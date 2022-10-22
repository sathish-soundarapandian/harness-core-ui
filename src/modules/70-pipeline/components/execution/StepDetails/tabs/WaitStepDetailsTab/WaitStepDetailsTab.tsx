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
import { defaultTo } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import { useMarkWaitStep, ExecutionNode, useExecutionDetails, WaitStepRequestDto } from 'services/pipeline-ng'
import { WaitActions, waitActionsIconMap, waitActionsStringMap } from '@pipeline/utils/FailureStrategyUtils'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { msToTime } from './WaitStepDetailstabUtil'
import css from './WaitStepTab.module.scss'

export interface WaitStepDetailsTabProps {
  step: ExecutionNode
}

// let hideSuccessButton = false
// let hideFailButton = false
let isDisabled = false

export function WaitStepDetailsTab(props: WaitStepDetailsTabProps): React.ReactElement {
  const { step = {} } = props
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
    nodeExecutionId: defaultTo(step.uuid, ''),
    queryParams: {
      ...commonParams
    }
  })

  function DurationMessage() {
    const duration = stepData?.data?.duration
    const daysDuration = msToTime(duration)
    const startTime =
      new Date(defaultTo(step.startTs, '')).toLocaleString() === 'Invalid Date'
        ? null
        : new Date(defaultTo(step.startTs, '')).toLocaleString()
    const endTime =
      new Date(defaultTo(step.endTs, '')).toLocaleString() === 'Invalid Date'
        ? null
        : new Date(defaultTo(step.endTs, '')).toLocaleString()

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
              <td>{defaultTo(startTime, '-')}</td>
            </tr>
            <tr>
              <th>{getString('endedAt')}</th>
              <td>{defaultTo(endTime, '-')}</td>
            </tr>
            <tr>
              <th>{getString('duration')}</th>
              <td>{daysDuration}</td>
            </tr>
            <tr>
              <th>{getString('pipeline.execution.elapsedTime')}</th>
              <td>
                <div>
                  <Duration
                    color={Color.ORANGE_400}
                    className={css.timer}
                    durationText=""
                    startTime={step.startTs}
                    endTime={step.endTs}
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
