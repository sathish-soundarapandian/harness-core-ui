/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, Formik } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { useStrings } from 'framework/strings'
import type { StepElementConfig } from 'services/cd-ng'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { NameTimeoutField } from './NameTimeoutField'

export interface GenericExecutionStepProps {
  initialValues: StepElementConfig
  onUpdate?: (data: StepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: StepElementConfig) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const GenericExecutionStepEdit = (
  props: GenericExecutionStepProps,
  formikRef: StepFormikFowardRef<StepElementConfig>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  return (
    <>
      <Formik<StepElementConfig>
        onSubmit={(values: StepElementConfig) => {
          onUpdate?.(values)
        }}
        formName="genericExecutionStepForm"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<StepElementConfig>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <NameTimeoutField
              values={{ name: values.name, timeout: values.timeout }}
              setFieldValue={setFieldValue}
              allowableTypes={allowableTypes}
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
            />
          )
        }}
      </Formik>
    </>
  )
}

export const GenericExecutionStepEditRef = React.forwardRef(GenericExecutionStepEdit)
