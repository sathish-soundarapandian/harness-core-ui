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
  ExpandingSearchInput,
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
import { defaultTo, get, isEmpty, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { FormGroup, Label } from '@blueprintjs/core'
import { HelpPanel } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import {
  RepositoriesRefs,
  RepositoriesRepoAppDetailsResponse,
  RepositoriesRepoAppsResponse,
  Servicev1Repository,
  useAgentRepositoryServiceCreateRepository,
  useAgentRepositoryServiceGet,
  useAgentRepositoryServiceGetAppDetails,
  useAgentRepositoryServiceListApps,
  useAgentRepositoryServiceListRefs,
  useRepositoryServiceListRepositories
} from 'services/gitops'
import { getLastURLPathParam } from '@common/utils/utils'
import { useDeepCompareEffect } from '@common/hooks'
import {
  APIError,
  DEFAULT_SAMPLE_REPO,
  DeploymentType,
  getFullAgentWithScope,
  RepositoryInterface,
  RevisionType,
  revisionTypeArray,
  SourceCodeType
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

enum AUTH_TYPES {
  ANONYMOUS = 'anonymous',
  USERNAME_AND_PASSWORD = 'usernamepassword'
}

const ConfigureGitopsRef = (props: any): JSX.Element => {
  const {
    saveRepositoryData,
    state: { repository: repositoryData }
  } = useCDOnboardingContext()
  const toast = useToaster()
  const { agent: agentIdentifier, scope } = props.prevStepData as any
  const fullAgentName = getFullAgentWithScope(agentIdentifier, scope)
  const connectionStatus = false
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(
    connectionStatus || TestStatus.NOT_INITIATED
  )

  const accordionRef = React.useRef<AccordionHandle>({} as AccordionHandle)
  const [revisionType, setRevisionType] = React.useState<string>(RevisionType.Branch)
  const [repositoryListdata, setRepositoryListData] = useState<Servicev1Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Servicev1Repository>({})
  const [isDestinationStepEnabled, setDestinationStepEnabled] = useState<boolean>(true)
  const [sampleRepo, setSampleRepo] = useState<Servicev1Repository | null>(null)

  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const formikRef = useRef<FormikContextType<RepositoryInterface>>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const repoURL = formikRef.current?.values?.repo
  const repoId = selectedRepo?.identifier
  const defaultQueryParams = {
    accountIdentifier: accountId
  }

  const { mutate: getRepositories } = useRepositoryServiceListRepositories({})

  const { mutate, error } = useAgentRepositoryServiceCreateRepository({
    agentIdentifier: '',
    queryParams: {
      accountIdentifier: accountId,
      identifier: getLastURLPathParam(defaultTo(repoURL, ''))
    }
  })

  const createRepo = (
    data: RepositoryInterface & { identifier: string },
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
          identifier: getLastURLPathParam(defaultTo(data?.repo, ''))
        },
        pathParams: {
          agentIdentifier: fullAgentName
        }
      }
    )
  }

  const {
    data: testConnectionData,
    error: testConnectionError,
    refetch
  } = useAgentRepositoryServiceGet({
    agentIdentifier: fullAgentName, // TODO: remove this later
    identifier: defaultTo(repoId, ''),
    queryParams: {
      ...defaultQueryParams
    },
    lazy: true
  })

  const defaultRevisionsParams = {
    agentIdentifier: getFullAgentWithScope(agentIdentifier, scope),
    queryRepo: '',
    'query.revision': ''
  }
  const defaultPathParams = {
    agentIdentifier,
    queryRepo: ''
  }

  const defaultAppDetailsParams = {
    agentIdentifier: fullAgentName,
    querySourceRepoUrl: ''
  }

  const {
    data: revisions,
    loading: loadingRevisions,
    refetch: fetchRevisions,
    error: revisionsLoadingError
  } = useAgentRepositoryServiceListRefs({
    queryParams: { ...defaultQueryParams, projectIdentifier, orgIdentifier },
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

  const {
    data: appDetails,
    error: appDetailsFetchError,
    refetch: fetchAppDetails
  } = useAgentRepositoryServiceGetAppDetails({
    queryParams: defaultQueryParams,
    identifier: getLastURLPathParam(defaultTo(repoURL, '')),
    ...defaultAppDetailsParams,
    lazy: true
  })

  useEffect(() => {
    if (!isEmpty(appDetails)) {
      props?.setAppDetails(appDetails as RepositoriesRepoAppDetailsResponse)
    }
  }, [appDetails])

  useEffect(() => {
    if (appDetailsFetchError) {
      toast.showError(`Failed loading app details: ${(appDetailsFetchError as APIError).data.error}`)
    }
  }, [appDetailsFetchError])

  useEffect(() => {
    if (revisionsLoadingError) {
      toast.showError(`Failed loading revisions: ${(revisionsLoadingError as APIError).data.error}`)
    }
  }, [revisionsLoadingError])

  useEffect(() => {
    getRepositories({
      accountIdentifier: accountId,
      agentIdentifier: fullAgentName,
      projectIdentifier,
      orgIdentifier
    }).then(response => {
      setRepositoryListData(defaultTo(response?.content, []))
      if (!response?.content?.length) {
        formikRef.current?.setFieldValue('isNewRepository', true)
      } else {
        const existingSampleRepo = response?.content?.find(repo => repo?.repository?.repo === DEFAULT_SAMPLE_REPO)
        if (existingSampleRepo) {
          setSampleRepo(existingSampleRepo)
        }
      }
    })
  }, [])

  useEffect(() => {
    trackEvent(CDOnboardingActions.SelectSourceTypeDefault, {
      selectedSourceType: repositoryTypes[0].value,
      deployment_type: DeploymentType.GitOps
    })
  }, [])

  useEffect(() => {
    if (appsFetchError) {
      toast.showError(`Failed loading paths: ${(appsFetchError as APIError)?.data?.error}`)
    }
  }, [appsFetchError])

  useEffect(() => {
    if (testConnectionError) {
      toast.showError(`Failed testing connection: ${(appsFetchError as APIError)?.data?.error}`)
    }
  }, [testConnectionError])

  const pathsArr = getPathArr(paths)

  const isTestConnectionDisabled = (): boolean => {
    if (formikRef.current?.values?.sourceCodeType === SourceCodeType.USE_SAMPLE) {
      return false
    } else {
      if (!formikRef.current?.values?.isNewRepository && selectedRepo) {
        return false
      }
      if (formikRef.current?.values?.authType === AUTH_TYPES.USERNAME_AND_PASSWORD) {
        return !formikRef.current?.values?.username || !formikRef.current?.values?.password
      } else {
        return !formikRef.current?.values?.authType || !formikRef.current?.values?.connectionType
      }
    }
  }

  const successRepoCreation = (repository: Servicev1Repository) => {
    if (repository.repository?.connectionState?.status === 'Successful') {
      setTestConnectionStatus(TestStatus.SUCCESS)
      if (formikRef.current?.values?.repo && formikRef.current?.values?.sourceCodeType !== SourceCodeType.USE_SAMPLE) {
        fetchRevisions({
          queryParams: { ...defaultQueryParams, projectIdentifier, orgIdentifier },
          pathParams: {
            identifier: repository?.identifier,
            ...defaultRevisionsParams
          }
        })
      }
    } else {
      setTestConnectionStatus(TestStatus.FAILED)
    }
  }

  useDeepCompareEffect(() => {
    if (testConnectionData) {
      successRepoCreation(defaultTo(testConnectionData, {}))
    }
  }, [testConnectionData])

  const refreshConnectionStatus = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
    refetch({
      pathParams: { agentIdentifier: fullAgentName, identifier: repoId }, // TODO: remove this later
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        'query.repo': repoId,
        'query.forceRefresh': true
      }
    })
  }

  const getRepoPayloadData = (data: RepositoryInterface): RepositoryInterface => {
    if (
      (data.authType === AUTH_TYPES.ANONYMOUS && data.connectionType === getString('HTTPS')) ||
      data.sourceCodeType === SourceCodeType.USE_SAMPLE
    ) {
      data = { ...data, connectionType: 'HTTPS_ANONYMOUS' }
    }
    if (data.sourceCodeType === SourceCodeType.USE_SAMPLE) {
      data = { ...data, authType: AUTH_TYPES.ANONYMOUS }
    }
    if (data.authType === AUTH_TYPES.ANONYMOUS) {
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
              onClick={e => {
                if (
                  (!formikRef.current?.values?.isNewRepository &&
                    formikRef.current?.values?.sourceCodeType === SourceCodeType.PROVIDE_MY_OWN) ||
                  (sampleRepo && formikRef.current?.values?.sourceCodeType === SourceCodeType.USE_SAMPLE) // when user has selected already created sample repo then only connection test is required
                ) {
                  setTestConnectionStatus(TestStatus.IN_PROGRESS)
                  refreshConnectionStatus(e)
                } else {
                  setTestConnectionStatus(TestStatus.IN_PROGRESS)
                  const data: RepositoryInterface = getRepoPayloadData(formikRef.current?.values || {})

                  const repoPayload = {
                    ...data,
                    name: getLastURLPathParam(defaultTo(repoURL, '')),
                    insecure: false,
                    ...defaultQueryParams,
                    identifier: getLastURLPathParam(defaultTo(repoURL, ''))
                  }
                  trackEvent(CDOnboardingActions.TestConnectionClicked, { deployment_type: DeploymentType.GitOps })
                  createRepo({ inheritedCreds: false, ...repoPayload }, false)
                    .then((response: Servicev1Repository) => {
                      successRepoCreation(response)
                      trackEvent(CDOnboardingActions.RepoCreatedSuccessfully, {
                        deployment_type: DeploymentType.GitOps
                      })
                    })
                    .catch(() => {
                      setTestConnectionStatus(TestStatus.FAILED)
                      trackEvent(CDOnboardingActions.RepoCreateFailure, { deployment_type: DeploymentType.GitOps })
                    })
                }
              }}
              className={css.downloadButton}
              id="test-connection-btn"
            />
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

  const handleSourceCodeTypeChange = (val: string) => {
    formikRef.current?.setFieldValue('sourceCodeType', val)
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
    if (formikRef.current?.values?.sourceCodeType === SourceCodeType.PROVIDE_MY_OWN) {
      return revisionType === RevisionType.Branch ? revisionsBranchesArr : revisionsTagsArr
    } else {
      return [
        {
          label: getString('cd.getStartedWithCD.main'),
          value: getString('cd.getStartedWithCD.main')
        }
      ]
    }
  }

  const getValidationSchema: Yup.ObjectSchema = Yup.object().shape({
    repo: Yup.string().required(getString('common.validation.repository')),
    username: Yup.string().when('authType', {
      is: AUTH_TYPES.USERNAME_AND_PASSWORD,
      then: Yup.string().required(getString('validation.username'))
    }),
    password: Yup.string().when('authType', {
      is: AUTH_TYPES.USERNAME_AND_PASSWORD,
      then: Yup.string().required(getString('validation.password'))
    })
  })

  return (
    <>
      <Layout.Vertical width={'100%'}>
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
                activeId="application-repo-source-step"
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
                        const sourceCodeType: string | undefined = formikProps.values?.sourceCodeType
                        const isNewRepository: boolean | undefined = formikProps.values?.isNewRepository

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
                                      trackEvent(CDOnboardingActions.SelectSourceType, {
                                        selectedSourceType: item.value,
                                        deployment_type: DeploymentType.GitOps
                                      })
                                    }}
                                  />
                                </Container>
                              </Container>
                              {formikProps.values.type === REPO_TYPES.GIT ? (
                                <Layout.Vertical margin={{ bottom: 'large' }}>
                                  <Text
                                    font={{ variation: FontVariation.H6, weight: 'semi-bold' }}
                                    className={css.secondaryHeader}
                                  >
                                    {getString('cd.getStartedWithCD.sourceOrSampleCode').toLocaleUpperCase()}
                                  </Text>
                                  <Layout.Horizontal spacing="medium" margin={{ bottom: 'xxlarge' }}>
                                    <Button
                                      onClick={() => {
                                        handleSourceCodeTypeChange(SourceCodeType.USE_SAMPLE)
                                        trackEvent(CDOnboardingActions.SelectSourceRepoType, {
                                          sourceRepo: SourceCodeType.USE_SAMPLE,
                                          deployment_type: DeploymentType.GitOps
                                        })
                                      }}
                                      className={cx(
                                        css.docker,
                                        sourceCodeType === SourceCodeType.USE_SAMPLE ? css.active : undefined
                                      )}
                                    >
                                      {getString('cd.getStartedWithCD.useSample')}
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        handleSourceCodeTypeChange(SourceCodeType.PROVIDE_MY_OWN)
                                        trackEvent(CDOnboardingActions.SelectSourceRepoType, {
                                          sourceRepo: SourceCodeType.PROVIDE_MY_OWN,
                                          deployment_type: DeploymentType.GitOps
                                        })
                                      }}
                                      className={cx(
                                        css.kubernetes,
                                        sourceCodeType === SourceCodeType.PROVIDE_MY_OWN ? css.active : undefined
                                      )}
                                    >
                                      {getString('cd.getStartedWithCD.provideMyOwn')}
                                    </Button>
                                  </Layout.Horizontal>
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
                                          <Layout.Vertical className={css.success} margin={{ bottom: 'medium' }}>
                                            <Layout.Horizontal padding={{ top: 'medium', bottom: 'medium' }}>
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
                                            <Layout.Vertical className={css.danger} margin={{ bottom: 'medium' }}>
                                              <Layout.Horizontal className={css.textPadding}>
                                                <Icon name="danger-icon" size={25} className={css.iconPadding} />
                                                <Text
                                                  className={css.dangerColor}
                                                  font={{ variation: FontVariation.H6 }}
                                                  color={Color.RED_600}
                                                >
                                                  {`${getString('cd.getStartedWithCD.failedToAuthenticate')} ${
                                                    formikProps.values.repo
                                                  }`}
                                                </Text>
                                              </Layout.Horizontal>
                                              <Layout.Vertical width={'83%'}>
                                                <Text style={{ marginLeft: '20px' }} className={css.dangerColor}>
                                                  {(error?.data as any)?.message}
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
                                          {sourceCodeType === SourceCodeType.USE_SAMPLE ? (
                                            <Layout.Vertical>
                                              {sampleRepo ? (
                                                <Layout.Vertical>
                                                  <Text
                                                    font={{ variation: FontVariation.BODY2 }}
                                                    className={moduleCss.text}
                                                    margin={{ bottom: 'medium' }}
                                                  >
                                                    {`You currently have 1 Sample repository, would you like to connect it to?`}
                                                  </Text>
                                                  <CardSelect
                                                    data={[sampleRepo] as Servicev1Repository[]}
                                                    cornerSelected={true}
                                                    className={moduleCss.icons}
                                                    cardClassName={moduleCss.repositoryListCard}
                                                    renderItem={(item: Servicev1Repository) => (
                                                      <>
                                                        <Layout.Vertical
                                                          spacing={'small'}
                                                          className={moduleCss.repositoryListItem}
                                                        >
                                                          <Layout.Horizontal className={moduleCss.repositoryHeader}>
                                                            <Icon
                                                              name={'service-github'}
                                                              size={24}
                                                              flex
                                                              className={moduleCss.repositoriesIcon}
                                                            />
                                                            <Text
                                                              font={{ variation: FontVariation.BODY2 }}
                                                              className={moduleCss.text3}
                                                            >
                                                              {item?.repository?.name}
                                                            </Text>
                                                          </Layout.Horizontal>
                                                          <Text font="normal">{item?.repository?.repo}</Text>
                                                        </Layout.Vertical>
                                                      </>
                                                    )}
                                                    selected={selectedRepo}
                                                    onChange={(item: Servicev1Repository) => {
                                                      setSelectedRepo(item)
                                                      formikProps.setValues({
                                                        ...formikProps.values,
                                                        repo: item?.repository?.repo,
                                                        identifier: item?.identifier
                                                      })
                                                    }}
                                                  />
                                                </Layout.Vertical>
                                              ) : (
                                                <FormInput.Text
                                                  name="repo"
                                                  style={{ width: '400px' }}
                                                  placeholder={getString('UrlLabel')}
                                                  label={getString('UrlLabel')}
                                                />
                                              )}
                                            </Layout.Vertical>
                                          ) : (
                                            sourceCodeType === SourceCodeType.PROVIDE_MY_OWN &&
                                            (isNewRepository || repositoryListdata.length === 0 ? (
                                              <Layout.Vertical>
                                                {repositoryListdata.length !== 0 && (
                                                  <Text
                                                    style={{ cursor: 'pointer' }}
                                                    className={css.marginBottomClass}
                                                    onClick={() => formikProps.setFieldValue('isNewRepository', false)}
                                                    color={Color.PRIMARY_7}
                                                  >
                                                    {getString('cd.getStartedWithCD.backToRepoList')}
                                                  </Text>
                                                )}
                                                <FormInput.Text
                                                  name="repo"
                                                  style={{ width: '400px' }}
                                                  placeholder={getString('UrlLabel')}
                                                  label={getString('UrlLabel')}
                                                />
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
                                                        onClick={() => handleAuthTypeChange(AUTH_TYPES.ANONYMOUS)}
                                                        className={cx(
                                                          css.kubernetes,
                                                          authType === AUTH_TYPES.ANONYMOUS ? css.active : undefined
                                                        )}
                                                      >
                                                        {getString('cd.getStartedWithCD.anonymous')}
                                                      </Button>
                                                      <Button
                                                        onClick={() => {
                                                          handleAuthTypeChange(AUTH_TYPES.USERNAME_AND_PASSWORD)
                                                        }}
                                                        className={cx(
                                                          css.docker,
                                                          authType === AUTH_TYPES.USERNAME_AND_PASSWORD
                                                            ? css.active
                                                            : undefined
                                                        )}
                                                      >
                                                        {getString('cd.getStartedWithCD.usernameAndPassword')}
                                                      </Button>
                                                    </Layout.Horizontal>
                                                    {authType === AUTH_TYPES.USERNAME_AND_PASSWORD && (
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
                                                {connectionType === getString('SSH') && (
                                                  <Text className={css.textPadding}>
                                                    {getString('common.comingSoon2')}
                                                  </Text>
                                                )}
                                              </Layout.Vertical>
                                            ) : (
                                              <Layout.Vertical>
                                                <Text
                                                  font={{ variation: FontVariation.BODY2 }}
                                                  className={moduleCss.text}
                                                  margin={{ bottom: 'medium' }}
                                                >
                                                  {`You currently have ${repositoryListdata?.length} repository(s), would you like to connect it to?`}
                                                </Text>
                                                <Layout.Horizontal margin={{ bottom: 'medium' }}>
                                                  <ExpandingSearchInput
                                                    alwaysExpanded
                                                    width={300}
                                                    onChange={searchTerm => {
                                                      getRepositories({
                                                        accountIdentifier: accountId,
                                                        searchTerm,
                                                        agentIdentifier: fullAgentName
                                                      }).then(response => {
                                                        setRepositoryListData(defaultTo(response?.content, []))
                                                      })
                                                    }}
                                                  />
                                                  <Button
                                                    variation={ButtonVariation.LINK}
                                                    onClick={() => formikProps.setFieldValue('isNewRepository', true)}
                                                  >
                                                    {getString('common.addNewRepo')}
                                                  </Button>
                                                </Layout.Horizontal>
                                                <CardSelect
                                                  data={repositoryListdata as Servicev1Repository[]}
                                                  cornerSelected={true}
                                                  className={moduleCss.icons}
                                                  cardClassName={moduleCss.repositoryListCard}
                                                  renderItem={(item: Servicev1Repository) => (
                                                    <>
                                                      <Layout.Vertical
                                                        spacing={'small'}
                                                        className={moduleCss.repositoryListItem}
                                                      >
                                                        <Layout.Horizontal className={moduleCss.repositoryHeader}>
                                                          <Icon
                                                            name={'service-github'}
                                                            size={24}
                                                            flex
                                                            className={moduleCss.repositoriesIcon}
                                                          />
                                                          <Text
                                                            font={{ variation: FontVariation.BODY2 }}
                                                            className={moduleCss.text3}
                                                          >
                                                            {item?.repository?.name}
                                                          </Text>
                                                        </Layout.Horizontal>
                                                        <Text font="normal">{item?.repository?.repo}</Text>
                                                      </Layout.Vertical>
                                                    </>
                                                  )}
                                                  selected={selectedRepo}
                                                  onChange={(item: Servicev1Repository) => {
                                                    setSelectedRepo(item)
                                                    formikProps.setValues({
                                                      ...formikProps.values,
                                                      repo: item?.repository?.repo,
                                                      identifier: item?.identifier
                                                    })
                                                  }}
                                                />
                                              </Layout.Vertical>
                                            ))
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
                                                            agentIdentifier: getFullAgentWithScope(
                                                              agentIdentifier,
                                                              scope
                                                            ),
                                                            identifier: getLastURLPathParam(defaultTo(repoURL, ''))
                                                          },
                                                          queryParams: {
                                                            ...defaultQueryParams,
                                                            projectIdentifier,
                                                            orgIdentifier,
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
                                                  if (item.value) {
                                                    fetchAppDetails({
                                                      pathParams: {
                                                        agentIdentifier: fullAgentName,
                                                        querySourceRepoUrl: encodeURIComponent(defaultTo(repoURL, '')),
                                                        identifier: getLastURLPathParam(defaultTo(repoURL, ''))
                                                      },
                                                      queryParams: {
                                                        ...defaultQueryParams,
                                                        projectIdentifier,
                                                        orgIdentifier,
                                                        'query.source.path': item.value as string,
                                                        'query.source.targetRevision':
                                                          formikProps?.values?.targetRevision
                                                      }
                                                    })
                                                  }
                                                }}
                                              />
                                            </FormGroup>
                                          </Layout.Horizontal>
                                        </div>
                                      )}
                                    </li>
                                  </ul>
                                </Layout.Vertical>
                              ) : (
                                <div>{getString('common.comingSoon')}</div>
                              )}
                            </Layout.Vertical>
                            {formikProps.values.type === REPO_TYPES.GIT ? (
                              <Button
                                variation={ButtonVariation.SECONDARY}
                                rightIcon="chevron-right"
                                disabled={testConnectionStatus !== TestStatus.SUCCESS}
                                style={{ marginTop: '20px' }}
                                minimal
                                onClick={() => {
                                  saveRepositoryData({
                                    ...formikProps.values,
                                    identifier: getLastURLPathParam(defaultTo(repoURL, ''))
                                  })
                                  setDestinationStepEnabled(false)
                                  accordionRef.current.open('application-repo-destination-step')
                                  trackEvent(CDOnboardingActions.NextStepClicked, {
                                    deployment_type: DeploymentType.GitOps
                                  })
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
      <Container className={moduleCss.helpPanelContainer}>
        <HelpPanel referenceId="gitOpsPlgConfigureApp" />
      </Container>
    </>
  )
}

export const ConfigureGitops = React.forwardRef(ConfigureGitopsRef)
