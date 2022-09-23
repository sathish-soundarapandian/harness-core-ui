/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Container } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { StringsMap } from 'stringTypes'
import type { ApprovalInstanceResponse } from 'services/pipeline-ng'
import { Duration } from '@common/exports'
import { ApprovalStatus } from '@pipeline/utils/approvalUtils'
import { String } from 'framework/strings'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { StepDetails } from '@pipeline/components/execution/StepDetails/common/StepDetails/StepDetails'
import type { StepExecutionTimeInfo } from '@pipeline/components/execution/StepDetails/views/BaseApprovalView/BaseApprovalView'
import { CustomApprovalCriteria } from './CustomApprovalCriteria/CustomApprovalCriteria'
import headerCss from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/ExecutionStageDetailsHeader/ExecutionStageDetailsHeader.module.scss'
import css from './CustomApprovalTab.module.scss'

export interface CustomApprovalTabProps extends StepExecutionTimeInfo {
  approvalData: ApprovalInstanceResponse
  isWaiting: boolean
}

const statusToStringIdMap = {
  [ApprovalStatus.APPROVED]: 'pipeline.customApprovalStep.execution.wasApproved',
  [ApprovalStatus.REJECTED]: 'pipeline.customApprovalStep.execution.wasRejected',
  [ApprovalStatus.EXPIRED]: 'pipeline.customApprovalStep.execution.wasExpired',
  [ApprovalStatus.ABORTED]: 'pipeline.customApprovalStep.execution.wasAborted'
}

function CustomApprovalMessage({ status }: { status: keyof typeof ApprovalStatus }) {
  const stringId = statusToStringIdMap[status] as keyof StringsMap

  return stringId ? (
    <Container
      color={Color.BLACK}
      background={Color.YELLOW_100}
      padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'large', right: 'large' }}
    >
      <String stringID={stringId} />
    </Container>
  ) : null
}

export function CustomApprovalTab(props: CustomApprovalTabProps): React.ReactElement {
  const { approvalData, isWaiting, startTs, endTs, stepParameters } = props
  const wasFailed = !isWaiting && approvalData?.status === ApprovalStatus.FAILED
  const shouldShowExecutionTimeInfo = !isWaiting && approvalData?.status !== ApprovalStatus.WAITING

  return (
    <>
      {wasFailed ? (
        <div className={headerCss.errorMsgWrapper}>
          <ExecutionStatusLabel status={'Failed'} />
          <div className={headerCss.errorMsg}>
            <String className={headerCss.errorTitle} stringID="errorSummaryText" tagName="div" />
            <p>{approvalData?.errorMessage}</p>
          </div>
        </div>
      ) : (
        <div>
          {isWaiting ? (
            <div className={css.info}>
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
              <Container color={Color.BLACK} margin={{ top: 'large', bottom: 'large' }}>
                <String stringID="pipeline.customApprovalStep.execution.customApprovalPending" />
              </Container>
            </div>
          ) : (
            <CustomApprovalMessage status={approvalData?.status} />
          )}
        </div>
      )}
      {shouldShowExecutionTimeInfo && (
        <Container className={css.stepDetailsContainer} padding={{ top: 'large' }}>
          <StepDetails step={{ startTs, endTs, stepParameters }} />
        </Container>
      )}
      <div className={cx(css.customApproval, { [css.applyTopPadding]: !shouldShowExecutionTimeInfo })}>
        {approvalData?.details?.approvalCriteria ? (
          <CustomApprovalCriteria type="approval" criteria={approvalData.details.approvalCriteria} />
        ) : null}
        {approvalData?.details?.rejectionCriteria ? (
          <CustomApprovalCriteria type="rejection" criteria={approvalData.details.rejectionCriteria} />
        ) : null}
      </div>
    </>
  )
}
