/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty, merge } from 'lodash-es'
import { Tabs } from '@blueprintjs/core'
import { HarnessDocTooltip } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { ExecutionNode, JiraIssueKeyNG } from 'services/pipeline-ng'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { ExecutionInputs } from '@pipeline/components/execution/StepDetails/tabs/ExecutionInputs/ExecutionInputs'
import { isExecutionWaitingForInput, isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import { StageType } from '@pipeline/utils/stageHelpers'
import { ManualInterventionTab } from '@pipeline/components/execution/StepDetails/tabs/ManualInterventionTab/ManualInterventionTab'

import { StepDetailsTab } from '../../tabs/StepDetailsTab/StepDetailsTab'
import { PolicyEvaluationContent } from '../../common/ExecutionContent/PolicyEvaluationContent/PolicyEvaluationContent'
import tabCss from '../DefaultView/DefaultView.module.scss'

export const REFRESH_APPROVAL = 'REFRESH_APPROVAL'

enum ApprovalStepTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
  STEP_EXECUTION_INPUTS = 'STEP_EXECUTION_INPUTS',
  POLICY_ENFORCEMENT = 'POLICY_ENFORCEMENT'
}

export interface JiraCreateUpdateViewProps extends StepDetailProps {
  step: ExecutionNode
}

export function JiraCreateUpdateView(props: JiraCreateUpdateViewProps): React.ReactElement | null {
  const { step, stageType = StageType.DEPLOY, executionMetadata } = props
  const issue = get(step, 'outcomes.issue', {}) as JiraIssueKeyNG
  const { getString } = useStrings()
  const manuallySelected = React.useRef(false)
  const [activeTab, setActiveTab] = React.useState(ApprovalStepTab.STEP_DETAILS)
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const shouldShowExecutionInputs = !!step.executionInputConfigured
  const shouldShowPolicyEnforcement = !!step?.outcomes?.policyOutput?.policySetDetails
  const labels = []
  if (!isEmpty(issue.url)) {
    labels.push({
      label: getString('pipeline.jiraApprovalStep.issueKey'),
      value: (
        <a href={issue.url} target="_blank" rel="noreferrer">
          {issue.key}
        </a>
      )
    })
  }

  React.useEffect(() => {
    if (!manuallySelected.current) {
      let tab = ApprovalStepTab.STEP_DETAILS
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
        id={ApprovalStepTab.STEP_DETAILS}
        title={<HarnessDocTooltip tooltipId={'stepDetailsTab'} labelText={getString('details')} />}
        panel={<StepDetailsTab step={step} executionMetadata={executionMetadata} labels={labels} />}
      />
      <Tabs.Tab
        id={ApprovalStepTab.INPUT}
        title={<HarnessDocTooltip tooltipId={'stepInputTab'} labelText={getString('common.input')} />}
        panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} isMultiline />}
      />
      <Tabs.Tab
        id={ApprovalStepTab.OUTPUT}
        title={<HarnessDocTooltip tooltipId={'stepOutputTab'} labelText={getString('outputLabel')} />}
        panel={
          <InputOutputTab
            baseFqn={step.baseFqn}
            mode="output"
            data={Array.isArray(step.outcomes) ? { output: merge({}, ...step.outcomes) } : step.outcomes}
            isMultiline
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
    </Tabs>
  )
}
