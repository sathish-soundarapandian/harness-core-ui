import {
  isExecutionActive,
  isExecutionCompletedWithBadState,
  isExecutionNotStarted
} from '@pipeline/utils/statusHelpers'

export interface SearchData<Node, NodeAdjacencyList> {
  nodeMap: Record<string, Node>
  nodeAdjacencyListMap: Record<string, NodeAdjacencyList>
  getChidrenIds(node: Node, nodeAdjacencyListMap: Record<string, NodeAdjacencyList>): string[]
  getNextIds(node: Node, nodeAdjacencyListMap: Record<string, NodeAdjacencyList>): string[]
}

/**
 * Perform a pre-order depth first traversal on the tree,
 * using given data and a staring node id.
 */
export function* preOrderTraversal<Node, NodeAdjacencyList>(
  data: SearchData<Node, NodeAdjacencyList>,
  startingNodeId: string
): Generator<Node> {
  const { nodeAdjacencyListMap, nodeMap, getChidrenIds, getNextIds } = data
  const node = nodeMap[startingNodeId]

  /* istanbul ignore else */
  if (node) {
    yield node
  }

  const childrenIds = getChidrenIds(node, nodeAdjacencyListMap)
  const nextIds = getNextIds(node, nodeAdjacencyListMap)

  // here childrenIds are given a higher priority than the nextIds
  // This is important in case, when the execution is active/failed.
  // We need to find the first corresponding node
  const allChildren = [...childrenIds, ...nextIds]

  // run recursive search on children
  for (const childId of allChildren) {
    yield* preOrderTraversal(data, childId)
  }
}

/**
 * Perform a post-order depth first traversal on the tree,
 * using given data and a staring node id.
 */
export function* postOrderTraversal<Node, NodeAdjacencyList>(
  data: SearchData<Node, NodeAdjacencyList>,
  startingNodeId: string
): Generator<Node> {
  const { nodeAdjacencyListMap, nodeMap, getChidrenIds, getNextIds } = data
  const node = nodeMap[startingNodeId]

  const childrenIds = getChidrenIds(node, nodeAdjacencyListMap)
  const nextIds = getNextIds(node, nodeAdjacencyListMap)

  // here  nextIds are given a higher priority than the  childrenIds
  // This is important in case, when the execution is success.
  // We need to find the first corresponding node
  const allChildren = [...nextIds, ...childrenIds]

  // run recursive search on children
  for (const childId of allChildren) {
    yield* postOrderTraversal(data, childId)
  }

  /* istanbul ignore else */
  if (node) {
    yield node
  }
}

export function isExecutionActiveOrCompletedWitBadState(status?: string): boolean {
  return !isExecutionNotStarted(status) && (isExecutionActive(status) || isExecutionCompletedWithBadState(status))
}
