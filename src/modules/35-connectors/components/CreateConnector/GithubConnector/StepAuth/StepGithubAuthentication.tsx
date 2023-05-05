/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { get, isEmpty, set } from 'lodash-es'
import cx from 'classnames'
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
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import type { FormikContextType, FormikProps } from 'formik'
import { Status } from '@common/utils/Constants'
import { useHostedBuilds } from '@common/hooks/useHostedBuild'
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
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { GitAuthTypes, GitAPIAuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { ConnectViaOAuth } from '@common/components/ConnectViaOAuth/ConnectViaOAuth'
import { Connectors } from '@connectors/constants'
import type { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { handleOAuthEventProcessing, OAuthEventProcessingResponse } from '@common/components/ConnectViaOAuth/OAuthUtils'
import { useConnectorWizard } from '../../../CreateConnectorWizard/ConnectorWizardContext'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import css from './StepGithubAuthentication.module.scss'
import commonCss from '../../commonSteps/ConnectorCommonStyles.module.scss'

interface StepGithubAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface GithubAuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  status?: ConnectorConnectivityDetails
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  helpPanelReferenceId?: string
}

interface GithubFormInterface {
  connectionType: string
  authType: string
  username: TextReferenceInterface | void
  accessToken: SecretReferenceInterface | void
  installationId: TextReferenceInterface | void
  applicationId: TextReferenceInterface | void
  privateKey: SecretReferenceInterface | void
  sshKey: SecretReferenceInterface | void
  apiAccessToken: SecretReferenceInterface | void
  enableAPIAccess: boolean
  apiAuthType: string
}

const defaultInitialFormData: GithubFormInterface = {
  connectionType: GitConnectionType.HTTP,
  authType: GitAuthTypes.USER_TOKEN,
  username: undefined,
  accessToken: undefined,
  installationId: undefined,
  applicationId: undefined,
  privateKey: undefined,
  sshKey: undefined,
  apiAccessToken: undefined,
  enableAPIAccess: false,
  apiAuthType: GitAPIAuthTypes.TOKEN
}

const RenderGithubAuthForm: React.FC<{
  formikProps: FormikProps<GithubFormInterface>
  gitAuthType?: GitAuthTypes
  scope?: ScopedObjectDTO
}> = props => {
  const { formikProps, gitAuthType, scope } = props
  const { getString } = useStrings()
  switch (gitAuthType) {
    case GitAuthTypes.USER_TOKEN:
      return (
        <>
          <TextReference
            name="username"
            stringId="username"
            type={formikProps.values.username ? formikProps.values.username?.type : ValueType.TEXT}
          />
          <SecretInput name="accessToken" label={getString('personalAccessToken')} scope={scope} />
        </>
      )
    default:
      return null
  }
}

const RenderAPIAccessForm: React.FC<FormikProps<GithubFormInterface> & { scope?: ScopedObjectDTO }> = props => {
  const { scope, values } = props
  const { getString } = useStrings()
  switch (props.values.apiAuthType) {
    case GitAPIAuthTypes.GITHUB_APP:
      return (
        <Container>
          <TextReference
            name="installationId"
            stringId="common.git.installationId"
            type={values.installationId ? values.installationId?.type : ValueType.TEXT}
          />
          <TextReference
            name="applicationId"
            stringId="common.git.applicationId"
            type={values.applicationId ? values.applicationId?.type : ValueType.TEXT}
          />
          <MultiTypeSecretInput name="privateKey" label={getString('common.git.privateKey')} />
        </Container>
      )
    case GitAPIAuthTypes.TOKEN:
      return (
        <Container data-tooltip-id="gitHubPersonalAccessTooltip">
          <SecretInput
            name="apiAccessToken"
            label={getString('personalAccessToken')}
            tooltipProps={{ dataTooltipId: 'gitHubPersonalAccessTooltip' }}
            scope={scope}
          />
        </Container>
      )
    default:
      return null
  }
}

const RenderAPIAccessFormWrapper: React.FC<FormikProps<GithubFormInterface> & ScopedObjectDTO> = props => {
  const { getString } = useStrings()

  const apiAuthOptions: Array<SelectOption> = [
    {
      label: getString('personalAccessToken'),
      value: GitAPIAuthTypes.TOKEN
    },
    {
      label: getString('common.git.gitHubApp'),
      value: GitAPIAuthTypes.GITHUB_APP
    }
  ]

  return (
    <>
      <Container className={css.authHeaderRow}>
        <Text font={{ variation: FontVariation.H6 }} tooltipProps={{ dataTooltipId: 'githubApiAuthentication' }}>
          {getString('common.git.APIAuthentication')}
        </Text>
        <FormInput.Select
          name="apiAuthType"
          items={apiAuthOptions}
          className={cx(commonStyles.authTypeSelect, commonStyles.marginBottom3)}
        />
      </Container>
      <RenderAPIAccessForm {...props} />
    </>
  )
}

const StepGithubAuthentication: React.FC<StepProps<StepGithubAuthenticationProps> & GithubAuthenticationProps> =
  props => {
    const { getString } = useStrings()
    const { prevStepData, nextStep, accountId } = props
    const [initialValues, setInitialValues] = useState(defaultInitialFormData)
    const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(props.isEditMode)
    const oAuthSecretIntercepted = useRef<boolean>(false)
    const [oAuthStatus, setOAuthStatus] = useState<Status>(Status.TO_DO)
    const formikRef = useRef<FormikContextType<any>>()
    const [isAccessRevoked, setIsAccessRevoked] = useState<boolean>(false)
    const { enabledHostedBuildsForFreeUsers } = useHostedBuilds()
    const [gitAuthType, setGitAuthType] = useState<GitAuthTypes>()
    const [forceFailOAuthTimeoutId, setForceFailOAuthTimeoutId] = useState<NodeJS.Timeout>()
    const [oAuthResponse, setOAuthResponse] = useState<OAuthEventProcessingResponse>()

    const scope: ScopedObjectDTO | undefined = props.isEditMode
      ? {
          orgIdentifier: prevStepData?.orgIdentifier,
          projectIdentifier: prevStepData?.projectIdentifier
        }
      : undefined

    useConnectorWizard({
      helpPanel: props.helpPanelReferenceId ? { referenceId: props.helpPanelReferenceId, contentWidth: 900 } : undefined
    })
    const authOptions: Array<SelectOption> = [
      {
        label: getString('usernameToken'),
        value: GitAuthTypes.USER_TOKEN
      }
    ]
    enabledHostedBuildsForFreeUsers &&
      authOptions.push({ label: getString('common.oAuthLabel'), value: GitAuthTypes.OAUTH })

    //#region  OAuth setup and processing

    const isGithubConnectorOAuthBased = useMemo((): boolean => {
      return get(prevStepData, 'spec.authentication.spec.type') === GitAuthTypes.OAUTH
    }, [prevStepData])

    const isExistingOAuthConnectionHealthy = useMemo((): boolean => {
      return (
        isGithubConnectorOAuthBased &&
        (!isEmpty(get(prevStepData, 'spec.authentication.spec.spec.tokenRef')) ||
          props.status?.status === Status.SUCCESS)
      )
    }, [prevStepData, isGithubConnectorOAuthBased, props.status?.status])

    const handleOAuthServerEvent = useCallback(
      (event: MessageEvent): void => {
        handleOAuthEventProcessing({
          event,
          oAuthStatus,
          setOAuthStatus,
          oAuthSecretIntercepted,
          onSuccessCallback: ({ accessTokenRef }: OAuthEventProcessingResponse) => {
            setOAuthResponse({ accessTokenRef })
            if (forceFailOAuthTimeoutId) {
              clearTimeout(forceFailOAuthTimeoutId)
            }
          }
        })
      },
      [formikRef, oAuthStatus, forceFailOAuthTimeoutId]
    )

    useEffect(() => {
      if (oAuthStatus === Status.SUCCESS && oAuthResponse) {
        const { accessTokenRef } = oAuthResponse
        const formValuesCopy = { ...formikRef.current?.values }
        const updatedFormValues = set(formValuesCopy, 'oAuthAccessTokenRef', `${accessTokenRef}`)
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
      if (isGithubConnectorOAuthBased) {
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
      if (loadingConnectorSecrets && props.isEditMode) {
        if (props.connectorInfo) {
          setupGithubFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as GithubFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }, [loadingConnectorSecrets])

    const handleSubmit = (formData: ConnectorConfigDTO) => {
      nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepGithubAuthenticationProps)
    }

    const getValidationSchema = useCallback((): Yup.ObjectSchema<Record<string, any> | undefined> => {
      return gitAuthType === GitAuthTypes.OAUTH
        ? Yup.object().shape({})
        : Yup.object().shape({
            username: Yup.string()
              .nullable()
              .when('connectionType', {
                is: val => val === GitConnectionType.HTTP,
                then: Yup.string().trim().required(getString('validation.username'))
              }),
            authType: Yup.string().when('connectionType', {
              is: val => val === GitConnectionType.HTTP,
              then: Yup.string().trim().required(getString('validation.authType'))
            }),
            sshKey: Yup.object().when('connectionType', {
              is: val => val === GitConnectionType.SSH,
              then: Yup.object().required(getString('validation.sshKey')),
              otherwise: Yup.object().nullable()
            }),
            accessToken: Yup.object().when(['connectionType', 'authType'], {
              is: (connectionType, authType) =>
                connectionType === GitConnectionType.HTTP && authType === GitAuthTypes.USER_TOKEN,

              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            }),
            apiAccessToken: Yup.object().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.TOKEN,
              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            }),
            privateKey: Yup.string().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.GITHUB_APP,
              then: Yup.string().required(getString('validation.privateKey')),
              otherwise: Yup.string().nullable()
            }),
            apiAuthType: Yup.string().when('enableAPIAccess', {
              is: val => val,
              then: Yup.string().trim().required(getString('validation.authType'))
            }),
            installationId: Yup.string().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.GITHUB_APP,
              then: Yup.string().trim().required(getString('validation.installationId'))
            }),
            applicationId: Yup.string().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.GITHUB_APP,
              then: Yup.string().trim().required(getString('validation.applicationId'))
            })
          })
    }, [gitAuthType])

    return loadingConnectorSecrets ||
      (formikRef.current?.values.authType === GitAuthTypes.OAUTH && oAuthStatus === Status.IN_PROGRESS) ? (
      <PageSpinner
        message={
          formikRef.current?.values.authType === GitAuthTypes.OAUTH && oAuthStatus === Status.IN_PROGRESS
            ? getString('common.oAuth.inProgress')
            : ''
        }
      />
    ) : (
      <Layout.Vertical className={cx(css.secondStep, commonCss.connectorModalMinHeight, commonCss.stepContainer)}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('credentials')}</Text>

        <Formik
          initialValues={{
            ...initialValues,
            ...prevStepData
          }}
          formName="stepGithubAuthForm"
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
                      <Text
                        tooltipProps={{ dataTooltipId: 'githubAuthentication' }}
                        font={{ variation: FontVariation.H6 }}
                      >
                        {getString('authentication')}
                      </Text>
                      <SSHSecretInput name="sshKey" label={getString('SSH_KEY')} />
                    </Layout.Horizontal>
                  ) : (
                    <Container>
                      <Container className={css.authHeaderRow} flex={{ alignItems: 'baseline' }}>
                        <Text
                          font={{ variation: FontVariation.H6 }}
                          tooltipProps={{ dataTooltipId: 'githubAuthentication' }}
                        >
                          {getString('authentication')}
                        </Text>
                        <FormInput.Select
                          name="authType"
                          items={authOptions}
                          disabled={false}
                          className={cx(commonStyles.authTypeSelect, commonStyles.marginBottom3)}
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
                      <RenderGithubAuthForm formikProps={formikProps} gitAuthType={gitAuthType} scope={scope} />
                    </Container>
                  )}

                  {gitAuthType === GitAuthTypes.OAUTH && enabledHostedBuildsForFreeUsers ? (
                    <ConnectViaOAuth
                      gitProviderType={Connectors.GITHUB}
                      accountId={accountId}
                      status={oAuthStatus}
                      setOAuthStatus={setOAuthStatus}
                      isOAuthAccessRevoked={isAccessRevoked}
                      isExistingConnectionHealthy={isExistingOAuthConnectionHealthy}
                      oAuthSecretIntercepted={oAuthSecretIntercepted}
                      forceFailOAuthTimeoutId={forceFailOAuthTimeoutId}
                      setForceFailOAuthTimeoutId={setForceFailOAuthTimeoutId}
                      orgIdentifier={props.orgIdentifier}
                      projectIdentifier={props.projectIdentifier}
                    />
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
                      {formikProps.values.enableAPIAccess ? (
                        <RenderAPIAccessFormWrapper
                          {...formikProps}
                          orgIdentifier={prevStepData?.orgIdentifier}
                          projectIdentifier={prevStepData?.projectIdentifier}
                        />
                      ) : null}
                    </>
                  )}
                </Container>

                <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="githubBackButton"
                    variation={ButtonVariation.SECONDARY}
                  />
                  <Button
                    type="submit"
                    intent="primary"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    variation={ButtonVariation.PRIMARY}
                    disabled={
                      !isGithubConnectorOAuthBased &&
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

export default StepGithubAuthentication
