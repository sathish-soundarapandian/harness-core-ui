/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'

import type { SelectOption, AllowedTypes } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { WaitStepData } from './WaitStepTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const entityTypeOptions: SelectOption[] = [{ label: 'Custom', value: 'Custom' }]

export default function BaseWaitStep(props: {
  formik: FormikProps<WaitStepData>
  isNewStep: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { isNewStep, readonly, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <NameId
            nameLabel={getString('pipelineSteps.stepNameLabel')}
            inputGroupProps={{ disabled: readonly }}
            identifierProps={{ isIdentifierEditable: isNewStep && !readonly }}
          />
        </div>
      )}
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeDurationField
          name="duration"
          label={getString('pipeline.duration')}
          disabled={readonly}
          className={stepCss.duration}
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            expressions,
            disabled: readonly
          }}
        />
      </div>
    </>
  )
}
