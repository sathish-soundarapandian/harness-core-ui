/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import cx from 'classnames'
import { get, isEmpty, set } from 'lodash-es'
import {
  Layout,
  Button,
  Formik,
  FormInput,
  Text,
  FormikForm as Form,
  StepProps,
  Container,
  SelectOption,
  ButtonVariation,
  PageSpinner
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import type { FormikContextType, FormikProps } from 'formik'
import { useHostedBuilds } from '@common/hooks/useHostedBuild'
import { Status } from '@common/utils/Constants'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  setupGithubFormData,
  GitConnectionType,
  saveCurrentStepData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type {
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO,
  ConnectorConnectivityDetails
} from 'services/cd-ng'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'
import { GitAuthTypes, GitAPIAuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { ConnectViaOAuth } from '@connectors/common/ConnectViaOAuth/ConnectViaOAuth'
import {
  ConnectorSecretScope,
  getCommonConnectorsValidationSchema,
  handleOAuthEventProcessing,
  OAuthEventProcessingResponse,
  OAUTH_PLACEHOLDER_VALUE
} from '../../CreateConnectorUtils'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import css from './StepGitlabAuthentication.module.scss'
import commonCss from '../../commonSteps/ConnectorCommonStyles.module.scss'

interface StepGitlabAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface GitlabAuthenticationProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  status?: ConnectorConnectivityDetails
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface GitlabFormInterface {
  connectionType: string
  authType: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
  accessToken: SecretReferenceInterface | void
  installationId: string
  applicationId: string
  privateKey: SecretReferenceInterface | void
  sshKey: SecretReferenceInterface | void
  kerberosKey: SecretReferenceInterface | void
  apiAccessToken: SecretReferenceInterface | void
  enableAPIAccess: boolean
  apiAuthType: string
}

const defaultInitialFormData: GitlabFormInterface = {
  connectionType: GitConnectionType.HTTP,
  authType: GitAuthTypes.USER_PASSWORD,
  username: undefined,
  password: undefined,
  accessToken: undefined,
  installationId: '',
  applicationId: '',
  privateKey: undefined,
  sshKey: undefined,
  apiAccessToken: undefined,
  kerberosKey: undefined,
  enableAPIAccess: false,
  apiAuthType: GitAPIAuthTypes.TOKEN
}

const RenderGitlabAuthForm: React.FC<{ formikProps: FormikProps<GitlabFormInterface>; gitAuthType?: GitAuthTypes }> =
  props => {
    const { formikProps, gitAuthType } = props
    const { getString } = useStrings()
    switch (gitAuthType) {
      case GitAuthTypes.USER_PASSWORD:
        return (
          <>
            <TextReference
              name="username"
              stringId="username"
              type={formikProps.values.username ? formikProps.values.username?.type : ValueType.TEXT}
            />
            <SecretInput name="password" label={getString('password')} />
          </>
        )
      case GitAuthTypes.USER_TOKEN:
        return (
          <>
            <TextReference
              name="username"
              stringId="username"
              type={formikProps.values.username ? formikProps.values.username?.type : ValueType.TEXT}
            />
            <SecretInput name="accessToken" label={getString('personalAccessToken')} />
          </>
        )
      case GitAuthTypes.KERBEROS:
        return (
          <>
            <SSHSecretInput name="kerberosKey" label={getString('kerberos')} />
          </>
        )
      default:
        return null
    }
  }

const RenderAPIAccessForm: React.FC<FormikProps<GitlabFormInterface>> = props => {
  const { getString } = useStrings()
  switch (props.values.apiAuthType) {
    case GitAPIAuthTypes.TOKEN:
      return <SecretInput name="apiAccessToken" label={getString('personalAccessToken')} />
    default:
      return null
  }
}

const RenderAPIAccessFormWrapper: React.FC<FormikProps<GitlabFormInterface>> = formikProps => {
  const { getString } = useStrings()

  const apiAuthOptions: Array<SelectOption> = [
    {
      label: getString('personalAccessToken'),
      value: GitAPIAuthTypes.TOKEN
    }
  ]

  useEffect(() => {
    formikProps.setFieldValue('apiAuthType', GitAPIAuthTypes.TOKEN)
  }, [])

  return (
    <>
      <Container className={css.authHeaderRow}>
        <Text font={{ variation: FontVariation.H6 }}>{getString('common.git.APIAuthentication')}</Text>
        <FormInput.Select
          name="apiAuthType"
          items={apiAuthOptions}
          className={commonStyles.authTypeSelect}
          value={apiAuthOptions[0]}
        />
      </Container>
      <RenderAPIAccessForm {...formikProps} />
    </>
  )
}

const StepGitlabAuthentication: React.FC<StepProps<StepGitlabAuthenticationProps> & GitlabAuthenticationProps> =
  props => {
    const { getString } = useStrings()
    const { prevStepData, nextStep, accountId } = props
    const [initialValues, setInitialValues] = useState(defaultInitialFormData)
    const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)
    const oAuthSecretIntercepted = useRef<boolean>(false)
    const [oAuthStatus, setOAuthStatus] = useState<Status>(Status.TO_DO)
    const formikRef = useRef<FormikContextType<any>>()
    const [isAccessRevoked, setIsAccessRevoked] = useState<boolean>(false)
    const { enabledHostedBuildsForFreeUsers } = useHostedBuilds()
    const [gitAuthType, setGitAuthType] = useState<GitAuthTypes>()
    const [forceFailOAuthTimeoutId, setForceFailOAuthTimeoutId] = useState<NodeJS.Timeout>()
    const [oAuthResponse, setOAuthResponse] = useState<OAuthEventProcessingResponse>()
    const authOptions: Array<SelectOption> = [
      {
        label: getString('usernamePassword'),
        value: GitAuthTypes.USER_PASSWORD
      },
      {
        label: getString('usernameToken'),
        value: GitAuthTypes.USER_TOKEN
      }
      // Disabling temp:
      // {
      //   label: getString('kerberos'),
      //   value: GitAuthTypes.KERBEROS
      // }
    ]

    enabledHostedBuildsForFreeUsers &&
      authOptions.push({ label: getString('common.oAuthLabel'), value: GitAuthTypes.OAUTH })

    //#region  OAuth setup and processing

    const isGitlabConnectorOAuthBased = useMemo((): boolean => {
      return get(prevStepData, 'spec.authentication.spec.type') === GitAuthTypes.OAUTH
    }, [prevStepData])

    const isExistingOAuthConnectionHealthy = useMemo((): boolean => {
      return (
        isGitlabConnectorOAuthBased &&
        (!isEmpty(get(prevStepData, 'spec.authentication.spec.spec.tokenRef')) ||
          props.status?.status === Status.SUCCESS)
      )
    }, [prevStepData, isGitlabConnectorOAuthBased, props.status?.status])

    const handleOAuthServerEvent = useCallback(
      (event: MessageEvent): void => {
        handleOAuthEventProcessing({
          event,
          oAuthStatus,
          setOAuthStatus,
          oAuthSecretIntercepted,
          onSuccessCallback: ({ accessTokenRef, refreshTokenRef }: OAuthEventProcessingResponse) => {
            setOAuthResponse({ accessTokenRef, refreshTokenRef })
            if (forceFailOAuthTimeoutId) {
              clearTimeout(forceFailOAuthTimeoutId)
            }
          }
        })
      },
      [formikRef.current?.values, oAuthStatus, forceFailOAuthTimeoutId]
    )

    useEffect(() => {
      if (oAuthStatus === Status.SUCCESS && oAuthResponse) {
        const { accessTokenRef, refreshTokenRef } = oAuthResponse
        const formValuesCopy = { ...formikRef.current?.values }
        let updatedFormValues = set(
          formValuesCopy,
          'oAuthAccessTokenRef',
          `${ConnectorSecretScope[Scope.ACCOUNT]}${accessTokenRef}`
        )
        if (refreshTokenRef !== OAUTH_PLACEHOLDER_VALUE) {
          updatedFormValues = set(
            updatedFormValues,
            'oAuthRefreshTokenRef',
            `${ConnectorSecretScope[Scope.ACCOUNT]}${refreshTokenRef}`
          )
        }
        formikRef.current?.setValues(updatedFormValues)
      }
    }, [oAuthStatus, oAuthResponse, formikRef.current])

    useEffect(() => {
      window.addEventListener('message', handleOAuthServerEvent)

      return () => {
        window.removeEventListener('message', handleOAuthServerEvent)
      }
    }, [handleOAuthServerEvent])

    useEffect(() => {
      if (isGitlabConnectorOAuthBased) {
        setIsAccessRevoked(props.status?.status !== Status.SUCCESS)
      }
    }, [props.status])

    useEffect(() => {
      if (oAuthSecretIntercepted.current) {
        window.removeEventListener('message', handleOAuthServerEvent) // remove event listener once oauth is done
      }
    }, [oAuthSecretIntercepted])

    //#endregion

    useEffect(() => {
      setGitAuthType(
        get(prevStepData, 'authType') || get(prevStepData, 'spec.authentication.spec.type') || GitAuthTypes.USER_TOKEN
      )
    }, [prevStepData])

    useEffect(() => {
      if (loadingConnectorSecrets) {
        if (props.isEditMode) {
          if (props.connectorInfo) {
            setupGithubFormData(props.connectorInfo, accountId).then(data => {
              setInitialValues(data as GitlabFormInterface)
              setLoadingConnectorSecrets(false)
            })
          } else {
            setLoadingConnectorSecrets(false)
          }
        }
      }
    }, [loadingConnectorSecrets])

    const handleSubmit = (formData: ConnectorConfigDTO) => {
      trackEvent(ConnectorActions.AuthenticationStepSubmit, {
        category: Category.CONNECTOR,
        connector_type: Connectors.GitLab
      })
      nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepGitlabAuthenticationProps)
    }
    const { trackEvent } = useTelemetry()
    useTrackEvent(ConnectorActions.AuthenticationStepLoad, {
      category: Category.CONNECTOR,
      connector_type: Connectors.GitLab
    })
    const getValidationSchema = useCallback((): Yup.ObjectSchema<Record<string, any> | undefined> => {
      return gitAuthType === GitAuthTypes.OAUTH
        ? Yup.object().shape({})
        : getCommonConnectorsValidationSchema(getString).concat(
            Yup.object().shape({
              kerberosKey: Yup.object().when('authType', {
                is: val => val === GitAuthTypes.KERBEROS,
                then: Yup.object().required(getString('validation.kerberosKey')),
                otherwise: Yup.object().nullable()
              }),
              accessToken: Yup.object().when(['connectionType', 'authType'], {
                is: (connectionType, authType) =>
                  connectionType === GitConnectionType.HTTP && authType === GitAuthTypes.USER_TOKEN,
                then: Yup.object().required(getString('connectors.validation.personalAccessToken')),
                otherwise: Yup.object().nullable()
              }),
              apiAuthType: Yup.string().when('enableAPIAccess', {
                is: val => val,
                then: Yup.string().trim().required(getString('validation.authType'))
              }),
              apiAccessToken: Yup.object().when(['enableAPIAccess', 'apiAuthType'], {
                is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.TOKEN,
                then: Yup.object().required(getString('connectors.validation.personalAccessToken')),
                otherwise: Yup.object().nullable()
              })
            })
          )
    }, [gitAuthType])

    return loadingConnectorSecrets ||
      (formikRef.current?.values.authType === GitAuthTypes.OAUTH && oAuthStatus === Status.IN_PROGRESS) ? (
      <PageSpinner
        message={
          formikRef.current?.values.authType === GitAuthTypes.OAUTH && oAuthStatus === Status.IN_PROGRESS
            ? getString('connectors.oAuth.inProgress')
            : ''
        }
      />
    ) : (
      <Layout.Vertical
        width="60%"
        className={cx(css.secondStep, commonCss.connectorModalMinHeight, commonCss.stepContainer)}
      >
        <Text font={{ variation: FontVariation.H3 }}>{getString('credentials')}</Text>

        <Formik
          initialValues={{
            ...initialValues,
            ...prevStepData
          }}
          formName="stepGitlabAuth"
          validationSchema={getValidationSchema()}
          onSubmit={handleSubmit}
        >
          {formikProps => {
            saveCurrentStepData<ConnectorInfoDTO>(
              props.getCurrentStepData,
              Object.assign(formikProps.values, {
                authType: gitAuthType,
                ...(gitAuthType === GitAuthTypes.OAUTH && { apiAuthType: GitAPIAuthTypes.OAUTH, enableAPIAccess: true })
              }) as unknown as ConnectorInfoDTO
            )
            formikRef.current = formikProps
            return (
              <Form className={cx(commonCss.fullHeight, commonCss.fullHeightDivsWithFlex)}>
                <Container className={cx(css.stepFormWrapper, commonCss.paddingTop8)}>
                  {formikProps.values.connectionType === GitConnectionType.SSH ? (
                    <Layout.Horizontal spacing="medium" flex={{ alignItems: 'baseline' }}>
                      <Text font={{ variation: FontVariation.H6 }}>{getString('authentication')}</Text>
                      <SSHSecretInput name="sshKey" label={getString('SSH_KEY')} />
                    </Layout.Horizontal>
                  ) : (
                    <Container>
                      <Container className={css.authHeaderRow} flex={{ alignItems: 'baseline' }}>
                        <Text font={{ variation: FontVariation.H6 }}>{getString('authentication')}</Text>
                        <FormInput.Select
                          name="authType"
                          items={authOptions}
                          disabled={false}
                          className={commonStyles.authTypeSelect}
                          onChange={(selection: SelectOption) => {
                            const selectedOption = selection.value as GitAuthTypes
                            setGitAuthType(selectedOption)
                            formikProps.setValues({
                              ...formikProps.values,
                              authType: selectedOption,
                              ...(selectedOption === GitAuthTypes.OAUTH
                                ? {
                                    apiAuthType: GitAPIAuthTypes.OAUTH,
                                    enableAPIAccess: true
                                  }
                                : {
                                    apiAuthType: GitAPIAuthTypes.TOKEN,
                                    enableAPIAccess: false
                                  })
                            })
                          }}
                        />
                      </Container>
                      <RenderGitlabAuthForm formikProps={formikProps} gitAuthType={gitAuthType} />
                    </Container>
                  )}
                  {gitAuthType === GitAuthTypes.OAUTH && enabledHostedBuildsForFreeUsers ? (
                    <Layout.Vertical spacing="xlarge">
                      <ConnectViaOAuth
                        gitProviderType={Connectors.GITLAB}
                        accountId={accountId}
                        status={oAuthStatus}
                        setOAuthStatus={setOAuthStatus}
                        isOAuthAccessRevoked={isAccessRevoked}
                        isExistingConnectionHealthy={isExistingOAuthConnectionHealthy}
                        oAuthSecretIntercepted={oAuthSecretIntercepted}
                        forceFailOAuthTimeoutId={forceFailOAuthTimeoutId}
                        setForceFailOAuthTimeoutId={setForceFailOAuthTimeoutId}
                      />
                    </Layout.Vertical>
                  ) : (
                    <>
                      <FormInput.CheckBox
                        name="enableAPIAccess"
                        label={getString('common.git.enableAPIAccess')}
                        padding={{ left: 'xxlarge' }}
                      />
                      <Text font="small" className={commonCss.bottomMargin4}>
                        {getString('common.git.APIAccessDescription')}
                      </Text>
                      {formikProps.values.enableAPIAccess ? <RenderAPIAccessFormWrapper {...formikProps} /> : null}
                    </>
                  )}
                </Container>

                <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="gitlabBackButton"
                    variation={ButtonVariation.SECONDARY}
                  />
                  <Button
                    type="submit"
                    intent="primary"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    variation={ButtonVariation.PRIMARY}
                    disabled={
                      !isGitlabConnectorOAuthBased &&
                      formikProps.values.authType === GitAuthTypes.OAUTH &&
                      oAuthStatus !== Status.SUCCESS
                    }
                  />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    )
  }

export default StepGitlabAuthentication
