/* eslint-disable import/no-unresolved */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import type { FormikContextType, FormikProps } from 'formik'

import {
  Text,
  Layout,
  Icon,
  Container,
  Button,
  Formik,
  FormikForm,
  FormInput,
  ButtonVariation,
  ButtonSize,
  FormError,
  PageSpinner
} from '@harness/uicore'

import { FontVariation, Color } from '@harness/design-system'
import { defaultTo, set } from 'lodash-es'
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
import { Connectors } from '@connectors/constants'
import {
  getBackendServerUrl,
  isEnvironmentAllowedForOAuth,
  OAUTH_REDIRECT_URL_PREFIX,
  OAUTH_PLACEHOLDER_VALUE,
  MAX_TIMEOUT_OAUTH
} from '@connectors/components/CreateConnector/CreateConnectorUtils'
import { getGitUrl } from '@pipeline/utils/CIUtils'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { StringUtils } from '@common/exports'
import {
  GitAuthenticationMethod,
  GitProvider,
  GitProviderTypeToAuthenticationMethodMapping,
  GitProviderPermission,
  GitProviderPermissions,
  ACCOUNT_SCOPE_PREFIX,
  DEFAULT_HARNESS_KMS,
  AccessTokenPermissionsDocLinks
} from '../../DeployProvisioningWizard/Constants'
import { getOAuthConnectorPayload, ONBOARDING_PREFIX } from '../../CDOnboardingUtils'
import css from '../../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface SelectGitProviderRefInstance {
  testConnectionStatus?: TestStatus // added,
  connectorRef: (ConnectorInfoDTO & { gitDetails?: IGitContextFormProps }) | undefined //added
  values: SelectGitProviderInterface
  setFieldTouched(field: keyof SelectGitProviderInterface & string, isTouched?: boolean, shouldValidate?: boolean): void
  validate: () => boolean
  showValidationErrors: () => void
  validatedConnector?: ConnectorInfoDTO
  validatedSecret?: SecretDTOV2
}

export type SelectGitProviderForwardRef =
  | ((instance: SelectGitProviderRefInstance | null) => void)
  | React.MutableRefObject<SelectGitProviderRefInstance | null>
  | null

interface SelectGitProviderProps {
  gitValues?: SelectGitProviderInterface
  connectionStatus?: TestStatus
  selectedGitProvider?: GitProvider

  onSuccess: (status: number, connectorResponse: SelectGitProviderRefInstance['connectorRef']) => void
}

export interface SelectGitProviderInterface {
  url?: string
  accessToken?: string
  username?: string
  validationRepo?: string
  applicationPassword?: string
  accessKey?: string
  gitAuthenticationMethod?: GitAuthenticationMethod
  gitProvider?: GitProvider
}

