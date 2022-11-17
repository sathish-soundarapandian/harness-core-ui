/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'

import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useStrings } from 'framework/strings'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { EmailStepData } from './emailStepTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './EmailStep.module.scss'

interface BaseEmailStepProps {
  formik: FormikProps<EmailStepData>
  stepViewType?: StepViewType
  allowableTypes?: AllowedTypes
  isNewStep?: boolean
  readonly?: boolean
}

const BaseEmailStep = (props: BaseEmailStepProps): React.ReactElement => {
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
            value={defaultTo(formValues.timeout, '')}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={/* istanbul ignore next */ value => setFieldValue('timeout', value)}
            isReadonly={readonly}
            allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
          />
        )}
      </div>

      <div className={stepCss.divider} />

      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.to"
          placeholder={getString('pipeline.utilitiesStep.to')}
          label={getString('common.smtp.labelTo')}
          disabled={readonly}
          multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
        />
        {getMultiTypeFromValue(formValues.spec.to) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.to}
            type="String"
            variableName="spec.to"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={/* istanbul ignore next */ value => setFieldValue('spec.to', value)}
            isReadonly={readonly}
            allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
          />
        )}
      </div>
      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          placeholder={getString('pipeline.utilitiesStep.cc')}
          disabled={readonly}
          multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
          label={getString('cd.steps.emailStep.ccOptionalLabel')}
          name="spec.cc"
        />
        {getMultiTypeFromValue(formValues.spec.cc) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.cc as string}
            type="String"
            variableName="spec.cc"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={/* istanbul ignore next */ value => setFieldValue('spec.cc', value)}
            isReadonly={readonly}
            allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
          />
        )}
      </div>
      <div className={stepCss.formGroup}>
        <FormMultiTypeTextAreaField
          placeholder={getString('pipeline.utilitiesStep.subject')}
          name="spec.subject"
          label={getString('common.smtp.labelSubject')}
          className={css.subject}
          multiTypeTextArea={{ enableConfigureOptions: false, expressions, disabled: readonly, allowableTypes }}
        />
        {getMultiTypeFromValue(formValues.spec.subject) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.subject}
            type="String"
            variableName="spec.subject"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={/* istanbul ignore next */ value => setFieldValue('spec.subject', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={stepCss.formGroup}>
        <FormMultiTypeTextAreaField
          placeholder={getString('pipeline.utilitiesStep.requestBody')}
          name="spec.body"
          label={getString('common.smtp.labelBody')}
          className={css.body}
          multiTypeTextArea={{ enableConfigureOptions: false, expressions, disabled: readonly, allowableTypes }}
        />
        {getMultiTypeFromValue(formValues.spec.body) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.body as string}
            type="String"
            variableName="spec.body"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={/* istanbul ignore next */ value => setFieldValue('spec.body', value)}
            isReadonly={readonly}
          />
        )}
      </div>
    </div>
  )
}

export default BaseEmailStep
