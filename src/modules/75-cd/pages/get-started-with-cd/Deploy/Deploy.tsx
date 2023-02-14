/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { capitalize, defaultTo, noop, snakeCase, sortBy } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { Text, Formik, FormikForm, Layout, Container, Button, ButtonVariation, useToaster, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { FormikContextType } from 'formik'
import routes from '@common/RouteDefinitions'
import { Servicev1Application, useAgentApplicationServiceCreate, useAgentApplicationServiceSync } from 'services/gitops'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import successSetup from '../../home/images/success_setup.svg'
import {
  getApplicationPayloadForSync,
  getAppPayload,
  getFullAgentWithScope,
  getResourceKey,
  getSyncBody,
  resourceStatusSortOrder,
  Scope,
  SyncStatus
} from '../CDOnboardingUtils'
import { DeployProvisiongWizardStepId } from '../DeployProvisioningWizard/Constants'
import css from '../RunPipelineSummary/RunPipelineSummary.module.scss'
import deployCSS from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

interface DeployProps {
  onBack: () => void
  setSelectedSectionId: React.Dispatch<React.SetStateAction<DeployProvisiongWizardStepId>>
}

export const Deploy = ({ onBack, setSelectedSectionId }: DeployProps) => {
  const {
    saveApplicationData,
    state: { service, cluster: clusterData, repository: repositoryData, agent: agentData, application: applicationData }
  } = useCDOnboardingContext()

  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const toast = useToaster()
  const fullAgentName = getFullAgentWithScope(defaultTo(agentData?.identifier, ''), Scope.ACCOUNT)
  const formikRef = useRef<FormikContextType<Servicev1Application>>()
  const { mutate: createApplication } = useAgentApplicationServiceCreate({
    agentIdentifier: fullAgentName,
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      repoIdentifier: `account.${repositoryData?.identifier}`
    }
  })

  const { mutate: syncApp, error: syncError } = useAgentApplicationServiceSync({
    agentIdentifier: fullAgentName,
    requestName: defaultTo(applicationData?.name, ''),
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const goToAppDetailPage = () => {
    const payload = getAppPayload({
      repositoryData,
      clusterData,
      name: formikRef?.current?.values?.name
    })
    const data: any = {
      ...payload,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      accountIdentifier: accountId
    }

    createApplication(data, {
      queryParams: {
        clusterIdentifier: `account.${clusterData?.identifier}`,
        projectIdentifier,
        orgIdentifier,
        accountIdentifier: accountId,
        repoIdentifier: `account.${repositoryData?.identifier}`
      }
    }).then(applicationResponse => {
      toast.showSuccess(
        getString('common.entitycreatedSuccessfully', {
          entity: getString('common.application'),
          name: applicationResponse?.name
        }),
        undefined
      )
      saveApplicationData(applicationResponse)
      const sortedResources = new Map(
        sortBy(
          applicationResponse?.app?.status?.resources || [],
          resource => resourceStatusSortOrder[(resource.status as SyncStatus) || SyncStatus.Unknown]
        ).map(resource => [snakeCase(getResourceKey(resource)), resource])
      )
      const formData = getApplicationPayloadForSync(
        defaultTo(applicationResponse?.app, {}),
        [...sortedResources.keys()],
        defaultTo(applicationResponse?.app?.spec?.source?.targetRevision, 'HEAD')
      )

      const body = getSyncBody(formData, sortedResources, defaultTo(applicationResponse?.app, {}))

      syncApp(body, {
        pathParams: { requestName: defaultTo(applicationResponse?.name, ''), agentIdentifier: fullAgentName }
      }).then(() => {
        if (!syncError) {
          toast.showSuccess(getString('cd.getStartedWithCD.syncCompleteMessage'))
        }
        history.push(
          routes.toGitOpsApplication({
            orgIdentifier: applicationResponse?.orgIdentifier || '',
            projectIdentifier: applicationResponse?.projectIdentifier || '',
            accountId: applicationResponse?.accountIdentifier || '',
            module: 'cd',
            applicationId: applicationResponse?.name || '',
            agentId: applicationResponse?.agentIdentifier || ''
          })
        )
      })
    })
  }

  const successsFullConfiguration = (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
      <Icon name="success-tick" />
      <Text font="normal" color={Color.GREEN_700}>
        {capitalize(getString('success'))}
      </Text>
    </Layout.Horizontal>
  )

  return (
    <>
      <Formik<Servicev1Application> initialValues={{}} formName="application-repo-deploy-step" onSubmit={noop}>
        {formikProps => {
          formikRef.current = formikProps
          return (
            <FormikForm>
              <Container className={css.container} width="50%">
                <Layout.Vertical padding="xxlarge">
                  <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'large' }}>
                    <Layout.Vertical>
                      <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xxlarge' }}>
                        {getString('cd.getStartedWithCD.gitopsOnboardingDeployStep')}
                      </Text>
                      <Layout.Horizontal
                        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                        padding={{ bottom: 'medium' }}
                      >
                        <Text font={{ variation: FontVariation.H5 }} padding={{ right: 'medium' }}>
                          {getString('cd.getStartedWithCD.deploymentType')}
                        </Text>
                        <Icon
                          name="Edit"
                          size={18}
                          color={Color.PRIMARY_7}
                          onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)}
                        />
                      </Layout.Horizontal>
                      <Text font="normal">{service?.serviceDefinition?.type}</Text>
                    </Layout.Vertical>

                    <img className={css.successImage} src={successSetup} />
                  </Layout.Horizontal>
                  <Container className={css.borderBottomClass} />
                  <Layout.Horizontal>
                    <Text
                      font={{ variation: FontVariation.H5 }}
                      padding={{ right: 'medium' }}
                      margin={{ bottom: 'large' }}
                    >
                      {getString('common.connect')}
                    </Text>
                    <Icon
                      name="Edit"
                      size={18}
                      color={Color.PRIMARY_7}
                      onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.Connect)}
                    />
                  </Layout.Horizontal>
                  <Layout.Vertical>
                    <Layout.Horizontal padding={{ bottom: 'large' }} flex={{ justifyContent: 'space-between' }}>
                      <Layout.Horizontal flex={{ alignItems: 'center' }}>
                        <Icon name="harness" size={15} />
                        <Text padding={{ left: 'small' }} font="normal" className={css.infoText}>{`${getString(
                          'cd.getStartedWithCD.hostedGitopsAgent'
                        )}: `}</Text>
                        <Text color={Color.GREY_900} padding={{ left: 'small' }} font="normal" className={css.infoText}>
                          {agentData?.name}
                        </Text>
                      </Layout.Horizontal>
                      {agentData?.health?.harnessGitopsAgent?.status === 'HEALTHY' && successsFullConfiguration}
                    </Layout.Horizontal>
                    <Container className={css.borderBottomClass} />
                  </Layout.Vertical>
                  <Layout.Horizontal>
                    <Text
                      font={{ variation: FontVariation.H5 }}
                      padding={{ right: 'medium' }}
                      margin={{ bottom: 'large' }}
                    >
                      {getString('connectors.ceAws.curExtention.stepB.step1.p1')}
                    </Text>
                    <Icon
                      name="Edit"
                      size={18}
                      color={Color.PRIMARY_7}
                      onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.Configure)}
                    />
                  </Layout.Horizontal>
                  <Layout.Vertical>
                    <Text color={Color.GREY_500} font={{ variation: FontVariation.H6 }} padding={{ bottom: 'large' }}>
                      {getString('cd.getStartedWithCD.sourceDetails')}
                    </Text>
                    <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
                      <Layout.Horizontal flex={{ alignItems: 'center' }}>
                        <Icon name="git-branch" size={15} />

                        <Text
                          padding={{ left: 'small' }}
                          color={Color.GREY_700}
                          font="normal"
                          className={css.infoText}
                        >{`${getString('cd.getStartedWithCD.gitURL')} : `}</Text>
                        <Text
                          color={Color.GREY_900}
                          padding={{ left: 'small', right: 'medium' }}
                          font="normal"
                          className={css.infoText}
                        >
                          {repositoryData?.repo}
                        </Text>
                      </Layout.Horizontal>
                      {successsFullConfiguration}
                    </Layout.Horizontal>
                    <Layout.Vertical margin={{ bottom: 'large' }}>
                      {repositoryData?.name && (
                        <Layout.Horizontal>
                          <Text color={Color.GREY_700} font="normal" className={css.infoText}>{`${getString(
                            'repository'
                          )} : `}</Text>
                          <Text
                            color={Color.GREY_900}
                            padding={{ left: 'small' }}
                            font="normal"
                            className={css.infoText}
                          >
                            {repositoryData?.name}
                          </Text>
                        </Layout.Horizontal>
                      )}
                      {repositoryData?.targetRevision && (
                        <Layout.Horizontal>
                          <Text color={Color.GREY_700} font="normal" className={css.infoText}>{`${getString(
                            'pipelineSteps.deploy.inputSet.branch'
                          )} : `}</Text>
                          <Text
                            color={Color.GREY_900}
                            padding={{ left: 'small' }}
                            font="normal"
                            className={css.infoText}
                          >
                            {repositoryData?.targetRevision}
                          </Text>
                        </Layout.Horizontal>
                      )}
                      {repositoryData?.path && (
                        <Layout.Horizontal>
                          <Text color={Color.GREY_700} font="normal" className={css.infoText}>{`${getString(
                            'common.path'
                          )} : `}</Text>
                          <Text
                            color={Color.GREY_900}
                            padding={{ left: 'small' }}
                            font="normal"
                            className={css.infoText}
                          >
                            {repositoryData?.path}
                          </Text>
                        </Layout.Horizontal>
                      )}
                    </Layout.Vertical>
                  </Layout.Vertical>
                  <Layout.Vertical>
                    <Text color={Color.GREY_500} font={{ variation: FontVariation.H6 }} padding={{ bottom: 'large' }}>
                      {getString('cd.getStartedWithCD.destinationDetails')}
                    </Text>
                    <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
                      <Layout.Horizontal flex={{ alignItems: 'center' }}>
                        <Icon name="gitops-clusters-blue" size={20} />
                        <Text
                          padding={{ left: 'small' }}
                          color={Color.GREY_700}
                          font="normal"
                          className={css.infoText}
                        >{`${getString('cd.getStartedWithCD.clusterRepo')} : `}</Text>
                        <Text
                          color={Color.GREY_900}
                          padding={{ left: 'small', right: 'medium' }}
                          font="normal"
                          className={css.infoText}
                        >
                          {clusterData?.server}
                        </Text>
                      </Layout.Horizontal>
                      {successsFullConfiguration}
                    </Layout.Horizontal>
                    <Layout.Vertical margin={{ bottom: 'large' }}>
                      <Layout.Horizontal>
                        <Text color={Color.GREY_700} font="normal" className={css.infoText}>{`${getString(
                          'common.clusterName'
                        )} : `}</Text>
                        <Text color={Color.GREY_900} padding={{ left: 'small' }} font="normal" className={css.infoText}>
                          {clusterData?.name}
                        </Text>
                      </Layout.Horizontal>
                    </Layout.Vertical>
                  </Layout.Vertical>
                </Layout.Vertical>
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
      <Layout.Vertical className={deployCSS.footer}>
        <Layout.Horizontal spacing="medium" padding={{ top: 'medium', bottom: 'large' }} width="100%">
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            minimal
            onClick={onBack}
          />
          <Button
            text={getString('cd.getStartedWithCD.syncApplication')}
            variation={ButtonVariation.PRIMARY}
            onClick={goToAppDetailPage}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </>
  )
}
