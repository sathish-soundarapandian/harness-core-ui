/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Text, Formik, FormikForm, Layout, Container } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { Servicev1Application } from 'services/gitops'
import { useStrings } from 'framework/strings'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import successSetup from '../../home/images/success_setup.svg'
import css from '../RunPipelineSummary/RunPipelineSummary.module.scss'

export const Deploy = () => {
  const {
    state: { application: applicationData }
  } = useCDOnboardingContext()

  const { getString } = useStrings()

  return (
    <Formik<Servicev1Application>
      initialValues={{ ...applicationData }}
      formName="application-repo-deploy-step"
      onSubmit={noop}
    >
      {formikProps => {
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
  )
}
