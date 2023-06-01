/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { Formik, FormInput } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CommandTypes, IACMTerraformPluginProps } from './StepTypes.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const IACMTerraformPlugin = (
  {
    allowableTypes,
    isNewStep = true,
    readonly = false,
    initialValues,
    onUpdate,
    onChange,
    stepViewType
  }: IACMTerraformPluginProps,
  formikRef: StepFormikFowardRef
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''
  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      formName={`iacmTerraformPlugin-${sectionId}`}
      validate={values => {
        /* istanbul ignore next */
        onChange?.(values)
      }}
      onSubmit={values => {
        /* istanbul ignore next */
        onUpdate?.(values)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          command: Yup.string().required(getString('iacm.pipelineSteps.required', { name: getString('commandLabel') }))
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        return (
          <>
            {stepViewType !== StepViewType.Template && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{
                    disabled: readonly
                  }}
                />
              </div>
            )}
            <div className={cx(stepCss.formGroup, stepCss.sm)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
                disabled={readonly}
              />
            </div>
            <Divider style={{ margin: '0 0 10px 0' }} />
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                useValue
                name="spec.command"
                label={getString('commandLabel')}
                disabled={readonly}
                selectItems={(Object.keys(CommandTypes) as Array<keyof typeof CommandTypes>).map(keyValue => ({
                  label: CommandTypes[keyValue],
                  value: CommandTypes[keyValue]
                }))}
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    defaultSelectedItem: {
                      label: CommandTypes.INIT,
                      value: CommandTypes.INIT
                    },
                    items: (Object.keys(CommandTypes) as Array<keyof typeof CommandTypes>).map(keyValue => ({
                      label: CommandTypes[keyValue],
                      value: CommandTypes[keyValue]
                    })),
                    allowCreatingNewItems: false
                  }
                }}
              />
            </div>
          </>
        )
      }}
    </Formik>
  )
}
