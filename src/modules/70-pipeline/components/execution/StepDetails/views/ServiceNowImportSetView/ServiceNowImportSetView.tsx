/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty, isNil, merge } from 'lodash-es'
import { Tabs } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { ExecutionInputs } from '@pipeline/components/execution/StepDetails/tabs/ExecutionInputs/ExecutionInputs'
import { isExecutionWaitingForInput } from '@pipeline/utils/statusHelpers'

import { StepDetailsTab } from '../../tabs/StepDetailsTab/StepDetailsTab'
import tabCss from '../DefaultView/DefaultView.module.scss'

enum StepDetailTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  STEP_EXECUTION_INPUTS = 'STEP_EXECUTION_INPUTS'
}

interface TransformMapOutcomeType {
  status: string
  displayValue?: string
  targetRecordURL?: string
  errorMessage?: string
}

interface ServiceNowImportSetViewProps extends StepDetailProps {
  step: ExecutionNode
}

export function ServiceNowImportSetView(props: ServiceNowImportSetViewProps): React.ReactElement | null {
  const { step } = props
  const transformMapOutcomes = get(step, 'outcomes.output.transformMapOutcomes', []) as TransformMapOutcomeType[]
  const { getString } = useStrings()
  const manuallySelected = React.useRef(false)
  const [activeTab, setActiveTab] = React.useState(StepDetailTab.STEP_DETAILS)
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const shouldShowExecutionInputs = !!step.executionInputConfigured

  const labels = []
  const importSetDetails = transformMapOutcomes.map(transformMapOutcome => {
    const _displayValue = get(transformMapOutcome, 'displayValue')
    if (transformMapOutcome?.status !== 'error' && !isNil(_displayValue) && !isEmpty(_displayValue)) {
      return (
        <a href={get(transformMapOutcome, 'targetRecordURL')} target="_blank" rel="noreferrer">
          {_displayValue}
        </a>
      )
    }
    return get(transformMapOutcome, 'errorMessage')
  })

  /* istanbul ignore else */
  if (!isEmpty(importSetDetails)) {
    labels.push({
      label: 'Import Set Details',
      value: importSetDetails
    })
  }

  React.useEffect(() => {
    /* istanbul ignore next */
    if (!manuallySelected.current) {
      const tab = !isWaitingOnExecInputs ? StepDetailTab.STEP_DETAILS : StepDetailTab.STEP_EXECUTION_INPUTS
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
        setActiveTab(newTab as StepDetailTab)
      }}
    >
      {shouldShowExecutionInputs ? (
        <Tabs.Tab
          id={StepDetailTab.STEP_EXECUTION_INPUTS}
          title={getString('pipeline.runtimeInputs')}
          panel={<ExecutionInputs step={step} />}
        />
      ) : null}
      <Tabs.Tab
        id={StepDetailTab.STEP_DETAILS}
        title={getString('details')}
        panel={<StepDetailsTab step={step} labels={labels} />}
      />
      <Tabs.Tab
        id={StepDetailTab.INPUT}
        title={getString('common.input')}
        panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
      />
      <Tabs.Tab
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
  )
}
