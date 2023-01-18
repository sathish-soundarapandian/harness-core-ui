/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  Heading,
  IconName,
  Layout,
  ThumbnailSelect
} from '@harness/uicore'
import * as Yup from 'yup'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { NameIdDescription } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { StackWizardStepProps } from './index'
import css from './StackWizard.module.scss'

interface Provisioner {
  label: string
  icon: IconName
  value: string
  disabled?: boolean
  tooltip?: string
}

const provisioners = (_getString: UseStringsReturn['getString']): Provisioner[] => {
  const comingSoon = {
    disabled: true,
    tooltip: _getString('common.comingSoon')
  }
  return [
    {
      label: _getString('iacm.terraform'),
      icon: 'service-terraform',
      value: 'terraform'
    },
    {
      label: _getString('iacm.terragrunt'),
      icon: 'service-terragrunt',
      value: 'terragrunt',
      ...comingSoon
    },
    {
      label: _getString('iacm.pulumi'),
      icon: 'service-pulumi',
      value: 'pulumi',
      ...comingSoon
    },
    {
      label: _getString('iacm.cdk'),
      icon: 'service-cdk',
      value: 'cdk',
      ...comingSoon
    },
    {
      label: _getString('iacm.ansible'),
      icon: 'service-ansible',
      value: 'ansible',
      ...comingSoon
    },
    {
      label: _getString('iacm.cloudformation'),
      icon: 'service-cloudformation',
      value: 'cloudformation',
      ...comingSoon
    }
  ]
}

const ProvisionerTypeStep: React.FC<StackWizardStepProps> = props => {
  const { name, identifier, nextStep, prevStepData } = props
  const { getString } = useStrings()

  return (
    <Layout.Vertical height="inherit" spacing="medium" className={css.optionsViewContainer}>
      <Heading level="2" margin={{ bottom: 'xxxlarge' }}>
        {name}
      </Heading>
      <Formik
        initialValues={{
          provisionerType: '',
          name: '',
          description: '',
          ...prevStepData
        }}
        formName={`resourcestack-wizard-${identifier}`}
        validationSchema={Yup.object({
          provisionerType: Yup.string().required(getString('iacm.stackWizard.provisionerTypeRequired')),
          name: Yup.string().required(getString('validation.nameRequired'))
        })}
        onSubmit={formData => nextStep?.({ ...prevStepData, ...formData })}
        enableReinitialize
      >
        {formik => {
          const { isValid, setFieldValue } = formik
          return (
            <FormikForm>
              <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Layout.Vertical>
                  <ThumbnailSelect
                    className={css.thumbnailSelect}
                    name="provisionerType"
                    items={provisioners(getString)}
                    onChange={provisionerTypeSelected => {
                      setFieldValue('provisionerType', provisionerTypeSelected)
                    }}
                  />
                  <NameIdDescription
                    formikProps={formik}
                    identifierProps={{ inputName: 'name' }}
                    className={css.nameIdDescContainer}
                  />
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

export default ProvisionerTypeStep
