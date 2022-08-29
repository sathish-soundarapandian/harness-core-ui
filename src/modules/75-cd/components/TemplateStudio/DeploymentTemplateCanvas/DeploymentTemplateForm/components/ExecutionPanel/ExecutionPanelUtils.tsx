/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import produce from 'immer'
import { clone, set } from 'lodash-es'
import type { TemplateStepNode } from 'services/pipeline-ng'
import type {
  DeploymentConfig,
  DeploymentConfigExecutionStepWrapper
} from '@cd/context/DeploymentContext/DeploymentContextProvider'

interface Params {
  processNode: TemplateStepNode
  deploymentConfig: DeploymentConfig
  isNewStep?: boolean
}

export const getUpdatedDeploymentConfig = ({ processNode, deploymentConfig, isNewStep }: Params) =>
  produce(deploymentConfig, draft => {
    const executionSteps = deploymentConfig?.execution?.steps || []
    const updatedExecutionSteps = clone(executionSteps)
    const newStepDetailsToAdd: DeploymentConfigExecutionStepWrapper = { step: processNode }

    if (isNewStep) {
      updatedExecutionSteps.push(newStepDetailsToAdd)
    } else {
      updatedExecutionSteps.forEach(executionStep => {
        if (executionStep.step.identifier === newStepDetailsToAdd.step.identifier) {
          executionStep.step = newStepDetailsToAdd.step
        }
      })
    }

    set(draft, 'execution.steps', updatedExecutionSteps)
  })
