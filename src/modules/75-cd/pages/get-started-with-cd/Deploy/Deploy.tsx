/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, noop, snakeCase, sortBy } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { Text, Formik, FormikForm, Layout, Container, Button, ButtonVariation, useToaster } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
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
import css from '../RunPipelineSummary/RunPipelineSummary.module.scss'
import deployCSS from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export const Deploy = ({ onBack }: { onBack: () => void }) => {
  const {
    saveApplicationData,
    state: { cluster: clusterData, repository: repositoryData, agent: agentData, application: applicationData }
  } = useCDOnboardingContext()

  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const toast = useToaster()
  const fullAgentName = getFullAgentWithScope(defaultTo(agentData?.identifier, ''), Scope.ACCOUNT)

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
      name: 'hostedapp'
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

  return (
    <>
      <Formik<Servicev1Application> initialValues={{}} formName="application-repo-deploy-step" onSubmit={noop}>
        {() => {
          return (
            <FormikForm>
              <Container className={css.container} width="50%">
                <Layout.Vertical padding="xxlarge">
                  <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'large' }}>
                    <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xxlarge' }}>
                      {getString('cd.getStartedWithCD.gitopsOnboardingDeployStep')}
                    </Text>
                    <img className={css.successImage} src={successSetup} />
                  </Layout.Horizontal>
                  <Container className={css.borderBottomClass} />
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
