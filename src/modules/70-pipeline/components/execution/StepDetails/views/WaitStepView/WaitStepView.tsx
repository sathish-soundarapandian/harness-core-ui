/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, merge } from 'lodash-es'
import { Tabs, Tab } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { StageType } from '@pipeline/utils/stageHelpers'
import { isExecutionWaitingForInput, isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { useExecutionDetails } from 'services/pipeline-ng'
import { WaitStepDetailsTab } from '../../tabs/WaitStepDetailsTab/WaitStepDetailsTab'
import { ManualInterventionTab } from '../../tabs/ManualInterventionTab/ManualInterventionTab'
import { PolicyEvaluationContent } from '../../common/ExecutionContent/PolicyEvaluationContent/PolicyEvaluationContent'
import css from '../DefaultView/DefaultView.module.scss'

enum StepDetailTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
  POLICY_ENFORCEMENT = 'POLICY_ENFORCEMENT'
}

export function WaitStepView(props: StepDetailProps): React.ReactElement {
  const { step, stageType = StageType.DEPLOY, isStageExecutionInputConfigured, executionMetadata } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = defaultTo(executionMetadata, {})
  const shouldShowInputOutput =
    ((step?.stepType ?? '') as string) !== 'liteEngineTask' && !isStageExecutionInputConfigured
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const [activeTab, setActiveTab] = React.useState(StepDetailTab.STEP_DETAILS)
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const shouldShowPolicyEnforcement = !!step?.outcomes?.policyOutput?.policySetDetails
  const manuallySelected = React.useRef(false)

  React.useEffect(() => {
    if (!manuallySelected.current) {
      let tab = StepDetailTab.STEP_DETAILS
      if (isManualInterruption) {
        tab = StepDetailTab.MANUAL_INTERVENTION
      }
      setActiveTab(tab)
    }
  }, [step.identifier, isManualInterruption, isWaitingOnExecInputs, isStageExecutionInputConfigured])

  const { data: executionDetails, loading } = useExecutionDetails({
    nodeExecutionId: defaultTo(step?.uuid, ''),
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

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
            panel={
              <WaitStepDetailsTab
                step={step}
                executionDetails={executionDetails}
                loading={loading}
                executionMetadata={executionMetadata}
              />
            }
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
        {isManualInterruption ? (
          <Tab
            id={StepDetailTab.MANUAL_INTERVENTION}
            title={getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
            panel={<ManualInterventionTab step={step} stageType={stageType} executionMetadata={executionMetadata} />}
          />
        ) : null}
        {shouldShowPolicyEnforcement ? (
          <Tab
            id={StepDetailTab.POLICY_ENFORCEMENT}
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
    </div>
  )
}
