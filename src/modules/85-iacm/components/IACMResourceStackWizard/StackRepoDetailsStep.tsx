/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Formik, FormikForm, FormInput, Heading, Layout } from '@harness/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { StackWizardStepProps } from './index'
import css from './StackWizard.module.scss'

const StackRepoDetailsStep: React.FC<StackWizardStepProps> = (props): JSX.Element => {
  const { name, identifier, nextStep, prevStepData } = props
  const { getString } = useStrings()
  return (
    <Layout.Vertical height="inherit" spacing="medium" className={css.optionsViewContainer}>
      <Heading level="3" margin={{ bottom: 'xxxlarge' }}>
        {name}
      </Heading>
      <Formik
        initialValues={{
          repo: '',
          branch: '',
          scriptsPath: '',
          ...prevStepData
        }}
        formName={`resourcestack-wizard-${identifier}`}
        onSubmit={formData => nextStep?.({ ...prevStepData, ...formData })}
        validationSchema={Yup.object({
          repo: Yup.string().required(getString('common.git.validation.repoRequired')),
          branch: Yup.string().required(getString('common.git.validation.branchRequired')),
          scriptsPath: Yup.string().required(getString('iacm.stackWizard.scriptsPathRequired'))
        })}
        enableReinitialize
      >
        {formik => {
          const { isValid } = formik
          return (
            <FormikForm>
              <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Layout.Vertical width={400}>
                  <FormInput.MultiTextInput name="repo" label={getString('repository')} />
                  <FormInput.MultiTextInput name="branch" label={getString('gitBranch')} />
                  <FormInput.MultiTextInput name="scriptsPath" label={getString('iacm.stackWizard.scriptsPath')} />
                </Layout.Vertical>
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
