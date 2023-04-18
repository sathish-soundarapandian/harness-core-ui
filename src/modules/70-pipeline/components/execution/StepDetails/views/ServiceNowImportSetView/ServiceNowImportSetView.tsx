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
import { isExecutionWaitingForInput, isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import { StageType } from '@pipeline/utils/stageHelpers'
import { ManualInterventionTab } from '@pipeline/components/execution/StepDetails/tabs/ManualInterventionTab/ManualInterventionTab'

import { StepDetailsTab } from '../../tabs/StepDetailsTab/StepDetailsTab'
import { PolicyEvaluationContent } from '../../common/ExecutionContent/PolicyEvaluationContent/PolicyEvaluationContent'
import tabCss from '../DefaultView/DefaultView.module.scss'

enum StepDetailTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
  STEP_EXECUTION_INPUTS = 'STEP_EXECUTION_INPUTS',
  POLICY_ENFORCEMENT = 'POLICY_ENFORCEMENT'
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
  const { step, stageType = StageType.DEPLOY, executionMetadata } = props
  const transformMapOutcomes = get(step, 'outcomes.output.transformMapOutcomes', []) as TransformMapOutcomeType[]
  const { getString } = useStrings()
  const manuallySelected = React.useRef(false)
  const [activeTab, setActiveTab] = React.useState(StepDetailTab.STEP_DETAILS)
  const isWaitingOnExecInputs = isExecutionWaitingForInput(step.status)
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const shouldShowExecutionInputs = !!step.executionInputConfigured
  const shouldShowPolicyEnforcement = !!step?.outcomes?.policyOutput?.policySetDetails

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
      let tab = StepDetailTab.STEP_DETAILS
      if (isWaitingOnExecInputs) {
        tab = StepDetailTab.STEP_EXECUTION_INPUTS
      } else if (isManualInterruption) {
        tab = StepDetailTab.MANUAL_INTERVENTION
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
        setActiveTab(newTab as StepDetailTab)
      }}
    >
      {shouldShowExecutionInputs ? (
        <Tabs.Tab
          id={StepDetailTab.STEP_EXECUTION_INPUTS}
          title={getString('pipeline.runtimeInputs')}
          panel={<ExecutionInputs step={step} executionMetadata={executionMetadata} />}
        />
      ) : null}
      <Tabs.Tab
        id={StepDetailTab.STEP_DETAILS}
        title={getString('details')}
        panel={<StepDetailsTab step={step} executionMetadata={executionMetadata} labels={labels} />}
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
      {isManualInterruption && (
        <Tabs.Tab
          id={StepDetailTab.MANUAL_INTERVENTION}
          key={StepDetailTab.MANUAL_INTERVENTION}
          title={getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
          panel={<ManualInterventionTab step={step} stageType={stageType} executionMetadata={executionMetadata} />}
        />
      )}
      {shouldShowPolicyEnforcement ? (
        <Tabs.Tab
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
  )
}
