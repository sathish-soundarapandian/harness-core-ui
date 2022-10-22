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
import { AllowedTypes, Formik, FormikForm, FormInput, Layout } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { StepElementConfig } from 'services/cd-ng'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { ECSRollingDeployStepInitialValues } from '@pipeline/utils/types'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import css from './ECSRollingDeployStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSRollingDeployStepProps {
  initialValues: ECSRollingDeployStepInitialValues
  onUpdate?: (data: StepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: StepElementConfig) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const ECSRollingDeployStepEdit = (
  props: ECSRollingDeployStepProps,
  formikRef: StepFormikFowardRef<ECSRollingDeployStepInitialValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { getString } = useStrings()

  return (
    <>
      <Formik<ECSRollingDeployStepInitialValues>
        onSubmit={(values: ECSRollingDeployStepInitialValues) => {
          onUpdate?.(values)
        }}
        formName="ecsRollingDeployStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<ECSRollingDeployStepInitialValues>) => {
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
                  name="spec.sameAsAlreadyRunningInstances"
                  label={getString('cd.ecsRollingDeployStep.sameAsAlreadyRunningInstances')}
                  className={css.checkbox}
                />
              </Layout.Horizontal>

              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                className={cx(stepCss.formGroup, stepCss.lg)}
                margin={{ top: 'small' }}
              >
                <FormInput.CheckBox
                  name="spec.forceNewDeployment"
                  label={getString('cd.ecsRollingDeployStep.forceNewDeployment')}
                  className={css.checkbox}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSRollingDeployStepEditRef = React.forwardRef(ECSRollingDeployStepEdit)
