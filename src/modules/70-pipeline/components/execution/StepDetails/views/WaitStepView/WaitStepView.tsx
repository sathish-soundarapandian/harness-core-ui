/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { merge } from 'lodash-es'
import { Tabs, Tab } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { StageType } from '@pipeline/utils/stageHelpers'
import { isExecutionWaitingForInput } from '@pipeline/utils/statusHelpers'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import css from '../DefaultView/DefaultView.module.scss'
import { WaitStepDetailsTab } from '../../tabs/WaitStepDetailsTab/WaitStepDetailsTab'

enum StepDetailTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export function WaitStepView(props: StepDetailProps): React.ReactElement {
  const { step, stageType = StageType.DEPLOY, isStageExecutionInputConfigured } = props
  const { getString } = useStrings()
  const shouldShowInputOutput =
    ((step?.stepType ?? '') as string) !== 'liteEngineTask' && !isStageExecutionInputConfigured
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const [activeTab, setActiveTab] = React.useState(StepDetailTab.STEP_DETAILS)
  const manuallySelected = React.useRef(false)

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
        {
          <Tab
            id={StepDetailTab.STEP_DETAILS}
            title={getString('details')}
            panel={<WaitStepDetailsTab step={step} />}
          />
        }
        {shouldShowInputOutput && (
          <Tab
            id={StepDetailTab.INPUT}
            title={getString('common.input')}
            disabled={isWaitingOnExecInputs}
            panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
          />
        )}
        {shouldShowInputOutput && (
          <Tab
            id={StepDetailTab.OUTPUT}
            title={getString('outputLabel')}
            disabled={isWaitingOnExecInputs}
            panel={
              <InputOutputTab
                baseFqn={step.baseFqn}
                mode="output"
                data={Array.isArray(step.outcomes) ? { output: merge({}, ...step.outcomes) } : step.outcomes}
              />
            }
          />
        )}
      </Tabs>
    </div>
  )
}