const SelectGitProviderRef = (
  props: SelectGitProviderProps,
  forwardRef: SelectGitProviderForwardRef
): React.ReactElement => {
  const { gitValues, connectionStatus, selectedGitProvider, onSuccess } = props
  const { getString } = useStrings()
  const [authMethod, setAuthMethod] = useState<GitAuthenticationMethod | undefined>(gitValues?.gitAuthenticationMethod)
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(
    connectionStatus || TestStatus.NOT_INITIATED
  )
  const formikRef = useRef<FormikContextType<SelectGitProviderInterface>>()
  const { accountId } = useParams<ProjectPathProps>()
  const [testConnectionErrors, setTestConnectionErrors] = useState<ResponseMessage[]>()
  const [connector, setConnector] = useState<ConnectorInfoDTO>()
  const [connectorResponse, setConnectorResponse] = useState<SelectGitProviderRefInstance['connectorRef']>()
  const [secret, setSecret] = useState<SecretDTOV2>()

  const oAuthSecretIntercepted = useRef<boolean>(false)
  const [oAuthStatus, setOAuthStatus] = useState<Status>(Status.TO_DO)

  const { mutate: createSCMConnector } = useCreateDefaultScmConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: createConnector } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  let timerId: NodeJS.Timeout

  //#region OAuth validation and integration

  const disableOAuthForGitProvider =
    selectedGitProvider?.type && [Connectors.BITBUCKET, Connectors.GITLAB].includes(selectedGitProvider.type)
  const createOAuthConnector = useCallback(
    ({ tokenRef, refreshTokenRef }: { tokenRef: string; refreshTokenRef?: string }): void => {
      if (selectedGitProvider?.type) {
        try {
          createConnector(
            set(
              getOAuthConnectorPayload({
                tokenRef: ACCOUNT_SCOPE_PREFIX.concat(tokenRef),
                refreshTokenRef: refreshTokenRef ? ACCOUNT_SCOPE_PREFIX.concat(refreshTokenRef) : '',
                gitProviderType: selectedGitProvider.type as ConnectorInfoDTO['type']
              }),
              'connector.spec.url',
              defaultTo(
                formikRef.current?.values?.url,
                getGitUrl(getString, selectedGitProvider?.type as ConnectorInfoDTO['type'])
              )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedGitProvider?.type, getString]
  )

  /* Event listener for OAuth server event, this is essential for landing user back to the same tab from where the OAuth started, once it's done */
  const handleOAuthServerEvent = useCallback(
    (event: MessageEvent): void => {
      if (oAuthStatus === Status.IN_PROGRESS) {
        if (!selectedGitProvider) {
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
    [createOAuthConnector, selectedGitProvider, oAuthStatus]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [getString, oAuthStatus])

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
        onSuccess(testConnectionStatus, connectorResponse)
      }
    } else if (authMethod === GitAuthenticationMethod.OAuth) {
      if (oAuthStatus === Status.SUCCESS) {
        onSuccess(testConnectionStatus, connectorResponse)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMethod, oAuthStatus, testConnectionStatus, connectorResponse])

  const setForwardRef = ({
    values,
    setFieldTouched,
    validatedConnector,
    validatedSecret
  }: Omit<SelectGitProviderRefInstance, 'validate' | 'showValidationErrors'>): void => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }

    if (values) {
      forwardRef.current = {
        values,
        testConnectionStatus,
        setFieldTouched: setFieldTouched,
        validate: validateGitProviderSetup,
        showValidationErrors: markFieldsTouchedToShowValidationErrors,
        validatedConnector,
        validatedSecret,
        connectorRef: connectorResponse
      }
    }
  }

  useEffect(() => {
    if (formikRef.current?.values && formikRef.current?.setFieldTouched) {
      const existingValues = { ...formikRef.current?.values, testConnectionStatus }
      let updatedValues = set(existingValues, 'gitProvider', selectedGitProvider)
      updatedValues = set(updatedValues, 'gitAuthenticationMethod', authMethod)
      formikRef.current?.setValues(updatedValues)

      setForwardRef({
        values: updatedValues,
        setFieldTouched: formikRef.current.setFieldTouched,
        validatedConnector: connector,
        validatedSecret: secret,
        connectorRef: connectorResponse
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikRef, connector, secret, authMethod, selectedGitProvider, testConnectionStatus, connectorResponse])

  //#region scm validation

  const getSecretPayload = React.useCallback((): SecretDTOV2 => {
    const gitProviderLabel = selectedGitProvider?.type as string
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
    switch (selectedGitProvider?.type) {
      case Connectors.GITHUB:
        return set(secretPayload, 'spec.value', formikRef.current?.values.accessToken)
      case Connectors.BITBUCKET:
        return set(secretPayload, 'spec.value', formikRef.current?.values.applicationPassword)
      case Connectors.GITLAB:
        return set(secretPayload, 'spec.value', formikRef.current?.values.accessKey)
      default:
        return secretPayload
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGitProvider?.type, formikRef.current?.values, getString])

  const getSCMConnectorPayload = React.useCallback(
    (secretId: string, type: GitProvider['type']): ConnectorInfoDTO => {
      const connectorName = `${type}_${ONBOARDING_PREFIX}`
      const commonConnectorPayload: ConnectorInfoDTO = {
        name: connectorName,
        identifier: StringUtils.getIdentifierFromName(connectorName),
        type: type as ConnectorInfoDTO['type'],
        spec: {
          executeOnDelegate: false,
          type: 'Account',
          url: defaultTo(
            formikRef.current?.values?.url,
            getGitUrl(getString, selectedGitProvider?.type as ConnectorInfoDTO['type'])
          ),
          validationRepo: formikRef.current?.values?.validationRepo,
          authentication: {
            type: 'Http',
            spec: {}
          },
          apiAccess: {}
        }
      }
      let updatedConnectorPayload: ConnectorInfoDTO
      switch (selectedGitProvider?.type) {
        case Connectors.GITLAB:
        case Connectors.GITHUB:
          updatedConnectorPayload = set(commonConnectorPayload, 'spec.authentication.spec.type', 'UsernameToken')
          updatedConnectorPayload = set(
            updatedConnectorPayload,
            'spec.authentication.spec.spec.tokenRef',
            `${ACCOUNT_SCOPE_PREFIX}${secretId}`
          )
          updatedConnectorPayload = set(updatedConnectorPayload, 'spec.apiAccess.type', 'Token')
          updatedConnectorPayload = set(updatedConnectorPayload, 'spec.authentication.spec.spec', {
            username: formikRef.current?.values?.username,
            tokenRef: `${ACCOUNT_SCOPE_PREFIX}${secretId}`
          })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedGitProvider?.type, formikRef.current?.values?.username, getString]
  )

  const TestConnection = (): React.ReactElement => {
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
      case TestStatus.NOT_INITIATED:
        return (
          <Layout.Vertical>
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('cd.getStartedWithCD.testConnection')}
              size={ButtonSize.SMALL}
              type="submit"
              onClick={() => {
                if (validateGitProviderSetup()) {
                  setTestConnectionStatus(TestStatus.IN_PROGRESS)
                  setTestConnectionErrors([])
                  if (selectedGitProvider?.type) {
                    const createSecretPayload = getSecretPayload()
                    const createConnectorPayload = getSCMConnectorPayload(
                      createSecretPayload.identifier,
                      selectedGitProvider.type
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
                          setConnectorResponse(scmCtrData.connectorResponseDTO?.connector)
                          setConnector(createConnectorPayload)
                          setSecret(createSecretPayload)
                          setTestConnectionStatus(TestStatus.SUCCESS)
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
              <Container padding={{ top: 'medium' }}>
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
    (providerPermissions: GitProviderPermission) => providerPermissions.type === selectedGitProvider?.type
  )[0]

  const getButtonLabel = React.useCallback((): string => {
    switch (selectedGitProvider?.type) {
      case Connectors.GITHUB:
        return getString('common.getStarted.accessTokenLabel')
      case Connectors.BITBUCKET:
        return `${getString('username')} & ${getString('common.getStarted.appPassword')}`
      case Connectors.GITLAB:
        return getString('common.accessKey')
      default:
        return ''
    }
  }, [getString, selectedGitProvider?.type])

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
          style={{ width: '60%' }}
          label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString(label)}</Text>}
          tooltipProps={{ dataTooltipId: tooltipId }}
          disabled={testConnectionStatus === TestStatus.IN_PROGRESS}
          inputGroup={{
            type: inputGroupType ?? 'text'
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e?.target?.value) {
              formikRef?.current?.setFieldValue(name, e.target.value)
              setTestConnectionStatus(TestStatus.NOT_INITIATED)
            }
          }}
        />
      )
    },
    [getString, testConnectionStatus]
  )

  const renderNonOAuthView = React.useCallback(
    (_formikProps: FormikProps<SelectGitProviderInterface>): JSX.Element => {
      switch (selectedGitProvider?.type) {
        case Connectors.GITHUB:
          return (
            <Layout.Vertical width="100%">
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
    [selectedGitProvider, renderTextField]
  )

  //#endregion

  //#region methods exposed via ref

  /*istanbul ignore next */
  const markFieldsTouchedToShowValidationErrors = React.useCallback((): void => {
    const { values, setFieldTouched } = formikRef.current || {}
    const { accessToken, accessKey, applicationPassword, username } = values || {}
    if (!authMethod) {
      setFieldTouched?.('gitAuthenticationMethod', true)
      return
    }
    if (!username) {
      setFieldTouched?.('username', true)
    }
    if (selectedGitProvider?.type === Connectors.GITHUB) {
      setFieldTouched?.('accessToken', !accessToken)
    } else if (selectedGitProvider?.type === Connectors.GITLAB) {
      setFieldTouched?.('accessKey', !accessKey)
    } else if (selectedGitProvider?.type === Connectors.BITBUCKET) {
      if (!applicationPassword) {
        setFieldTouched?.('applicationPassword', true)
      }
    }
  }, [selectedGitProvider, authMethod])

  const validateGitProviderSetup = React.useCallback((): boolean => {
    const { accessToken, accessKey, applicationPassword, username } = formikRef.current?.values || {}
    switch (selectedGitProvider?.type) {
      case Connectors.GITHUB:
        return authMethod === GitAuthenticationMethod.AccessToken && !!accessToken && !!username
      case Connectors.GITLAB:
        return authMethod === GitAuthenticationMethod.AccessKey && !!accessKey && !!username

      case Connectors.BITBUCKET:
        return (
          authMethod === GitAuthenticationMethod.UserNameAndApplicationPassword && !!username && !!applicationPassword
        )
      default:
        return false
    }
  }, [selectedGitProvider, authMethod])

  //#endregion

  const shouldRenderAuthFormFields = React.useCallback((): boolean => {
    if (selectedGitProvider?.type) {
      return (
        (selectedGitProvider.type === Connectors.GITHUB && authMethod === GitAuthenticationMethod.AccessToken) ||
        (selectedGitProvider.type === Connectors.GITLAB && authMethod === GitAuthenticationMethod.AccessKey) ||
        (selectedGitProvider.type === Connectors.BITBUCKET &&
          authMethod === GitAuthenticationMethod.UserNameAndApplicationPassword)
      )
    }
    return false
  }, [selectedGitProvider, authMethod])
  //#region formik related

  const getInitialValues = React.useCallback((): Record<string, string> => {
    let initialValues = {}
    switch (selectedGitProvider?.type) {
      case Connectors.GITHUB:
        initialValues = {
          accessToken: defaultTo(gitValues?.accessToken, ''),
          username: defaultTo(gitValues?.username, '')
        }
        break
      case Connectors.GITLAB:
        initialValues = { accessKey: defaultTo(gitValues?.accessKey, ''), username: defaultTo(gitValues?.username, '') }
        break
      case Connectors.BITBUCKET:
        initialValues = {
          applicationPassword: defaultTo(gitValues?.applicationPassword, ''),
          username: defaultTo(gitValues?.username, '')
        }
        break
    }
    return {
      ...initialValues,
      url: defaultTo(gitValues?.url, ''),
      validationRepo: defaultTo(gitValues?.validationRepo, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGitProvider])

  const getValidationSchema = React.useCallback(() => {
    let baseSchema

    const urlAndNameSchema = {
      url: Yup.string().test('isValidUrl', getString('validation.urlIsNotValid'), function (_url) {
        if (!_url) return false
        const trimmedUrl = _url?.trim() || ''
        if (trimmedUrl.includes(' ')) {
          return false
        }
        return trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') ? true : false
      }),
      username: Yup.string()
        .trim()
        .required(getString('fieldRequired', { field: getString('username') })),
      validationRepo: Yup.string().nullable().required(getString('common.validation.testRepoIsRequired'))
    }
    switch (selectedGitProvider?.type) {
      case Connectors.GITHUB:
        baseSchema = Yup.object()
          .shape({
            ...urlAndNameSchema,
            accessToken: Yup.string()
              .trim()
              .required(getString('fieldRequired', { field: getString('common.getStarted.accessTokenLabel') }))
          })
          .required()
        return baseSchema
      case Connectors.GITLAB:
        baseSchema = Yup.object()
          .shape({
            ...urlAndNameSchema,
            accessKey: Yup.string()
              .trim()
              .required(getString('fieldRequired', { field: getString('common.accessKey') }))
          })
          .required()
        return baseSchema
      case Connectors.BITBUCKET:
        baseSchema = Yup.object()
          .shape({
            ...urlAndNameSchema,

            applicationPassword: Yup.string()
              .trim()
              .required(getString('fieldRequired', { field: getString('common.getStarted.appPassword') }))
          })
          .required()
        return baseSchema
      default:
        return Yup.object().shape({})
    }
  }, [getString, selectedGitProvider])

  //#endregion

  //#region on change of a git provider

  const resetField = (field: keyof SelectGitProviderInterface): void => {
    const { setFieldValue, setFieldTouched } = formikRef.current || {}
    setFieldValue?.(field, '')
    setFieldTouched?.(field, false)
  }

  const resetFormFields = React.useCallback((): void => {
    setTestConnectionStatus(TestStatus.NOT_INITIATED)
    switch (selectedGitProvider?.type) {
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
  }, [selectedGitProvider])

  //#endregion

  const getUrlLabel = (connectorType: ConnectorInfoDTO['type']): string => {
    switch (connectorType) {
      case Connectors.GIT:
        return getString('common.git.gitAccountUrl')
      case Connectors.GITHUB:
        return getString('common.git.gitHubAccountUrl')
      case Connectors.GITLAB:
        return getString('common.git.gitLabAccountUrl')
      case Connectors.BITBUCKET:
        return getString('common.git.bitbucketAccountUrl')
      default:
        return ''
    }
  }
  const getUrlLabelPlaceholder = (connectorType: ConnectorInfoDTO['type']): string => {
    switch (connectorType) {
      case Connectors.GIT:
      case Connectors.GITHUB:
        return getString('common.git.gitHubUrlPlaceholder')

      case Connectors.GITLAB:
        return getString('common.git.gitLabUrlPlaceholder')

      case Connectors.BITBUCKET:
        return getString('common.git.bitbucketUrlPlaceholder')
      default:
        return ''
    }
  }
  return (
    <>
      <Layout.Vertical width="70%" padding={{ bottom: 'xxlarge' }}>
        {authMethod === GitAuthenticationMethod.OAuth && oAuthStatus === Status.IN_PROGRESS ? (
          <PageSpinner message={getString('connectors.oAuth.inProgress')} />
        ) : null}
        <Formik<SelectGitProviderInterface>
          initialValues={{
            ...getInitialValues(),
            gitProvider: selectedGitProvider,
            gitAuthenticationMethod: undefined
          }}
          formName="cdInfraProvisiong-gitProvider"
          validationSchema={getValidationSchema()}
          validateOnChange={true}
          onSubmit={(values: SelectGitProviderInterface) => Promise.resolve(values)}
        >
          {formikProps => {
            formikRef.current = formikProps
            return (
              <FormikForm>
                {selectedGitProvider ? (
                  <Layout.Vertical>
                    <Container padding={{ bottom: 'large' }}>
                      <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'small' }}>
                        {getString('common.getStarted.authMethod')}
                      </Text>
                      <Layout.Vertical padding={{ top: 'medium' }}>
                        <FormInput.Text
                          name="url"
                          label={
                            <Text font={{ variation: FontVariation.FORM_LABEL }}>
                              {selectedGitProvider?.type && getUrlLabel(selectedGitProvider.type)}
                            </Text>
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e?.target?.value) {
                              formikRef?.current?.setFieldValue('url', e.target.value)
                              setTestConnectionStatus(TestStatus.NOT_INITIATED)
                            }
                          }}
                          placeholder={getUrlLabelPlaceholder(selectedGitProvider?.type || 'Github')}
                        />
                        <Container>
                          <Text font={{ variation: FontVariation.BODY }}>
                            {getString('common.git.testRepositoryDescription', {
                              scope: getString('rbac.account')
                            })}
                          </Text>

                          <FormInput.Text
                            name="validationRepo"
                            label={
                              <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                {getString('common.git.testRepository')}
                              </Text>
                            }
                            placeholder={getString('common.git.selectRepoLabel')}
                            tooltipProps={{
                              dataTooltipId: `${getString('common.git.testRepository')}DetailsStepForm_validationRepo`
                            }}
                          />
                        </Container>

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
                              if (selectedGitProvider?.type) {
                                try {
                                  const { headers } = getRequestOptions()
                                  const oauthRedirectEndpoint = `${OAUTH_REDIRECT_URL_PREFIX}?provider=${selectedGitProvider.type.toLowerCase()}&accountId=${accountId}`
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
                              (selectedGitProvider?.type &&
                                [Connectors.GITHUB].includes(selectedGitProvider.type as ConnectorInfoDTO['type']) &&
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
                              if (selectedGitProvider?.type) {
                                const gitAuthMethod = GitProviderTypeToAuthenticationMethodMapping.get(
                                  selectedGitProvider.type as ConnectorInfoDTO['type']
                                )
                                setAuthMethod(gitAuthMethod)
                              }
                            }}
                            intent={shouldRenderAuthFormFields() ? 'primary' : 'none'}
                          />
                          {authMethod === GitAuthenticationMethod.OAuth && renderOAuthConnectionStatus()}
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

                      {shouldRenderAuthFormFields() && (
                        <Layout.Vertical padding={{ top: 'medium' }} flex={{ alignItems: 'flex-start' }}>
                          <Container padding={{ top: 'xsmall' }} width="100%">
                            {renderTextField({
                              name: 'username',
                              label: 'username',
                              tooltipId: 'onboardingUsername'
                            })}

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
                                AccessTokenPermissionsDocLinks.get(
                                  selectedGitProvider?.type as ConnectorInfoDTO['type']
                                ),
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
                                {(selectedGitProvider.type === Connectors.BITBUCKET
                                  ? getString('permissions')
                                  : getString('common.scope').concat('s')
                                ).toLowerCase()}
                                :&nbsp;{joinAsASentence(permissionsForSelectedGitProvider.permissions)}.
                              </Text>
                            ) : null}
                          </Layout.Horizontal>
                        </Layout.Vertical>
                      )}
                    </Container>
                    {shouldRenderAuthFormFields() && (
                      <Layout.Vertical padding={{ top: 'small' }}>
                        <Text font={{ variation: FontVariation.H5 }}>{getString('common.smtp.testConnection')}</Text>
                        <Text>{getString('common.getStarted.verifyConnection')}</Text>
                        <Container padding={{ top: 'medium' }}>
                          <TestConnection />
                        </Container>
                      </Layout.Vertical>
                    )}
                  </Layout.Vertical>
                ) : null}
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </>
  )
}

export const SelectGitProvider = React.forwardRef(SelectGitProviderRef)
