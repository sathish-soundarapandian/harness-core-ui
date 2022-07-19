/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'

export enum LoopingStrategyEnum {
  Matrix = 'matrix',
  For = 'for',
  Parallelism = 'parallelism'
}

export interface LoopingStrategy {
  label: string
  defaultValue: any
  helperText: keyof StringsMap
  helperLink: string
}

export const AvailableStrategies: Record<LoopingStrategyEnum, LoopingStrategy> = {
  [LoopingStrategyEnum.Matrix]: {
    label: 'Matrix',
    defaultValue: {},
    helperText: 'pipeline.loopingStrategy.helperText.matrix',
    helperLink: 'https://www.google.com'
  },
  [LoopingStrategyEnum.For]: {
    label: 'For Loop',
    defaultValue: {},
    helperText: 'pipeline.loopingStrategy.helperText.for',
    helperLink: 'https://www.google.com'
  },
  [LoopingStrategyEnum.Parallelism]: {
    label: 'Parallelism',
    defaultValue: 1,
    helperText: 'pipeline.loopingStrategy.helperText.parallelism',
    helperLink: 'https://www.google.com'
  }
}
