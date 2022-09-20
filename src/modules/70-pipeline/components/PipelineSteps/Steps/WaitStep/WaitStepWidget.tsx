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
import type { WaitStepData } from './WaitStepTypes'
import BaseWaitStep from './BaseWaitStep'

interface WaitStepWidgetProps {
  initialValues: WaitStepData
  onUpdate?: (data: WaitStepData) => void
  onChange?: (data: WaitStepData) => void
  stepViewType?: StepViewType
  isNewStep?: boolean
  readonly?: boolean
  allowableTypes: AllowedTypes
}

function WaitStepWidget(
  { initialValues, onUpdate, onChange, isNewStep, readonly, stepViewType, allowableTypes }: WaitStepWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const validationSchema = Yup.object().shape({
    spec: Yup.object().shape({
      duration: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik<WaitStepData>
      onSubmit={
        /* istanbul ignore next */ values => {
          onUpdate?.(values)
        }
      }
      validate={formValues => {
        /* istanbul ignore next */ onChange?.(formValues)
      }}
      formName="stepStepForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<WaitStepData>) => {
        setFormikRef(formikRef, formik)
        return (
          <BaseWaitStep
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

export const WaitStepWidgetWithRef = React.forwardRef(WaitStepWidget)
