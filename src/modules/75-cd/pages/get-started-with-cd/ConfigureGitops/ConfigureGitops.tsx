/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useRef, useState } from 'react'
import {
  Accordion,
  Button,
  ButtonSize,
  ButtonVariation,
  CardSelect,
  Container,
  Formik,
  FormikForm,
  FormInput,
  HarnessDocTooltip,
  Icon,
  IconName,
  Layout,
  Text
} from '@harness/uicore'
import { Color, FontVariation, PopoverProps } from '@harness/design-system'
import cx from 'classnames'
import type { FormikContextType } from 'formik'
import { noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import { ResponseMessage, Servicev1Repository, useAgentRepositoryServiceCreateRepository } from 'services/cd-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getFullAgentWithScope, RepositoriesRepository } from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'
import moduleCss from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface DelegateSelectorRefInstance {
  isDelegateInstalled?: boolean
}
export type DelegateSelectorForwardRef =
  | ((instance: DelegateSelectorRefInstance | null) => void)
  | React.MutableRefObject<DelegateSelectorRefInstance | null>
  | null
export interface DelegateTypeSelectorProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
}

const enum REPO_TYPES {
  GIT = 'git',
  HELM = 'helm'
}
export interface RepoTypeItem {
  label: string
  icon: IconName
  value: string
  disabled?: boolean
  tooltip?: ReactElement | string
  tooltipProps?: PopoverProps
}

