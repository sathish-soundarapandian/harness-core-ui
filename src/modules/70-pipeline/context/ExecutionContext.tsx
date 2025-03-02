/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createContext, useContext } from 'react'

import type { PipelineExecutionDetail, GraphLayoutNode, ExecutionNode } from 'services/pipeline-ng'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'

export interface ExecutionContextParams {
  pipelineExecutionDetail: PipelineExecutionDetail | null
  allNodeMap: { [key: string]: ExecutionNode }
  pipelineStagesMap: Map<string, GraphLayoutNode>
  childPipelineStagesMap: Map<string, GraphLayoutNode>
  rollbackPipelineStagesMap: Map<string, GraphLayoutNode>
  allStagesMap: Map<string, GraphLayoutNode>
  isPipelineInvalid?: boolean
  selectedStageId: string
  selectedChildStageId?: string
  selectedStepId: string
  selectedStageExecutionId: string
  selectedCollapsedNodeId: string
  loading: boolean
  isDataLoadedForSelectedStage: boolean
  queryParams: ExecutionPageQueryParams & GitQueryParams
  logsToken: string
  setLogsToken: (token: string) => void
  refetch?: (() => Promise<void>) | undefined
  addNewNodeToMap(id: string, node: ExecutionNode): void
  setIsPipelineInvalid?: (flag: boolean) => void
  retriedHistoryInfo?: { retriedStages?: string[]; retriedExecutionUuids?: string[] }
}

export const ExecutionContext = createContext<ExecutionContextParams>({
  pipelineExecutionDetail: null,
  allNodeMap: {},
  pipelineStagesMap: new Map(),
  childPipelineStagesMap: new Map(),
  rollbackPipelineStagesMap: new Map(),
  allStagesMap: new Map(),
  isPipelineInvalid: false,
  selectedStageId: '',
  selectedChildStageId: '',
  selectedStepId: '',
  selectedStageExecutionId: '',
  selectedCollapsedNodeId: '',
  loading: false,
  isDataLoadedForSelectedStage: false,
  queryParams: {},
  logsToken: '',
  setLogsToken: () => void 0,
  refetch: undefined,
  addNewNodeToMap: () => void 0,
  setIsPipelineInvalid: () => void 0,
  retriedHistoryInfo: { retriedStages: [], retriedExecutionUuids: [] }
})

export default ExecutionContext

export function useExecutionContext(): ExecutionContextParams {
  return useContext(ExecutionContext)
}
