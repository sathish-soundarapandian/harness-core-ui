/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useRef, useState, useEffect } from 'react'
import {
  Accordion,
  AccordionHandle,
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
  Select,
  SelectOption,
  Text,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation, PopoverProps } from '@harness/design-system'
import cx from 'classnames'
import * as Yup from 'yup'
import type { FormikContextType } from 'formik'
import { defaultTo, get, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { FormGroup, Label } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import type { ResponseMessage } from 'services/cd-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  RepositoriesRefs,
  RepositoriesRepoAppsResponse,
  Servicev1Repository,
  useAgentRepositoryServiceCreateRepository,
  useAgentRepositoryServiceListApps,
  useAgentRepositoryServiceListRefs
} from 'services/gitops'
import { getLastURLPathParam } from '@common/utils/utils'
import {
  APIError,
  DEFAULT_SAMPLE_REPO,
  getFullAgentWithScope,
  RepositoryInterface,
  RevisionType,
  revisionTypeArray
} from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import { DestinationStep } from './DestinationStep'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'
import moduleCss from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

const getRevisionsTransformedArr = (
  revisions: RepositoriesRefs | null
): { revisionsBranchesArr: SelectOption[]; revisionsTagsArr: SelectOption[] } => {
  const revisionsBranchesArr: SelectOption[] = defaultTo(
    revisions?.branches?.map(branch => {
      return {
        label: defaultTo(branch, ''),
        value: defaultTo(branch, '')
      }
    }),
    []
  )

  const revisionsTagsArr: SelectOption[] = defaultTo(
    revisions?.tags?.map(tag => {
      return {
        label: defaultTo(tag, ''),
        value: defaultTo(tag, '')
      }
    }),
    []
  )
  return { revisionsBranchesArr, revisionsTagsArr }
}