const ConfigureGitopsRef = (props: any): JSX.Element => {
  const {
    state: { repository: repositoryData }
  } = useCDOnboardingContext()
  const [loading, setloading] = useState(false)
  const { name, agent, identifier, scope } = props.prevStepData as any
  const connectionStatus = false
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { mutate } = useAgentRepositoryServiceCreateRepository({
    agentIdentifier: '',
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      identifier: ''
    }
  })

  const createRepo = (
    data: RepositoriesRepository & { identifier: string },
    fullAgentName: string,
    upsert: boolean
  ): Promise<Servicev1Repository> => {
    return mutate(
      {
        repo: {
          ...data
        },
        upsert: upsert
      },
      {
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          identifier: identifier
        },
        pathParams: {
          agentIdentifier: fullAgentName
        }
      }
    )
  }

  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(
    connectionStatus || TestStatus.NOT_INITIATED
  )

  const [testConnectionErrors, setTestConnectionErrors] = useState<ResponseMessage[]>()

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
                const fullAgentName = getFullAgentWithScope(agent, scope)
                setTestConnectionStatus(TestStatus.IN_PROGRESS)
                setTestConnectionErrors([])
                let data: RepositoriesRepository = formikRef.current?.values || {}
                if (
                  data.authType === getString('cd.getStartedWithCD.annonymous') &&
                  data.connectionType === getString('HTTPS')
                ) {
                  data = { ...data, connectionType: 'HTTPS_ANONYMOUS' }
                }
                const repoPayload = {
                  ...data,
                  name,
                  insecure: false,
                  // project: projectIdentifier,
                  identifier
                }
                createRepo({ inheritedCreds: false, ...repoPayload }, fullAgentName, false)
                  .then((response: Servicev1Repository) => {
                    if (response.repository?.connectionState?.status === 'Successful') {
                      setTestConnectionStatus(TestStatus.SUCCESS)
                    } else {
                      setTestConnectionStatus(TestStatus.FAILED)
                      setTestConnectionErrors([
                        {
                          level: 'ERROR',
                          message: (response as any)?.message
                        }
                      ])
                    }
                    setloading(false)
                  })
                  .catch(err => {
                    setloading(false)
                    setTestConnectionStatus(TestStatus.FAILED)
                    setTestConnectionErrors((err?.data as any)?.responseMessages)
                  })
              }}
              className={moduleCss.testConnectionBtn}
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

  const { getString } = useStrings()
  const formikRef = useRef<FormikContextType<RepositoriesRepository>>()

  const handleConnectionTypeChange = (val: boolean) => {
    formikRef.current?.setFieldValue('connectionType', val)
  }

  const handleAuthTypeChange = (val: boolean) => {
    formikRef.current?.setFieldValue('authType', val)
  }

  const repositoryTypes = [
    {
      label: getString('pipeline.manifestType.gitConnectorLabel'),
      icon: 'service-git' as IconName,
      value: REPO_TYPES.GIT
    },
    {
      label: getString('cd.getStartedWithCD.helm'),
      icon: 'service-helm' as IconName,
      value: REPO_TYPES.HELM
    }
  ]

  return (
    <Layout.Vertical width={'100%'} margin={{ left: 'small' }}>
      <Layout.Horizontal>
        <Layout.Vertical width={'55%'}>
          <Container>
            <Text
              font={{ variation: FontVariation.H3, weight: 'semi-bold' }}
              margin={{ bottom: 'small' }}
              color={Color.GREY_600}
              data-tooltip-id="cdOnboardingConfigureStep"
            >
              {getString('cd.getStartedWithCD.gitopsOnboardingConfigureStep')}
              <HarnessDocTooltip tooltipId="cdOnboardingConfigureStep" useStandAlone={true} />
            </Text>
            <div className={css.borderBottomClass} />
            <Accordion collapseProps={{ keepChildrenMounted: false }}>
              <Accordion.Panel
                details={
                  <Formik<RepositoriesRepository>
                    initialValues={{
                      ...repositoryData?.repository
                    }}
                    formName="select-deployment-type-cd"
                    onSubmit={noop}
                  >
                    {formikProps => {
                      formikRef.current = formikProps
                      const selectedRepoType: RepoTypeItem | undefined = repositoryTypes?.find(
                        repoType => repoType.value === formikProps.values?.type
                      )
                      const connectionType: string | undefined = formikProps.values?.connectionType
                      const authType: string | undefined = formikProps.values?.authType
                      return (
                        <FormikForm>
                          <Layout.Vertical>
                            <Container padding={{ bottom: 'xxlarge' }}>
                              <Container padding={{ top: 'xxlarge', bottom: 'xxlarge' }}>
                                <CardSelect
                                  data={repositoryTypes as RepoTypeItem[]}
                                  cornerSelected={true}
                                  className={moduleCss.icons}
                                  cardClassName={moduleCss.serviceDeploymentTypeCard}
                                  renderItem={(item: RepoTypeItem) => (
                                    <>
                                      <Layout.Vertical flex>
                                        <Icon
                                          name={item.icon}
                                          size={48}
                                          flex
                                          className={moduleCss.serviceDeploymentTypeIcon}
                                        />
                                        <Text font={{ variation: FontVariation.BODY2 }} className={moduleCss.text1}>
                                          {item.label}
                                        </Text>
                                      </Layout.Vertical>
                                    </>
                                  )}
                                  selected={selectedRepoType}
                                  onChange={(item: RepoTypeItem) => {
                                    formikProps.setFieldValue('type', item.value)
                                  }}
                                />
                              </Container>
                            </Container>
                            <ul className={css.progress}>
                              <li className={`${css.progressItem} ${css.progressItemActive}`}>
                                <Text
                                  font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                                  className={css.subHeading}
                                >
                                  {getString('authentication').toLocaleUpperCase()}
                                </Text>
                                {testConnectionStatus === TestStatus.SUCCESS && formikProps.values.repo ? (
                                  <Layout.Vertical className={css.success}>
                                    <Layout.Horizontal className={css.textPadding}>
                                      <Icon name="success-tick" size={25} className={css.iconPadding} />
                                      <Text
                                        className={css.success}
                                        font={{ variation: FontVariation.H6 }}
                                        color={Color.RED_600}
                                      >
                                        {getString('cd.getStartedWithCD.successfullyAuthenticated', {
                                          target: formikRef.current?.values.repo || ''
                                        })}
                                      </Text>
                                    </Layout.Horizontal>
                                  </Layout.Vertical>
                                ) : (
                                  <>
                                    {testConnectionStatus === TestStatus.FAILED && (
                                      <Layout.Vertical className={css.danger}>
                                        <Layout.Horizontal className={css.textPadding}>
                                          <Icon name="danger-icon" size={25} className={css.iconPadding} />
                                          <Text
                                            className={css.dangerColor}
                                            font={{ variation: FontVariation.H6 }}
                                            color={Color.RED_600}
                                          >
                                            {getString('cd.getStartedWithCD.failedToAuthenticate', {
                                              target: formikRef.current?.values.repo?.toString() || ''
                                            })}
                                          </Text>
                                        </Layout.Horizontal>
                                        <Layout.Vertical width={'83%'}>
                                          <Text className={css.textPadding}>
                                            {getString('cd.getStartedWithCD.failedSourceText')}
                                          </Text>
                                          <ul>
                                            <li>
                                              <Text className={css.textPadding}>
                                                {getString('cd.getStartedWithCD.checkAnnonymously')}
                                              </Text>
                                            </li>
                                            <li>
                                              <Text className={css.textPadding}>
                                                {getString('cd.getStartedWithCD.checkAuthSettings')}
                                              </Text>
                                            </li>
                                          </ul>
                                        </Layout.Vertical>
                                      </Layout.Vertical>
                                    )}
                                    <FormInput.Text
                                      name="repo"
                                      placeholder={getString('UrlLabel')}
                                      label={getString('UrlLabel')}
                                    />
                                    <Text font="normal" className={css.marginBottomClass}>
                                      {getString('cd.getStartedWithCD.selectAuthType')}
                                    </Text>
                                    <Layout.Horizontal spacing="medium">
                                      <Button
                                        onClick={() => handleConnectionTypeChange(getString('HTTPS'))}
                                        className={cx(
                                          css.kubernetes,
                                          connectionType === getString('HTTPS') ? css.active : undefined
                                        )}
                                      >
                                        {getString('HTTPS')}
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          handleConnectionTypeChange(getString('SSH'))
                                        }}
                                        className={cx(
                                          css.docker,
                                          connectionType === getString('SSH') ? css.active : undefined
                                        )}
                                      >
                                        {getString('SSH')}
                                      </Button>
                                    </Layout.Horizontal>
                                    {connectionType === getString('HTTPS') && (
                                      <Layout.Vertical>
                                        <Text font="normal" className={css.marginBottomClass}>
                                          {getString('authentication')}
                                        </Text>
                                        <Layout.Horizontal spacing="medium">
                                          <Button
                                            onClick={() =>
                                              handleAuthTypeChange(getString('cd.getStartedWithCD.annonymous'))
                                            }
                                            className={cx(
                                              css.kubernetes,
                                              authType === getString('cd.getStartedWithCD.annonymous')
                                                ? css.active
                                                : undefined
                                            )}
                                          >
                                            {getString('cd.getStartedWithCD.annonymous')}
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              handleAuthTypeChange(getString('cd.getStartedWithCD.usernameAndPassword'))
                                            }}
                                            className={cx(
                                              css.docker,
                                              authType === getString('cd.getStartedWithCD.usernameAndPassword')
                                                ? css.active
                                                : undefined
                                            )}
                                          >
                                            {getString('cd.getStartedWithCD.usernameAndPassword')}
                                          </Button>
                                        </Layout.Horizontal>
                                        {authType === getString('cd.getStartedWithCD.usernameAndPassword') && (
                                          <Layout.Vertical>
                                            <FormInput.Text
                                              className={css.inputWidth}
                                              name="username"
                                              label={getString('username')}
                                              tooltipProps={{ dataTooltipId: `username` }}
                                            />
                                            <FormInput.Text
                                              className={css.inputWidth}
                                              inputGroup={{ type: 'password' }}
                                              name="password"
                                              tooltipProps={{ dataTooltipId: `password` }}
                                              label={getString('password')}
                                            />
                                          </Layout.Vertical>
                                        )}
                                        <Layout.Vertical padding={{ top: 'small' }}>
                                          <Text font={{ variation: FontVariation.H5 }}>
                                            {getString('common.smtp.testConnection')}
                                          </Text>
                                          <Text>{getString('common.getStarted.verifyConnection')}</Text>
                                          <Container padding={{ top: 'medium' }}>
                                            <TestConnection />
                                          </Container>
                                        </Layout.Vertical>
                                      </Layout.Vertical>
                                    )}
                                  </>
                                )}
                              </li>
                              <li className={`${css.progressItem} ${css.progressItemActive}`}>
                                <Text
                                  font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                                  className={css.subHeading}
                                >
                                  {getString('pipeline.gitDetails').toLocaleUpperCase()}
                                </Text>
                                {testConnectionStatus === TestStatus.SUCCESS && <div>enabled</div>}
                              </li>
                            </ul>
                          </Layout.Vertical>
                          <div className={css.marginTopClass} />

                          <Button
                            variation={ButtonVariation.PRIMARY}
                            disabled={loading}
                            type="submit"
                            text={getString('submit')}
                            rightIcon="chevron-right"
                          />
                        </FormikForm>
                      )
                    }}
                  </Formik>
                }
                id={'application-repo'}
                summary={
                  <Text
                    font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                    margin={{ bottom: 'small' }}
                    color={Color.GREY_600}
                    data-tooltip-id="cdOnboardingInstallDelegate"
                  >
                    {getString('cd.getStartedWithCD.gitopsOnboardingSource')}
                    <HarnessDocTooltip tooltipId="gitopsOnboardingSource" useStandAlone={true} />
                  </Text>
                }
              />
            </Accordion>

            <div className={css.marginTopClass} />
          </Container>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const ConfigureGitops = React.forwardRef(ConfigureGitopsRef)
