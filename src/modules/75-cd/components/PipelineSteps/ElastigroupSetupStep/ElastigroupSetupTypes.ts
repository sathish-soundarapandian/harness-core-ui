/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type {
  ElastigroupSetupStepInfo,
  ElastigroupCurrentRunningInstances,
  ElastigroupFixedInstances
} from 'services/cd-ng'
import type { StepElementConfig } from 'services/pipeline-ng'

export enum InstancesType {
  Fixed = 'Fixed',
  CurrentRunning = 'CurrentRunning'
}

export interface ElastigroupInstances {
  type: 'Fixed' | 'CurrentRunning'
  spec: ElastigroupFixedInstances | ElastigroupCurrentRunningInstances
}

export interface ElastigroupSetupData extends StepElementConfig {
  spec: ElastigroupSetupStepInfo & {
    name: string
    instances: ElastigroupInstances
  }
}

export interface ElastigroupSetupTemplate {
  identifier: string
  timeout: string
  name: string
  type: StepType.ElastigroupSetup
  spec: {
    name: string
    instances: {
      type: string
      spec: {
        desired: string
        max: string
        min: string
      }
    }
  }
}
