/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { unstable_batchedUpdates } from 'react-dom'
import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'

import { useQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import {
  Failure,
  PipelineExecutionDetail,
  ResponsePipelineExecutionDetail,
  useGetExecutionDetailV2
} from 'services/pipeline-ng'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getActiveStageForPipeline } from './getActiveStageForPipeline'
import { getActiveStepForStage } from './getActiveStepForStage'

export interface UseExecutionDataReturn {
  data: ResponsePipelineExecutionDetail | null
  refetch(): Promise<void>
  loading: boolean
  error: GetDataError<Failure | Error> | null
  selectedStageId: string
  selectedChildStageId: string
  selectedStepId: string
  selectedStageExecutionId: string
  selectedCollapsedNodeId: string
}

export interface UseExecutionDataProps {
  mockData?: {
    data?: ResponsePipelineExecutionDetail
    error?: Failure | Error
    loading?: boolean
    response?: Response
  }
}

/**
 * Logic for auto selecting stage and step based on
 * current pipeline status and query params.
 *
 * Query params will be populated only on user actions and
 * hence can used to determine further action.
 */
export function useExecutionData(props: UseExecutionDataProps = {}): UseExecutionDataReturn {
  const { mockData } = props
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId } =
    useParams<PipelineType<ExecutionPathProps>>()
  const queryParams = useQueryParams<ExecutionPageQueryParams>()
  const [selectedStageId, setSelectedStageId] = React.useState<string>('')
  const [selectedStageExecutionId, setSelectedStageExecutionId] = React.useState<string>('')
  const [selectedChildStageId, setSelectedChildStageId] = React.useState<string>('')
  const [selectedStepId, setSelectedStepId] = React.useState<string>('')
  const [selectedCollapsedNodeId, setSelectedCollapsedNodeId] = React.useState<string>('')
  const { data, refetch, loading, error } = useGetExecutionDetailV2({
    planExecutionId: executionIdentifier,
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId,
      stageNodeId: selectedStageId || undefined,
      ...(selectedStageId !== selectedStageExecutionId &&
        !isEmpty(selectedStageExecutionId) && {
          stageNodeExecutionId: selectedStageExecutionId
        }),
      ...(!isEmpty(selectedChildStageId) && {
        childStageNodeId: selectedChildStageId
      })
    },
    debounce: 500,
    mock: mockData
  })

  React.useEffect(() => {
    const { executionGraph, pipelineExecutionSummary, childGraph } = get(data, 'data', {} as PipelineExecutionDetail)

    // pick default values from query params
    let stageId = defaultTo(queryParams.stage, '')
    let stepId = defaultTo(queryParams.step, '')
    let executionId = defaultTo(queryParams.stageExecId, '')
    let childStageId = defaultTo(queryParams.childStage, '')
    const collapsedNode = defaultTo(queryParams.collapsedNode, '')

    const [_stageId, _executionId] = getActiveStageForPipeline(pipelineExecutionSummary)
    const [_childStageId, _childExecutionId] = getActiveStageForPipeline(childGraph?.pipelineExecutionSummary)

    // stage selection
    if (!queryParams.stage && !queryParams.collapsedNode) {
      stageId = _stageId
    }

    // set childStageId to auto selected id (`_childStageId`)
    // if there's a childGraph and queryParams.childStage is falsy
    if (childGraph && !queryParams.childStage && !queryParams.collapsedNode) {
      childStageId = _childStageId
    }

    // matrix stage selection
    if (
      !queryParams.stageExecId && // does not have stageExecId in query params
      (_executionId || _childExecutionId) && // has _executionId or _childExecutionId
      (_stageId === stageId || (_childStageId === childStageId && !isEmpty(childStageId))) && // auto selected stage is same as current stage
      !queryParams.collapsedNode //  does not have collapsedNode in query params
    ) {
      executionId = _childExecutionId || _executionId
    } else if (queryParams.stageExecId) {
      // remove executionId
      // if stageId/childStageId is not equal to stageId/childStageId of queryParams.stageExecId
      if (childGraph) {
        const childStageIdForExecution = get(childGraph.pipelineExecutionSummary, [
          'layoutNodeMap',
          queryParams.stageExecId,
          'nodeUuid'
        ])

        if (childStageIdForExecution !== childStageId) {
          executionId = ''
        }
      } else {
        const stageIdForExecution = get(pipelineExecutionSummary, [
          'layoutNodeMap',
          queryParams.stageExecId,
          'nodeUuid'
        ])

        if (stageIdForExecution !== stageId) {
          executionId = ''
        }
      }
    }

    // step selection
    if (!queryParams.step && !queryParams.collapsedNode) {
      stepId = childGraph
        ? getActiveStepForStage(
            childGraph.executionGraph,
            get(childGraph.pipelineExecutionSummary, ['layoutNodeMap', executionId || childStageId, 'status'])
          )
        : getActiveStepForStage(
            executionGraph,
            get(pipelineExecutionSummary, ['layoutNodeMap', executionId || stageId, 'status'])
          )
    }

    unstable_batchedUpdates(() => {
      setSelectedStageId(stageId)
      setSelectedStepId(stepId)
      // for Matrix, Loop and Parallelism
      setSelectedStageExecutionId(executionId)
      // for chained pipeline
      setSelectedChildStageId(childStageId)
      // for collapsed node
      setSelectedCollapsedNodeId(collapsedNode)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data, queryParams])

  return {
    selectedChildStageId,
    selectedCollapsedNodeId,
    selectedStageExecutionId,
    selectedStageId,
    selectedStepId,
    data,
    refetch,
    loading,
    error
  }
}
