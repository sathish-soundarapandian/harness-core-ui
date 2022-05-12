/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createContext, useContext } from 'react'

import type { PipelineExecutionDetail, GraphLayoutNode, ExecutionNode } from 'services/pipeline-ng'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'

export interface GraphCanvasState {
  offsetX?: number
  offsetY?: number
  zoom?: number
}

export interface ExecutionContextParams {
  pipelineExecutionDetail: PipelineExecutionDetail | null
  allNodeMap: { [key: string]: ExecutionNode }
  pipelineStagesMap: Map<string, GraphLayoutNode>
  isPipelineInvalid?: boolean
  selectedStageId: string
  selectedStepId: string
  loading: boolean
  isDataLoadedForSelectedStage: boolean
  queryParams: ExecutionPageQueryParams
  logsToken: string
  setLogsToken: (token: string) => void
  refetch?: (() => Promise<void>) | undefined
  addNewNodeToMap(id: string, node: ExecutionNode): void
  setStepsGraphCanvasState?: (canvasState: GraphCanvasState) => void
  stepsGraphCanvasState?: GraphCanvasState
  setSelectedStepId: (step: string) => void
  setSelectedStageId: (stage: string) => void
  setIsPipelineInvalid?: (flag: boolean) => void
}

export const ExecutionContext = createContext<ExecutionContextParams>({
  pipelineExecutionDetail: null,
  allNodeMap: {},
  pipelineStagesMap: new Map(),
  isPipelineInvalid: false,
  selectedStageId: '',
  selectedStepId: '',
  loading: false,
  isDataLoadedForSelectedStage: false,
  queryParams: {},
  logsToken: '',
  setLogsToken: () => void 0,
  refetch: undefined,
  addNewNodeToMap: () => void 0,
  setStepsGraphCanvasState: () => undefined,
  stepsGraphCanvasState: { offsetX: 0, offsetY: 0, zoom: 100 },
  setSelectedStepId: () => void 0,
  setSelectedStageId: () => void 0,
  setIsPipelineInvalid: () => void 0
})

export default ExecutionContext

export function useExecutionContext(): ExecutionContextParams {
  return useContext(ExecutionContext)
}
