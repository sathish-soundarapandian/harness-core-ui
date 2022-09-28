/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { merge } from 'lodash-es'
import { Tab, Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { StepDetailsTab } from '@pipeline/components/execution/StepDetails/tabs/StepDetailsTab/StepDetailsTab'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { QueuedExecutionsTab } from '@pipeline/components/execution/StepDetails/tabs/QueuedExecutionsTab/QueuedExecutionsTab'
import { ExecutionInputs } from '@pipeline/components/execution/StepDetails/tabs/ExecutionInputs/ExecutionInputs'
import { isExecutionWaitingForInput } from '@pipeline/utils/statusHelpers'
import tabCss from '@pipeline/components/execution/StepDetails/views/DefaultView/DefaultView.module.scss'

enum StepDetailTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  QUEUED_EXECUTIONS = 'QUEUED_EXECUTIONS',
  STEP_EXECUTION_INPUTS = 'STEP_EXECUTION_INPUTS'
}

export interface QueueStepViewProps extends StepDetailProps {
  step: ExecutionNode
}

export function QueueStepView(props: QueueStepViewProps): React.ReactElement | null {
  const { step } = props
  const { getString } = useStrings()
  const manuallySelected = React.useRef(false)
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const shouldShowExecutionInputs = !!step.executionInputConfigured
  const [activeTab, setActiveTab] = React.useState(StepDetailTab.QUEUED_EXECUTIONS)

  React.useEffect(() => {
    if (!manuallySelected.current) {
      if (isWaitingOnExecInputs) {
        setActiveTab(StepDetailTab.STEP_EXECUTION_INPUTS)
      }
    }
  }, [step.identifier, isWaitingOnExecInputs])

  return (
    <div className={tabCss.tabs}>
      <Tabs
        id="step-details"
        renderAllTabPanels={false}
        selectedTabId={activeTab}
        onChange={newTab => {
          manuallySelected.current = true
          setActiveTab(newTab as StepDetailTab)
        }}
      >
        {shouldShowExecutionInputs ? (
          <Tab
            id={StepDetailTab.STEP_EXECUTION_INPUTS}
            title={getString('pipeline.runtimeInputs')}
            panel={<ExecutionInputs step={step} />}
          />
        ) : null}
        <Tab
          id={StepDetailTab.QUEUED_EXECUTIONS}
          title={getString('pipeline.queueStep.queuedExecutions')}
          panel={<QueuedExecutionsTab step={step} />}
        />
        <Tab id={StepDetailTab.STEP_DETAILS} title={getString('details')} panel={<StepDetailsTab step={step} />} />
        <Tab
          id={StepDetailTab.INPUT}
          title={getString('common.input')}
          panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
        />
        <Tab
          id={StepDetailTab.OUTPUT}
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
    </div>
  )
}
