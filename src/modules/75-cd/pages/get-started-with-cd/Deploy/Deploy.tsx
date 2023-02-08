/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, noop, snakeCase, sortBy } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { Text, Formik, FormikForm, Layout, Container, Button, ButtonVariation } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import { Servicev1Application, useAgentApplicationServiceSync } from 'services/gitops'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import successSetup from '../../home/images/success_setup.svg'
import {
  getApplicationPayloadForSync,
  getResourceKey,
  getSyncBody,
  resourceStatusSortOrder,
  SyncStatus
} from '../CDOnboardingUtils'
import css from '../RunPipelineSummary/RunPipelineSummary.module.scss'
import deployCSS from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export const Deploy = ({ onBack }: { onBack: () => void }) => {
  const {
    state: { application: applicationData }
  } = useCDOnboardingContext()

  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const applicationId = applicationData?.name
  const { mutate: syncApp } = useAgentApplicationServiceSync({
    agentIdentifier: defaultTo(applicationData?.agentIdentifier, ''),
    requestName: defaultTo(applicationId, ''),
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const goToAppDetailPage = async () => {
    const sortedResources = new Map(
      sortBy(
        applicationData?.app?.status?.resources || [],
        resource => resourceStatusSortOrder[(resource.status as SyncStatus) || SyncStatus.Unknown]
      ).map(resource => [snakeCase(getResourceKey(resource)), resource])
    )
    const formData = getApplicationPayloadForSync(
      defaultTo(applicationData?.app, {}),
      [...sortedResources.keys()],
      defaultTo(applicationData?.app?.spec?.source?.targetRevision, 'HEAD')
    )

    const body = getSyncBody(formData, sortedResources, defaultTo(applicationData?.app, {}))
    await syncApp(body)
    history.push(
      routes.toGitOpsApplication({
        orgIdentifier: applicationData?.orgIdentifier || '',
        projectIdentifier: applicationData?.projectIdentifier || '',
        accountId: applicationData?.accountIdentifier || '',
        module: 'cd',
        applicationId: applicationData?.name || '',
        agentId: applicationData?.agentIdentifier || ''
      })
    )
  }

  return (
    <>
      <Formik<Servicev1Application>
        initialValues={{ ...applicationData }}
        formName="application-repo-deploy-step"
        onSubmit={noop}
      >
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
