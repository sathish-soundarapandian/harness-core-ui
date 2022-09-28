/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty, merge } from 'lodash-es'
import { Tabs } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { ExecutionInputs } from '@pipeline/components/execution/StepDetails/tabs/ExecutionInputs/ExecutionInputs'
import { isExecutionWaitingForInput } from '@pipeline/utils/statusHelpers'

import { StepDetailsTab } from '../../tabs/StepDetailsTab/StepDetailsTab'
import tabCss from '../DefaultView/DefaultView.module.scss'

export const REFRESH_APPROVAL = 'REFRESH_APPROVAL'

enum ApprovalStepTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  STEP_EXECUTION_INPUTS = 'STEP_EXECUTION_INPUTS'
}

export interface ServiceNowCreateUpdateViewProps extends StepDetailProps {
  step: ExecutionNode
}

export function ServiceNowCreateUpdateView(props: ServiceNowCreateUpdateViewProps): React.ReactElement | null {
  const { step } = props
  const ticket = get(step, 'outcomes.ticket', {}) as { ticketNumber: string; ticketUrl: string }
  const { getString } = useStrings()
  const manuallySelected = React.useRef(false)
  const [activeTab, setActiveTab] = React.useState(ApprovalStepTab.STEP_DETAILS)
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const shouldShowExecutionInputs = !!step.executionInputConfigured

  const labels = []
  if (!isEmpty(ticket?.ticketUrl)) {
    labels.push({
      label: getString('pipeline.serviceNowApprovalStep.issueNumber'),
      value: (
        <a href={ticket.ticketUrl} target="_blank" rel="noreferrer">
          {ticket.ticketNumber}
        </a>
      )
    })
  }

  React.useEffect(() => {
    if (!manuallySelected.current) {
      let tab = ApprovalStepTab.STEP_DETAILS
      if (isWaitingOnExecInputs) {
        tab = ApprovalStepTab.STEP_EXECUTION_INPUTS
      }
      setActiveTab(tab)
    }
  }, [step.identifier, isWaitingOnExecInputs])

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
        id={ApprovalStepTab.STEP_DETAILS}
        title={getString('details')}
        panel={<StepDetailsTab step={step} labels={labels} />}
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
    </Tabs>
  )
}
