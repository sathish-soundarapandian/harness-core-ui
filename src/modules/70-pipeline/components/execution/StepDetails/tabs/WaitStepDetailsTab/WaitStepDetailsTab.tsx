/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { String, useStrings } from 'framework/strings'
import { useMarkWaitStep, ExecutionNode, WaitStepResponseDto } from 'services/pipeline-ng'
import { Thumbnail, Container, Color } from '@wings-software/uicore'
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
  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<ExecutionPathProps>>()
  const { mutate: handleInterrupt } = useMarkWaitStep({
    nodeExecutionId: step.uuid || /* istanbul ignore next */ ''
  })

  function DurationMessage() {
    return (
      <Container
        color={Color.BLACK}
        background={Color.YELLOW_100}
        padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'large', right: 'large' }}
      >
        <div>Duration:</div>
      </Container>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const actionPassed = e.target.value as WaitStepResponseDto['action']
    const waitStepResponseDto = { action: actionPassed }
    handleInterrupt(waitStepResponseDto, {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      headers: { 'content-type': 'application/json' }
    })
  }
  return (
    <React.Fragment>
      <DurationMessage />
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
