/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { get } from 'lodash-es'
import { useModalHook } from '@harness/use-modal'
import { Button, Dialog, Layout } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import { DefaultConsoleViewStepDetails, logsRenderer } from '@pipeline/components/LogsContent/LogsContent'
import type { ConsoleViewStepDetailProps, RenderLogsInterface } from '@pipeline/factories/ExecutionFactory/types'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'
import { HarnessApprovalTab } from '@pipeline/components/execution/StepDetails/tabs/HarnessApprovalTab/HarnessApprovalTab'
import { isApprovalWaiting } from '@pipeline/utils/approvalUtils'
import { useHarnessApproval } from '@pipeline/components/execution/StepDetails/views/HarnessApprovalView/useHarnessApproval'
import css from './HarnessApprovalLogsView.module.scss'

export function HarnessApprovalLogsView(props: ConsoleViewStepDetailProps): React.ReactElement {
  const { getString } = useStrings()
  const step = props.step

  const isWaiting = isExecutionWaiting(step.status)
  const approvalInstanceId = get(step, 'executableResponses[0].async.callbackIds[0]') || ''
  const {
    authData,
    refetchAuthData,
    approvalData,
    setApprovalData,
    loadingApprovalData,
    loadingAuthData,
    shouldFetchData
  } = useHarnessApproval({ approvalInstanceId })

  const isWaitingAll = isWaiting && approvalData && isApprovalWaiting(approvalData.status)

  const isCurrentUserAuthorized = /* istanbul ignore next */ !!authData?.data?.authorized
  const currentUserUnAuthorizedReason = /* istanbul ignore next */ authData?.data?.reason

  const [showApproveRejectModal, hideApproveRejectModal] = useModalHook(
    () => (
      <Dialog
        className={css.approveRejectModal}
        onClose={hideApproveRejectModal}
        isOpen={true}
        enforceFocus={false}
        title={
          <>
            <String stringID="pipeline.approvalStep.execution.inputsTitle" />
          </>
        }
      >
        <Layout.Vertical>
          <HarnessApprovalTab
            showBannerInfo={false}
            showInputsHeader={false}
            approvalInstanceId={approvalInstanceId}
            approvalData={approvalData}
            isWaiting={isWaiting}
            authData={authData}
            approvalBoxClassName={css.harnessApprovalLogsView}
            startTs={step.startTs}
            endTs={step.endTs}
            updateState={updatedData => {
              setApprovalData(updatedData)
              refetchAuthData()
              hideApproveRejectModal()
            }}
            stepParameters={step.stepParameters}
          />
        </Layout.Vertical>
      </Dialog>
    ),
    [approvalInstanceId, approvalData, isWaiting, authData]
  )
  let approveButtonNode: React.ReactNode = null

  if (loadingApprovalData || loadingAuthData || !shouldFetchData) {
    approveButtonNode = null
  } else if (isWaitingAll && !isCurrentUserAuthorized) {
    approveButtonNode = (
      <div className={classnames(css.approvalRow, css.error)}>
        {currentUserUnAuthorizedReason
          ? currentUserUnAuthorizedReason
          : /* istanbul ignore next */ approvalData?.details?.approvers?.disallowPipelineExecutor
          ? getString('pipeline.approvalStep.disallowedApproverExecution')
          : getString('pipeline.approvalStep.notAuthorizedExecution')}
      </div>
    )
  } else if (isWaitingAll && isCurrentUserAuthorized) {
    approveButtonNode = (
      <div className={css.approvalRow}>
        <div>
          {approvalData?.details?.approvalMessage || getString('pipeline.approvalStage.approvalStageLogsViewMessage')}
        </div>
        <Button
          margin={{ left: 'xlarge' }}
          style={{ minWidth: '170px' }}
          withoutBoxShadow
          intent="primary"
          onClick={showApproveRejectModal}
          data-testid="approvalButton"
        >
          <String stringID="pipeline.approveOrReject" />
        </Button>
      </div>
    )
  }

  const renderLogs = (renderLogsProps: RenderLogsInterface): React.ReactElement => {
    return (
      <div data-testid="harnessApprovalLogsTest">
        {approveButtonNode}
        {logsRenderer(renderLogsProps)}
      </div>
    )
  }
  return <DefaultConsoleViewStepDetails {...props} renderLogs={renderLogs} />
}
