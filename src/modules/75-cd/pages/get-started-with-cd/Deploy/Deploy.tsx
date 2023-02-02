/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Text, Formik, FormikForm, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { Servicev1Application } from 'services/gitops'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export const Deploy = () => {
  const {
    state: { application: applicationData }
  } = useCDOnboardingContext()

  return (
    <Formik<Servicev1Application>
      initialValues={{ ...applicationData }}
      formName="application-repo-deploy-step"
      onSubmit={noop}
    >
      {formikProps => {
        return (
          <FormikForm>
            <Layout.Vertical>
              <Text className={css.success} font={{ variation: FontVariation.H6 }} color={Color.GREEN_800}>
                {formikProps.values?.name}
              </Text>
            </Layout.Vertical>
          </FormikForm>
        )
      }}
    </Formik>
  )
}
