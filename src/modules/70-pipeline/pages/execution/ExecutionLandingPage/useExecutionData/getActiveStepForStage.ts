import { defaultTo, get, has } from 'lodash-es'
import type { ExecutionGraph, ExecutionNode, ExecutionNodeAdjacencyList } from 'services/pipeline-ng'
import { isExecutionSuccess, isExecutionWaitingForInput } from '@pipeline/utils/statusHelpers'
import { NonSelectableStepNodes, StepNodeType } from '@pipeline/utils/executionUtils'

import { isExecutionActiveOrCompletedWitBadState, preOrderTraversal, postOrderTraversal } from './treeSearchUtils'

function getChidrenIds(
  node: ExecutionNode,
  nodeAdjacencyListMap: Record<string, ExecutionNodeAdjacencyList>
): string[] {
  const uuid = defaultTo(node.uuid, '')
  return get(nodeAdjacencyListMap, [uuid, 'children'], []).filter(id => has(nodeAdjacencyListMap, id))
}

function getNextIds(node: ExecutionNode, nodeAdjacencyListMap: Record<string, ExecutionNodeAdjacencyList>): string[] {
  const uuid = defaultTo(node.uuid, '')
  return get(nodeAdjacencyListMap, [uuid, 'nextIds'], []).filter(id => has(nodeAdjacencyListMap, id))
}

export function getActiveStepForStage(graph?: ExecutionGraph, status?: string): string {
  if (!graph) {
    return ''
  }

  const { nodeMap, nodeAdjacencyListMap, rootNodeId } = graph

  if (!nodeMap || !nodeAdjacencyListMap || !rootNodeId) {
    return ''
  }

  const rootNode = nodeMap[rootNodeId]

  // This is for stage level execution inputs
  if (isExecutionWaitingForInput(status) && get(rootNode, 'executionInputConfigured')) {
    return rootNodeId
  }

  if (isExecutionActiveOrCompletedWitBadState(status)) {
    // find the first active node using pre-order DFS
    const search = preOrderTraversal<ExecutionNode, ExecutionNodeAdjacencyList>(
      { nodeAdjacencyListMap, nodeMap, getChidrenIds, getNextIds },
      rootNodeId
    )

    for (const node of search) {
      const stepType = get(node, 'stepType', '') as StepNodeType
      if (!NonSelectableStepNodes.includes(stepType) && isExecutionActiveOrCompletedWitBadState(node.status)) {
        return defaultTo(node.uuid, '')
      }
    }
  }

  /* istanbul ignore else */
  if (isExecutionSuccess(status)) {
    // find last node (node with empty nextIds)
    const search = postOrderTraversal<ExecutionNode, ExecutionNodeAdjacencyList>(
      { nodeAdjacencyListMap, nodeMap, getChidrenIds, getNextIds },
      rootNodeId
    )

    for (const node of search) {
      const stepType = defaultTo(node.stepType, '') as StepNodeType
      /* istanbul ignore else */
      if (!NonSelectableStepNodes.includes(stepType) && isExecutionSuccess(node.status)) {
        return defaultTo(node.uuid, '')
      }
    }
  }

  /* istanbul ignore next */
  return ''
}
