/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  IconName,
  Layout,
  StepProps,
  Text,
  ThumbnailSelect
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
import type { IacResourceStack, StackWizardStepProps } from '.'
import css from './StackWizard.module.scss'

type Provisioner = {
  name: string
  icon: IconName
  value: string
}

const provisioners: Provisioner[] = [
  {
    name: 'Terrarform',
    icon: 'service-terraform',
    value: 'terraform'
  },
  {
    name: 'Terragrunt',
    icon: 'service-terraform',
    value: 'terragrunt'
  },
  {
    name: 'Pulumi',
    icon: 'service-terraform',
    value: 'pulumi'
  },
  {
    name: 'CDK',
    icon: 'service-terraform',
    value: 'cdk'
  },
  {
    name: 'Ansible',
    icon: 'service-terraform',
    value: 'ansible'
  },
  {
    name: 'Cloud Formation',
    icon: 'service-terraform',
    value: 'cloudformation'
  }
]

type ProvisionerTypeOption = {
  label: string
  icon: IconName
  value: string
}

const ProvisionerTypeStep: React.FC<StepProps<StackWizardStepProps>> = props => {
  const { name, identifier, nextStep, prevStepData } = props
  const { getString } = useStrings()
  const provisionerTypeOptions = useMemo(
    (): ProvisionerTypeOption[] =>
      provisioners.map((type: Provisioner) => ({
        label: type.name,
        icon: type.icon,
        value: type.value
      })),
    []
  )
  const handleOptionSelection = (formikData: IacResourceStack, provisionerSelected: string): void => {
    formikData.provisionerType = provisionerSelected
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxxlarge' }}>
        {name}
      </Text>
      <Formik
        initialValues={{
          provisionerType: '',
          name: '',
          description: '',
          ...prevStepData
        }}
        formName={`resourcestack-wizard-${identifier}`}
        validationSchema={Yup.object().shape({
          provisionerType: Yup.string().required('Required'),
          name: Yup.string().required('Required')
        })}
        onSubmit={formData => nextStep?.({ ...prevStepData, ...formData })}
        enableReinitialize={true}
      >
        {formik => {
          const { values, isValid } = formik
          return (
            <FormikForm>
              <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Layout.Horizontal>
                  <Layout.Vertical>
                    <ThumbnailSelect
                      className={css.thumbnailSelect}
                      name={'provisionerType'}
                      items={provisionerTypeOptions}
                      onChange={provisionerTypeSelected => {
                        handleOptionSelection(values as IacResourceStack, provisionerTypeSelected)
                      }}
                    />
                    <NameIdDescriptionTags
                      formikProps={formik}
                      identifierProps={{ inputName: 'name' }}
                      className={css.nameIdDescContainer}
                    />
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

export default ProvisionerTypeStep
