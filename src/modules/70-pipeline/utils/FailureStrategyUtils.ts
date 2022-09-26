/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import type { StringKeys } from 'framework/strings'
import type { OnFailureConfig } from 'services/cd-ng'

export type FailureErrorType = OnFailureConfig['errors'][number]

export enum Strategy {
  Ignore = 'Ignore',
  Abort = 'Abort',
  StageRollback = 'StageRollback',
  Retry = 'Retry',
  ManualIntervention = 'ManualIntervention',
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
  ExecutionInputTimeoutError: 'ExecutionInputTimeoutError'
}

export const strategyIconMap: Record<Strategy, IconName> = {
  [Strategy.Ignore]: 'delete',
  [Strategy.Abort]: 'ban-circle',
  [Strategy.MarkedAsSuccess]: 'tick',
  [Strategy.MarkAsSuccess]: 'tick',
  [Strategy.StageRollback]: 'repeat',
  [Strategy.Retry]: 'refresh',
  [Strategy.ManualIntervention]: 'hand-up',
  [Strategy.MarkAsFailure]: 'ban-circle',
  [Strategy.MarkedAsFailure]: 'ban-circle'
}

export const stringsMap: Record<Strategy, StringKeys> = {
  [Strategy.Ignore]: 'pipeline.failureStrategies.strategiesLabel.Ignore',
  [Strategy.Abort]: 'pipeline.failureStrategies.strategiesLabel.Abort',
  [Strategy.MarkAsSuccess]: 'pipeline.failureStrategies.strategiesLabel.MarkAsSuccess',
  [Strategy.MarkedAsSuccess]: 'pipeline.failureStrategies.strategiesLabel.MarkedAsSuccess',
  [Strategy.StageRollback]: 'pipeline.failureStrategies.strategiesLabel.StageRollback',
  [Strategy.Retry]: 'pipeline.failureStrategies.strategiesLabel.Retry',
  [Strategy.ManualIntervention]: 'pipeline.failureStrategies.strategiesLabel.ManualIntervention',
  [Strategy.MarkAsFailure]: 'pipeline.failureStrategies.strategiesLabel.MarkAsFail',
  [Strategy.MarkedAsFailure]: 'pipeline.failureStrategies.strategiesLabel.MarkedAsFail'
}
