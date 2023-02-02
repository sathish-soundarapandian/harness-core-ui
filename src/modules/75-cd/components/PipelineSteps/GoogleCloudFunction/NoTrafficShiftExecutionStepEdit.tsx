/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { AllowedTypes, Formik, FormikForm, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { CloudFunctionExecutionStepInitialValues } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface CloudFunctionExecutionStepProps {
  initialValues: CloudFunctionExecutionStepInitialValues
  formikFormName: string
  onUpdate?: (data: CloudFunctionExecutionStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: CloudFunctionExecutionStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const NoTrafficShiftExecutionStepEdit = (
  props: CloudFunctionExecutionStepProps,
  formikRef: StepFormikFowardRef<CloudFunctionExecutionStepInitialValues>
): React.ReactElement => {
  const {
    initialValues,
    formikFormName,
    onUpdate,
    isNewStep = true,
    readonly,
    onChange,
    allowableTypes,
    stepViewType
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<CloudFunctionExecutionStepInitialValues>
        onSubmit={(values: CloudFunctionExecutionStepInitialValues) => {
          onUpdate?.(values)
        }}
        formName={formikFormName}
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<CloudFunctionExecutionStepInitialValues>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  name="spec.updateFieldMask"
                  label={getString('cd.steps.googleCloudFunctionCommon.fieldMask')}
                  placeholder={getString('cd.steps.googleCloudFunctionCommon.fieldMaskPlaceholder')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(formik.values.spec?.updateFieldMask) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={formik.values.spec?.updateFieldMask}
                      type="String"
                      variableName="spec.updateFieldMask"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('spec.updateFieldMask', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
              </div>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const NoTrafficShiftExecutionStepEditRef = React.forwardRef(NoTrafficShiftExecutionStepEdit)
