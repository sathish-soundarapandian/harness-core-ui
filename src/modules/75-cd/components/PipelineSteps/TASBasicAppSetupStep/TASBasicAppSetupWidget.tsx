/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import React from 'react'
import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType, Formik } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

import TasSetupSource from './TASSetupSource'
import type { TASBasicAppSetupData } from './TASBasicAppSetupStep'

interface TASBasicAppSetupWidgetProps {
  initialValues: TASBasicAppSetupData
  onUpdate?: (data: TASBasicAppSetupData) => void
  onChange?: (data: TASBasicAppSetupData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export function TASBasicAppSetupWidget(
  { initialValues, onUpdate, onChange, allowableTypes, isNewStep, readonly, stepViewType }: TASBasicAppSetupWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  function commonValidation(this: Yup.TestContext, value: any): boolean | Yup.ValidationError {
    if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED && typeof value !== 'number') {
      return this.createError({
        message: `${value} cannot be empty, string etc., should only be a positive number`
      })
    }
    if (value < 0) {
      return this.createError({
        message: 'value cannot be less than 0'
      })
    }
    return true
  }

  const validationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      instanceCount: Yup.string().trim().required(getString('common.validation.typeIsRequired')),
      existingVersionToKeep: Yup.mixed().test({
        test(value): boolean | Yup.ValidationError {
          if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
            if (value < 0) {
              // chcek if minimum version is 1 or 0
              return this.createError({
                message: getString?.('pipeline.approvalStep.validation.minimumCountOne') //check name
              })
            }
          }
          return commonValidation.call(this, value) //CHECK NAME
        }
      })
    })
  })

  return (
    <Formik<TASBasicAppSetupData>
      onSubmit={submit => {
        /* istanbul ignore next */ onUpdate?.(submit)
      }}
      validate={formValues => {
        /* istanbul ignore next */ onChange?.(formValues)
      }}
      formName="TASBasicAppSetupForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<TASBasicAppSetupData>) => {
        // this is required
        setFormikRef(formikRef, formik)
        return (
          <TasSetupSource
            isNewStep={defaultTo(isNewStep, true)}
            stepViewType={stepViewType}
            formik={formik}
            readonly={readonly}
            allowableTypes={allowableTypes}
          />
        )
      }}
    </Formik>
  )
}

export const TASBasicAppSetupWidgetWithRef = React.forwardRef(TASBasicAppSetupWidget)
