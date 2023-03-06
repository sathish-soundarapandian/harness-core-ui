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
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'

export class IACMEvaluate extends PipelineStep<any> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = 'IACMTerraformPlan' as StepType
  protected stepName = 'IACM Evaluate'
  protected stepIcon: IconName = 'iacm'
  protected stepDescription = 'IACM Evaluate' as keyof StringsMap
  protected stepPaletteVisible = false
  protected isHarnessSpecific = true
  protected isStepNonDeletable = true
  protected defaultValues = {}

  processFormData() {
    return {}
  }

  validateInputSet(): FormikErrors<any> {
    return {}
  }

  renderStep(): JSX.Element {
    return (
      <></>
    )
  }
}

