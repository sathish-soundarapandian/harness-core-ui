/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { String, useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import { useMarkWaitStep, ExecutionNode, useExecutionDetails, WaitStepRequestDto } from 'services/pipeline-ng'
import { Thumbnail, Container, Color } from '@wings-software/uicore'
import { Strategy, strategyIconMap, stringsMap } from '@pipeline/utils/FailureStrategyUtils'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './WaitStepTab.module.scss'

export interface WaitStepDetailsTabProps {
  step: ExecutionNode
}

let hideSuccessButton = false
let hideFailButton = false

export function WaitStepDetailsTab(props: WaitStepDetailsTabProps): React.ReactElement {
  const { step } = props
  const { getString } = useStrings()
  const STRATEGIES: Strategy[][] = [[Strategy.MarkAsSuccess], [Strategy.MarkAsFailure]]
  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<ExecutionPathProps>>()
  const { mutate: handleInterrupt } = useMarkWaitStep({
    nodeExecutionId: step.uuid || /* istanbul ignore next */ ''
  })

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }

  const { data: stepData } = useExecutionDetails({
    nodeExecutionId: step.uuid || '',
    queryParams: {
      ...commonParams
    }
  })

  function msToTime(ms: number) {
    let seconds: number = parseInt((ms / 1000).toFixed(1))
    let minutes: number = parseInt((ms / (1000 * 60)).toFixed(1))
    let hours: number = parseInt((ms / (1000 * 60 * 60)).toFixed(1))
    let days: number = parseInt((ms / (1000 * 60 * 60 * 24)).toFixed(1))
    if (seconds < 60) return seconds + ' Sec'
    else if (minutes < 60) return minutes + ' Min'
    else if (hours < 24) return hours + ' Hrs'
    else return days + ' Days'
  }

  function DurationMessage() {
    console.log(stepData, 'hello')
    const duration = stepData?.data?.duration
    const daysDuration = msToTime(duration || 0)
    const startedTimeValue = step?.startTs ? new Date(step.startTs).toLocaleString() : '-'
    const endTimeValue = step?.endTs ? new Date(step.endTs).toLocaleString() : '-'
    return (
      <Container
        color={Color.ORANGE_400}
        background={Color.YELLOW_100}
        padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'large', right: 'large' }}
      >
        <div>{`${getString('startedAt')}-${startedTimeValue}`}</div>
        <div>{`${getString('endedAt')}  -${endTimeValue}`}</div>
        <div>{`Duration  -${daysDuration}`}</div>
        <div>
          <Duration
            color={Color.ORANGE_400}
            className={css.timer}
            durationText="Ellapsed Time"
            startTime={step?.startTs}
            endTime={step?.endTs}
            showZeroSecondsResult
          />
        </div>
      </Container>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    console.log(e.target.value, 'hello2')
    const actionPassed = (
      e.target.value === 'MarkAsSuccess' ? 'MARK_AS_SUCCESS' : 'MARK_AS_FAIL'
    ) as WaitStepRequestDto['action']
    if (e.target.value === 'MarkAsSuccess') {
      hideFailButton = true
    } else {
      hideSuccessButton = true
    }
    const waitStepRequestDto = { action: actionPassed }
    handleInterrupt(waitStepRequestDto, {
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
      <div className={css.manualInterventionTab}>
        <String tagName="div" className={css.title} stringID="common.PermissibleActions" />

        <div className={css.actionRow}>
          {!hideSuccessButton ? (
            <Thumbnail
              key={0}
              label={
                hideFailButton
                  ? getString(stringsMap[Strategy.MarkedAsSuccess])
                  : getString(stringsMap[Strategy.MarkAsSuccess])
              }
              icon={strategyIconMap[Strategy.MarkAsSuccess]}
              value={Strategy.MarkAsSuccess}
              name={Strategy.MarkAsSuccess}
              onClick={handleChange}
              className={css.thumbnail}
            />
          ) : null}
          {!hideFailButton ? (
            <Thumbnail
              key={0}
              label={
                hideSuccessButton
                  ? getString(stringsMap[Strategy.MarkedAsFailure])
                  : getString(stringsMap[Strategy.MarkAsFailure])
              }
              icon={strategyIconMap[Strategy.MarkAsFailure]}
              value={Strategy.MarkAsFailure}
              name={Strategy.MarkAsFailure}
              onClick={handleChange}
              className={css.thumbnail}
            />
          ) : null}
        </div>
      </div>
    </React.Fragment>
  )
}
