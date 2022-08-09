/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Container } from '@wings-software/uicore'
import type { ApprovalInstanceResponse, ServiceNowApprovalInstanceDetails } from 'services/pipeline-ng'
import { Duration } from '@common/exports'
import { ApprovalStatus } from '@pipeline/utils/approvalUtils'
import { String } from 'framework/strings'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import type { StepExecutionTimeInfo } from '@pipeline/components/execution/StepDetails/views/BaseApprovalView/BaseApprovalView'
import { StepDetails } from '@pipeline/components/execution/StepDetails/common/StepDetails/StepDetails'
import { ServiceNowCriteria } from './ServiceNowCriteria/ServiceNowCriteria'
import headerCss from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/ExecutionStageDetailsHeader/ExecutionStageDetailsHeader.module.scss'
import css from './ServiceNowApprovalTab.module.scss'

export type ApprovalData =
  | (ApprovalInstanceResponse & {
      details: ServiceNowApprovalInstanceDetails
    })
  | null

export interface ServiceNowApprovalTabProps extends StepExecutionTimeInfo {
  approvalData: ApprovalInstanceResponse
  isWaiting: boolean
}

export function ServiceNowApprovalTab(props: ServiceNowApprovalTabProps): React.ReactElement {
  const { isWaiting, startTs, endTs, stepParameters } = props
  const approvalData = props.approvalData as ApprovalData
  const wasApproved = !isWaiting && approvalData?.status === ApprovalStatus.APPROVED
  const wasRejected =
    !isWaiting && (approvalData?.status === ApprovalStatus.REJECTED || approvalData?.status === ApprovalStatus.EXPIRED)
  const wasFailed = !isWaiting && approvalData?.status === ApprovalStatus.FAILED
  const serviceNowKey = approvalData?.details.ticket.key
  const serviceNowUrl = approvalData?.details.ticket.url
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
        <div className={css.info} data-type="serviceNow">
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
              {serviceNowKey && serviceNowUrl ? (
                <div className={css.serviceNowTicket}>
                  <String stringID="pipeline.serviceNowApprovalStep.execution.serviceNowTicket" />

                  <a href={serviceNowUrl} target="_blank" rel="noopener noreferrer">
                    {serviceNowKey}
                  </a>
                </div>
              ) : null}
            </>
          ) : null}
          {wasApproved && serviceNowUrl && serviceNowKey ? (
            <div className={css.serviceNowTicket}>
              <String stringID="pipeline.serviceNowApprovalStep.execution.wasApproved" />

              <a href={serviceNowUrl} target="_blank" rel="noopener noreferrer">
                {serviceNowKey}
              </a>
            </div>
          ) : null}

          {wasRejected && serviceNowUrl && serviceNowKey ? (
            <div className={css.serviceNowTicket}>
              {approvalData?.status === ApprovalStatus.REJECTED ? (
                <String stringID="pipeline.serviceNowApprovalStep.execution.wasRejected" />
              ) : null}
              {approvalData?.status === ApprovalStatus.EXPIRED ? (
                <String stringID="pipeline.serviceNowApprovalStep.execution.wasExpired" />
              ) : null}
              <a href={serviceNowUrl} target="_blank" rel="noopener noreferrer">
                {serviceNowKey}
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
      <div className={cx(css.serviceNowApproval, { [css.applyTopPadding]: !shouldShowExecutionTimeInfo })}>
        {approvalData?.details?.approvalCriteria ? (
          <ServiceNowCriteria type="approval" criteria={approvalData.details.approvalCriteria} />
        ) : null}
        {approvalData?.details?.rejectionCriteria ? (
          <ServiceNowCriteria type="rejection" criteria={approvalData.details.rejectionCriteria} />
        ) : null}
      </div>
    </React.Fragment>
  )
}
