/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Formik, FormikForm, FormInput, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { StackWizardStepProps } from '.'
import css from './StackWizard.module.scss'

const StackRepoDetailsStep: React.FC<StackWizardStepProps> = (props): JSX.Element => {
  const { name, identifier, nextStep, prevStepData } = props
  const { getString } = useStrings()
  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxxlarge' }}>
        {name}
      </Text>
      <Formik
        initialValues={{
          ...prevStepData
        }}
        formName={`resourcestack-wizard-${identifier}`}
        onSubmit={formData => nextStep?.({ ...prevStepData, ...formData })}
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          branch: Yup.string().required('Required'),
          scriptsPath: Yup.string().required('Required')
        })}
      >
        {formik => {
          const { isValid } = formik
          return (
            <FormikForm>
              <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Layout.Horizontal spacing="medium" width={400}>
                  <Layout.Vertical width={400}>
                    <FormInput.MultiTextInput name="repo" label="Repository" />
                    <FormInput.MultiTextInput name="branch" label="Branch" />
                    <FormInput.MultiTextInput name="scriptsPath" label="Scripts Path" />
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    disabled={!isValid}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default StackRepoDetailsStep
