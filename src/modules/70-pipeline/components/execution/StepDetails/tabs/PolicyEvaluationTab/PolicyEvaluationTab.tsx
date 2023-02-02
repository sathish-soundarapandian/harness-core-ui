/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import type { ExecutionGraph, ExecutionNode } from 'services/pipeline-ng'
import { String } from 'framework/strings'

import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { StepDetails } from '@pipeline/components/execution/StepDetails/common/StepDetails/StepDetails'
import { isExecutionSkipped, isExecutionCompletedWithBadState } from '@pipeline/utils/statusHelpers'

import { PolicyEvaluationContent } from '../../common/ExecutionContent/PolicyEvaluationContent/PolicyEvaluationContent'

import css from '../StepDetailsTab/StepDetailsTab.module.scss'

export interface ExecutionStepDetailsTabProps {
  step: ExecutionNode
  executionMetadata: ExecutionGraph['executionMetadata']
}

export function PolicyEvaluationTab(props: ExecutionStepDetailsTabProps): React.ReactElement {
  const { step, executionMetadata } = props

  const errorMessage = step?.failureInfo?.message || step.executableResponses?.[0]?.skipTask?.message
  const isFailed = isExecutionCompletedWithBadState(step.status)
  const isSkipped = isExecutionSkipped(step.status)

  return (
    <div className={css.detailsTab}>
      {step.failureInfo?.responseMessages?.length ? (
        <ErrorHandler responseMessages={step.failureInfo?.responseMessages} />
      ) : errorMessage ? (
        <div className={cx(css.errorMsg, { [css.error]: isFailed, [css.warn]: isSkipped })}>
          <String className={css.title} stringID="errorSummaryText" tagName="div" />
          <p>{errorMessage}</p>
        </div>
      ) : null}
      <StepDetails step={step} executionMetadata={executionMetadata} />
      <PolicyEvaluationContent
        step={step}
        executionMetadata={executionMetadata}
        policySetOutputPath={'outcomes.output'}
      />
    </div>
  )
}
