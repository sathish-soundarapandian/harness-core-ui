/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { String, useStrings } from 'framework/strings'
import {
  useHandleManualInterventionInterrupt,
  ExecutionNode,
  HandleManualInterventionInterruptQueryParams
} from 'services/pipeline-ng'
import { Thumbnail } from '@wings-software/uicore'
import { Strategy, strategyIconMap, stringsMap } from '@pipeline/utils/FailureStrategyUtils'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import css from '../ManualInterventionTab/ManualInterventionTab.module.scss'

export interface WaitStepDetailsTabProps {
  step: ExecutionNode
}

export function WaitStepDetailsTab(props: WaitStepDetailsTabProps): React.ReactElement {
  const { step } = props
  const { getString } = useStrings()
  const STRATEGIES: Strategy[][] = [[Strategy.MarkAsSuccess], [Strategy.Abort]]
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId } =
    useParams<PipelineType<ExecutionPathProps>>()
  const { mutate: handleInterrupt } = useHandleManualInterventionInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: step.uuid || /* istanbul ignore next */ ''
  })

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
  return (
    <React.Fragment>
      <div className={css.detailsTab}>`Duration : ${step}`</div>
      <div>
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
    </React.Fragment>
  )
}
