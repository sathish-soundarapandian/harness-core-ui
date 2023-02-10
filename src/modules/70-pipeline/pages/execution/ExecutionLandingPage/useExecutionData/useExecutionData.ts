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

// import { StageType } from '@pipeline/utils/stageHelpers'

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

    const status = get(pipelineExecutionSummary, 'status')

    // pick default values from query params
    let stageId = defaultTo(queryParams.stage, '')
    let stepId = defaultTo(queryParams.step, '')
    let executionId = defaultTo(queryParams.stageExecId, '')
    let childStageId = defaultTo(queryParams.childStage, '')
    const collapsedNode = defaultTo(queryParams.collapsedNode, '')

    const [_stageId, _executionId] = getActiveStageForPipeline(pipelineExecutionSummary)

    // stage selection
    if (!queryParams.stage && !queryParams.collapsedNode) {
      stageId = _stageId
    }

    // matrix stage selection
    if (!queryParams.stageExecId && _executionId && !queryParams.collapsedNode) {
      executionId = _executionId
    }

    // get stage from child pipeline if it exists
    if (childGraph && !queryParams.childStage && !queryParams.collapsedNode) {
      const [_childStageId] = getActiveStageForPipeline(childGraph.pipelineExecutionSummary)
      childStageId = _childStageId
    }

    // step selection
    if (!queryParams.step && !queryParams.collapsedNode) {
      stepId = childGraph
        ? getActiveStepForStage(childGraph.executionGraph, childGraph.pipelineExecutionSummary?.status)
        : getActiveStepForStage(executionGraph, status)
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
