/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Thumbnail, Container } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import { useMarkWaitStep, ExecutionNode, useExecutionDetails, WaitStepRequestDto } from 'services/pipeline-ng'
import { WaitActions, waitActionsIconMap, waitActionsStringMap } from '@pipeline/utils/FailureStrategyUtils'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './WaitStepTab.module.scss'

export interface WaitStepDetailsTabProps {
  step: ExecutionNode
}

// let hideSuccessButton = false
// let hideFailButton = false
let isDisabled = false

export function WaitStepDetailsTab(props: WaitStepDetailsTabProps): React.ReactElement {
  const { step } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<ExecutionPathProps>>()
  const [hideFailButton, setHideFailButton] = useState(false)
  const [hideSuccessButton, setHideSuccessButton] = useState(false)
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
    const seconds: number = parseInt((ms / 1000).toFixed(1))
    const minutes: number = parseInt((ms / (1000 * 60)).toFixed(1))
    const hours: number = parseInt((ms / (1000 * 60 * 60)).toFixed(1))
    const days: number = parseInt((ms / (1000 * 60 * 60 * 24)).toFixed(1))
    if (seconds < 60) return seconds + ' Sec'
    else if (minutes < 60) return minutes + ' Min'
    else if (hours < 24) return hours + ' Hrs'
    else return days + ' Days'
  }

  function DurationMessage() {
    const duration = stepData?.data?.duration
    const daysDuration = msToTime(duration || 0)
    return (
      <Container
        color={Color.ORANGE_400}
        background={Color.YELLOW_100}
        padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'large', right: 'large' }}
      >
        <table className={css.detailsTable}>
          <tbody>
            <tr>
              <th>{getString('startedAt')}</th>
              <td>{step?.startTs ? new Date(step.startTs).toLocaleString() : '-'}</td>
            </tr>
            <tr>
              <th>{getString('endedAt')}</th>
              <td>{step?.startTs ? new Date(step.endTs || '').toLocaleString() : '-'}</td>
            </tr>
            <tr>
              <th>{getString('duration')}</th>
              <td>{daysDuration ? daysDuration : '-'}</td>
            </tr>
            <tr>
              <th>{getString('pipeline.execution.elapsedTime')}</th>
              <td>
                <div>
                  <Duration
                    color={Color.ORANGE_400}
                    className={css.timer}
                    durationText=""
                    startTime={step?.startTs}
                    endTime={step?.endTs}
                    showZeroSecondsResult
                  />
                </div>
              </td>
            </tr>
            {step?.stepDetails?.waitStepActionTaken?.actionTaken ? (
              <tr>
                <th>{getString('action')}</th>
                <td>{step?.stepDetails?.waitStepActionTaken?.actionTaken}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Container>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    isDisabled = true
    const actionPassed = (
      e.target.value === 'MarkAsSuccess' ? 'MARK_AS_SUCCESS' : 'MARK_AS_FAIL'
    ) as WaitStepRequestDto['action']
    if (e.target.value === 'MarkAsSuccess') {
      setHideFailButton(true)
    } else {
      setHideSuccessButton(true)
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
  const status = step?.status === 'WaitStepRunning' ? true : false
  return (
    <React.Fragment>
      <DurationMessage />
      {step?.status === 'WaitStepRunning' ? (
        <div className={css.manualInterventionTab}>
          <String tagName="div" className={css.title} stringID="common.PermissibleActions" />
          <div className={css.actionRow}>
            <Thumbnail
              disabled={isDisabled === true && status === false ? true : false}
              key={0}
              label={
                hideFailButton
                  ? getString(waitActionsStringMap[WaitActions.MarkedAsSuccess])
                  : getString(waitActionsStringMap[WaitActions.MarkAsSuccess])
              }
              icon={waitActionsIconMap[WaitActions.MarkAsSuccess]}
              value={WaitActions.MarkAsSuccess}
              name={WaitActions.MarkAsSuccess}
              onClick={handleChange}
              className={css.thumbnail}
            />
            <Thumbnail
              disabled={isDisabled === true && status === false ? true : false}
              key={0}
              label={
                hideSuccessButton
                  ? getString(waitActionsStringMap[WaitActions.MarkedAsFailure])
                  : getString(waitActionsStringMap[WaitActions.MarkAsFailure])
              }
              icon={waitActionsIconMap[WaitActions.MarkAsFailure]}
              value={WaitActions.MarkAsFailure}
              name={WaitActions.MarkAsFailure}
              onClick={handleChange}
              className={css.thumbnail}
            />
          </div>
        </div>
      ) : null}
    </React.Fragment>
  )
}
