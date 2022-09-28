/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Container } from '@wings-software/uicore'
import type { ApprovalInstanceResponse, JiraApprovalInstanceDetails } from 'services/pipeline-ng'
import { Duration } from '@common/exports'
import { ApprovalStatus } from '@pipeline/utils/approvalUtils'
import { String } from 'framework/strings'
import type { StepExecutionTimeInfo } from '@pipeline/components/execution/StepDetails/views/BaseApprovalView/BaseApprovalView'
import { StepDetails } from '@pipeline/components/execution/StepDetails/common/StepDetails/StepDetails'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { JiraCriteria } from './JiraCriteria/JiraCriteria'
import headerCss from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/ExecutionStageDetailsHeader/ExecutionStageDetailsHeader.module.scss'
import css from './JiraApprovalTab.module.scss'

export type ApprovalData =
  | (ApprovalInstanceResponse & {
      details: JiraApprovalInstanceDetails
    })
  | null

export interface JiraApprovalTabProps extends StepExecutionTimeInfo {
  approvalData: ApprovalInstanceResponse
  isWaiting: boolean
}

export function JiraApprovalTab(props: JiraApprovalTabProps): React.ReactElement {
  const { isWaiting, startTs, endTs, stepParameters } = props
  const approvalData = props.approvalData as ApprovalData
  const wasApproved = !isWaiting && approvalData?.status === ApprovalStatus.APPROVED
  const wasRejected =
    !isWaiting && (approvalData?.status === ApprovalStatus.REJECTED || approvalData?.status === ApprovalStatus.EXPIRED)
  const wasFailed = !isWaiting && approvalData?.status === ApprovalStatus.FAILED
  const jiraKey = approvalData?.details.issue.key
  const jiraUrl = approvalData?.details.issue.url
  const shouldShowExecutionTimeInfo = !isWaiting && approvalData?.status !== ApprovalStatus.WAITING

  return (
    <React.Fragment>
      {wasFailed ? (
        <div className={headerCss.errorMsgWrapper}>
          <ExecutionStatusLabel status={'Failed'} />
          <div className={headerCss.errorMsg}>
            <String className={headerCss.errorTitle} stringID="errorSummaryText" tagName="div" />
            <p>{approvalData?.errorMessage}</p>
          </div>
        </div>
      ) : (
        <div className={css.info} data-type="jira">
          {isWaiting ? (
            <>
              <div className={css.timer}>
                <Duration
                  className={css.duration}
                  durationText=""
                  icon="hourglass"
                  startTime={approvalData?.deadline}
                  iconProps={{ size: 8 }}
                />
                <String stringID="pipeline.timeRemainingSuffix" />
              </div>
              {jiraKey && jiraUrl ? (
                <div className={css.jiraTicket}>
                  <String stringID="pipeline.jiraApprovalStep.execution.jiraTicket" />

                  <a href={jiraUrl} target="_blank" rel="noopener noreferrer">
                    {jiraKey}
                  </a>
                </div>
              ) : null}
            </>
          ) : null}
          {wasApproved && jiraUrl && jiraKey ? (
            <div className={css.jiraTicket}>
              <String stringID="pipeline.jiraApprovalStep.execution.wasApproved" />

              <a href={jiraUrl} target="_blank" rel="noopener noreferrer">
                {jiraKey}
              </a>
            </div>
          ) : null}

          {wasRejected && jiraUrl && jiraKey ? (
            <div className={css.jiraTicket}>
              {approvalData?.status === ApprovalStatus.REJECTED ? (
                <String stringID="pipeline.jiraApprovalStep.execution.wasRejected" />
              ) : null}
              {approvalData?.status === ApprovalStatus.EXPIRED ? (
                <String stringID="pipeline.jiraApprovalStep.execution.wasExpired" />
              ) : null}
              <a href={jiraUrl} target="_blank" rel="noopener noreferrer">
                {jiraKey}
              </a>
            </div>
          ) : null}
        </div>
      )}
      {shouldShowExecutionTimeInfo && (
        <Container className={css.stepDetailsContainer} padding={{ top: 'large' }}>
          <StepDetails step={{ startTs, endTs, stepParameters }} />
        </Container>
      )}
      <div className={cx(css.jiraApproval, { [css.applyTopPadding]: !shouldShowExecutionTimeInfo })}>
        {approvalData?.details?.approvalCriteria ? (
          <JiraCriteria type="approval" criteria={approvalData.details.approvalCriteria} />
        ) : null}
        {approvalData?.details?.rejectionCriteria ? (
          <JiraCriteria type="rejection" criteria={approvalData.details.rejectionCriteria} />
        ) : null}
      </div>
    </React.Fragment>
  )
}
