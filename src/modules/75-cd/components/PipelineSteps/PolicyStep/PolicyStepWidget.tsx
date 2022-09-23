/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { defaultTo } from 'lodash-es'

import { AllowedTypes, Formik } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

import type { PolicyStepFormData } from './PolicyStepTypes'
import BasePolicyStep from './BasePolicyStep'
import { getPolicySetValidationSchema } from './utils'

interface PolicyStepWidgetProps {
  initialValues: PolicyStepFormData
  onUpdate?: (data: PolicyStepFormData) => void
  onChange?: (data: PolicyStepFormData) => void
  stepViewType?: StepViewType
  isNewStep?: boolean
  readonly?: boolean
  allowableTypes: AllowedTypes
}

function PolicyStepWidget(
  { initialValues, onUpdate, onChange, isNewStep, readonly, stepViewType, allowableTypes }: PolicyStepWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      type: Yup.string()
        .trim()
        .required(getString('fieldRequired', { field: 'Entity Type' })),
      policySets: getPolicySetValidationSchema({
        minimumErrorMessage: getString('common.policiesSets.policySetRequired'),
        invalidErrorMessage: getString('invalidText') + getString('common.payload')
      }),
      policySpec: Yup.object().shape({
        payload: Yup.string()
          .trim()
          .required(getString('fieldRequired', { field: 'Payload' }))
      })
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik<PolicyStepFormData>
      onSubmit={
        /* istanbul ignore next */ values => {
          onUpdate?.(values)
        }
      }
      validate={formValues => {
        /* istanbul ignore next */ onChange?.(formValues)
      }}
      formName="policyStepForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<PolicyStepFormData>) => {
        setFormikRef(formikRef, formik)
        return (
          <BasePolicyStep
            isNewStep={defaultTo(isNewStep, true)}
            formik={formik}
            readonly={readonly}
            stepViewType={stepViewType}
            allowableTypes={allowableTypes}
          />
        )
      }}
    </Formik>
  )
}

export const PolicyStepWidgetWithRef = React.forwardRef(PolicyStepWidget)
