/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useLocation } from 'react-router-dom'
import cx from 'classnames'
import qs from 'qs'
import { Container } from '@harness/uicore'
import type { ResponseMessage } from 'services/cd-ng'
import type { ExecutionGraph, ExecutionNode } from 'services/pipeline-ng'
import { String } from 'framework/strings'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { LogsContentWithErrorBoundary as LogsContent } from '@pipeline/components/LogsContent/LogsContent'
import { isExecutionSkipped, isExecutionCompletedWithBadState } from '@pipeline/utils/statusHelpers'
import { StepDetails, StepLabels } from '@pipeline/components/execution/StepDetails/common/StepDetails/StepDetails'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ExecutionQueryParams, showHarnessCoPilot } from '@pipeline/utils/executionUtils'
import HarnessCopilot from '@pipeline/components/HarnessCopilot/HarnessCopilot'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'

import css from './StepDetailsTab.module.scss'

export interface ExecutionStepDetailsTabProps {
  step: ExecutionNode
  executionMetadata: ExecutionGraph['executionMetadata']
  labels?: StepLabels[]
}

export function StepDetailsTab(props: ExecutionStepDetailsTabProps): React.ReactElement {
  const { step, executionMetadata, labels } = props
  const { pathname } = useLocation()
  const queryParams = useQueryParams<ExecutionQueryParams>()
  const { pipelineStagesMap, selectedStageId } = useExecutionContext()
  const { CI_AI_ENHANCED_REMEDIATIONS, CD_AI_ENHANCED_REMEDIATIONS } = useFeatureFlags()

  const logUrl = `${pathname}?${qs.stringify({ ...queryParams, view: 'log' })}`

  const errorMessage = step?.failureInfo?.message || step.executableResponses?.[0]?.skipTask?.message
  const isFailed = isExecutionCompletedWithBadState(step.status)
  const isSkipped = isExecutionSkipped(step.status)

  return (
    <div className={css.detailsTab}>
      {step.failureInfo?.responseMessages?.length ? (
        <ErrorHandler responseMessages={step.failureInfo?.responseMessages as ResponseMessage[]} />
      ) : errorMessage ? (
        <div className={cx(css.errorMsg, { [css.error]: isFailed, [css.warn]: isSkipped })}>
          <String className={css.title} stringID="errorSummaryText" tagName="div" />
          <p>{errorMessage}</p>
        </div>
      ) : null}
      {showHarnessCoPilot({
        pipelineStagesMap,
        selectedStageId,
        enableForCI: CI_AI_ENHANCED_REMEDIATIONS,
        enableForCD: CD_AI_ENHANCED_REMEDIATIONS
      }) ? (
        <Container
          flex={{ justifyContent: 'flex-start' }}
          padding={{ top: 'large', bottom: 'large', right: 'bottom', left: 'medium' }}
        >
          <HarnessCopilot mode="step-details" />
        </Container>
      ) : null}
      <StepDetails step={step} labels={labels} executionMetadata={executionMetadata} />
      <LogsContent mode="step-details" toConsoleView={logUrl} />
    </div>
  )
}
