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

import { Button, ButtonVariation, useToggleOpen } from '@harness/uicore'
import type { ResponseMessage } from 'services/cd-ng'
import type { ExecutionGraph, ExecutionNode } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { LogsContentWithErrorBoundary as LogsContent } from '@pipeline/components/LogsContent/LogsContent'
import { isExecutionSkipped, isExecutionCompletedWithBadState } from '@pipeline/utils/statusHelpers'
import { StepDetails, StepLabels } from '@pipeline/components/execution/StepDetails/common/StepDetails/StepDetails'
import { useQueryParams } from '@common/hooks'
import type { ExecutionQueryParams } from '@pipeline/utils/executionUtils'
import { DelegateTaskLogsModal } from '@common/components/DelegateTaskLogs/DelegateTaskLogs'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

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
  const { isOpen, open: openDelegateTaskLogsModal, close: closeDelegateTaskLogsModal } = useToggleOpen(false)
  const { getString } = useStrings()
  const DELEGATE_TASK_LOGS_ENABLED = useFeatureFlag(FeatureFlag.DEL_FETCH_TASK_LOG_API)

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
      <StepDetails step={step} labels={labels} executionMetadata={executionMetadata} />
      {DELEGATE_TASK_LOGS_ENABLED && step.startTs && step.delegateInfoList && step.delegateInfoList.length > 0 ? (
        <>
          <Button variation={ButtonVariation.PRIMARY} margin={'small'} onClick={openDelegateTaskLogsModal}>
            {getString('common.viewText')} {getString('common.logs.delegateTaskLogs')}
          </Button>
          <DelegateTaskLogsModal isOpen={isOpen} close={closeDelegateTaskLogsModal} step={step} />
        </>
      ) : null}
      <LogsContent mode="step-details" toConsoleView={logUrl} />
    </div>
  )
}
