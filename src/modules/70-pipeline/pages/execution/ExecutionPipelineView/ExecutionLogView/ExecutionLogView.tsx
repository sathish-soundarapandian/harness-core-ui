/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo, get, has } from 'lodash-es'

import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import factory from '@pipeline/factories/ExecutionFactory'
import { isExecutionSkipped } from '@pipeline/utils/statusHelpers'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useGetExecutionNode } from 'services/pipeline-ng'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import type { ConsoleViewStepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { StageSelection } from './StageSelection/StageSelection'
import css from './ExecutionLogView.module.scss'

export default function ExecutionLogView(): React.ReactElement {
  const { allNodeMap, selectedStepId, queryParams, addNewNodeToMap } = useExecutionContext()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ExecutionPathProps>()
  const { data: executionNode, loading } = useGetExecutionNode({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      nodeExecutionId: defaultTo(queryParams.retryStep, '')
    },
    /**
     * Do not fetch data:
     * 1. No retry step
     * 2. Already have data for it
     */
    lazy: !queryParams.retryStep || has(allNodeMap, queryParams.retryStep)
  })

  const selectedStep = allNodeMap[selectedStepId]
  const errorMessage =
    get(selectedStep, 'failureInfo.message') || get(selectedStep, 'executableResponses[0].skipTask.message')
  const isSkipped = isExecutionSkipped(selectedStep?.status)

  const stepDetails = factory.getConsoleViewStepDetails(selectedStep?.stepType as StepType)

  React.useEffect(() => {
    if (executionNode?.data) {
      Object.assign(executionNode.data, { __isInterruptNode: true })
      addNewNodeToMap(defaultTo(executionNode.data.uuid, ''), executionNode.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionNode?.data])

  return (
    <Container className={css.logsContainer}>
      <StageSelection />
      {React.createElement<ConsoleViewStepDetailProps>(stepDetails.component, {
        step: selectedStep,
        errorMessage,
        isSkipped,
        loading
      })}
    </Container>
  )
}
