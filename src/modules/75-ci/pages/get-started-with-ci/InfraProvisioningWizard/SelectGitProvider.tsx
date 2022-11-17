/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import type { FormikContextType, FormikProps } from 'formik'
import cx from 'classnames'
import {
  Text,
  Layout,
  CardSelect,
  Icon,
  Container,
  Button,
  Formik,
  FormikForm as Form,
  FormInput,
  ButtonVariation,
  ButtonSize,
  FormError,
  PageSpinner
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { getRequestOptions } from 'framework/app/App'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import {
  ConnectorInfoDTO,
  ResponseConnectorResponse,
  ResponseMessage,
  ResponseScmConnectorResponse,
  SecretDTOV2,
  SecretTextSpecDTO,
  useCreateConnector,
  useCreateDefaultScmConnector
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { joinAsASentence } from '@common/utils/StringUtils'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import { Status } from '@common/utils/Constants'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CIOnboardingActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'
import {
  getBackendServerUrl,
  isEnvironmentAllowedForOAuth,
  OAUTH_REDIRECT_URL_PREFIX,
  OAUTH_PLACEHOLDER_VALUE,
  MAX_TIMEOUT_OAUTH
} from '@connectors/components/CreateConnector/CreateConnectorUtils'
import { getGitUrl } from '@pipeline/utils/CIUtils'
import {
  AllSaaSGitProviders,
  GitAuthenticationMethod,
  GitProvider,
  GitProviderTypeToAuthenticationMethodMapping,
  GitProviderPermission,
  Hosting,
  GitProviderPermissions,
  ACCOUNT_SCOPE_PREFIX,
  DEFAULT_HARNESS_KMS,
  AccessTokenPermissionsDocLinks,
  GitProviderIcons,
  NonGitOption
} from './Constants'
import { getOAuthConnectorPayload } from '../../../utils/HostedBuildsUtils'

import css from './InfraProvisioningWizard.module.scss'

export interface SelectGitProviderRef {
  values: SelectGitProviderInterface
  setFieldTouched(field: keyof SelectGitProviderInterface & string, isTouched?: boolean, shouldValidate?: boolean): void
  validate: () => boolean
  showValidationErrors: () => void
  validatedConnector?: ConnectorInfoDTO
  validatedSecret?: SecretDTOV2
}

export type SelectGitProviderForwardRef =
  | ((instance: SelectGitProviderRef | null) => void)
  | React.MutableRefObject<SelectGitProviderRef | null>
  | null

interface SelectGitProviderProps {
  selectedHosting?: Hosting
  disableNextBtn: () => void
  enableNextBtn: () => void
  updateFooterLabel?: React.Dispatch<React.SetStateAction<string>>
}

export interface SelectGitProviderInterface {
  url?: string
  accessToken?: string
  username?: string
  applicationPassword?: string
  accessKey?: string
  gitAuthenticationMethod?: GitAuthenticationMethod
  gitProvider?: GitProvider
}

const SelectGitProviderRef = (
  props: SelectGitProviderProps,
  forwardRef: SelectGitProviderForwardRef
): React.ReactElement => {
  const { selectedHosting, disableNextBtn, enableNextBtn, updateFooterLabel } = props
  const { getString } = useStrings()
  const [gitProvider, setGitProvider] = useState<GitProvider | undefined>()
  const [authMethod, setAuthMethod] = useState<GitAuthenticationMethod>()
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(TestStatus.NOT_INITIATED)
  const formikRef = useRef<FormikContextType<SelectGitProviderInterface>>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [testConnectionErrors, setTestConnectionErrors] = useState<ResponseMessage[]>()
  const [connector, setConnector] = useState<ConnectorInfoDTO>()
  const [secret, setSecret] = useState<SecretDTOV2>()
  const scrollRef = useRef<Element>()
  const oAuthSecretIntercepted = useRef<boolean>(false)
  const [oAuthStatus, setOAuthStatus] = useState<Status>(Status.TO_DO)
  const { mutate: createSCMConnector } = useCreateDefaultScmConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: createConnector } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  let timerId: NodeJS.Timeout
  const { trackEvent } = useTelemetry()

  //#region OAuth validation and integration
  const disableOAuthForGitProvider = gitProvider?.type === Connectors.BITBUCKET

  const createOAuthConnector = useCallback(
    ({ tokenRef, refreshTokenRef }: { tokenRef: string; refreshTokenRef?: string }): void => {
      if (gitProvider?.type) {
        try {
          createConnector(
            set(
              getOAuthConnectorPayload({
                tokenRef: tokenRef,
                refreshTokenRef: refreshTokenRef ? refreshTokenRef : '',
                gitProviderType: gitProvider.type as ConnectorInfoDTO['type'],
                orgIdentifier,
                projectIdentifier
              }),
              'connector.spec.url',
              getGitUrl(getString, gitProvider?.type as ConnectorInfoDTO['type'])
            )
          )
            .then((createOAuthCtrResponse: ResponseConnectorResponse) => {
              const { data, status } = createOAuthCtrResponse
              const { connector: oAuthConnector } = data || {}
              if (oAuthConnector && status === Status.SUCCESS) {
                oAuthSecretIntercepted.current = true
                setOAuthStatus(Status.SUCCESS)
                setConnector(oAuthConnector)
                clearTimeout(timerId)
              }
            })
            .catch(_err => {
              setOAuthStatus(Status.FAILURE)
            })
        } catch (_err) {
          setOAuthStatus(Status.FAILURE)
        }
      }
    },
    [gitProvider?.type]
  )

  /* Event listener for OAuth server event, this is essential for landing user back to the same tab from where the OAuth started, once it's done */
  const handleOAuthServerEvent = useCallback(
    (event: MessageEvent): void => {
      if (oAuthStatus === Status.IN_PROGRESS) {
        if (!gitProvider) {
          return
        }
        if (event.origin !== getBackendServerUrl() && !isEnvironmentAllowedForOAuth()) {
          return
        }
        if (!event || !event.data) {
          return
        }
        const { accessTokenRef, refreshTokenRef, status, errorMessage } = event.data
        // valid oauth event from server will always have some value
        if (accessTokenRef && refreshTokenRef && status && errorMessage) {
          //safeguard against backend server sending multiple oauth events, which could lead to multiple duplicate connectors getting created
          if (!oAuthSecretIntercepted.current) {
            if (
              accessTokenRef !== OAUTH_PLACEHOLDER_VALUE &&
              (status as string).toLowerCase() === Status.SUCCESS.toLowerCase()
            ) {
              createOAuthConnector({ tokenRef: accessTokenRef, refreshTokenRef })
            } else if (errorMessage !== OAUTH_PLACEHOLDER_VALUE) {
              setOAuthStatus(Status.FAILURE)
            }
          }
        }
      }
    },
    [createOAuthConnector, gitProvider, oAuthStatus]
  )

  useEffect(() => {
    window.addEventListener('message', handleOAuthServerEvent)

    return () => {
      window.removeEventListener('message', handleOAuthServerEvent)
    }
  }, [handleOAuthServerEvent])

  useEffect(() => {
    if (oAuthSecretIntercepted.current) {
      window.removeEventListener('message', handleOAuthServerEvent) // remove event listener once oauth is done
    }
  }, [oAuthSecretIntercepted.current])

  const renderOAuthConnectionStatus = useCallback((): JSX.Element => {
    switch (oAuthStatus) {
      case Status.SUCCESS:
        return (
          <Container padding={{ left: 'large' }}>
            <Layout.Horizontal
              className={css.provisioningSuccessful}
              flex={{ justifyContent: 'flex-start' }}
              padding={{ left: 'small', top: 'xsmall', right: 'small', bottom: 'xsmall' }}
              spacing="xsmall"
            >
              <Icon name={'success-tick'} size={24} />
              <Text font={{ weight: 'semi-bold' }} color={Color.GREEN_800}>
                {getString('common.test.connectionSuccessful')}
              </Text>
            </Layout.Horizontal>
          </Container>
        )
      case Status.FAILURE:
        return (
          <Container padding={{ left: 'large' }}>
            <Layout.Horizontal
              className={css.provisioningFailed}
              flex={{ justifyContent: 'flex-start' }}
              padding={{ left: 'small', top: 'xsmall', right: 'small', bottom: 'xsmall' }}
              spacing="xsmall"
            >
              <Icon name={'circle-cross'} size={24} color={Color.RED_500} />
              <Text font={{ weight: 'semi-bold' }} color={Color.RED_500}>
                {getString('connectors.oAuth.failed')}
              </Text>
            </Layout.Horizontal>
          </Container>
        )
      default:
        return <></>
    }
  }, [oAuthStatus])

  //#endregion

  useEffect(() => {
    if (shouldRenderAuthFormFields()) {
      setTestConnectionStatus(TestStatus.NOT_INITIATED)
      enableNextBtn()
    }
  }, [gitProvider, authMethod, selectedHosting])

  useEffect(() => {
    if (
      authMethod &&
      [
        GitAuthenticationMethod.AccessToken,
        GitAuthenticationMethod.AccessKey,
        GitAuthenticationMethod.UserNameAndApplicationPassword
      ].includes(authMethod)
    ) {
      if (testConnectionStatus === TestStatus.SUCCESS) {
        enableNextBtn()
      } else {
        disableNextBtn()
      }
    } else if (authMethod === GitAuthenticationMethod.OAuth) {
      if (oAuthStatus === Status.SUCCESS) {
        enableNextBtn()
      } else {
        disableNextBtn()
      }
    }
  }, [authMethod, oAuthStatus, testConnectionStatus])

  const setForwardRef = ({
    values,
    setFieldTouched,
    validatedConnector,
    validatedSecret
  }: Omit<SelectGitProviderRef, 'validate' | 'showValidationErrors'>): void => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }

    if (values) {
      forwardRef.current = {
        values,
        setFieldTouched: setFieldTouched,
        validate: validateGitProviderSetup,
        showValidationErrors: markFieldsTouchedToShowValidationErrors,
        validatedConnector,
        validatedSecret
      }
    }
  }

  useEffect(() => {
    if (formikRef.current?.values && formikRef.current?.setFieldTouched) {
      const existingValues = { ...formikRef.current?.values }
      let updatedValues = set(existingValues, 'gitProvider', gitProvider)
      updatedValues = set(updatedValues, 'gitAuthenticationMethod', authMethod)
      formikRef.current?.setValues(updatedValues)

      setForwardRef({
        values: updatedValues,
        setFieldTouched: formikRef.current.setFieldTouched,
        validatedConnector: connector,
        validatedSecret: secret
      })
    }
  }, [formikRef, connector, secret, authMethod, gitProvider])

  useEffect(() => {
    if (gitProvider?.type === NonGitOption.OTHER) {
      updateFooterLabel?.(getString('ci.getStartedWithCI.createPipeline'))
    } else {
      updateFooterLabel?.(`${getString('next')}: ${getString('common.selectRepository')}`)
    }
  }, [gitProvider])

  //#region scm validation

  const getSecretPayload = React.useCallback((): SecretDTOV2 => {
    const gitProviderLabel = gitProvider?.type as string
    const secretName = `${gitProviderLabel} ${getString('common.getStarted.accessTokenLabel')}`
    const secretPayload: SecretDTOV2 = {
      name: secretName,
      identifier: secretName.split(' ').join('_'), // an identifier cannot contain spaces
      type: 'SecretText',
      spec: {
        valueType: 'Inline',
        secretManagerIdentifier: DEFAULT_HARNESS_KMS
      } as SecretTextSpecDTO
    }
    switch (gitProvider?.type) {
      case Connectors.GITHUB:
        return set(secretPayload, 'spec.value', formikRef.current?.values.accessToken)
      case Connectors.BITBUCKET:
        return set(secretPayload, 'spec.value', formikRef.current?.values.applicationPassword)
      case Connectors.GITLAB:
        return set(secretPayload, 'spec.value', formikRef.current?.values.accessKey)
      default:
        return secretPayload
    }
  }, [gitProvider?.type, formikRef.current?.values])

  const getSCMConnectorPayload = React.useCallback(
    (secretId: string, type: GitProvider['type']): ConnectorInfoDTO => {
      const commonConnectorPayload: ConnectorInfoDTO = {
        name: type,
        identifier: type,
        type: type as ConnectorInfoDTO['type'],
        spec: {
          executeOnDelegate: false,
          type: 'Account',
          url: getGitUrl(getString, gitProvider?.type as ConnectorInfoDTO['type']),
          authentication: {
            type: 'Http',
            spec: {}
          },
          apiAccess: {}
        }
      }
      let updatedConnectorPayload: ConnectorInfoDTO
      switch (gitProvider?.type) {
        case Connectors.GITLAB:
        case Connectors.GITHUB:
          updatedConnectorPayload = set(commonConnectorPayload, 'spec.authentication.spec.type', 'UsernameToken')
          updatedConnectorPayload = set(
            updatedConnectorPayload,
            'spec.authentication.spec.spec.tokenRef',
            `${ACCOUNT_SCOPE_PREFIX}${secretId}`
          )
          updatedConnectorPayload = set(updatedConnectorPayload, 'spec.apiAccess.type', 'Token')
          updatedConnectorPayload = set(
            updatedConnectorPayload,
            'spec.apiAccess.spec.tokenRef',
            `${ACCOUNT_SCOPE_PREFIX}${secretId}`
          )
          return updatedConnectorPayload
        case Connectors.BITBUCKET:
          updatedConnectorPayload = set(commonConnectorPayload, 'spec.authentication.spec.type', 'UsernamePassword')
          updatedConnectorPayload = set(updatedConnectorPayload, 'spec.authentication.spec.spec', {
            username: formikRef.current?.values?.username,
            passwordRef: `${ACCOUNT_SCOPE_PREFIX}${secretId}`
          })
          updatedConnectorPayload = set(updatedConnectorPayload, 'spec.apiAccess.type', 'UsernameToken')
          updatedConnectorPayload = set(updatedConnectorPayload, 'spec.apiAccess.spec', {
            username: formikRef.current?.values?.username,
            tokenRef: `${ACCOUNT_SCOPE_PREFIX}${secretId}`
          })
          return updatedConnectorPayload
        default:
          return commonConnectorPayload
      }
    },
    [gitProvider?.type, formikRef.current?.values?.username]
  )

  useEffect(() => {
    if (scrollRef) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [testConnectionErrors?.length])

  const TestConnection = (): React.ReactElement => {
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
      case TestStatus.NOT_INITIATED:
        return (
          <Layout.Vertical>
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('common.smtp.testConnection')}
              size={ButtonSize.SMALL}
              type="submit"
              onClick={() => {
                if (validateGitProviderSetup()) {
                  setTestConnectionStatus(TestStatus.IN_PROGRESS)
                  setTestConnectionErrors([])
                  if (gitProvider?.type) {
                    const createSecretPayload = getSecretPayload()
                    const createConnectorPayload = getSCMConnectorPayload(
                      createSecretPayload.identifier,
                      gitProvider.type
                    )
                    createSCMConnector({
                      secret: createSecretPayload,
                      connector: createConnectorPayload
                    })
                      .then((createSCMCtrResponse: ResponseScmConnectorResponse) => {
                        const { data: scmCtrData, status: scmCtrResponse } = createSCMCtrResponse
                        const connectorId = scmCtrData?.connectorResponseDTO?.connector?.identifier
                        const secretId = scmCtrData?.secretResponseWrapper?.secret?.identifier
                        if (
                          secretId &&
                          connectorId &&
                          scmCtrResponse === Status.SUCCESS &&
                          scmCtrData?.connectorValidationResult?.status === Status.SUCCESS
                        ) {
                          setTestConnectionStatus(TestStatus.SUCCESS)
                          setConnector(createConnectorPayload)
                          setSecret(createSecretPayload)
                        } else {
                          setTestConnectionStatus(TestStatus.FAILED)
                          const errorMsgs: ResponseMessage[] = []
                          if (scmCtrData?.connectorValidationResult?.errorSummary) {
                            errorMsgs.push({
                              level: 'ERROR',
                              message: scmCtrData?.connectorValidationResult?.errorSummary
                            })
                          }
                          if (!connectorId) {
                            errorMsgs.push({
                              level: 'ERROR',
                              message: getString('common.getStarted.fieldIsMissing', {
                                field: `${getString('connector')} ${getString('identifier').toLowerCase()}`
                              })
                            })
                          }
                          if (!secretId) {
                            errorMsgs.push({
                              level: 'ERROR',
                              message: getString('common.getStarted.fieldIsMissing', {
                                field: `${getString('secretType')} ${getString('identifier').toLowerCase()}`
                              })
                            })
                          }
                          if (errorMsgs.length > 0) {
                            errorMsgs.push({
                              level: 'ERROR',
                              message: `${getString('common.smtp.testConnection')} ${getString('failed').toLowerCase()}`
                            })
                            setTestConnectionErrors(errorMsgs.reverse())
                          }
                        }
                      })
                      .catch(err => {
                        setTestConnectionStatus(TestStatus.FAILED)
                        setTestConnectionErrors((err?.data as any)?.responseMessages)
                      })
                  }
                }
              }}
              className={css.testConnectionBtn}
              id="test-connection-btn"
            />
            {testConnectionStatus === TestStatus.FAILED &&
            Array.isArray(testConnectionErrors) &&
            testConnectionErrors.length > 0 ? (
              <Container padding={{ top: 'medium' }} ref={scrollRef}>
                <ErrorHandler responseMessages={testConnectionErrors || []} />
              </Container>
            ) : null}
          </Layout.Vertical>
        )
      case TestStatus.IN_PROGRESS:
        return (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name="steps-spinner" color={Color.PRIMARY_7} />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7}>
              {getString('common.test.inProgress')}
            </Text>
          </Layout.Horizontal>
        )
      case TestStatus.SUCCESS:
        return (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name="success-tick" />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREEN_700}>
              {getString('common.test.connectionSuccessful')}
            </Text>
          </Layout.Horizontal>
        )
      default:
        return <></>
    }
  }

  //#endregion

  //#region form view

  const permissionsForSelectedGitProvider = GitProviderPermissions.filter(
    (providerPermissions: GitProviderPermission) => providerPermissions.type === gitProvider?.type
  )[0]

  const getButtonLabel = React.useCallback((): string => {
    switch (gitProvider?.type) {
      case Connectors.GITHUB:
        return getString('common.getStarted.accessTokenLabel')
      case Connectors.BITBUCKET:
        return `${getString('username')} & ${getString('common.getStarted.appPassword')}`
      case Connectors.GITLAB:
        return getString('common.accessKey')
      default:
        return ''
    }
  }, [gitProvider])

  const renderTextField = React.useCallback(
    ({
      name,
      label,
      tooltipId,
      inputGroupType
    }: {
      name: string
      label: keyof StringsMap
      tooltipId: string
      inputGroupType?: 'text' | 'password'
    }) => {
      return (
        <FormInput.Text
          name={name}
          style={{ width: '40%' }}
          label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString(label)}</Text>}
          tooltipProps={{ dataTooltipId: tooltipId }}
          disabled={testConnectionStatus === TestStatus.IN_PROGRESS}
          inputGroup={{
            type: inputGroupType ?? 'text'
          }}
        />
      )
    },
    [testConnectionStatus]
  )

  const renderNonOAuthView = React.useCallback(
    (_formikProps: FormikProps<SelectGitProviderInterface>): JSX.Element => {
      const apiUrlField = renderTextField({
        name: 'url',
        label: 'common.getStarted.apiUrlLabel',
        tooltipId: 'url'
      })
      switch (gitProvider?.type) {
        case Connectors.GITHUB:
          return (
            <Layout.Vertical width="100%">
              {selectedHosting === Hosting.OnPrem ? apiUrlField : null}
              {renderTextField({
                name: 'accessToken',
                label: 'common.getStarted.accessTokenLabel',
                tooltipId: 'accessToken',
                inputGroupType: 'password'
              })}
            </Layout.Vertical>
          )
        case Connectors.BITBUCKET:
          return (
            <Layout.Vertical width="100%">
              {selectedHosting === Hosting.OnPrem ? apiUrlField : null}
              {renderTextField({
                name: 'username',
                label: 'username',
                tooltipId: 'username'
              })}
              {renderTextField({
                name: 'applicationPassword',
                label: 'common.getStarted.appPassword',
                tooltipId: 'applicationPassword',
                inputGroupType: 'password'
              })}
            </Layout.Vertical>
          )
        case Connectors.GITLAB:
          return (
            <Layout.Vertical width="100%">
              {selectedHosting === Hosting.OnPrem ? apiUrlField : null}
              {renderTextField({
                name: 'accessKey',
                label: 'common.accessKey',
                tooltipId: 'accessKey',
                inputGroupType: 'password'
              })}
            </Layout.Vertical>
          )
        default:
          return <></>
      }
    },
    [gitProvider, selectedHosting, testConnectionStatus]
  )

  //#endregion

  //#region methods exposed via ref

  const markFieldsTouchedToShowValidationErrors = React.useCallback((): void => {
    const { values, setFieldTouched } = formikRef.current || {}
    const { accessToken, accessKey, applicationPassword, username, url } = values || {}
    if (!authMethod) {
      setFieldTouched?.('gitAuthenticationMethod', true)
      return
    }
    if (gitProvider?.type === Connectors.GITHUB) {
      setFieldTouched?.('accessToken', !accessToken)
      if (selectedHosting === Hosting.OnPrem) {
        setFieldTouched?.('accessToken', !accessToken)
      }
    } else if (gitProvider?.type === Connectors.GITLAB) {
      setFieldTouched?.('accessKey', !accessKey)
    } else if (gitProvider?.type === Connectors.BITBUCKET) {
      if (!username) {
        setFieldTouched?.('username', true)
      }
      if (!applicationPassword) {
        setFieldTouched?.('applicationPassword', true)
      }
    }
    if (selectedHosting === Hosting.OnPrem) {
      setFieldTouched?.('url', !url)
    }
  }, [gitProvider, authMethod, selectedHosting])

  const validateGitProviderSetup = React.useCallback((): boolean => {
    const { accessToken, accessKey, applicationPassword, username, url } = formikRef.current?.values || {}
    if (selectedHosting === Hosting.SaaS) {
      switch (gitProvider?.type) {
        case Connectors.GITHUB:
          return authMethod === GitAuthenticationMethod.AccessToken && !!accessToken
        case Connectors.GITLAB:
          return authMethod === GitAuthenticationMethod.AccessKey && !!accessKey

        case Connectors.BITBUCKET:
          return (
            authMethod === GitAuthenticationMethod.UserNameAndApplicationPassword && !!username && !!applicationPassword
          )
        default:
          return false
      }
    } else if (selectedHosting === Hosting.OnPrem) {
      switch (gitProvider?.type) {
        case Connectors.GITHUB:
          return !!accessToken && !!url
          break
        case Connectors.GITLAB:
          return !!accessKey && !!url
          break
        case Connectors.BITBUCKET:
          return !!username && !!applicationPassword && !!url
        default:
          return false
      }
    }
    return false
  }, [gitProvider, authMethod, selectedHosting])

  //#endregion

  const shouldRenderAuthFormFields = React.useCallback((): boolean => {
    if (gitProvider?.type) {
      if (selectedHosting === Hosting.SaaS) {
        return (
          (gitProvider.type === Connectors.GITHUB && authMethod === GitAuthenticationMethod.AccessToken) ||
          (gitProvider.type === Connectors.GITLAB && authMethod === GitAuthenticationMethod.AccessKey) ||
          (gitProvider.type === Connectors.BITBUCKET &&
            authMethod === GitAuthenticationMethod.UserNameAndApplicationPassword)
        )
      } else if (selectedHosting === Hosting.OnPrem) {
        return (
          [Connectors.GITHUB, Connectors.GITLAB, Connectors.BITBUCKET].includes(
            gitProvider.type as ConnectorInfoDTO['type']
          ) && selectedHosting === Hosting.OnPrem
        )
      }
    }
    return false
  }, [gitProvider, authMethod, selectedHosting])

  //#region formik related

  const getInitialValues = React.useCallback((): Record<string, string> => {
    let initialValues = {}
    switch (gitProvider?.type) {
      case Connectors.GITHUB:
        initialValues = { accessToken: '' }
        break
      case Connectors.GITLAB:
        initialValues = { accessKey: '' }
        break
      case Connectors.BITBUCKET:
        initialValues = { applicationPassword: '', username: '' }
        break
    }
    return selectedHosting === Hosting.SaaS ? initialValues : { ...initialValues, url: '' }
  }, [gitProvider, selectedHosting])

  const getValidationSchema = React.useCallback(() => {
    const urlSchema = Yup.object().shape({
      url: Yup.string()
        .trim()
        .required(
          getString('fieldRequired', {
            field: getString('common.getStarted.apiUrlLabel')
          })
        )
    })
    let baseSchema
    switch (gitProvider?.type) {
      case Connectors.GITHUB:
        baseSchema = Yup.object()
          .shape({
            accessToken: Yup.string()
              .trim()
              .required(getString('fieldRequired', { field: getString('common.getStarted.accessTokenLabel') }))
          })
          .required()
        return selectedHosting === Hosting.SaaS ? baseSchema : urlSchema.concat(baseSchema)
      case Connectors.GITLAB:
        baseSchema = Yup.object()
          .shape({
            accessKey: Yup.string()
              .trim()
              .required(getString('fieldRequired', { field: getString('common.accessKey') }))
          })
          .required()
        return selectedHosting === Hosting.SaaS ? baseSchema : urlSchema.concat(baseSchema)
      case Connectors.BITBUCKET:
        baseSchema = Yup.object()
          .shape({
            username: Yup.string()
              .trim()
              .required(getString('fieldRequired', { field: getString('username') })),
            applicationPassword: Yup.string()
              .trim()
              .required(getString('fieldRequired', { field: getString('common.getStarted.appPassword') }))
          })
          .required()
        return selectedHosting === Hosting.SaaS ? baseSchema : urlSchema.concat(baseSchema)
      default:
        return Yup.object().shape({})
    }
  }, [gitProvider, selectedHosting])

  //#endregion

  //#region on change of a git provider

  const resetField = (field: keyof SelectGitProviderInterface) => {
    const { setFieldValue, setFieldTouched } = formikRef.current || {}
    setFieldValue?.(field, '')
    setFieldTouched?.(field, false)
  }

  const resetFormFields = React.useCallback((): void => {
    switch (gitProvider?.type) {
      case Connectors.GITHUB:
        resetField('accessToken')
        return
      case Connectors.GITLAB:
        resetField('accessKey')
        return
      case Connectors.BITBUCKET:
        resetField('applicationPassword')
        resetField('username')
        return
      default:
        return
    }
  }, [gitProvider, authMethod])

  const handleGitProviderSelection = useCallback(
    (item: GitProvider) => {
      trackEvent(CIOnboardingActions.SelectGitProvider, { gitProvider: item.type, ...(authMethod && { authMethod }) })
      setGitProvider(item)
      setTestConnectionStatus(TestStatus.NOT_INITIATED)
      resetFormFields()
      setAuthMethod(undefined)
      setOAuthStatus(Status.TO_DO)
    },
    [formikRef, trackEvent]
  )

  //#endregion

  return (
    <Layout.Vertical width="70%">
      {authMethod === GitAuthenticationMethod.OAuth && oAuthStatus === Status.IN_PROGRESS ? (
        <PageSpinner message={getString('connectors.oAuth.inProgress')} />
      ) : null}
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.codeRepo')}</Text>
      <Formik<SelectGitProviderInterface>
        initialValues={{
          ...getInitialValues(),
          gitProvider,
          gitAuthenticationMethod: undefined
        }}
        formName="ciInfraProvisiong-gitProvider"
        validationSchema={getValidationSchema()}
        validateOnChange={true}
        onSubmit={(values: SelectGitProviderInterface) => Promise.resolve(values)}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <Form>
              <Container
                padding={{ top: 'xxlarge', bottom: 'xxxlarge' }}
                className={cx({ [css.borderBottom]: gitProvider && gitProvider.type !== NonGitOption.OTHER })}
              >
                <Layout.Horizontal spacing="large">
                  <CardSelect
                    data={AllSaaSGitProviders}
                    selected={gitProvider}
                    cornerSelected={true}
                    className={css.icons}
                    cardClassName={css.gitProviderCard}
                    renderItem={(item: GitProvider) => (
                      <Layout.Vertical flex>
                        <Icon
                          name={item.icon}
                          size={30}
                          flex
                          className={cx(
                            { [css.githubIcon]: item.icon === GitProviderIcons.get(Connectors.GITHUB) },
                            { [css.gitlabIcon]: item.icon === GitProviderIcons.get(Connectors.GITLAB) },
                            { [css.bitbucketIcon]: item.icon === GitProviderIcons.get(Connectors.BITBUCKET) },
                            { [css.genericGitIcon]: item.icon === GitProviderIcons.get(Connectors.GIT) }
                          )}
                        />
                        <Text font={{ variation: FontVariation.SMALL_SEMI }} padding={{ top: 'small' }}>
                          {getString(item.label)}
                        </Text>
                      </Layout.Vertical>
                    )}
                    onChange={handleGitProviderSelection}
                  />
                </Layout.Horizontal>
                {formikProps.touched.gitProvider && !formikProps.values.gitProvider ? (
                  <Container padding={{ top: 'xsmall' }}>
                    <FormError
                      name={'gitProvider'}
                      errorMessage={getString('common.getStarted.plsChoose', {
                        field: `a ${getString('common.getStarted.codeRepoLabel').toLowerCase()}`
                      })}
                    />
                  </Container>
                ) : null}
              </Container>
              {gitProvider && gitProvider.type !== NonGitOption.OTHER ? (
                <Layout.Vertical>
                  <Container
                    className={cx({
                      [css.borderBottom]: shouldRenderAuthFormFields()
                    })}
                    padding={{ bottom: 'xxlarge' }}
                  >
                    <Text font={{ variation: FontVariation.H5 }} padding={{ top: 'xlarge', bottom: 'small' }}>
                      {getString(
                        selectedHosting === Hosting.SaaS
                          ? 'common.getStarted.authMethod'
                          : 'ci.getStartedWithCI.setUpAuth'
                      )}
                    </Text>
                    {selectedHosting === Hosting.SaaS ? (
                      <Layout.Vertical padding={{ top: 'medium' }}>
                        <Layout.Horizontal spacing="small">
                          <Button
                            className={css.authMethodBtn}
                            round
                            text={getString('common.oAuthLabel')}
                            onClick={async () => {
                              setOAuthStatus(Status.IN_PROGRESS)
                              setTimeout(() => {
                                if (oAuthStatus !== Status.SUCCESS) {
                                  setOAuthStatus(Status.FAILURE)
                                }
                              }, MAX_TIMEOUT_OAUTH)
                              oAuthSecretIntercepted.current = false
                              setAuthMethod(GitAuthenticationMethod.OAuth)
                              if (gitProvider?.type) {
                                try {
                                  const { headers } = getRequestOptions()
                                  const oauthRedirectEndpoint = `${OAUTH_REDIRECT_URL_PREFIX}?provider=${gitProvider.type.toLowerCase()}&accountId=${accountId}&orgId=${orgIdentifier}&projectId=${projectIdentifier}`
                                  const response = await fetch(oauthRedirectEndpoint, {
                                    headers
                                  })
                                  const oAuthURL = await response.text()
                                  if (typeof oAuthURL === 'string') {
                                    window.open(oAuthURL, '_blank')
                                  }
                                } catch (e) {
                                  setOAuthStatus(Status.FAILURE)
                                }
                              }
                            }}
                            intent={authMethod === GitAuthenticationMethod.OAuth ? 'primary' : 'none'}
                            disabled={
                              disableOAuthForGitProvider ||
                              (gitProvider?.type &&
                                [Connectors.GITHUB, Connectors.GITLAB].includes(
                                  gitProvider.type as ConnectorInfoDTO['type']
                                ) &&
                                oAuthStatus === Status.IN_PROGRESS)
                            }
                            tooltipProps={
                              disableOAuthForGitProvider
                                ? {
                                    isDark: true
                                  }
                                : { isOpen: false }
                            }
                            tooltip={
                              disableOAuthForGitProvider ? (
                                <Text padding="small" color={Color.WHITE}>
                                  {getString('common.comingSoon2')}
                                </Text>
                              ) : (
                                <></>
                              )
                            }
                          />
                          <Button
                            className={css.authMethodBtn}
                            round
                            text={getButtonLabel()}
                            onClick={() => {
                              oAuthSecretIntercepted.current = false
                              resetFormFields()
                              if (gitProvider?.type) {
                                const gitAuthMethod = GitProviderTypeToAuthenticationMethodMapping.get(
                                  gitProvider.type as ConnectorInfoDTO['type']
                                )
                                setAuthMethod(gitAuthMethod)
                              }
                            }}
                            intent={shouldRenderAuthFormFields() ? 'primary' : 'none'}
                          />
                          {authMethod === GitAuthenticationMethod.OAuth ? renderOAuthConnectionStatus() : null}
                        </Layout.Horizontal>
                        {formikProps.touched.gitAuthenticationMethod && !formikProps.values.gitAuthenticationMethod ? (
                          <Container padding={{ top: 'xsmall' }}>
                            <FormError
                              name={'gitAuthenticationMethod'}
                              errorMessage={getString('common.getStarted.plsChoose', {
                                field: `an ${getString('common.getStarted.authMethodLabel').toLowerCase()}`
                              })}
                            />
                          </Container>
                        ) : null}
                      </Layout.Vertical>
                    ) : null}
                    {shouldRenderAuthFormFields() ? (
                      <Layout.Vertical padding={{ top: 'medium' }} flex={{ alignItems: 'flex-start' }}>
                        <Container padding={{ top: formikProps.errors.url ? 'xsmall' : 'xlarge' }} width="100%">
                          {renderNonOAuthView(formikProps)}
                        </Container>
                        <Button
                          variation={ButtonVariation.LINK}
                          text={getString('common.getStarted.learnMoreAboutPermissions')}
                          className={css.learnMore}
                          tooltipProps={{ dataTooltipId: 'learnMoreAboutPermissions' }}
                          rightIcon="link"
                          onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
                            event.preventDefault()
                            window.open(
                              AccessTokenPermissionsDocLinks.get(gitProvider?.type as ConnectorInfoDTO['type']),
                              '_blank'
                            )
                          }}
                        />
                        <Layout.Horizontal>
                          {permissionsForSelectedGitProvider.type &&
                          Array.isArray(permissionsForSelectedGitProvider.permissions) &&
                          permissionsForSelectedGitProvider.permissions.length > 0 ? (
                            <Text>
                              {permissionsForSelectedGitProvider.type}&nbsp;
                              {(gitProvider.type === Connectors.BITBUCKET
                                ? getString('permissions')
                                : getString('common.scope').concat('s')
                              ).toLowerCase()}
                              :&nbsp;{joinAsASentence(permissionsForSelectedGitProvider.permissions)}.
                            </Text>
                          ) : null}
                        </Layout.Horizontal>
                      </Layout.Vertical>
                    ) : null}
                  </Container>
                  {shouldRenderAuthFormFields() ? (
                    <Layout.Vertical padding={{ top: formikProps.errors.url ? 'xsmall' : 'large' }} spacing="small">
                      <Text font={{ variation: FontVariation.H5 }}>{getString('common.smtp.testConnection')}</Text>
                      <Text>{getString('common.getStarted.verifyConnection')}</Text>
                      <Container padding={{ top: 'small' }}>
                        <TestConnection />
                      </Container>
                    </Layout.Vertical>
                  ) : null}
                </Layout.Vertical>
              ) : null}
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const SelectGitProvider = React.forwardRef(SelectGitProviderRef)
