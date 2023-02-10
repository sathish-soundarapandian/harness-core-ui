/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SetStateAction } from 'react'
import type { FormikErrors, FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import { Intent } from '@blueprintjs/core'

import type {
  RetryFailureActionConfig,
  IgnoreFailureActionConfig,
  ManualInterventionFailureActionConfig,
  AbortFailureActionConfig,
  StepGroupFailureActionConfig,
  MarkAsSuccessFailureActionConfig,
  StageRollbackFailureActionConfig,
  FailureStrategyConfig,
  PipelineRollbackFailureActionConfig,
  OnFailureConfig,
  ProceedWithDefaultValuesFailureActionConfig
} from 'services/pipeline-ng'

export type AllActions =
  | RetryFailureActionConfig
  | IgnoreFailureActionConfig
  | ManualInterventionFailureActionConfig
  | AbortFailureActionConfig
  | StepGroupFailureActionConfig
  | MarkAsSuccessFailureActionConfig
  | StageRollbackFailureActionConfig
  | PipelineRollbackFailureActionConfig
  | ProceedWithDefaultValuesFailureActionConfig

export interface AllFailureStrategyConfig extends FailureStrategyConfig {
  onFailure: OnFailureConfig & { action: AllActions }
}

export function hasItems<T>(data?: T[]): boolean {
  return Array.isArray(data) && data.length > 0
}

export function findTabWithErrors(errors: FormikErrors<AllFailureStrategyConfig[]>): number {
  return Array.isArray(errors) ? errors.findIndex(err => !isEmpty(err)) : -1
}

export interface FormState {
  failureStrategies?: AllFailureStrategyConfig[]
}

export interface HandleChangeInStrategiesProps {
  strategies: AllFailureStrategyConfig[]
  selectedStrategyNum: number
  setSelectedStrategyNum: (value: SetStateAction<number>) => void
  setFormikState: FormikProps<unknown>['setFormikState']
}

export function handleChangeInStrategies({
  strategies,
  selectedStrategyNum,
  setSelectedStrategyNum,
  setFormikState
}: HandleChangeInStrategiesProps): void {
  /* istanbul ignore else */
  if (Array.isArray(strategies)) {
    /* istanbul ignore else */
    if (selectedStrategyNum >= strategies.length) {
      // select the new last tab, if the last tab was deleted
      setSelectedStrategyNum(Math.max(0, strategies.length - 1))
    }

    /* istanbul ignore else */
    if (strategies.length === 0) {
      // reset errors when all the tabs are deleted
      setFormikState(prevState => ({ ...prevState, errors: {}, submitCount: 0 }))
    }
  }
}

export function getTabIntent(i: number, selectedStrategyNum: number): Intent {
  return i === selectedStrategyNum ? Intent.PRIMARY : Intent.NONE
}
