/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import { toString } from 'lodash-es'
import type { FormikProps } from 'formik'
import { AllowedTypes, Formik, FormikForm, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { CloudFunctionTrafficShiftExecutionStepInitialValues } from '@pipeline/utils/types'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface CloudFunctionTrafficShiftExecutionStepProps {
  initialValues: CloudFunctionTrafficShiftExecutionStepInitialValues
  formikFormName: string
  onUpdate?: (data: CloudFunctionTrafficShiftExecutionStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: CloudFunctionTrafficShiftExecutionStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const TrafficShiftExecutionStepEdit = (
  props: CloudFunctionTrafficShiftExecutionStepProps,
  formikRef: StepFormikFowardRef<CloudFunctionTrafficShiftExecutionStepInitialValues>
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

  return (
    <>
      <Formik<CloudFunctionTrafficShiftExecutionStepInitialValues>
        onSubmit={(values: CloudFunctionTrafficShiftExecutionStepInitialValues) => {
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
        {(formik: FormikProps<CloudFunctionTrafficShiftExecutionStepInitialValues>) => {
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
                <FormInput.Text
                  name="spec.trafficPercent"
                  label={getString('cd.steps.googleCloudFunctionCommon.trafficPercent')}
                  placeholder={getString('cd.steps.googleCloudFunctionCommon.trafficPercentPlaceholder')}
                  disabled={readonly}
                  inputGroup={{
                    type: 'number'
                  }}
                />
                {getMultiTypeFromValue(formik.values.spec?.trafficPercent) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={toString(formik.values.spec?.trafficPercent)}
                    type="Number"
                    variableName="spec.trafficPercent"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('spec.trafficPercent', value)
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

export const TrafficShiftExecutionStepEditRef = React.forwardRef(TrafficShiftExecutionStepEdit)
