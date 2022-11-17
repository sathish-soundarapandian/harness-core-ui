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

export interface RestoreCacheHarnessStepData {
  identifier: string
  name?: string
  description?: string
  type: string
}
export class RestoreCacheHarnessStep extends PipelineStep<RestoreCacheHarnessStepData> {
  // This is a dummy step used to render the icon for implicit step Restore Cache from Harness
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.RestoreCacheHarness
  protected stepName = 'Restore Cache from Harness Step'
  protected stepIcon: IconName = 'restore-cache-harness-ci-step'
  protected stepIconColor = '#4F5162'
  protected stepIconSize = 34

  // protected stepDescription: keyof StringsMap =

  protected stepPaletteVisible = false

  protected defaultValues: RestoreCacheHarnessStepData = {
    identifier: '',
    type: StepType.RestoreCacheHarness as string
  }

  validateInputSet(): FormikErrors<RestoreCacheHarnessStepData> {
    /* istanbul ignore next */
    return {}
  }

  renderStep(_: StepProps<RestoreCacheHarnessStepData>): JSX.Element {
    return <></>
  }
}
