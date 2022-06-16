import React from 'react'
import { Button, ButtonVariation, Dialog, Layout } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import { useModalHook } from '@harness/use-modal'
import type { ExecutionPipelineNode } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import {
  ExecutionNode,
  ResponseHarnessApprovalInstanceAuthorization,
  useGetApprovalInstance,
  useGetHarnessApprovalInstanceAuthorization
} from 'services/pipeline-ng'
import {
  ApprovalData,
  HarnessApprovalTab
} from '@pipeline/components/execution/StepDetails/tabs/HarnessApprovalTab/HarnessApprovalTab'
import { useDeepCompareEffect } from '@common/hooks'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'

interface PropsInterface {
  step: ExecutionPipelineNode<ExecutionNode>
}

export const ApprovalNode = ({ step }: PropsInterface) => {
  const { getString } = useStrings()
  const approvalInstanceId = step.item?.data?.executableResponses?.[0].async?.callbackIds?.[0]
  const [approvalData, setApprovalData] = React.useState<ApprovalData>(null)
  const shouldFetchData = !!approvalInstanceId
  const isWaiting = isExecutionWaiting(step?.status)

  const {
    data,
    refetch,
    loading: loadingApprovalData,
    error
  } = useGetApprovalInstance({
    approvalInstanceId,
    lazy: !shouldFetchData
  })

  const {
    data: authData,
    refetch: refetchAuthData,
    loading: loadingAuthData
  } = useGetHarnessApprovalInstanceAuthorization({
    approvalInstanceId,
    lazy: !shouldFetchData
  })

  useDeepCompareEffect(() => {
    setApprovalData(data?.data as ApprovalData)
  }, [data])

  const [showApproveRejectModal, hideApproveRejectModal] = useModalHook(
    () => (
      <Dialog
        onClose={hideApproveRejectModal}
        isOpen={true}
        enforceFocus={false}
        title={
          <>
            <String stringID="common.approve" /> / <String stringID="common.reject" />
          </>
        }
      >
        <Layout.Vertical>
          <Layout.Horizontal>
            <Button variation={ButtonVariation.PRIMARY} onClick={hideApproveRejectModal} intent="primary">
              {getString('close')}
            </Button>
          </Layout.Horizontal>
          <HarnessApprovalTab
            approvalInstanceId={approvalInstanceId}
            approvalData={approvalData}
            isWaiting={isWaiting}
            authData={authData}
            updateState={updatedData => {
              setApprovalData(updatedData)
              refetchAuthData()
            }}
            // stepParameters={step.stepParameters}
          />
        </Layout.Vertical>
      </Dialog>
    ),
    []
  )

  return (
    <Button intent="primary" onClick={showApproveRejectModal} disabled={false}>
      <String stringID="common.approve" />
    </Button>
  )
}

// const hasApprovalNode = nodes.find(node => node.item.data.executableResponses[0].async.callbackIds[0])
