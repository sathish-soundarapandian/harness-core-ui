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
import { Formik, FormikForm, FormInput, Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type { ElastigroupSwapRouteStepProps, ElastigroupSwapRouteStepValues } from './ElastigroupSwapRouteStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const ElastigroupSwapRouteStepEdit = (
  props: ElastigroupSwapRouteStepProps,
  formikRef: StepFormikFowardRef<ElastigroupSwapRouteStepValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { getString } = useStrings()

  return (
    <>
      <Formik<ElastigroupSwapRouteStepValues>
        onSubmit={(values: ElastigroupSwapRouteStepValues) => {
          onUpdate?.(values)
        }}
        formName="ElastigroupSwapRouteStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<ElastigroupSwapRouteStepValues>) => {
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
                  name="spec.downsizeOldElastigroup"
                  label={getString('cd.ElastigroupSwap.downsizeOldElastigroup')}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const ElastigroupSwapRouteStepEditRef = React.forwardRef(ElastigroupSwapRouteStepEdit)
