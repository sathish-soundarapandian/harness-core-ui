/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

export interface SaveCacheHarnessStepData {
  identifier: string
  name?: string
  description?: string
  type: string
}
export class SaveCacheHarnessStep extends PipelineStep<SaveCacheHarnessStepData> {
  // This is a dummy step used to render the icon for implicit step Save Cache to Harness
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.SaveCacheHarness
  protected stepName = 'Save Cache to Harness Step'
  protected stepIcon: IconName = 'save-cache-harness-ci-step'
  protected stepIconColor = '#4F5162'
  protected stepIconSize = 34
  // protected stepDescription: keyof StringsMap =

  protected stepPaletteVisible = false

  protected defaultValues: SaveCacheHarnessStepData = {
    identifier: '',
    type: StepType.SaveCacheHarness as string
  }

  validateInputSet(): FormikErrors<SaveCacheHarnessStepData> {
    /* istanbul ignore next */
    return {}
  }

  renderStep(_: StepProps<SaveCacheHarnessStepData>): JSX.Element {
    return <></>
  }
}
