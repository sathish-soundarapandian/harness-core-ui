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
import DeployInfrastructureEntityInputStep from './DeployInfrastructureEntityInputStep'
import type { DeployInfrastructureEntityCustomStepProps } from './types'

export class DeployInfrastructureEntityStep extends Step<DeployEnvironmentEntityConfig['environment']> {
  protected type = StepType.DeployInfrastructureEntity
  protected stepPaletteVisible = false
  protected stepName = 'Deploy Infrastructure Entity'
  protected stepIcon: IconName = 'infrastructure'

  protected defaultValues: DeployEnvironmentEntityConfig['environment'] = {
    environmentRef: ''
  }

  constructor() {
    super()
  }

  renderStep(props: StepProps<DeployEnvironmentEntityConfig['environment']>): JSX.Element {
    const { initialValues, readonly = false, allowableTypes, inputSetData, stepViewType, customStepProps } = props

    if (isTemplatizedView(stepViewType)) {
      return (
        <DeployInfrastructureEntityInputStep
          initialValues={initialValues}
          readonly={readonly}
          inputSetData={inputSetData}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          {...(customStepProps as Required<DeployInfrastructureEntityCustomStepProps>)}
        />
      )
    }

    return <React.Fragment />
  }

  validateInputSet(): any {
    return
  }
}
