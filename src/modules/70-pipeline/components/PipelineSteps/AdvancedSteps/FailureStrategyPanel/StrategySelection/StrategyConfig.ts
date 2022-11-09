/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Strategy, StrategyType, ErrorType, FailureErrorType } from '@pipeline/utils/FailureStrategyUtils'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'

export const allowedStrategiesAsPerStep: (domain: StageType) => Record<Modes, StrategyType[]> = (
  domain = StageType.DEPLOY
) => {
  switch (domain) {
    case StageType.BUILD:
      return {
        [Modes.STEP]: [
          Strategy.ManualIntervention,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort,
          Strategy.ProceedWithDefaultValues
        ],
        [Modes.STEP_GROUP]: [
          Strategy.ManualIntervention,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort
        ],
        [Modes.STAGE]: [
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort,
          Strategy.ProceedWithDefaultValues
        ]
      }
    case StageType.CUSTOM:
      return {
        [Modes.STEP]: [
          Strategy.ManualIntervention,
          // Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort,
          Strategy.ProceedWithDefaultValues
        ],
        [Modes.STEP_GROUP]: [
          Strategy.ManualIntervention,
          // Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort
        ],
        [Modes.STAGE]: [
          Strategy.ManualIntervention,
          // Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort,
          Strategy.ProceedWithDefaultValues
        ]
      }
    case StageType.DEPLOY:
    default:
      return {
        [Modes.STEP]: [
          Strategy.ManualIntervention,
          Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort,
          Strategy.ProceedWithDefaultValues
        ],
        [Modes.STEP_GROUP]: [
          Strategy.ManualIntervention,
          Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort
        ],
        [Modes.STAGE]: [
          Strategy.ManualIntervention,
          Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort,
          Strategy.ProceedWithDefaultValues
        ]
      }
  }
}

export const errorTypesForStages: Record<StageType, FailureErrorType[]> = {
  [StageType.DEPLOY]: [
    ErrorType.Authentication,
    ErrorType.Authorization,
    ErrorType.Connectivity,
    ErrorType.DelegateProvisioning,
    ErrorType.Timeout,
    ErrorType.Unknown,
    ErrorType.Verification,
    ErrorType.PolicyEvaluationFailure,
    ErrorType.AllErrors,
    ErrorType.InputTimeoutError
  ],
  [StageType.BUILD]: [ErrorType.Timeout, ErrorType.Unknown, ErrorType.InputTimeoutError, ErrorType.AllErrors],
  [StageType.APPROVAL]: [
    ErrorType.Authentication,
    ErrorType.Authorization,
    ErrorType.Connectivity,
    ErrorType.DelegateProvisioning,
    ErrorType.Timeout,
    ErrorType.Unknown,
    ErrorType.Verification,
    ErrorType.AllErrors,
    ErrorType.PolicyEvaluationFailure,
    ErrorType.InputTimeoutError
  ],
  [StageType.FEATURE]: [ErrorType.Timeout, ErrorType.Unknown, ErrorType.InputTimeoutError, ErrorType.AllErrors],
  [StageType.SECURITY]: [ErrorType.Timeout, ErrorType.Unknown, ErrorType.InputTimeoutError, ErrorType.AllErrors],
  [StageType.PIPELINE]: [
    ErrorType.Authentication,
    ErrorType.Authorization,
    ErrorType.Connectivity,
    ErrorType.DelegateProvisioning,
    ErrorType.Timeout,
    ErrorType.Unknown,
    ErrorType.Verification,
    ErrorType.AllErrors,
    ErrorType.PolicyEvaluationFailure,
    ErrorType.InputTimeoutError
  ],
  [StageType.CUSTOM]: [
    ErrorType.Authentication,
    ErrorType.Authorization,
    ErrorType.Connectivity,
    ErrorType.DelegateProvisioning,
    ErrorType.Timeout,
    ErrorType.Unknown,
    ErrorType.Verification,
    ErrorType.AllErrors,
    ErrorType.PolicyEvaluationFailure,
    ErrorType.InputTimeoutError
  ],
  [StageType.Template]: [],
  [StageType.MATRIX]: [],
  [StageType.LOOP]: [],
  [StageType.PARALLELISM]: []
}
