/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useRef, useEffect } from 'react'
import classnames from 'classnames'
import { defaultTo, noop } from 'lodash-es'
import {
  Text,
  Formik,
  FormikForm,
  Layout,
  Container,
  Icon,
  CardSelect,
  FormInput,
  Button,
  IconName,
  ButtonSize,
  useToaster,
  ExpandingSearchInput,
  ButtonVariation
} from '@harness/uicore'
import * as Yup from 'yup'
import { Color, FontVariation } from '@harness/design-system'
import type { FormikContextType } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import type { ResponseMessage } from 'services/cd-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  Servicev1Cluster,
  useAgentClusterServiceCreate,
  useAgentClusterServiceCreateHosted,
  useAgentClusterServiceGet,
  useClusterServiceListClusters
} from 'services/gitops'
import { useDeepCompareEffect } from '@common/hooks'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { AuthTypeForm, CREDENTIALS_TYPE } from './AuthTypeForm'
import InfoContainer from '../InfoContainer/InfoContainer'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import {
  APIError,
  ClusterInterface,
  DeploymentType,
  getFullAgentWithScope,
  SUBMIT_HANDLER_MAP_FOR_CLUSTER
} from '../CDOnboardingUtils'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'
import moduleCss from '@cd/pages/get-started-with-cd/DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export const GITOPS_IP_WHITELIST = 'https://developer.harness.io/docs/continuous-delivery/cd-gitops/gitops-allowlist'
export const DestinationStep = (props: any) => {
  const { getString } = useStrings()
  const connectionStatus = false
  const {
    saveClusterData,
    state: { cluster: clusterData }
  } = useCDOnboardingContext()
  const toast = useToaster()
  const { trackEvent } = useTelemetry()
  const { agent: agentIdentifier, scope } = props.prevStepData as any
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(
    connectionStatus || TestStatus.NOT_INITIATED
  )
  const formikRef = useRef<FormikContextType<ClusterInterface>>()
  const [testConnectionErrors, setTestConnectionErrors] = useState<ResponseMessage[]>()
  const [clusterListdata, setClusterListData] = useState<Servicev1Cluster[]>([])
  const [selectedCluster, setSelectedCluster] = useState<Servicev1Cluster>({})
  const clustersTypes = [
    {
      label: getString('cd.getStartedWithCD.harnessHosted'),
      icon: 'harness',
      value: CIBuildInfrastructureType.Cloud
    },
    {
      label: getString('cd.getStartedWithCD.selfManaged'),
      icon: 'service-kubernetes',
      value: CIBuildInfrastructureType.KubernetesDirect
    }
  ]
  const fullAgentName = getFullAgentWithScope(agentIdentifier, scope)
  const serverId = defaultTo(selectedCluster?.identifier, '')
  const { accountId } = useParams<ProjectPathProps>()

  useEffect(() => {
    trackEvent(CDOnboardingActions.SelectClusterTypeDefault, {
      selectedClusterType: clustersTypes[0].label,
      deployment_type: DeploymentType.GitOps
    })
  }, [])

  const { mutate, error } = useAgentClusterServiceCreate({
    agentIdentifier: fullAgentName,
    queryParams: {
      accountIdentifier: accountId,
      identifier: formikRef.current?.values?.identifier
    }
  })

  const { mutate: getClusters } = useClusterServiceListClusters({})

  const {
    data: testConnectionData,
    error: testConnectionError,
    refetch
  } = useAgentClusterServiceGet({
    agentIdentifier: fullAgentName,
    identifier: serverId,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const { error: hostedClusterError, mutate: createHostedCluster } = useAgentClusterServiceCreateHosted({
    agentIdentifier: fullAgentName,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryParams: {
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    if (testConnectionError) {
      toast.showError(`Failed testing connection: ${(testConnectionError as APIError).data.error}`)
    }
  }, [testConnectionError])

  useDeepCompareEffect(() => {
    if (testConnectionData) {
      if (testConnectionData.cluster?.connectionState?.status === 'Successful') {
        props?.enableNextBtn()
        setTestConnectionStatus(TestStatus.SUCCESS)
      } else {
        setTestConnectionStatus(TestStatus.FAILED)
        setTestConnectionErrors([
          {
            level: 'ERROR',
            message: (testConnectionData as any)?.message || testConnectionData?.cluster?.connectionState?.message
          }
        ])
      }
    }
  }, [testConnectionData])

  const refreshConnectionStatus = (e: React.MouseEvent<Element>): void => {
    e.stopPropagation()
    refetch({
      pathParams: { agentIdentifier: fullAgentName, identifier: serverId }, // TODO: remove this later
      queryParams: {
        accountIdentifier: accountId
      }
    })
  }

  useEffect(() => {
    getClusters({ accountIdentifier: accountId, agentIdentifier: fullAgentName }).then(response => {
      setClusterListData(defaultTo(response?.content, []))
    })
  }, [])

  useEffect(() => {
    if (error) {
      toast.showError(`Failed creating cluster: ${(error as APIError).data.error}`)
    }
  }, [error])

  const onClusterCreate = (data: any): Promise<Servicev1Cluster> => {
    /* istanbul ignore next */
    if (!data.authType) {
      return mutate({ cluster: { name: data.name } })
    }

    let formData = data

    if (data.authType === CREDENTIALS_TYPE.USERNAME_PASSWORD) {
      formData = {
        ...data,
        config: {
          username: data.username,
          password: data.password
        }
      }
    }
    const payload: ClusterInterface | undefined = SUBMIT_HANDLER_MAP_FOR_CLUSTER[data.authType]({
      ...formData,
      project: props.prevStepData.project,
      queryParams: { accountIdentifier: accountId },
      pathParams: {
        agentIdentifier: fullAgentName
      }
    })

    if (!payload) {
      return Promise.reject('missing required fields')
    } else {
      return mutate({ cluster: payload, tags: formData.tags })
    }
  }

  const TestConnection = (): React.ReactElement => {
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
      case TestStatus.NOT_INITIATED:
        return (
          <Layout.Vertical>
            <Button
              text={getString('connectors.verifyConnection')}
              size={ButtonSize.SMALL}
              width={200}
              style={{ marginTop: '20px' }}
              type="submit"
              onClick={e => {
                const data = formikRef.current?.values
                if (!formikRef.current?.values?.isNewCluster) {
                  setTestConnectionStatus(TestStatus.IN_PROGRESS)
                  setTestConnectionErrors([])
                  saveClusterData({ ...data, ...selectedCluster?.cluster, identifier: selectedCluster?.identifier })
                  refreshConnectionStatus(e)
                } else {
                  setTestConnectionStatus(TestStatus.IN_PROGRESS)
                  setTestConnectionErrors([])
                  saveClusterData(data || {})
                  onClusterCreate(data)
                    .then((response: Servicev1Cluster) => {
                      if (response.cluster?.connectionState?.status === 'Successful') {
                        props?.enableNextBtn()
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

                      toast.showSuccess(
                        getString('common.entitycreatedSuccessfully', {
                          entity: getString('common.cluster'),
                          name: data?.name
                        }),
                        undefined,
                        'create.cluster.error'
                      )
                    })
                    .catch(err => {
                      setTestConnectionStatus(TestStatus.FAILED)
                      setTestConnectionErrors((err?.data as any)?.responseMessages)
                    })
                }
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

  const ProvisionCluster = (): React.ReactElement => {
    const data = formikRef.current?.values
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
        return (
          <Layout.Vertical>
            <Layout.Vertical className={css.danger} margin={{ bottom: 'medium' }}>
              <Layout.Horizontal className={css.textPadding}>
                <Icon name="danger-icon" size={25} className={css.iconPadding} />
                <Text className={css.dangerColor} font={{ variation: FontVariation.H6 }} color={Color.RED_600}>
                  {getString('cd.getStartedWithCD.failedToProvisionCluster')}
                </Text>
              </Layout.Horizontal>
              <Text style={{ marginLeft: '20px' }} className={css.dangerColor}>
                {(hostedClusterError?.data as any)?.message}
              </Text>
            </Layout.Vertical>
            <Button
              variation={ButtonVariation.SECONDARY}
              style={{ marginTop: '20px', width: '250px' }}
              minimal
              onClick={() => {
                setTestConnectionStatus(TestStatus.IN_PROGRESS)
                createHostedCluster()
                  .then(response => {
                    if (response?.cluster?.connectionState?.status === 'Successful') {
                      props?.enableNextBtn()
                      setSelectedCluster(response)
                      saveClusterData({ ...data, ...response?.cluster, identifier: response?.identifier })
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
                  })
                  .catch(err => {
                    setTestConnectionStatus(TestStatus.FAILED)
                    setTestConnectionErrors((err?.data as any)?.responseMessages)
                  })
              }}
            >
              {getString('cd.getStartedWithCD.retryProvisioningHostedCluster')}
            </Button>
          </Layout.Vertical>
        )
      case TestStatus.NOT_INITIATED:
        return (
          <Layout.Vertical>
            <Button
              variation={ButtonVariation.SECONDARY}
              style={{ marginTop: '20px', width: '250px' }}
              minimal
              onClick={() => {
                trackEvent(CDOnboardingActions.ConnectToClusterClicked, { deployment_type: DeploymentType.GitOps })
                setTestConnectionStatus(TestStatus.IN_PROGRESS)
                createHostedCluster()
                  .then(response => {
                    if (response?.cluster?.connectionState?.status === 'Successful') {
                      props?.enableNextBtn()
                      setSelectedCluster(response)
                      saveClusterData({ ...data, ...response?.cluster, identifier: response?.identifier })
                      setTestConnectionStatus(TestStatus.SUCCESS)
                      trackEvent(CDOnboardingActions.ClusterCreatedSuccessfully, {
                        deployment_type: DeploymentType.GitOps
                      })
                    } else {
                      setTestConnectionStatus(TestStatus.FAILED)
                      setTestConnectionErrors([
                        {
                          level: 'ERROR',
                          message: (response as any)?.message
                        }
                      ])
                      trackEvent(CDOnboardingActions.ClusterCreateFailure, { deployment_type: DeploymentType.GitOps })
                    }
                  })
                  .catch(err => {
                    setTestConnectionStatus(TestStatus.FAILED)
                    setTestConnectionErrors((err?.data as any)?.responseMessages)
                    trackEvent(CDOnboardingActions.ClusterCreateFailure, { deployment_type: DeploymentType.GitOps })
                  })
              }}
            >
              {getString('cd.getStartedWithCD.createHostedCluster')}
            </Button>
          </Layout.Vertical>
        )
      case TestStatus.IN_PROGRESS:
        return (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name="steps-spinner" color={Color.PRIMARY_7} />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7}>
              {getString('cd.getStartedWithCD.provisioningInProgress')}
            </Text>
          </Layout.Horizontal>
        )
      case TestStatus.SUCCESS:
        return (
          <Layout.Vertical className={css.success} margin={{ bottom: 'medium', top: 'large' }}>
            <Layout.Horizontal padding={{ top: 'medium', bottom: 'medium' }}>
              <Icon name="success-tick" size={25} className={css.iconPadding} />
              <Text className={css.success} font={{ variation: FontVariation.H6 }} color={Color.GREEN_800}>
                {getSuccessText()}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        )
      default:
        return <></>
    }
  }

  const getValidationSchema: Yup.ObjectSchema = Yup.object().shape({
    clusterType: Yup.string().required(getString('cd.validation.clusterType')),
    server: Yup.string().when('clusterType', {
      is: CIBuildInfrastructureType.KubernetesDirect,
      then: Yup.string().required(getString('validation.masterUrl'))
    }),
    authType: Yup.string().required(getString('cd.validation.authType')),
    username: Yup.string().when('authType', {
      is: CREDENTIALS_TYPE.USERNAME_AND_PASSWORD,
      then: Yup.string().required(getString('validation.username'))
    }),
    password: Yup.string().when('authType', {
      is: CREDENTIALS_TYPE.USERNAME_AND_PASSWORD,
      then: Yup.string().required(getString('validation.password'))
    }),
    bearerToken: Yup.string().when('authType', {
      is: CREDENTIALS_TYPE.SERVICE_ACCOUNT,
      then: Yup.string().required(getString('connectors.jenkins.bearerTokenRequired'))
    }),
    keyData: Yup.string().when('authType', {
      is: CREDENTIALS_TYPE.CLIENT_KEY_CERTIFICATE,
      then: Yup.string().required(getString('cd.validation.keyData'))
    }),
    certData: Yup.string().when('authType', {
      is: CREDENTIALS_TYPE.CLIENT_KEY_CERTIFICATE,
      then: Yup.string().required(getString('cd.validation.certData'))
    })
  })

  const getSuccessText = () => {
    if (formikRef.current?.values?.isNewCluster) {
      return `${getString('common.cluster')} ${getString('cd.getStartedWithCD.createdSuccessfully')}`
    } else {
      if (formikRef?.current?.values?.clusterType === CIBuildInfrastructureType.KubernetesDirect) {
        return `${getString('common.cluster')} ${getString('cd.getStartedWithCD.testesSuccessfully')}`
      }
      return `${getString('common.cluster')} ${getString('cd.getStartedWithCD.provisionedSuccessfully')}`
    }
  }

  return (
    <Formik<ClusterInterface>
      initialValues={{ ...clusterData }}
      validationSchema={getValidationSchema}
      formName="application-repo-destination-step"
      onSubmit={noop}
    >
      {formikProps => {
        formikRef.current = formikProps
        const selectedClusterType = formikProps.values.clusterType
        const authType = formikProps.values.authType
        const isNewCluster: boolean | undefined = formikProps.values?.isNewCluster

        return (
          <FormikForm>
            <Layout.Vertical>
              <Container padding={{ bottom: 'xxlarge' }}>
                <CardSelect
                  data={clustersTypes}
                  cornerSelected={true}
                  className={moduleCss.icons}
                  cardClassName={moduleCss.serviceDeploymentTypeSmallCard}
                  renderItem={item => (
                    <>
                      <Layout.Vertical flex>
                        <Icon
                          name={item.icon as IconName}
                          size={24}
                          flex
                          className={moduleCss.serviceDeploymentTypeIcon}
                        />
                        <Text font={{ variation: FontVariation.BODY2 }} className={moduleCss.text2}>
                          {item.label}
                        </Text>
                      </Layout.Vertical>
                    </>
                  )}
                  selected={clustersTypes.find(c => c.value === selectedClusterType)}
                  onChange={item => {
                    setTestConnectionStatus(TestStatus.NOT_INITIATED)
                    formikProps.setFieldValue('clusterType', item.value)
                    trackEvent(CDOnboardingActions.SelectClusterType, {
                      selectedClusterType: item.label,
                      deployment_type: DeploymentType.GitOps
                    })
                  }}
                />
              </Container>
              {selectedClusterType === CIBuildInfrastructureType.KubernetesDirect ? (
                <Container>
                  {testConnectionStatus === TestStatus.SUCCESS ? (
                    <>
                      <Layout.Vertical className={css.success} margin={{ bottom: 'medium', top: 'large' }}>
                        <Layout.Horizontal padding={{ top: 'medium', bottom: 'medium' }}>
                          <Icon name="success-tick" size={25} className={css.iconPadding} />
                          <Text className={css.success} font={{ variation: FontVariation.H6 }} color={Color.GREEN_800}>
                            {getSuccessText()}
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
                    </>
                  ) : (
                    <>
                      {isNewCluster || clusterListdata.length === 0 ? (
                        <Layout.Vertical>
                          {clusterListdata.length !== 0 && (
                            <Text
                              style={{ cursor: 'pointer', marginTop: '20px' }}
                              className={css.marginBottomClass}
                              onClick={() => formikProps.setFieldValue('isNewCluster', false)}
                              color={Color.PRIMARY_7}
                            >
                              {getString('cd.getStartedWithCD.backToClusterList')}
                            </Text>
                          )}
                          <ul className={css.progress}>
                            <li className={`${css.progressItem} ${css.progressItemActive}`}>
                              <Text
                                font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                                className={css.subHeading}
                              >
                                {getString('cd.steps.common.clusterDetails').toLocaleUpperCase()}
                              </Text>
                              <InfoContainer
                                label="cd.getStartedWithCD.ipWhitelist1"
                                labelElement={
                                  <>
                                    {getString('cd.getStartedWithCD.ipWhitelist1')}
                                    <a
                                      className="externalLink"
                                      rel="noreferrer"
                                      href={GITOPS_IP_WHITELIST}
                                      target="_blank"
                                    >
                                      {getString('cd.getStartedWithCD.setupIPWhitelist')}
                                    </a>
                                    {getString('cd.getStartedWithCD.ipWhitelist2')}
                                  </>
                                }
                              />
                              <div className={css.smallMarginBottomClass} />
                              <div className={moduleCss.width50}>
                                <NameId nameLabel={getString('cd.getStartedWithCD.nameYourCluster')} />
                                <FormInput.Text
                                  name="server"
                                  label={getString('connectors.k8.masterUrlLabel')}
                                  placeholder={getString('UrlLabel')}
                                />
                              </div>
                            </li>
                            <li className={`${css.progressItem} ${css.progressItemActive}`}>
                              <Text
                                font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                                className={css.subHeading}
                              >
                                {getString('authentication').toLocaleUpperCase()}
                              </Text>
                              <Text
                                tooltipProps={{ dataTooltipId: 'clusterAuthentication' }}
                                margin={{ bottom: 'small' }}
                              >
                                {getString('cd.getStartedWithCD.selectAuthenticationType')}
                              </Text>
                              <div className={moduleCss.marginBottom25}>
                                <Button
                                  onClick={() =>
                                    formikProps.setFieldValue('authType', CREDENTIALS_TYPE.USERNAME_PASSWORD)
                                  }
                                  className={classnames(
                                    css.kubernetes,
                                    authType === CREDENTIALS_TYPE.USERNAME_PASSWORD ? css.active : undefined
                                  )}
                                >
                                  {getString('usernamePassword')}
                                </Button>
                                <Button
                                  onClick={() =>
                                    formikProps.setFieldValue('authType', CREDENTIALS_TYPE.SERVICE_ACCOUNT)
                                  }
                                  className={classnames(
                                    css.docker,
                                    authType === CREDENTIALS_TYPE.SERVICE_ACCOUNT ? css.active : undefined
                                  )}
                                >
                                  {getString('serviceAccount')}
                                </Button>
                                <Button
                                  onClick={() =>
                                    formikProps.setFieldValue('authType', CREDENTIALS_TYPE.CLIENT_KEY_CERTIFICATE)
                                  }
                                  className={classnames(
                                    css.docker,
                                    authType === CREDENTIALS_TYPE.CLIENT_KEY_CERTIFICATE ? css.active : undefined
                                  )}
                                >
                                  {getString('connectors.k8.clientKey')}
                                </Button>
                              </div>
                              <AuthTypeForm authType={authType} />
                            </li>
                          </ul>
                        </Layout.Vertical>
                      ) : (
                        <Layout.Vertical>
                          <Text
                            font={{ variation: FontVariation.BODY2 }}
                            className={moduleCss.text}
                            margin={{ bottom: 'medium' }}
                          >
                            {getString('cd.getStartedWithCD.clustersCount', { target: clusterListdata?.length })}
                          </Text>
                          <Layout.Horizontal margin={{ bottom: 'medium' }}>
                            <ExpandingSearchInput
                              alwaysExpanded
                              width={300}
                              onChange={searchTerm => {
                                getClusters({
                                  accountIdentifier: accountId,
                                  searchTerm,
                                  agentIdentifier: fullAgentName
                                }).then(response => {
                                  setClusterListData(defaultTo(response?.content, []))
                                })
                              }}
                            />
                            <Button
                              variation={ButtonVariation.LINK}
                              onClick={() => formikProps.setFieldValue('isNewCluster', true)}
                            >
                              {getString('common.addNewCluster')}
                            </Button>
                          </Layout.Horizontal>
                          <CardSelect
                            data={clusterListdata as Servicev1Cluster[]}
                            cornerSelected={true}
                            className={moduleCss.icons}
                            cardClassName={moduleCss.repositoryListCard}
                            renderItem={(item: Servicev1Cluster) => (
                              <>
                                <Layout.Vertical spacing={'small'} className={moduleCss.repositoryListItem}>
                                  <Layout.Horizontal className={moduleCss.repositoryHeader}>
                                    <Icon
                                      name={'service-github'}
                                      size={24}
                                      flex
                                      className={moduleCss.repositoriesIcon}
                                    />
                                    <Text font={{ variation: FontVariation.BODY2 }} className={moduleCss.text3}>
                                      {item?.cluster?.name}
                                    </Text>
                                  </Layout.Horizontal>
                                  <Text font="normal">{item?.cluster?.server}</Text>
                                </Layout.Vertical>
                              </>
                            )}
                            selected={selectedCluster}
                            onChange={(item: Servicev1Cluster) => {
                              setSelectedCluster(item)
                            }}
                          />
                        </Layout.Vertical>
                      )}
                      <Layout.Vertical padding={{ top: 'small' }}>
                        <Container padding={{ top: 'medium' }}>
                          <TestConnection />
                        </Container>
                      </Layout.Vertical>
                    </>
                  )}
                </Container>
              ) : (
                <Container>
                  <Layout.Vertical margin={{ top: 'large' }}>
                    <InfoContainer label="cd.getStartedWithCD.managedCluster" />
                    <div className={css.smallMarginBottomClass} />
                    <ProvisionCluster />
                  </Layout.Vertical>
                </Container>
              )}
            </Layout.Vertical>
          </FormikForm>
        )
      }}
    </Formik>
  )
}
