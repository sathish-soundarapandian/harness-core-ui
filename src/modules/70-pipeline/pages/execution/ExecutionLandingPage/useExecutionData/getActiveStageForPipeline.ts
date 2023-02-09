import { defaultTo, get, has } from 'lodash-es'

import { isExecutionSuccess } from '@pipeline/utils/statusHelpers'
import { NonSelectableStageNodes, StageNodeType } from '@pipeline/utils/executionUtils'
import type { GraphLayoutNode, PipelineExecutionSummary } from 'services/pipeline-ng'

import { preOrderTraversal, postOrderTraversal, isExecutionActiveOrCompletedWitBadState } from './treeSearchUtils'

function getChidrenIds(node: GraphLayoutNode, nodeAdjacencyListMap: Record<string, GraphLayoutNode>): string[] {
  return (get(node, ['edgeLayoutList', 'currentNodeChildren'], []) as string[]).filter(id =>
    has(nodeAdjacencyListMap, id)
  )
}

function getNextIds(node: GraphLayoutNode, nodeAdjacencyListMap: Record<string, GraphLayoutNode>): string[] {
  return (get(node, ['edgeLayoutList', 'nextIds'], []) as string[]).filter(id => has(nodeAdjacencyListMap, id))
}

/**
 * Priority: Running > Waiting > Failure > Success
 */
export function getActiveStageForPipeline(executionSummary?: PipelineExecutionSummary): [string, string] {
  if (!executionSummary) {
    return ['', '']
  }

  const { status, layoutNodeMap, startingNodeId } = executionSummary

  if (!layoutNodeMap || !startingNodeId || !status) {
    return ['', '']
  }

  const getNode = (node: GraphLayoutNode): [string, string] => {
    const { nodeExecutionId = '', nodeUuid } = node
    return [defaultTo(nodeUuid, ''), has(layoutNodeMap, nodeExecutionId) ? nodeExecutionId : '']
  }

  if (isExecutionActiveOrCompletedWitBadState(status)) {
    // find the first active node using pre-order DFS

    const search = preOrderTraversal(
      { nodeAdjacencyListMap: layoutNodeMap, nodeMap: layoutNodeMap, getChidrenIds, getNextIds },
      startingNodeId
    )

    for (const node of search) {
      const nodeType = defaultTo(node.nodeType, '') as StageNodeType
      if (!NonSelectableStageNodes.includes(nodeType) && isExecutionActiveOrCompletedWitBadState(node.status)) {
        return getNode(node)
      }
    }
  }

  /* istanbul ignore else */
  if (isExecutionSuccess(status)) {
    // find last node (node with empty nextIds)
    const search = postOrderTraversal(
      { nodeAdjacencyListMap: layoutNodeMap, nodeMap: layoutNodeMap, getChidrenIds, getNextIds },
      startingNodeId
    )

    for (const node of search) {
      const nodeType = defaultTo(node.nodeType, '') as StageNodeType
      /* istanbul ignore else */
      if (!NonSelectableStageNodes.includes(nodeType) && isExecutionSuccess(node.status)) {
        return getNode(node)
      }
    }
  }

  /* istanbul ignore next */
  return ['', '']
}
