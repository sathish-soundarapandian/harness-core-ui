/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useRef, useEffect } from 'react'
import classnames from 'classnames'
import { noop } from 'lodash-es'
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
  useToaster
} from '@harness/uicore'
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
import { Servicev1Cluster, useAgentClusterServiceCreate } from 'services/gitops'
import { AuthTypeForm, CREDENTIALS_TYPE } from './AuthTypeForm'
import InfoContainer from '../InfoContainer/InfoContainer'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import { APIError, ClusterInterface, getFullAgentWithScope, SUBMIT_HANDLER_MAP_FOR_CLUSTER } from '../CDOnboardingUtils'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'
import moduleCss from '@cd/pages/get-started-with-cd/DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export const DestinationStep = (props: any) => {
  const { getString } = useStrings()
  const connectionStatus = false
  const {
    saveClusterData,
    state: { cluster: clusterData }
  } = useCDOnboardingContext()
  const toast = useToaster()
  const { agent: agentIdentifier, scope } = props.prevStepData as any
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(
    connectionStatus || TestStatus.NOT_INITIATED
  )
  const formikRef = useRef<FormikContextType<ClusterInterface>>()
  const [testConnectionErrors, setTestConnectionErrors] = useState<ResponseMessage[]>()
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
  const { accountId } = useParams<ProjectPathProps>()

  const { mutate, error } = useAgentClusterServiceCreate({
    agentIdentifier: fullAgentName,
    queryParams: {
      accountIdentifier: accountId,
      identifier: formikRef.current?.values?.identifier
    }
  })

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
              onClick={() => {
                setTestConnectionStatus(TestStatus.IN_PROGRESS)
                setTestConnectionErrors([])
                const data = formikRef.current?.values
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

  return (
    <Formik<ClusterInterface>
      initialValues={{ ...clusterData }}
      formName="application-repo-destination-step"
      onSubmit={noop}
    >
      {formikProps => {
        formikRef.current = formikProps
        const selectedCluster = formikProps.values.clusterType
        const authType = formikProps.values.authType
        return (
          <FormikForm>
            <Layout.Vertical>
              <Container padding={{ bottom: 'xxlarge' }}>
                <CardSelect
                  data={clustersTypes}
                  cornerSelected={true}
                  className={moduleCss.icons}
                  cardClassName={moduleCss.serviceDeploymentTypeCard}
                  renderItem={item => (
                    <>
                      <Layout.Vertical flex>
                        <Icon
                          name={item.icon as IconName}
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
                  selected={clustersTypes.find(c => c.value === selectedCluster)}
                  onChange={item => {
                    formikProps.setFieldValue('clusterType', item.value)
                  }}
                />
              </Container>
              {selectedCluster === CIBuildInfrastructureType.KubernetesDirect ? (
                <Container>
                  {testConnectionStatus === TestStatus.SUCCESS ? (
                    <Layout.Vertical>
                      <Layout.Vertical className={css.success}>
                        <Layout.Horizontal className={css.textPadding}>
                          <Icon name="success-tick" size={25} className={css.iconPadding} />
                          <Text className={css.success} font={{ variation: FontVariation.H6 }} color={Color.GREEN_800}>
                            {`${getString('common.cluster')} ${formikProps.values?.server} ${getString(
                              'cd.getStartedWithCD.clusterCreatedSuccessfully'
                            )}`}
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
                    <ul className={css.progress}>
                      <li className={`${css.progressItem} ${css.progressItemActive}`}>
                        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
                          {getString('cd.steps.common.clusterDetails').toLocaleUpperCase()}
                        </Text>
                        <InfoContainer label="cd.getStartedWithCD.ipWhitelist" />
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
                        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
                          {getString('authentication').toLocaleUpperCase()}
                        </Text>
                        <Text tooltipProps={{ dataTooltipId: 'clusterAuthentication' }} margin={{ bottom: 'small' }}>
                          Select Authentication Type
                        </Text>
                        <div className={moduleCss.marginBottom25}>
                          <Button
                            onClick={() => formikProps.setFieldValue('authType', CREDENTIALS_TYPE.USERNAME_PASSWORD)}
                            className={classnames(
                              css.kubernetes,
                              authType === CREDENTIALS_TYPE.USERNAME_PASSWORD ? css.active : undefined
                            )}
                          >
                            {getString('usernamePassword')}
                          </Button>
                          <Button
                            onClick={() => formikProps.setFieldValue('authType', CREDENTIALS_TYPE.SERVICE_ACCOUNT)}
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
                        <Layout.Vertical padding={{ top: 'small' }}>
                          <Container padding={{ top: 'medium' }}>
                            <TestConnection />
                          </Container>
                        </Layout.Vertical>
                      </li>
                    </ul>
                  )}
                </Container>
              ) : (
                <Container>
                  <Layout.Vertical margin={{ top: 'medium' }}>
                    <InfoContainer label="cd.getStartedWithCD.managedCluster" />
                    <div className={css.smallMarginBottomClass} />
                    <>
                      <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
                        {getString('cd.getStartedWithCD.clusterspec').toLocaleUpperCase()}
                      </Text>
                      <div className={css.installedComponent}>
                        <div className={css.blackDot} />
                        {getString('cd.getStartedWithCD.clusterSpec1')}
                      </div>
                      <div className={css.installedComponent}>
                        <div className={css.blackDot} />
                        {getString('cd.getStartedWithCD.clusterSpec2')}
                      </div>
                      <div className={css.installedComponent}>
                        <div className={css.blackDot} />
                        {getString('cd.getStartedWithCD.clusterSpec3')}
                      </div>
                    </>
                    <Text font="normal" className={css.smallMarginBottomClass}>
                      {getString('cd.getStartedWithCD.clusterSpecInfo')}
                    </Text>
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
