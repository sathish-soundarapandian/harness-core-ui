/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { chunk, defaultTo } from 'lodash-es'
import { Thumbnail, useToaster } from '@harness/uicore'
import cx from 'classnames'

import { String, useStrings } from 'framework/strings'
import {
  useHandleManualInterventionInterrupt,
  ExecutionNode,
  HandleManualInterventionInterruptQueryParams,
  ExecutionGraph
} from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { StrategyType, strategyIconMap, stringsMap, Strategy } from '@pipeline/utils/FailureStrategyUtils'
import type { StageType } from '@pipeline/utils/stageHelpers'
import { allowedStrategiesAsPerStep } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { StepMode } from '@pipeline/utils/stepUtils'

import css from './ManualInterventionTab.module.scss'

export interface ManualInterventionTabProps {
  step: ExecutionNode
  stageType: StageType
  allowedStrategies?: StrategyType[]
  executionMetadata: ExecutionGraph['executionMetadata']
}

export function ManualInterventionTab(props: ManualInterventionTabProps): React.ReactElement {
  const { allowedStrategies: allowedStrategiesFromProps, step, executionMetadata, stageType } = props
  const { orgIdentifier, projectIdentifier, planExecutionId, accountId } = defaultTo(executionMetadata, {})
  const {
    mutate: handleInterrupt,
    loading,
    error
  } = useHandleManualInterventionInterrupt({
    planExecutionId,
    nodeExecutionId: step.uuid || /* istanbul ignore next */ ''
  })
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const allowedStrategies =
    allowedStrategiesFromProps ||
    allowedStrategiesAsPerStep(stageType)[StepMode.STEP].filter(
      st => st !== Strategy.ManualIntervention && st !== Strategy.PipelineRollback
    )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const interruptType = e.target.value as HandleManualInterventionInterruptQueryParams['interruptType']
    handleInterrupt(undefined, {
      queryParams: {
        interruptType,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      headers: { 'content-type': 'application/json' }
    })
  }

  const STRATEGIES: StrategyType[][] = React.useMemo(() => chunk(allowedStrategies, 5), [allowedStrategies])

  React.useEffect(() => {
    if (error) {
      showError(getRBACErrorMessage(error), undefined, 'pipeline.error.intervention')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <div className={cx(css.manualInterventionTab, { [css.loading]: loading })}>
      <String tagName="div" className={css.title} stringID="common.PermissibleActions" />
      {STRATEGIES.map((layer, i) => {
        return (
          <div key={i} className={css.actionRow}>
            {layer.map((strategy, j) => (
              <Thumbnail
                key={j}
                label={getString(stringsMap[strategy])}
                icon={strategyIconMap[strategy]}
                value={strategy}
                name={strategy}
                onClick={handleChange}
                className={css.thumbnail}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
