/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Thumbnail, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import {
  useMarkWaitStep,
  ExecutionNode,
  WaitStepRequestDto,
  ResponseWaitStepExecutionDetailsDto,
  ExecutionGraph
} from 'services/pipeline-ng'
import { WaitActions, waitActionsIconMap, waitActionsStringMap } from '@pipeline/utils/FailureStrategyUtils'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { msToTime } from './WaitStepDetailstabUtil'
import css from './WaitStepTab.module.scss'

export interface WaitStepDetailsTabProps {
  step: ExecutionNode
  executionDetails: ResponseWaitStepExecutionDetailsDto | null | undefined
  loading: boolean
  executionMetadata: ExecutionGraph['executionMetadata']
}

interface WaitStepMarkState {
  isMarked: boolean
  markedAs?: WaitActions.MarkedAsSuccess | WaitActions.MarkedAsFailure
}

interface WaitStepDetailsProps {
  step: ExecutionNode
  executionDetails: ResponseWaitStepExecutionDetailsDto | null | undefined
}

function WaitStepDetails({ step, executionDetails }: WaitStepDetailsProps): JSX.Element {
  const { getString } = useStrings()

  const duration = executionDetails?.data?.duration
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

export function WaitStepDetailsTab(props: WaitStepDetailsTabProps): React.ReactElement {
  const { step = {}, executionDetails, loading, executionMetadata } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier } = defaultTo(executionMetadata, {})
  const [markState, setMarkState] = useState<WaitStepMarkState>({
    isMarked: false,
    markedAs: undefined
  })

  const { mutate: markWaitStep } = useMarkWaitStep({
    nodeExecutionId: step.uuid || /* istanbul ignore next */ ''
  })

  const [canExecute] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier as string
      },
      permissions: [PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [orgIdentifier, projectIdentifier, accountId, pipelineIdentifier]
  )

  const onClick = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    const action: WaitStepRequestDto['action'] =
      value === WaitActions.MarkAsSuccess ? 'MARK_AS_SUCCESS' : 'MARK_AS_FAIL'

    setMarkState({
      isMarked: true,
      markedAs: value === WaitActions.MarkAsSuccess ? WaitActions.MarkedAsSuccess : WaitActions.MarkedAsFailure
    })

    const waitStepRequestDto = { action }
    markWaitStep(waitStepRequestDto, {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      headers: { 'content-type': 'application/json' }
    })
  }

  const isRunning = step?.status === 'WaitStepRunning'
  const { isMarked, markedAs } = markState

  if (loading) {
    return (
      <Container height={'100px'} flex={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={20} />
      </Container>
    )
  }

  return (
    <React.Fragment>
      <WaitStepDetails executionDetails={executionDetails} step={step} />
      {isRunning && (
        <div className={css.manualInterventionTab}>
          <String tagName="div" className={css.title} stringID="common.PermissibleActions" />
          <div className={css.actionRow}>
            <Thumbnail
              disabled={!canExecute || isMarked}
              label={
                isMarked && markedAs === WaitActions.MarkedAsSuccess
                  ? getString(waitActionsStringMap[WaitActions.MarkedAsSuccess])
                  : getString(waitActionsStringMap[WaitActions.MarkAsSuccess])
              }
              icon={waitActionsIconMap[WaitActions.MarkAsSuccess]}
              value={WaitActions.MarkAsSuccess}
              name={WaitActions.MarkAsSuccess}
              onClick={onClick}
              className={css.thumbnail}
            />
            <Thumbnail
              disabled={!canExecute || isMarked}
              label={
                isMarked && markedAs === WaitActions.MarkedAsFailure
                  ? getString(waitActionsStringMap[WaitActions.MarkedAsFailure])
                  : getString(waitActionsStringMap[WaitActions.MarkAsFailure])
              }
              icon={waitActionsIconMap[WaitActions.MarkAsFailure]}
              value={WaitActions.MarkAsFailure}
              name={WaitActions.MarkAsFailure}
              onClick={onClick}
              className={css.thumbnail}
            />
          </div>
        </div>
      )}
    </React.Fragment>
  )
}
