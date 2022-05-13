/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'
import type { FormikContextType, FormikProps } from 'formik'
import cx from 'classnames'
import {
  Text,
  FontVariation,
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
  Color,
  FormError
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { OAuthProviders, OAuthProviderType } from '@common/constants/OAuthProviders'
import { joinAsASentence } from '@common/utils/StringUtils'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import { Connectors } from '@connectors/constants'
import {
  AllSaaSGitProviders,
  AllOnPremGitProviders,
  GitAuthenticationMethod,
  GitProvider,
  GitProviderTypeToAuthenticationMethodMapping,
  GitProviderPermission,
  Hosting,
  GitProviderPermissions
} from './Constants'

import css from './InfraProvisioningWizard.module.scss'

const OAUTH_REDIRECT_URL_PREFIX = `${location.protocol}//${location.host}/gateway/`

export interface SelectGitProviderRef {
  values: SelectGitProviderInterface
  setFieldTouched(field: keyof SelectGitProviderInterface & string, isTouched?: boolean, shouldValidate?: boolean): void
  validate: () => boolean
  showValidationErrors: () => void
}

export type SelectGitProviderForwardRef =
  | ((instance: SelectGitProviderRef | null) => void)
  | React.MutableRefObject<SelectGitProviderRef | null>
  | null

interface SelectGitProviderProps {
  selectedHosting?: Hosting
  disableNextBtn: () => void
  enableNextBtn: () => void
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
  const { selectedHosting, disableNextBtn, enableNextBtn } = props
  const { getString } = useStrings()
  const [gitProvider, setGitProvider] = useState<GitProvider | undefined>()
  const [authMethod, setAuthMethod] = useState<GitAuthenticationMethod>()
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(TestStatus.NOT_INITIATED)
  const formikRef = useRef<FormikContextType<SelectGitProviderInterface>>()

  useEffect(() => {
    if (authMethod === GitAuthenticationMethod.AccessToken) {
      setTestConnectionStatus(TestStatus.NOT_INITIATED)
      enableNextBtn()
    }
  }, [authMethod])

  useEffect(() => {
    if (gitProvider) {
      if (selectedHosting === Hosting.SaaS) {
        if (authMethod === GitAuthenticationMethod.AccessToken) {
          if (testConnectionStatus === TestStatus.SUCCESS) {
            enableNextBtn()
          } else {
            disableNextBtn()
          }
        }
      } else {
        if (testConnectionStatus === TestStatus.SUCCESS) {
          enableNextBtn()
        } else {
          disableNextBtn()
        }
      }
    }
  }, [gitProvider, authMethod, testConnectionStatus])

  const setForwardRef = ({
    values,
    setFieldTouched
  }: {
    values: SelectGitProviderInterface
    setFieldTouched(
      field: keyof SelectGitProviderInterface & string,
      isTouched?: boolean,
      shouldValidate?: boolean
    ): void
  }): void => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }

    if (values) {
      forwardRef.current = {
        values: values,
        setFieldTouched: setFieldTouched,
        validate: validateGitProviderSetup,
        showValidationErrors: markFieldsTouchedToShowValidationErrors
      }
    }
  }

  useEffect(() => {
    if (formikRef.current?.values && formikRef.current?.setFieldTouched) {
      setForwardRef({
        values: formikRef.current.values,
        setFieldTouched: formikRef.current.setFieldTouched
      })
    }
  })

  const TestConnection = (): React.ReactElement => {
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
      case TestStatus.NOT_INITIATED:
        return (
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('common.smtp.testConnection')}
            size={ButtonSize.SMALL}
            type="submit"
            onClick={() => {
              if (validateGitProviderSetup()) {
                setTestConnectionStatus(TestStatus.IN_PROGRESS)
                //TODO remove this when api will available for integration
                setTimeout(() => setTestConnectionStatus(TestStatus.SUCCESS), 3000)
              }
            }}
            className={css.testConnectionBtn}
            id="test-connection-btn"
          />
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

  //#region form view

  const permissionsForSelectedGitProvider = GitProviderPermissions.filter(
    (providerPermissions: GitProviderPermission) => providerPermissions.type === gitProvider?.type
  )[0]

  const getButtonLabel = React.useCallback((): string => {
    switch (gitProvider?.type) {
      case Connectors.GITHUB:
        return getString('ci.getStartedWithCI.accessTokenLabel')
      case Connectors.BITBUCKET:
        return `${getString('username')} & ${getString('ci.getStartedWithCI.appPassword')}`
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
        label: 'ci.getStartedWithCI.apiUrlLabel',
        tooltipId: 'url'
      })
      switch (gitProvider?.type) {
        case Connectors.GITHUB:
          return (
            <Layout.Vertical width="100%">
              {selectedHosting === Hosting.OnPrem ? apiUrlField : null}
              {renderTextField({
                name: 'accessToken',
                label: 'ci.getStartedWithCI.accessTokenLabel',
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
                label: 'ci.getStartedWithCI.appPassword',
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
    let isSetupValid = false
    const { accessToken, accessKey, applicationPassword, username, url } = formikRef.current?.values || {}
    if (selectedHosting === Hosting.SaaS) {
      switch (gitProvider?.type) {
        case Connectors.GITHUB:
          isSetupValid = authMethod === GitAuthenticationMethod.AccessToken && !!accessToken
          break
        case Connectors.GITLAB:
          isSetupValid = authMethod === GitAuthenticationMethod.AccessKey && !!accessKey
          break
        case Connectors.BITBUCKET:
          isSetupValid =
            authMethod === GitAuthenticationMethod.UserNameAndApplicationPassword && !!username && !!applicationPassword
          break
      }
    } else if (selectedHosting === Hosting.OnPrem) {
      switch (gitProvider?.type) {
        case Connectors.GITHUB:
          isSetupValid = !!accessToken && !!url
          break
        case Connectors.GITLAB:
          isSetupValid = !!accessKey && !!url
          break
        case Connectors.BITBUCKET:
          isSetupValid = !!username && !!applicationPassword && !!url
          break
      }
    }
    return isSetupValid
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
          [Connectors.GITHUB, Connectors.GITLAB, Connectors.BITBUCKET].includes(gitProvider.type) &&
          selectedHosting === Hosting.OnPrem
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
            field: getString('ci.getStartedWithCI.apiUrlLabel')
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
              .required(getString('fieldRequired', { field: getString('ci.getStartedWithCI.accessTokenLabel') }))
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
              .required(getString('fieldRequired', { field: getString('ci.getStartedWithCI.appPassword') }))
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

  //#endregion

  return (
    <Layout.Vertical width="70%">
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.codeRepo')}</Text>
      <Formik<SelectGitProviderInterface>
        initialValues={{
          ...getInitialValues(),
          gitProvider: undefined,
          gitAuthenticationMethod: undefined
        }}
        formName="ciInfraProvisiong-gitProvider"
        validationSchema={getValidationSchema()}
        validateOnChange={true}
        onSubmit={(values: SelectGitProviderInterface) => Promise.resolve(values)}
      >
        {formikProps => {
          formikRef.current = formikProps
          setForwardRef({
            values: formikProps.values,
            setFieldTouched: formikProps.setFieldTouched
          })
          return (
            <Form>
              <Container
                padding={{ top: 'xxlarge', bottom: 'xxxlarge' }}
                className={cx({ [css.borderBottom]: gitProvider })}
              >
                <CardSelect
                  data={selectedHosting === Hosting.SaaS ? AllSaaSGitProviders : AllOnPremGitProviders}
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
                          { [css.githubIcon]: item.icon === 'github' },
                          { [css.gitlabIcon]: item.icon === 'gitlab' },
                          { [css.bitbucketIcon]: item.icon === 'bitbucket-blue' },
                          { [css.genericGitIcon]: item.icon === 'service-github' }
                        )}
                      />
                      <Text font={{ variation: FontVariation.SMALL_SEMI }} padding={{ top: 'small' }}>
                        {getString(item.label)}
                      </Text>
                    </Layout.Vertical>
                  )}
                  selected={gitProvider}
                  onChange={(item: GitProvider) => {
                    formikProps.setFieldValue('gitProvider', item)
                    setGitProvider(item)
                    setTestConnectionStatus(TestStatus.NOT_INITIATED)
                    resetFormFields()
                    setAuthMethod(undefined)
                  }}
                />
                {formikProps.touched.gitProvider && !formikProps.values.gitProvider ? (
                  <Container padding={{ top: 'xsmall' }}>
                    <FormError
                      name={'gitProvider'}
                      errorMessage={getString('fieldRequired', {
                        field: getString('ci.getStartedWithCI.codeRepoLabel')
                      })}
                    />
                  </Container>
                ) : null}
              </Container>
              {gitProvider ? (
                <Layout.Vertical>
                  <Container
                    className={cx({ [css.borderBottom]: shouldRenderAuthFormFields() })}
                    padding={{ bottom: 'xxlarge' }}
                  >
                    <Text font={{ variation: FontVariation.H5 }} padding={{ top: 'xlarge', bottom: 'small' }}>
                      {getString(
                        selectedHosting === Hosting.SaaS
                          ? 'ci.getStartedWithCI.authMethod'
                          : 'ci.getStartedWithCI.setUpAuth'
                      )}
                    </Text>
                    {selectedHosting === Hosting.SaaS ? (
                      <Layout.Vertical padding={{ top: 'medium' }}>
                        <Layout.Horizontal spacing="small">
                          <Button
                            className={css.authMethodBtn}
                            round
                            text={getString('ci.getStartedWithCI.oAuthLabel')}
                            onClick={() => {
                              const oAuthProviderDetails = OAuthProviders.filter(
                                (oAuthProvider: OAuthProviderType) =>
                                  gitProvider && gitProvider.type.toUpperCase() === oAuthProvider.name.toUpperCase()
                              )[0]
                              if (oAuthProviderDetails) {
                                const redirectionUrl = `${OAUTH_REDIRECT_URL_PREFIX}api/users/${oAuthProviderDetails.url}`
                                window.open(redirectionUrl, '_blank')
                              }
                              formikProps.setFieldValue('gitAuthenticationMethod', GitAuthenticationMethod.OAuth)
                              setAuthMethod(GitAuthenticationMethod.OAuth)
                            }}
                            intent={authMethod === GitAuthenticationMethod.OAuth ? 'primary' : 'none'}
                          />
                          <Button
                            className={css.authMethodBtn}
                            round
                            text={getButtonLabel()}
                            onClick={() => {
                              resetFormFields()
                              if (gitProvider?.type) {
                                const gitAuthMethod = GitProviderTypeToAuthenticationMethodMapping.get(gitProvider.type)
                                formikProps.setFieldValue('gitAuthenticationMethod', gitAuthMethod)
                                setAuthMethod(gitAuthMethod)
                              }
                            }}
                            intent={shouldRenderAuthFormFields() ? 'primary' : 'none'}
                          />
                        </Layout.Horizontal>
                        {formikProps.touched.gitAuthenticationMethod && !formikProps.values.gitAuthenticationMethod ? (
                          <Container padding={{ top: 'xsmall' }}>
                            <FormError
                              name={'gitAuthenticationMethod'}
                              errorMessage={getString('fieldRequired', {
                                field: getString('ci.getStartedWithCI.authMethodLabel')
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
                          text={getString('ci.getStartedWithCI.learnMoreAboutPermissions')}
                          className={css.learnMore}
                          tooltipProps={{ dataTooltipId: 'learnMoreAboutPermissions' }}
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
                      <Text>{getString('ci.getStartedWithCI.verifyConnection')}</Text>
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
