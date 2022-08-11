/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, IconName } from '@wings-software/uicore'
import { Popover, Menu, Spinner } from '@blueprintjs/core'
import { has, defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import ExecutionLayoutToggle from '@pipeline/components/ExecutionLayout/ExecutionLayoutToggle'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetExecutionNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import factory from '@pipeline/factories/ExecutionFactory'
import { isCDStage, isCIStage, StageType } from '@pipeline/utils/stageHelpers'
import { isExecutionCompletedWithBadState, isExecutionRunning, isExecutionSuccess } from '@pipeline/utils/statusHelpers'
import { NodeType, NonSelectableNodes } from '@pipeline/utils/executionUtils'

import type { StepType } from '../PipelineSteps/PipelineStepInterface'
import css from './ExecutionStepDetails.module.scss'

export default function ExecutionStepDetails(): React.ReactElement {
  const { allNodeMap, addNewNodeToMap, queryParams, selectedStepId, selectedStageId, pipelineStagesMap } =
    useExecutionContext()
  const { retryStep } = queryParams
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ExecutionPathProps>()
  const { data: executionNode, loading } = useGetExecutionNode({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      nodeExecutionId: defaultTo(retryStep, '')
    },
    /**
     * Do not fetch data:
     * 1. No retry step
     * 2. Already have data for it
     */
    lazy: !retryStep || has(allNodeMap, retryStep)
  })
  const originalStep = defaultTo(allNodeMap?.[selectedStepId], {})
  const selectedStep = defaultTo(retryStep ? allNodeMap[retryStep] : originalStep, {})
  const stepDetails = factory.getStepDetails(selectedStep.stepType as StepType)
  const interruptHistories = defaultTo(originalStep.interruptHistories, []).filter(row => row.interruptType === 'RETRY')
  const selectedStage = pipelineStagesMap.get(selectedStageId)

  let retryCount = interruptHistories.length

  if (retryStep) {
    retryCount = interruptHistories.findIndex(
      ({ interruptConfig }) => interruptConfig?.retryInterruptConfig?.retryId === retryStep
    )
  }

  let stageType: StageType | undefined

  if (isCDStage(selectedStage)) stageType = StageType.DEPLOY
  else if (isCIStage(selectedStage)) stageType = StageType.BUILD

  function goToRetryStepExecution(id: string): void {
    updateQueryParams({ retryStep: id })
  }

  function goToCurrentExecution(): void {
    updateQueryParams({ retryStep: [] as unknown as string /* this removes the param fro query */ })
  }

  React.useEffect(() => {
    if (executionNode?.data) {
      Object.assign(executionNode.data, { __isInterruptNode: true })
      addNewNodeToMap(defaultTo(executionNode.data.uuid, ''), executionNode.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionNode?.data])

  let leftRetryIcon: IconName | undefined = undefined
  let retryIconStatus = ''

  if (isExecutionSuccess(selectedStep?.status)) {
    leftRetryIcon = 'tick-circle'
    retryIconStatus = 'success'
  } else if (isExecutionRunning(selectedStep?.status)) {
    leftRetryIcon = 'steps-spinner'
    retryIconStatus = 'running'
  } else if (isExecutionCompletedWithBadState(selectedStep?.status)) {
    leftRetryIcon = 'circle-cross'
    retryIconStatus = 'failed'
  }

  const StepDetails = stepDetails.component
  const isStage = NonSelectableNodes.includes(selectedStep?.stepType as NodeType)

  return (
    <div className={css.main}>
      <div className={css.header}>
        <div className={css.title} data-name={selectedStep.name}>
          {getString(isStage ? 'common.stageName' : 'common.stepName', selectedStep)}
        </div>
        <div className={css.actions}>
          {interruptHistories.length > 0 ? (
            <Popover
              wrapperTagName="div"
              targetTagName="div"
              minimal
              position="bottom-left"
              popoverClassName={css.retryMenu}
            >
              <Button
                minimal
                className={css.retry}
                data-testid="retry-logs"
                data-status={retryIconStatus}
                icon={leftRetryIcon}
                iconProps={{ size: 12, className: css.retryStatusIcon }}
                rightIcon="chevron-down"
              >
                {getString('pipeline.execution.retryStepCount', { num: retryCount + 1 })}
              </Button>
              <Menu>
                {interruptHistories.map(({ interruptId, interruptConfig }, i) => (
                  <Menu.Item
                    active={retryStep === interruptConfig?.retryInterruptConfig?.retryId}
                    key={interruptId}
                    text={getString('pipeline.execution.retryStepCount', { num: i + 1 })}
                    onClick={() =>
                      goToRetryStepExecution(
                        interruptConfig.retryInterruptConfig?.retryId || /* istanbul ignore next */ ''
                      )
                    }
                  />
                ))}
                <Menu.Item
                  active={!retryStep}
                  text={getString('pipeline.execution.retryStepCount', { num: interruptHistories.length + 1 })}
                  onClick={goToCurrentExecution}
                />
              </Menu>
            </Popover>
          ) : null}
          <ExecutionLayoutToggle />
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <StepDetails
          key={selectedStep.uuid}
          step={selectedStep}
          stageType={stageType}
          isStageExecutionInputConfigured={isStage && selectedStep.executionInputConfigured}
        />
      )}
    </div>
  )
}
