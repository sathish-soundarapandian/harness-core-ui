/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { defaultTo, get, identity, merge } from 'lodash-es'
import { Spinner, Tabs } from '@blueprintjs/core'
import { Layout, Button, PageError } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { ApprovalInstanceResponse, ExecutionNode } from 'services/pipeline-ng'
import { useGetApprovalInstance, ResponseApprovalInstanceResponse } from 'services/pipeline-ng'
import { isExecutionWaiting, isExecutionFailed, isExecutionWaitingForInput } from '@pipeline/utils/statusHelpers'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { extractInfo } from '@common/components/ErrorHandler/ErrorHandler'
import { PipelineDetailsTab } from '@pipeline/components/execution/StepDetails/tabs/PipelineDetailsTab/PipelineDetailsTab'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { ExecutionInputs } from '@pipeline/components/execution/StepDetails/tabs/ExecutionInputs/ExecutionInputs'

import tabCss from '../DefaultView/DefaultView.module.scss'

export const REFRESH_APPROVAL = 'REFRESH_APPROVAL'

enum ApprovalStepTab {
  APPROVAL = 'APPROVAL',
  PIPELINE_DETAILS = 'PIPELINE_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  STEP_EXECUTION_INPUTS = 'STEP_EXECUTION_INPUTS'
}

export interface StepExecutionTimeInfo {
  stepParameters?: { [key: string]: { [key: string]: any } }
  startTs?: number
  endTs?: number
}

interface ApprovalTabComponentProps extends StepExecutionTimeInfo {
  approvalData: ApprovalInstanceResponse
  isWaiting: boolean
}

export interface BaseApprovalViewProps extends StepDetailProps {
  step: ExecutionNode
  mock?: {
    data?: ResponseApprovalInstanceResponse
    loading?: boolean
  }
  approvalTabComponent: React.ComponentType<ApprovalTabComponentProps>
}

export function BaseApprovalView(props: BaseApprovalViewProps): React.ReactElement | null {
  const { step, mock, approvalTabComponent: ApprovalTabComponent } = props
  const approvalInstanceId = get(step, 'executableResponses[0].async.callbackIds[0]') || ''
  const manuallySelected = React.useRef(false)
  const [activeTab, setActiveTab] = React.useState(ApprovalStepTab.APPROVAL)
  const isWaiting = isExecutionWaiting(step.status)
  const isStepExecutionFailed = isExecutionFailed(step.status)
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const shouldShowExecutionInputs = !!step.executionInputConfigured
  const { message, responseMessages } = step.failureInfo || {}

  const failureErrorMessage = React.useMemo(() => {
    return responseMessages && responseMessages.length > 0
      ? extractInfo(responseMessages)
          .map(err => err.error?.message)
          .filter(identity)
          .join(', ')
      : defaultTo(message, '')
  }, [responseMessages, message])

  const shouldFetchData = !!approvalInstanceId
  const mounted = useRef(false)
  const { getString } = useStrings()
  const {
    data,
    loading: loadingApprovalData,
    error,
    refetch
  } = useGetApprovalInstance({
    approvalInstanceId,
    mock,
    lazy: true
  })

  // only calls the api when approvalInstanceId is available for waiting state
  // refreshes the view when the status of the node changes
  React.useEffect(() => {
    if (shouldFetchData) {
      if (mounted.current) {
        window.setTimeout(() => {
          refetch()
        }, 3000)
      } else {
        refetch()
      }
      mounted.current = true
    }
  }, [shouldFetchData, step.status])

  React.useEffect(() => {
    if (!manuallySelected.current) {
      let tab = ApprovalStepTab.APPROVAL
      if (isWaitingOnExecInputs) {
        tab = ApprovalStepTab.STEP_EXECUTION_INPUTS
      }
      setActiveTab(tab)
    }
  }, [step.identifier, isWaitingOnExecInputs])

  if (error || (isStepExecutionFailed && failureErrorMessage)) {
    return (
      <Layout.Vertical height="100%" margin={{ top: 'huge' }}>
        <PageError
          message={failureErrorMessage ? failureErrorMessage : (error!.data as Error)?.message || error!.message}
        />
      </Layout.Vertical>
    )
  }

  if (loadingApprovalData || (!shouldFetchData && !shouldShowExecutionInputs)) {
    return (
      <Layout.Vertical height="100%" flex={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </Layout.Vertical>
    )
  }

  return (
    <Tabs
      id="step-details"
      className={tabCss.tabs}
      renderActiveTabPanelOnly
      selectedTabId={activeTab}
      onChange={newTab => {
        manuallySelected.current = true
        setActiveTab(newTab as ApprovalStepTab)
      }}
    >
      {shouldShowExecutionInputs ? (
        <Tabs.Tab
          id={ApprovalStepTab.STEP_EXECUTION_INPUTS}
          title={getString('pipeline.runtimeInputs')}
          panel={<ExecutionInputs step={step} />}
        />
      ) : null}
      <Tabs.Tab
        id={ApprovalStepTab.APPROVAL}
        title={getString('approvalStage.title')}
        panel={
          <ApprovalTabComponent
            approvalData={data?.data as ApprovalInstanceResponse}
            isWaiting={isWaiting}
            startTs={step.startTs}
            endTs={step.endTs}
            stepParameters={step.stepParameters}
          />
        }
      />
      <Tabs.Tab
        id={ApprovalStepTab.PIPELINE_DETAILS}
        title={getString('common.pipelineDetails')}
        panel={<PipelineDetailsTab />}
      />
      <Tabs.Tab
        id={ApprovalStepTab.INPUT}
        title={getString('common.input')}
        panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
      />
      <Tabs.Tab
        id={ApprovalStepTab.OUTPUT}
        title={getString('outputLabel')}
        panel={
          <InputOutputTab
            baseFqn={step.baseFqn}
            mode="output"
            data={Array.isArray(step.outcomes) ? { output: merge({}, ...step.outcomes) } : step.outcomes}
          />
        }
      />
      <Tabs.Expander />
      <Button
        minimal
        intent="primary"
        icon="refresh"
        iconProps={{ size: 12, style: { marginRight: 'var(--spacing-2)' } }}
        style={{ transform: 'translateY(-5px)' }}
        onClick={() => refetch()}
      >
        {getString('common.refresh')}
      </Button>
    </Tabs>
  )
}
