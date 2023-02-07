/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { useHistory } from 'react-router-dom'
import { Text, Formik, FormikForm, Layout, Container, Button, ButtonVariation } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import type { Servicev1Application } from 'services/gitops'
import { useStrings } from 'framework/strings'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import successSetup from '../../home/images/success_setup.svg'
import css from '../RunPipelineSummary/RunPipelineSummary.module.scss'

export const Deploy = ({ onBack }: { onBack: () => void }) => {
  const {
    state: { application: applicationData }
  } = useCDOnboardingContext()

  // const applicationData = {
  //   accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
  //   orgIdentifier: 'default',
  //   projectIdentifier: 'ishantplg',
  //   agentIdentifier: 'account.hostedtest9',
  //   name: 'hostedapp',
  //   clusterIdentifier: 'account.hello_world',
  //   repoIdentifier: 'account.argoprojdeployments',
  //   app: {
  //     metadata: {
  //       name: 'hostedapp',
  //       namespace: 'c281b43b',
  //       uid: '6046e083-dca0-4ae9-aa52-fb977b55ec66',
  //       resourceVersion: '13912297',
  //       generation: '1',
  //       creationTimestamp: '2023-02-02T14:41:34Z'
  //     },
  //     status: { sync: { comparedTo: { source: {}, destination: {} } }, health: {}, summary: {} }
  //   },
  //   createdAt: '2023-02-02T14:41:34.590272144Z',
  //   lastModifiedAt: '2023-02-02T14:41:34.590270415Z'
  // }
  const { getString } = useStrings()
  const history = useHistory()

  const goToAppDetailPage = () => {
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
    </>
  )
}
