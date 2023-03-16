/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormInput, AllowedTypes, FormikForm } from '@harness/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { ServerlessDeployCommandOptions } from './ServerlessDeployCommandOptions/ServerlessDeployCommandOptions'
import type { ServerlessLambdaDeployStepValues } from './ServerlessLambdaDeploy'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ServerlessLambdaDeployProps {
  initialValues: ServerlessLambdaDeployStepValues
  onUpdate?: (data: ServerlessLambdaDeployStepValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ServerlessLambdaDeployStepValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: ServerlessLambdaDeployStepValues
    path?: string
    readonly?: boolean
  }
}

function ServerlessLambdaDeployStepEdit(
  props: ServerlessLambdaDeployProps,
  formikRef: StepFormikFowardRef<ServerlessLambdaDeployStepValues>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  return (
    <>
      <Formik<ServerlessLambdaDeployStepValues>
        onSubmit={(values: ServerlessLambdaDeployStepValues) => {
          onUpdate?.(values)
        }}
        formName={'ServerlessAwsLambdaDeploy'}
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<ServerlessLambdaDeployStepValues>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep && !readonly}
                    inputGroupProps={{
                      placeholder: getString('pipeline.stepNamePlaceholder'),
                      disabled: readonly
                    }}
                  />
                </div>
              )}

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{
                    enableConfigureOptions: true,
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                  disabled={readonly}
                />
              </div>

              <ServerlessDeployCommandOptions isReadonly={readonly} stepViewType={props.stepViewType} />
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const ServerlessLambdaDeployStepEditRef = React.forwardRef(ServerlessLambdaDeployStepEdit)
