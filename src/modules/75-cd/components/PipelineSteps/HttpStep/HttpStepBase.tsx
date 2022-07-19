/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  SelectOption,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import cx from 'classnames'

import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { HttpStepFormData } from './types'
import css from './HttpStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const httpStepType: SelectOption[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' }
]

export default function HttpStepBase(props: {
  formik: FormikProps<HttpStepFormData>
  isNewStep?: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  allowableTypes?: AllowedTypes
}): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const {
    formik: { values: formValues, setFieldValue },
    isNewStep = true,
    readonly,
    stepViewType,
    allowableTypes
  } = props

  return (
    <div className={stepCss.stepPanel}>
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
            enableConfigureOptions: false,
            expressions,
            disabled: readonly,
            allowableTypes
          }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(formValues.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.timeout || ''}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('timeout', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.divider} />

      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.url"
          placeholder={getString('pipeline.utilitiesStep.url')}
          label={getString('UrlLabel')}
          disabled={readonly}
          multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
        />
        {getMultiTypeFromValue(formValues.spec.url) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.url}
            type="String"
            variableName="spec.url"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.url', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormInput.MultiTypeInput
          selectItems={httpStepType}
          disabled={readonly}
          multiTypeInputProps={{ expressions, disabled: readonly, allowableTypes }}
          label={getString('methodLabel')}
          name="spec.method"
        />
        {getMultiTypeFromValue(formValues.spec.method) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.method as string}
            type="String"
            variableName="spec.method"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.method', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={stepCss.formGroup}>
        <FormMultiTypeTextAreaField
          placeholder={getString('pipeline.utilitiesStep.requestBody')}
          name="spec.requestBody"
          label={getString('requestBodyLabel')}
          className={css.requestBody}
          multiTypeTextArea={{ enableConfigureOptions: false, expressions, disabled: readonly, allowableTypes }}
        />
        {getMultiTypeFromValue(formValues.spec.requestBody) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.requestBody}
            type="String"
            variableName="spec.requestBody"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.requestBody', value)}
            isReadonly={readonly}
          />
        )}
      </div>
    </div>
  )
}
