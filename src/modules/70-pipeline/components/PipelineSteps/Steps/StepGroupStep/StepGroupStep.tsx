/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/uicore'

import type { StepGroupElementConfig } from 'services/cd-ng'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepGroupStepEditRef } from './StepGroupStepEdit'

export class StepGroupStep extends PipelineStep<StepGroupElementConfig> {
  protected type = StepType.StepGroup
  protected stepName = 'Step Group'
  protected stepIcon: IconName = 'step-group'
  protected stepPaletteVisible = false

  protected defaultValues: StepGroupElementConfig = {
    identifier: '',
    name: '',
    steps: []
  }

  constructor() {
    super()
    this._hasDelegateSelectionVisible = true
  }

  validateInputSet(): Record<string, any> {
    return {}
  }

  renderStep(props: StepProps<StepGroupElementConfig>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, formikRef, isNewStep, readonly, allowableTypes } = props

    return (
      <StepGroupStepEditRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
        allowableTypes={allowableTypes}
      />
    )
  }
}
