/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { DefaultIACMProps } from './types'
import { IACMStepSideBarComponent } from './RenderStep'

export class IACMEvaluate extends PipelineStep<DefaultIACMProps> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Evaluate
  protected stepName = 'IACM Evaluate'
  protected stepIcon: IconName = 'iacm'
  protected stepDescription: keyof StringsMap = 'iacm.pipelineSteps.evaluateDescription'
  protected stepPaletteVisible = false
  protected isHarnessSpecific = true
  protected isStepNonDeletable = true
  protected defaultValues: DefaultIACMProps = {
    name: 'IACM Evaluate',
    type: StepType.Evaluate,
    spec: {}
  }
  // no validation needed as this is not editable by default
  // the purpose of this step is to allow the user to
  // add steps before or after this action
  validateInputSet(): FormikErrors<any> {
    return {}
  }

  renderStep(props: StepProps<any, unknown>): JSX.Element {
    const { initialValues } = props
    return <IACMStepSideBarComponent initialValues={initialValues} />
  }
}
