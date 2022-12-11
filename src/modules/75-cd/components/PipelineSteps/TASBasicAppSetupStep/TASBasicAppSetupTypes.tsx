/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export enum InstancesType {
  FromManifest = 'FromManifest',
  MatchRunningInstances = 'MatchRunningInstances'
}

export enum ResizeStrategyType {
  UpScaleNewFirst = 'UpScaleNewFirst',
  DownScaleOldFirst = 'DownScaleOldFirst'
}

export interface TASBasicAppSetupTemplate {
  identifier: string
  timeout: string
  name: string
  type: StepType.TasBasicAppSetup
  spec: {
    instanceCount: string
    existingVersionToKeep: string
    additionalRoutes: any
  }
}

export const checkEmptyOrNegative = (value: any): boolean => /* istanbul ignore next */ {
  if (typeof value === 'string') {
    return isEmpty(value)
  }
  if (typeof value === 'number') {
    return value < 0
  }
  return false
}
