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
import { AllowedTypes, Formik, FormikForm, Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeCheckboxField } from '@common/components'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ECSRollingDeployStepElementConfig } from '@pipeline/utils/types'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import css from './ECSRollingDeployStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSRollingDeployStepProps {
  initialValues: ECSRollingDeployStepElementConfig
  onUpdate?: (data: ECSRollingDeployStepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: ECSRollingDeployStepElementConfig) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const ECSRollingDeployStepEdit = (
  props: ECSRollingDeployStepProps,
  formikRef: StepFormikFowardRef<ECSRollingDeployStepElementConfig>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const onSubmit = (values: ECSRollingDeployStepElementConfig) => {
    onUpdate?.(values)
  }

  return (
    <>
      <Formik<ECSRollingDeployStepElementConfig>
        onSubmit={onSubmit}
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
        {(formik: FormikProps<ECSRollingDeployStepElementConfig>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
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
                <FormMultiTypeCheckboxField
                  className={css.checkbox}
                  name="spec.sameAsAlreadyRunningInstances"
                  label={getString('cd.ecsRollingDeployStep.sameAsAlreadyRunningInstances')}
                  disabled={readonly}
                  multiTypeTextbox={{
                    expressions,
                    allowableTypes,
                    defaultValueToReset: false
                  }}
                />
              </Layout.Horizontal>

              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                className={cx(stepCss.formGroup, stepCss.lg)}
                margin={{ top: 'medium' }}
              >
                <FormMultiTypeCheckboxField
                  className={css.checkbox}
                  name="spec.forceNewDeployment"
                  label={getString('cd.ecsRollingDeployStep.forceNewDeployment')}
                  disabled={readonly}
                  multiTypeTextbox={{
                    expressions,
                    allowableTypes,
                    defaultValueToReset: false
                  }}
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
