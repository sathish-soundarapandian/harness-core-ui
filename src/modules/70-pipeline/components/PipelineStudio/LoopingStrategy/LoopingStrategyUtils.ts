/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'

import type { StringsMap } from 'stringTypes'
import type { StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StepOrStepGroupOrTemplateStepData } from '../StepCommands/StepCommandTypes'
import { getFlattenedSteps } from '../CommonUtils/CommonUtils'

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

export const getAvailableStrategies = (
  step?: StepOrStepGroupOrTemplateStepData
): Record<LoopingStrategyEnum, LoopingStrategy> => {
  const stepType = (step as StepElementConfig)?.type
  const allSteps = getFlattenedSteps((step as StepGroupElementConfig)?.steps)

  let disabled = stepType === StepType.Command
  // Ideally step group should have type as StepType.StepGroup.
  // But, it is not present hence assuming if step has steps property then it is step group
  if (!isEmpty(allSteps)) {
    const commandSteps = allSteps.filter(currStep => currStep.type === StepType.Command)
    if (commandSteps.length === allSteps.length) {
      disabled = true
    }
  }

  return {
    [LoopingStrategyEnum.Matrix]: {
      label: 'pipeline.loopingStrategy.matrix.label',
      defaultValue: {},
      helperText: 'pipeline.loopingStrategy.matrix.helperText',
      helperLink: 'https://docs.harness.io/article/eh4azj73m4#matrix',
      disabled: disabled
    },
    [LoopingStrategyEnum.Repeat]: {
      label: 'pipeline.loopingStrategy.repeat.label',
      defaultValue: {},
      helperText: 'pipeline.loopingStrategy.repeat.helperText',
      helperLink: 'https://docs.harness.io/article/eh4azj73m4#repeat',
      disabled: false
    },
    [LoopingStrategyEnum.Parallelism]: {
      label: 'pipeline.loopingStrategy.parallelism.label',
      defaultValue: 1,
      helperText: 'pipeline.loopingStrategy.parallelism.helperText',
      helperLink: 'https://docs.harness.io/article/eh4azj73m4#parallelism',
      disabled: disabled
    }
  }
}
