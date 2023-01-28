/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { merge } from 'lodash-es'
import { Tabs, Tab } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { PolicyEvaluationTab } from '@pipeline/components/execution/StepDetails/tabs/PolicyEvaluationTab/PolicyEvaluationTab'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { ManualInterventionTab } from '@pipeline/components/execution/StepDetails/tabs/ManualInterventionTab/ManualInterventionTab'
import { StageType } from '@pipeline/utils/stageHelpers'

import css from '../DefaultView/DefaultView.module.scss'

enum StepDetailTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION'
}

export function PolicyEvaluationView(props: StepDetailProps): React.ReactElement {
  const { step, stageType = StageType.DEPLOY, executionMetadata } = props
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = React.useState(StepDetailTab.STEP_DETAILS)
  const manuallySelected = React.useRef(false)
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)

  React.useEffect(() => {
    // istanbul ignore else
    if (!manuallySelected.current) {
      setActiveTab(isManualInterruption ? StepDetailTab.MANUAL_INTERVENTION : StepDetailTab.STEP_DETAILS)
    }
  }, [step.identifier, isManualInterruption])

  return (
    <div className={css.tabs}>
      <Tabs
        id="step-details"
        selectedTabId={activeTab}
        onChange={newTab => {
          manuallySelected.current = true
          setActiveTab(newTab as StepDetailTab)
        }}
        renderAllTabPanels={false}
      >
        <Tab
          id={StepDetailTab.STEP_DETAILS}
          title={getString('details')}
          panel={<PolicyEvaluationTab step={step} executionMetadata={executionMetadata} />}
        />
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
        {isManualInterruption ? (
          <Tab
            id={StepDetailTab.MANUAL_INTERVENTION}
            title={getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
            panel={<ManualInterventionTab step={step} stageType={stageType} executionMetadata={executionMetadata} />}
          />
        ) : null}
      </Tabs>
    </div>
  )
}