const getPathArr = (paths: RepositoriesRepoAppsResponse | null): SelectOption[] => {
  const pathsArr: SelectOption[] = defaultTo(
    paths?.items?.map(path => {
      return {
        label: defaultTo(path.path, ''),
        value: defaultTo(path.path, ''),
        type: defaultTo(path.type, '')
      }
    }),
    []
  )
  return pathsArr
}
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
    saveRepositoryData,
    state: { repository: repositoryData }
  } = useCDOnboardingContext()
  const toast = useToaster()
  const { agent: agentIdentifier, scope } = props.prevStepData as any
  const connectionStatus = false
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(
    connectionStatus || TestStatus.NOT_INITIATED
  )

  const accordionRef = React.useRef<AccordionHandle>({} as AccordionHandle)
  const [revisionType, setRevisionType] = React.useState<string>(RevisionType.Branch)
  const [testConnectionErrors, setTestConnectionErrors] = useState<ResponseMessage[]>()
  const [isDestinationStepEnabled, setDestinationStepEnabled] = useState<boolean>(true)

  const { getString } = useStrings()
  const formikRef = useRef<FormikContextType<RepositoryInterface>>()
  const { accountId } = useParams<ProjectPathProps>()
  const repoURL = formikRef.current?.values?.repo
  const defaultQueryParams = {
    accountIdentifier: accountId
  }

  const { mutate } = useAgentRepositoryServiceCreateRepository({
    agentIdentifier: '',
    queryParams: {
      accountIdentifier: accountId,
      identifier: getLastURLPathParam(defaultTo(repoURL, ''))
    }
  })

  const createRepo = (
    data: RepositoryInterface & { identifier: string },
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
          identifier: getLastURLPathParam(defaultTo(repoURL, ''))
        },
        pathParams: {
          agentIdentifier: fullAgentName
        }
      }
    )
  }

  const defaultRevisionsParams = {
    agentIdentifier: getFullAgentWithScope(agentIdentifier, scope),
    queryRepo: '',
    'query.revision': ''
  }
  const defaultPathParams = {
    agentIdentifier,
    queryRepo: ''
  }

  const {
    data: revisions,
    loading: loadingRevisions,
    refetch: fetchRevisions,
    error: revisionsLoadingError
  } = useAgentRepositoryServiceListRefs({
    queryParams: defaultQueryParams,
    identifier: getLastURLPathParam(defaultTo(repoURL, '')),
    ...defaultRevisionsParams,
    lazy: true
  })

  const { revisionsBranchesArr, revisionsTagsArr } = getRevisionsTransformedArr(revisions)
  const {
    data: paths,
    loading: loadingPaths,
    error: appsFetchError,
    refetch: fetchAppsList
  } = useAgentRepositoryServiceListApps({
    identifier: getLastURLPathParam(defaultTo(repoURL, '')),
    queryParams: { ...defaultRevisionsParams, ...defaultQueryParams },
    ...defaultPathParams,
    lazy: true
  })
  useEffect(() => {
    if (revisionsLoadingError) {
      toast.showError(`Failed loading revisions: ${(revisionsLoadingError as APIError).data.error}`)
    }
  }, [revisionsLoadingError])

  useEffect(() => {
    if (appsFetchError) {
      toast.showError(`Failed loading paths: ${(appsFetchError as APIError).data.error}`)
    }
  }, [appsFetchError])

  const pathsArr = getPathArr(paths)

  const isTestConnectionDisabled = (): boolean => {
    if (formikRef.current?.values?.repo === DEFAULT_SAMPLE_REPO) {
      return false
    } else {
      if (formikRef.current?.values?.authType === getString('cd.getStartedWithCD.usernameAndPassword')) {
        return !formikRef.current?.values?.username || !formikRef.current?.values?.password
      } else {
        return !formikRef.current?.values?.authType || !formikRef.current?.values?.connectionType
      }
    }
  }

  const getRepoPayloadData = (data: RepositoryInterface): RepositoryInterface => {
    if (
      (data.authType === getString('cd.getStartedWithCD.anonymous') && data.connectionType === getString('HTTPS')) ||
      data.repo === DEFAULT_SAMPLE_REPO
    ) {
      data = { ...data, connectionType: 'HTTPS_ANONYMOUS' }
    }
    if (data.repo === DEFAULT_SAMPLE_REPO) {
      data = { ...data, authType: getString('cd.getStartedWithCD.anonymous') }
    }
    if (data.authType === getString('cd.getStartedWithCD.anonymous')) {
      const { username, password, ...restData } = data
      return restData
    }
    return data
  }

  const TestConnection = (): React.ReactElement => {
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
      case TestStatus.NOT_INITIATED:
        return (
          <Layout.Vertical>
            <Button
              text={getString('cd.getStartedWithCD.testConnection')}
              size={ButtonSize.SMALL}
              width={200}
              disabled={isTestConnectionDisabled()}
              type="submit"
              onClick={() => {
                const fullAgentName = getFullAgentWithScope(agentIdentifier, scope)
                setTestConnectionStatus(TestStatus.IN_PROGRESS)
                setTestConnectionErrors([])
                const data: RepositoryInterface = getRepoPayloadData(formikRef.current?.values || {})

                const repoPayload = {
                  ...data,
                  name: getLastURLPathParam(defaultTo(repoURL, '')),
                  insecure: false,
                  ...defaultQueryParams,
                  identifier: getLastURLPathParam(defaultTo(repoURL, ''))
                }
                createRepo({ inheritedCreds: false, ...repoPayload }, fullAgentName, false)
                  .then((response: Servicev1Repository) => {
                    if (response.repository?.connectionState?.status === 'Successful') {
                      setTestConnectionStatus(TestStatus.SUCCESS)
                      if (formikRef.current?.values?.repo !== DEFAULT_SAMPLE_REPO) {
                        fetchRevisions({
                          queryParams: defaultQueryParams,
                          pathParams: {
                            identifier: response?.identifier,
                            ...defaultRevisionsParams
                          }
                        })
                      }
                    } else {
                      setTestConnectionStatus(TestStatus.FAILED)
                      setTestConnectionErrors([
                        {
                          level: 'ERROR',
                          message: (response as any)?.message
                        }
                      ])
                    }
                  })
                  .catch(err => {
                    setTestConnectionStatus(TestStatus.FAILED)
                    setTestConnectionErrors((err?.data as any)?.responseMessages)
                  })
              }}
              className={css.downloadButton}
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

  const handleConnectionTypeChange = (val: string) => {
    formikRef.current?.setFieldValue('connectionType', val)
  }

  const handleAuthTypeChange = (val: string) => {
    formikRef.current?.setFieldValue('authType', val)
  }

  const repositoryTypes = [
    {
      label: getString('pipeline.manifestType.gitConnectorLabel'),
      icon: 'service-github' as IconName,
      value: REPO_TYPES.GIT
    },
    {
      label: getString('cd.getStartedWithCD.helm'),
      icon: 'service-helm' as IconName,
      value: REPO_TYPES.HELM
    }
  ]

  const getTargetRevisionItems = () => {
    if (formikRef.current?.values?.repo !== DEFAULT_SAMPLE_REPO) {
      return revisionType === RevisionType.Branch ? revisionsBranchesArr : revisionsTagsArr
    } else {
      return [
        {
          label: getString('cd.getStartedWithCD.master'),
          value: getString('cd.getStartedWithCD.master')
        }
      ]
    }
  }

  const getValidationSchema: Yup.ObjectSchema = Yup.object().shape({
    repo: Yup.string().required(getString('common.validation.repository')),
    username: Yup.string().when('authType', {
      is: getString('cd.getStartedWithCD.usernameAndPassword'),
      then: Yup.string().required(getString('validation.username'))
    }),
    password: Yup.string().when('authType', {
      is: getString('cd.getStartedWithCD.usernameAndPassword'),
      then: Yup.string().required(getString('validation.password'))
    })
  })

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
            <Accordion
              ref={accordionRef}
              collapseProps={{ keepChildrenMounted: false }}
              panelClassName={moduleCss.configureGitopsPanel}
              summaryClassName={moduleCss.configureGitopsPanelSummary}
            >
              <Accordion.Panel
                details={
                  <Formik<RepositoryInterface>
                    initialValues={{
                      ...repositoryData
                    }}
                    validationSchema={getValidationSchema}
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
                                  cardClassName={moduleCss.serviceDeploymentTypeSmallCard}
                                  renderItem={(item: RepoTypeItem) => (
                                    <>
                                      <Layout.Vertical flex>
                                        <Icon
                                          name={item.icon}
                                          size={24}
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
                            {formikProps.values.type === REPO_TYPES.GIT ? (
                              <ul className={css.progress}>
                                <li className={`${css.progressItem} ${css.progressItemActive}`}>
                                  <Text
                                    font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                                    className={css.subHeading}
                                  >
                                    {getString('authentication').toLocaleUpperCase()}
                                  </Text>
                                  {testConnectionStatus === TestStatus.SUCCESS && formikProps.values.repo ? (
                                    <Layout.Vertical>
                                      <Layout.Vertical className={css.success}>
                                        <Layout.Horizontal className={css.textPadding}>
                                          <Icon name="success-tick" size={25} className={css.iconPadding} />
                                          <Text
                                            className={css.success}
                                            font={{ variation: FontVariation.H6 }}
                                            color={Color.GREEN_800}
                                          >
                                            {`${getString('cd.getStartedWithCD.successfullyAuthenticated')} ${
                                              formikRef.current?.values.repo
                                            }`}
                                          </Text>
                                        </Layout.Horizontal>
                                      </Layout.Vertical>
                                      <Text
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setTestConnectionStatus(TestStatus.NOT_INITIATED)}
                                        color={Color.PRIMARY_7}
                                      >
                                        {getString('cd.getStartedWithCD.tryAnotherCreds')}
                                      </Text>
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
                                        style={{ width: '400px' }}
                                        placeholder={getString('UrlLabel')}
                                        label={getString('UrlLabel')}
                                      />
                                      {formikProps.values.repo !== DEFAULT_SAMPLE_REPO && (
                                        <>
                                          <Text font="normal" className={css.smallMarginBottomClass}>
                                            {getString('cd.getStartedWithCD.selectAuthType')}
                                          </Text>
                                          <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
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
                                            <>
                                              <Text font="normal" className={css.smallMarginBottomClass}>
                                                {getString('authentication')}
                                              </Text>
                                              <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
                                                <Button
                                                  onClick={() =>
                                                    handleAuthTypeChange(getString('cd.getStartedWithCD.anonymous'))
                                                  }
                                                  className={cx(
                                                    css.kubernetes,
                                                    authType === getString('cd.getStartedWithCD.anonymous')
                                                      ? css.active
                                                      : undefined
                                                  )}
                                                >
                                                  {getString('cd.getStartedWithCD.anonymous')}
                                                </Button>
                                                <Button
                                                  onClick={() => {
                                                    handleAuthTypeChange(
                                                      getString('cd.getStartedWithCD.usernameAndPassword')
                                                    )
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
                                            </>
                                          )}
                                        </>
                                      )}
                                      <Layout.Vertical padding={{ top: 'small' }}>
                                        <Container padding={{ top: 'medium' }}>
                                          <TestConnection />
                                        </Container>
                                      </Layout.Vertical>
                                    </>
                                  )}
                                  <div className={css.spacing} />
                                </li>
                                <li className={`${css.progressItem} ${css.progressItemActive}`}>
                                  <Text
                                    font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                                    className={css.subHeading}
                                  >
                                    {getString('pipeline.gitDetails').toLocaleUpperCase()}
                                  </Text>
                                  {testConnectionStatus === TestStatus.SUCCESS && (
                                    <div>
                                      <FormGroup>
                                        <Label className={css.formLabel}>
                                          <HarnessDocTooltip
                                            tooltipId={'source-step_targetRevision'}
                                            labelText={getString('cd.getStartedWithCD.targetRevision')}
                                          />
                                        </Label>

                                        <div style={{ display: 'flex', gap: '8px', paddingTop: '5px' }}>
                                          <div style={{ width: '30%' }}>
                                            <Select
                                              inputProps={{
                                                placeholder: loadingRevisions ? 'Loading' : '- Select -'
                                              }}
                                              allowCreatingNewItems
                                              usePortal
                                              value={
                                                !loadingRevisions
                                                  ? {
                                                      label: get(formikProps, 'values.targetRevision'),
                                                      value: get(formikProps, 'values.targetRevision')
                                                    }
                                                  : null
                                              }
                                              addClearBtn
                                              name="targetRevision"
                                              items={getTargetRevisionItems()}
                                              disabled={loadingRevisions}
                                              onChange={item => {
                                                if (item.value !== formikProps?.values?.targetRevision) {
                                                  formikProps.setFieldValue('targetRevision', item.value)
                                                  formikProps.setFieldValue('path', '')
                                                  if (item) {
                                                    fetchAppsList({
                                                      pathParams: {
                                                        agentIdentifier: getFullAgentWithScope(agentIdentifier, scope),
                                                        identifier: getLastURLPathParam(defaultTo(repoURL, ''))
                                                      },
                                                      queryParams: {
                                                        ...defaultQueryParams,
                                                        'query.revision': item.value as string
                                                      }
                                                    })
                                                  }
                                                }
                                              }}
                                            />
                                          </div>
                                          <div className={css.revisionTypeWrapper}>
                                            <Select
                                              className={css.revisionTypeNewApp}
                                              name="revisionType"
                                              value={revisionTypeArray.find(item => item.value == revisionType)}
                                              items={revisionTypeArray}
                                              onChange={item => {
                                                formikProps.setFieldValue('targetRevision', '')
                                                formikProps.setFieldValue('path', '')
                                                setRevisionType(item.value as string)
                                                props?.setAppDetails({})
                                              }}
                                              data-tooltip-id="app-details-revision-type"
                                            />
                                          </div>
                                        </div>
                                      </FormGroup>
                                      <Layout.Horizontal className={css.pathContainer}>
                                        <FormGroup style={{ width: '100%' }}>
                                          <Label className={css.formLabel}>
                                            <HarnessDocTooltip
                                              tooltipId={'source-step_targetPath'}
                                              labelText={getString('common.path')}
                                            />
                                          </Label>
                                          <Select
                                            addClearBtn
                                            allowCreatingNewItems
                                            items={pathsArr}
                                            className={css.pathInput}
                                            usePortal
                                            inputProps={{
                                              placeholder: loadingPaths ? 'Loading' : '- Select -'
                                            }}
                                            value={
                                              !loadingPaths
                                                ? {
                                                    label: defaultTo(formikProps.values?.path, ''),
                                                    value: defaultTo(formikProps.values?.path, '')
                                                  }
                                                : null
                                            }
                                            name="path"
                                            disabled={loadingRevisions}
                                            onChange={item => {
                                              if (item.value !== formikProps?.values?.path) {
                                                formikProps.setFieldValue('path', item.value)
                                              }
                                            }}
                                          />
                                        </FormGroup>
                                      </Layout.Horizontal>
                                    </div>
                                  )}
                                </li>
                              </ul>
                            ) : (
                              <div>{getString('common.comingSoon')}</div>
                            )}
                          </Layout.Vertical>
                          {formikProps.values.type === REPO_TYPES.GIT ? (
                            <Button
                              variation={ButtonVariation.SECONDARY}
                              rightIcon="chevron-right"
                              style={{ marginTop: '20px' }}
                              minimal
                              onClick={() => {
                                saveRepositoryData({
                                  ...formikProps.values,
                                  identifier: getLastURLPathParam(defaultTo(repoURL, ''))
                                })
                                setDestinationStepEnabled(false)
                                accordionRef.current.open('application-repo-destination-step')
                              }}
                            >
                              {getString('common.nextStep')}
                            </Button>
                          ) : null}
                          <div className={css.marginTopClass} />
                        </FormikForm>
                      )
                    }}
                  </Formik>
                }
                id={'application-repo-source-step'}
                summary={
                  <Text
                    font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                    margin={{ bottom: 'small' }}
                    color={Color.GREY_600}
                    data-tooltip-id="gitopsOnboardingSource"
                  >
                    {getString('cd.getStartedWithCD.gitopsOnboardingSource')}
                    <HarnessDocTooltip tooltipId="gitopsOnboardingSource" useStandAlone={true} />
                  </Text>
                }
              />
              <Accordion.Panel
                details={<DestinationStep {...props} />}
                disabled={isDestinationStepEnabled}
                id={'application-repo-destination-step'}
                summary={
                  <Text
                    font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                    margin={{ bottom: 'small' }}
                    color={Color.GREY_600}
                  >
                    {getString('cd.getStartedWithCD.gitopsOnboardingDestination')}
                    <HarnessDocTooltip tooltipId="gitopsOnboardingDestination" useStandAlone={true} />
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
