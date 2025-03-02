/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { defaultTo, get, identity, merge } from 'lodash-es'
import { Spinner, Tabs } from '@blueprintjs/core'
import { Layout, Button, PageError, HarnessDocTooltip } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { ApprovalInstanceResponse, ExecutionNode, ExecutionGraph } from 'services/pipeline-ng'
import { useGetApprovalInstance, ResponseApprovalInstanceResponse } from 'services/pipeline-ng'
import {
  isExecutionWaiting,
  isExecutionFailed,
  isExecutionWaitingForInput,
  isExecutionWaitingForIntervention
} from '@pipeline/utils/statusHelpers'
import { usePolling } from '@common/hooks/usePolling'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { ManualInterventionTab } from '@pipeline/components/execution/StepDetails/tabs/ManualInterventionTab/ManualInterventionTab'
import { StageType } from '@pipeline/utils/stageHelpers'
import { extractInfo } from '@common/components/ErrorHandler/ErrorHandler'
import { PipelineDetailsTab } from '@pipeline/components/execution/StepDetails/tabs/PipelineDetailsTab/PipelineDetailsTab'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { ExecutionInputs } from '@pipeline/components/execution/StepDetails/tabs/ExecutionInputs/ExecutionInputs'

import { PolicyEvaluationContent } from '../../common/ExecutionContent/PolicyEvaluationContent/PolicyEvaluationContent'
import tabCss from '../DefaultView/DefaultView.module.scss'

export const REFRESH_APPROVAL = 'REFRESH_APPROVAL'

const POLL_INTERVAL = 60 * 1000 // 1 min

enum ApprovalStepTab {
  APPROVAL = 'APPROVAL',
  PIPELINE_DETAILS = 'PIPELINE_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
  STEP_EXECUTION_INPUTS = 'STEP_EXECUTION_INPUTS',
  POLICY_ENFORCEMENT = 'POLICY_ENFORCEMENT'
}

export interface StepExecutionTimeInfo {
  stepParameters?: { [key: string]: { [key: string]: any } }
  startTs?: number
  endTs?: number
}

interface ApprovalTabComponentProps extends StepExecutionTimeInfo {
  approvalData: ApprovalInstanceResponse
  isWaiting: boolean
  executionMetadata: ExecutionGraph['executionMetadata']
  progressData?: {
    [key: string]: string
  }
}

export interface BaseApprovalViewProps extends StepDetailProps {
  step: Omit<ExecutionNode, 'progressData'> & {
    progressData?: {
      [key: string]: any
    }
  }
  mock?: {
    data?: ResponseApprovalInstanceResponse
    loading?: boolean
  }
  approvalTabComponent: React.ComponentType<ApprovalTabComponentProps>
}

export function BaseApprovalView(props: BaseApprovalViewProps): React.ReactElement | null {
  const {
    step,
    stageType = StageType.DEPLOY,
    mock,
    approvalTabComponent: ApprovalTabComponent,
    executionMetadata
  } = props
  const approvalInstanceId = get(step, 'executableResponses[0].async.callbackIds[0]') || ''
  const manuallySelected = React.useRef(false)
  const [activeTab, setActiveTab] = React.useState(ApprovalStepTab.APPROVAL)
  const isWaiting = isExecutionWaiting(step.status)
  const isStepExecutionFailed = isExecutionFailed(step.status)
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const shouldPollForTicketStatus =
    step?.stepType === StepType.JiraApproval || step?.stepType === StepType.ServiceNowApproval
  const shouldShowExecutionInputs = !!step.executionInputConfigured
  const shouldShowPolicyEnforcement = !!step?.outcomes?.policyOutput?.policySetDetails
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
    refetch: fetchApprovalInstanceData
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
          fetchApprovalInstanceData()
        }, 3000)
      } else {
        fetchApprovalInstanceData()
      }
      mounted.current = true
    }
  }, [shouldFetchData, step.status])

  usePolling(fetchApprovalInstanceData, {
    pollingInterval: POLL_INTERVAL,
    startPolling: !loadingApprovalData && !!data && shouldFetchData && shouldPollForTicketStatus
  })

  React.useEffect(() => {
    if (!manuallySelected.current) {
      let tab = ApprovalStepTab.APPROVAL
      if (isWaitingOnExecInputs) {
        tab = ApprovalStepTab.STEP_EXECUTION_INPUTS
      } else if (isManualInterruption) {
        tab = ApprovalStepTab.MANUAL_INTERVENTION
      }
      setActiveTab(tab)
    }

    return () => {
      manuallySelected.current = false
    }
  }, [step.identifier, isWaitingOnExecInputs, isManualInterruption])

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
          title={<HarnessDocTooltip tooltipId={'executionInputsTab'} labelText={getString('pipeline.runtimeInputs')} />}
          panel={<ExecutionInputs step={step} executionMetadata={executionMetadata} />}
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
            executionMetadata={executionMetadata}
            progressData={step.progressData}
          />
        }
      />
      <Tabs.Tab
        id={ApprovalStepTab.PIPELINE_DETAILS}
        title={<HarnessDocTooltip tooltipId={'stepDetailsTab'} labelText={getString('common.pipelineDetails')} />}
        panel={<PipelineDetailsTab />}
      />
      <Tabs.Tab
        id={ApprovalStepTab.INPUT}
        title={<HarnessDocTooltip tooltipId={'stepInputTab'} labelText={getString('common.input')} />}
        panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
      />
      <Tabs.Tab
        id={ApprovalStepTab.OUTPUT}
        title={<HarnessDocTooltip tooltipId={'stepOutputTab'} labelText={getString('outputLabel')} />}
        panel={
          <InputOutputTab
            baseFqn={step.baseFqn}
            mode="output"
            data={Array.isArray(step.outcomes) ? { output: merge({}, ...step.outcomes) } : step.outcomes}
          />
        }
      />
      {isManualInterruption && (
        <Tabs.Tab
          id={ApprovalStepTab.MANUAL_INTERVENTION}
          key={ApprovalStepTab.MANUAL_INTERVENTION}
          title={
            <HarnessDocTooltip
              tooltipId={'manualInterventionTab'}
              labelText={getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
            />
          }
          panel={<ManualInterventionTab step={step} stageType={stageType} executionMetadata={executionMetadata} />}
        />
      )}
      {shouldShowPolicyEnforcement ? (
        <Tabs.Tab
          id={ApprovalStepTab.POLICY_ENFORCEMENT}
          title={getString('pipeline.policyEnforcement.title')}
          panel={
            <PolicyEvaluationContent
              step={step}
              executionMetadata={executionMetadata}
              policySetOutputPath={'outcomes.policyOutput'}
            />
          }
        />
      ) : null}
      <Tabs.Expander />
      <Button
        minimal
        intent="primary"
        icon="refresh"
        iconProps={{ size: 12, style: { marginRight: 'var(--spacing-2)' } }}
        style={{ transform: 'translateY(-5px)' }}
        onClick={() => fetchApprovalInstanceData()}
      >
        {getString('common.refresh')}
      </Button>
    </Tabs>
  )
}
