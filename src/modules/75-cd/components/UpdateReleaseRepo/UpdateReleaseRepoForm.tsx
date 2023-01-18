/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { Accordion, AllowedTypes, FormInput, SelectOption } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import OptionalConfiguration from './OptionalConfiguration'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const shellScriptType: SelectOption[] = [{ label: 'Bash', value: 'Bash' }]

export default function UpdateReleaseRepoForm(props: {
  formik: FormikProps<any>
  isNewStep: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { formik, isNewStep, readonly, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('pipelineSteps.stepNameLabel')}
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
          multiTypeDurationProps={{ enableConfigureOptions: true, expressions, disabled: readonly, allowableTypes }}
          className={stepCss.duration}
          disabled={readonly}
        />
      </div>
      <div className={stepCss.divider} />

      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={<OptionalConfiguration formik={formik} readonly={readonly} allowableTypes={allowableTypes} />}
        />
      </Accordion>
    </>
  )
}
