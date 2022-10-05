/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { Formik, FormikForm, FormInput, Layout } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type {
  ECSBlueGreenSwapTargetGroupsStepProps,
  ECSBlueGreenSwapTargetGroupsStepValues
} from './ECSBlueGreenSwapTargetGroupsStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const ECSBlueGreenSwapTargetGroupsStepEdit = (
  props: ECSBlueGreenSwapTargetGroupsStepProps,
  formikRef: StepFormikFowardRef<ECSBlueGreenSwapTargetGroupsStepValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { getString } = useStrings()

  return (
    <>
      <Formik<ECSBlueGreenSwapTargetGroupsStepValues>
        onSubmit={(values: ECSBlueGreenSwapTargetGroupsStepValues) => {
          onUpdate?.(values)
        }}
        formName="ecsBlueGreenSwapTargetGroupsStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<ECSBlueGreenSwapTargetGroupsStepValues>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <FormikForm>
              <NameTimeoutField
                values={{ name: values.name, timeout: values.timeout }}
                setFieldValue={setFieldValue}
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                className={cx(stepCss.formGroup, stepCss.lg)}
                margin={{ top: 'medium' }}
              >
                <FormInput.CheckBox
                  name="spec.doNotDownsizeOldService"
                  label={getString('cd.ecsBGSwapTargetGroupsStep.doNotDownsizeOldService')}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSBlueGreenSwapTargetGroupsStepEditRef = React.forwardRef(ECSBlueGreenSwapTargetGroupsStepEdit)
