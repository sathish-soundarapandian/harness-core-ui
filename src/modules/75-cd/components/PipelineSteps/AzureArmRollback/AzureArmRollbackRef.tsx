/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ALLOWED_VALUES_TYPE, ConfigureOptions, VALIDATORS } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useQueryParams } from '@common/hooks'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { RollbackStackProps } from './AzureArmRollback.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AzureArmRollback.module.scss'

export const RollbackStack = (
  {
    allowableTypes,
    isNewStep = true,
    readonly = false,
    initialValues,
    onUpdate,
    onChange,
    stepViewType
  }: RollbackStackProps,
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
      formName={`azureArmRollback-${sectionId}`}
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
          provisionerIdentifier: Yup.lazy((value): Yup.Schema<unknown> => {
            /* istanbul ignore next */
            if (getMultiTypeFromValue(value as string) === MultiTypeInputType.FIXED) {
              return IdentifierSchemaWithOutName(getString, {
                requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
                regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
              })
            }
            /* istanbul ignore next */
            return Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired'))
          })
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        const { values } = formik
        const provisionerIdentifier = values?.spec?.provisionerIdentifier
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
                multiTypeDurationProps={{ enableConfigureOptions: false, expressions, allowableTypes }}
                disabled={readonly}
              />
              {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
                  allowedValuesValidator={VALIDATORS[ALLOWED_VALUES_TYPE.TIME]({ minimum: '10s' })}
                  value={values.timeout as string}
                  type="String"
                  variableName="step.timeout"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => {
                    formik.setFieldValue('timeout', value)
                  }}
                  isReadonly={readonly}
                />
              )}
            </div>
            <div className={css.divider} />
            <div className={stepCss.formGroup}>
              <FormInput.MultiTextInput
                name="spec.provisionerIdentifier"
                label={getString('pipelineSteps.provisionerIdentifier')}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
              />
              {getMultiTypeFromValue(provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                  value={provisionerIdentifier as string}
                  type="String"
                  variableName="spec.provisionerIdentifier"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  isReadonly={readonly}
                  onChange={value => {
                    formik.setFieldValue('spec.provisionerIdentifier', value)
                  }}
                />
              )}
            </div>
          </>
        )
      }}
    </Formik>
  )
}
