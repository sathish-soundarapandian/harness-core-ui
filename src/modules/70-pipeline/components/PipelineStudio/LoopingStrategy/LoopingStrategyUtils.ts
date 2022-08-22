/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export enum LoopingStrategyEnum {
  Matrix = 'matrix',
  Repeat = 'repeat',
  Parallelism = 'parallelism'
}

export interface LoopingStrategy {
  label: keyof StringsMap
  defaultValue: unknown
  helperText: keyof StringsMap
  helperLink: string
  disabled: boolean
}

export const getAvailableStrategies = (stepType?: StepType): Record<LoopingStrategyEnum, LoopingStrategy> => ({
  [LoopingStrategyEnum.Matrix]: {
    label: 'pipeline.loopingStrategy.matrix.label',
    defaultValue: {},
    helperText: 'pipeline.loopingStrategy.matrix.helperText',
    helperLink: 'https://docs.harness.io',
    disabled: stepType === StepType.Command
  },
  [LoopingStrategyEnum.Repeat]: {
    label: 'pipeline.loopingStrategy.repeat.label',
    defaultValue: {},
    helperText: 'pipeline.loopingStrategy.repeat.helperText',
    helperLink: 'https://docs.harness.io',
    disabled: false
  },
  [LoopingStrategyEnum.Parallelism]: {
    label: 'pipeline.loopingStrategy.parallelism.label',
    defaultValue: 1,
    helperText: 'pipeline.loopingStrategy.parallelism.helperText',
    helperLink: 'https://docs.harness.io',
    disabled: stepType === StepType.Command
  }
})
