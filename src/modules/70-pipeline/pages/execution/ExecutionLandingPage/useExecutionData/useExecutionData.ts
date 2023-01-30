/*

const setStageIds = ({
  queryParams,
  setAutoSelectedStageId,
  setAutoSelectedChildStageId,
  setAutoSelectedStepId,
  setAutoStageNodeExecutionId,
  setSelectedStepId,
  setSelectedStageId,
  setSelectedChildStageId,
  setSelectedStageExecutionId,
  data,
  error
}: {
  queryParams: ExecutionPageQueryParams
  setAutoSelectedStageId: Dispatch<SetStateAction<string>>
  setAutoSelectedChildStageId: Dispatch<SetStateAction<string>>
  setAutoSelectedStepId: Dispatch<SetStateAction<string>>
  setAutoStageNodeExecutionId: Dispatch<SetStateAction<string>>
  setSelectedStepId: Dispatch<SetStateAction<string>>
  setSelectedStageId: Dispatch<SetStateAction<string>>
  setSelectedChildStageId: Dispatch<SetStateAction<string>>
  setSelectedStageExecutionId: Dispatch<SetStateAction<string>>
  data?: ResponsePipelineExecutionDetail | null
  error?: GetDataError<Failure | Error> | null
}): void => {
  if (error) {
    return
  }

  // if user has selected a stage/step/collapsedNode do not auto-update
  if (queryParams.stage || queryParams.step || queryParams.collapsedNode) {
    setAutoSelectedStageId('')
    setAutoSelectedChildStageId('')
    setAutoSelectedStepId('')
    return
  }

  // if no data is found, reset the stage and step
  if (!data || !data?.data) {
    setAutoSelectedStageId('')
    setAutoSelectedChildStageId('')
    setAutoSelectedStepId('')
    return
  }

  const runningStage = getActiveStageForPipeline(
    data.data.pipelineExecutionSummary,
    data.data?.pipelineExecutionSummary?.status as ExecutionStatus
  )

  const runningChildStage = getActiveStageForPipeline(
    data.data?.childGraph?.pipelineExecutionSummary,
    data.data?.childGraph?.pipelineExecutionSummary?.status as ExecutionStatus
  )

  let runningStep = null
  if (data.data?.executionGraph)
    runningStep = getActiveStep(data.data?.executionGraph, data.data.pipelineExecutionSummary)
  else if (data.data?.childGraph?.executionGraph)
    runningStep = getActiveStep(data.data?.childGraph?.executionGraph, data.data?.childGraph?.pipelineExecutionSummary)

  if (runningStage) {
    if (isNodeTypeMatrixOrFor(data.data?.pipelineExecutionSummary?.layoutNodeMap?.[runningStage]?.nodeType)) {
      const nodeExecid = get(
        data,
        ['data', 'pipelineExecutionSummary', 'layoutNodeMap', runningStage, 'edgeLayoutList', 'currentNodeChildren', 0],
        runningStage
      ) as string // UNIQUE ID--> stageNodeExecutionID
      const nodeId = get(
        data,
        ['data', 'pipelineExecutionSummary', 'layoutNodeMap', nodeExecid, 'nodeUuid'],
        ''
      ) as string // COMMMON--> stageNodeID
      setAutoSelectedStageId(nodeId)
      setSelectedStageId(nodeId)
      setAutoStageNodeExecutionId(nodeExecid)
      setSelectedStageExecutionId(nodeExecid)
    } else {
      setAutoSelectedStageId(runningStage)
      setSelectedStageId(runningStage)
      if (runningChildStage) {
        if (
          isNodeTypeMatrixOrFor(
            data.data?.childGraph?.pipelineExecutionSummary?.layoutNodeMap?.[runningChildStage]?.nodeType
          )
        ) {
          const childNodeExecid = get(
            data,
            [
              'data',
              'childGraph',
              'pipelineExecutionSummary',
              'layoutNodeMap',
              runningChildStage,
              'edgeLayoutList',
              'currentNodeChildren',
              0
            ],
            runningChildStage
          ) as string // UNIQUE ID--> stageNodeExecutionID
          const childNodeId = get(
            data,
            ['data', 'childGraph', 'pipelineExecutionSummary', 'layoutNodeMap', childNodeExecid, 'nodeUuid'],
            ''
          ) as string // COMMMON--> stageNodeID
          setAutoSelectedChildStageId(childNodeId)
          setSelectedChildStageId(childNodeId)
          setAutoStageNodeExecutionId(childNodeExecid)
          setSelectedStageExecutionId(childNodeExecid)
        } else {
          setAutoSelectedChildStageId(runningChildStage)
          setSelectedChildStageId(runningChildStage)
          setAutoStageNodeExecutionId('')
          setSelectedStageExecutionId('')
        }
      } else {
        setAutoSelectedChildStageId('')
        setSelectedChildStageId('')
        setAutoStageNodeExecutionId('')
        setSelectedStageExecutionId('')
      }
    }
  }

  if (runningStep) {
    setAutoSelectedStepId(runningStep.node)
    setSelectedStepId(runningStep.node)
  }
}
*/

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { unstable_batchedUpdates } from 'react-dom'
import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'

import { useQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import {
  Failure,
  PipelineExecutionSummary,
  ResponsePipelineExecutionDetail,
  useGetExecutionDetailV2
} from 'services/pipeline-ng'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { ExecutionStatus, isExecutionActive, isExecutionRunning } from '@pipeline/utils/statusHelpers'

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

/**
 * Logic for auto selecting stage and step based on
 * current pipeline status and query params.
 *
 * Query params will be populated only on user actions and
 * hence can used to determine further action.
 */
export function useExecutionData(): UseExecutionDataReturn {
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
    debounce: 500
  })

  // update selected stage from query params
  React.useEffect(() => {
    setSelectedStageId(defaultTo(queryParams.stage, ''))
  }, [queryParams.stage])

  // update selected step from query params
  React.useEffect(() => {
    setSelectedStepId(defaultTo(queryParams.step, ''))
  }, [queryParams.step])

  // update selected stage execution id from query params
  React.useEffect(() => {
    setSelectedStageExecutionId(defaultTo(queryParams.stageExecId, ''))
  }, [queryParams.stageExecId])

  // update selected child stage from query params
  React.useEffect(() => {
    setSelectedChildStageId(defaultTo(queryParams.childStage, ''))
  }, [queryParams.childStage])

  // update collapsed node from query params
  React.useEffect(() => {
    setSelectedCollapsedNodeId(defaultTo(queryParams.collapsedNode, ''))
  }, [queryParams.collapsedNode])

  if (queryParams.stage) {
    if (queryParams.step) {
      // do nothing
    } else {
      const step = getActiveStepForStage()
      setSelectedStepId(step)
    }
  } else {
    // stage and step selection
    const stageId = getActiveStageForPipeline(data?.data?.pipelineExecutionSummary)

    if (stageId) {
      const step = getActiveStepForStage()

      unstable_batchedUpdates(() => {
        setSelectedStageId(stageId)
        setSelectedStepId(step)
      })
    }
  }

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

/**
 * Priority: Running > Waiting > Failure > Success
 */
export function getActiveStageForPipeline(executionSummary?: PipelineExecutionSummary): string | null {
  if (!executionSummary) {
    return null
  }

  const { status, layoutNodeMap } = executionSummary

  if (isExecutionActive(status)) {
    // find the first
  } else {
  }
}

export function getActiveStepForStage(): string {
  return ''
}
