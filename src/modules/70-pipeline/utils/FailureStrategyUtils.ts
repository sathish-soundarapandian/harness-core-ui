/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import type { StringKeys } from 'framework/strings'
import type { FailureStrategyActionConfig, OnFailureConfig } from 'services/pipeline-ng'

export type FailureErrorType = OnFailureConfig['errors'][number]

export type StrategyType = FailureStrategyActionConfig['type']

export const Strategy: Record<StrategyType, StrategyType> = {
  Ignore: 'Ignore',
  Abort: 'Abort',
  StageRollback: 'StageRollback',
  Retry: 'Retry',
  ManualIntervention: 'ManualIntervention',
  MarkAsSuccess: 'MarkAsSuccess',
  PipelineRollback: 'PipelineRollback',
  ProceedWithDefaultValues: 'ProceedWithDefaultValues',
  StepGroupRollback: 'StepGroupRollback'
}

export enum WaitActions {
  MarkAsSuccess = 'MarkAsSuccess',
  MarkedAsSuccess = 'MarkedAsSuccess',
  MarkAsFailure = 'MarkAsFailure',
  MarkedAsFailure = 'MarkedAsFailure'
}

export const ErrorType: Record<FailureErrorType, FailureErrorType> = {
  AllErrors: 'AllErrors',
  Authentication: 'Authentication',
  Connectivity: 'Connectivity',
  Timeout: 'Timeout',
  Authorization: 'Authorization',
  Verification: 'Verification',
  DelegateProvisioning: 'DelegateProvisioning',
  Unknown: 'Unknown',
  PolicyEvaluationFailure: 'PolicyEvaluationFailure',
  InputTimeoutError: 'InputTimeoutError'
}

export const strategyIconMap: Record<StrategyType, IconName> = {
  Ignore: 'delete',
  Abort: 'ban-circle',
  MarkAsSuccess: 'tick',
  StageRollback: 'repeat',
  Retry: 'refresh',
  ManualIntervention: 'hand-up',
  PipelineRollback: 'repeat',
  ProceedWithDefaultValues: 'main-resume',
  StepGroupRollback: 'repeat'
}

export const waitActionsIconMap: Record<WaitActions, IconName> = {
  [WaitActions.MarkAsFailure]: 'ban-circle',
  [WaitActions.MarkedAsFailure]: 'ban-circle',
  [WaitActions.MarkedAsSuccess]: 'tick',
  [WaitActions.MarkAsSuccess]: 'tick'
}
export const stringsMap: Record<StrategyType, StringKeys> = {
  Ignore: 'pipeline.failureStrategies.strategiesLabel.Ignore',
  Abort: 'pipeline.failureStrategies.strategiesLabel.Abort',
  MarkAsSuccess: 'pipeline.failureStrategies.strategiesLabel.MarkAsSuccess',
  StageRollback: 'pipeline.failureStrategies.strategiesLabel.StageRollback',
  Retry: 'pipeline.failureStrategies.strategiesLabel.Retry',
  ManualIntervention: 'pipeline.failureStrategies.strategiesLabel.ManualIntervention',
  PipelineRollback: 'pipeline.failureStrategies.strategiesLabel.PipelineRollback',
  ProceedWithDefaultValues: 'pipeline.failureStrategies.strategiesLabel.ProceedWithDefaultValues',
  StepGroupRollback: 'pipeline.failureStrategies.strategiesLabel.StepGroupRollback'
}

export const waitActionsStringMap: Record<WaitActions, StringKeys> = {
  [WaitActions.MarkAsSuccess]: 'pipeline.failureStrategies.strategiesLabel.MarkAsSuccess',
  [WaitActions.MarkedAsSuccess]: 'pipeline.failureStrategies.strategiesLabel.MarkedAsSuccess',
  [WaitActions.MarkedAsFailure]: 'pipeline.failureStrategies.strategiesLabel.MarkedAsFail',
  [WaitActions.MarkAsFailure]: 'pipeline.failureStrategies.strategiesLabel.MarkAsFail'
}
