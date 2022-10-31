/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import type { IconName } from '@harness/uicore'

import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'

import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'
import DeployEnvironmentGroupInputStep from './DeployEnvironmentGroupInputStep'

export class DeployEnvironmentGroupStep extends Step<DeployEnvironmentEntityConfig> {
  protected type = StepType.DeployEnvironmentGroup
  protected stepPaletteVisible = false
  protected stepName = 'Deploy Environment Group'
  protected stepIcon: IconName = 'environment-group'

  protected defaultValues: DeployEnvironmentEntityConfig = {}

  constructor() {
    super()
  }

  renderStep(props: StepProps<DeployEnvironmentEntityConfig>): JSX.Element {
    const { allowableTypes, inputSetData, stepViewType } = props

    if (isTemplatizedView(stepViewType)) {
      return <DeployEnvironmentGroupInputStep inputSetData={inputSetData} allowableTypes={allowableTypes} />
    }

    return <React.Fragment />
  }

  validateInputSet(): any {
    return
  }
}
