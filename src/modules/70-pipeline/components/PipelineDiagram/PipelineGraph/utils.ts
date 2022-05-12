import { defaultTo } from 'lodash-es'
import type { PipelineGraphState } from '../types'

const shouldAttachRef = (
  intersectingIndex: number,
  isCurrentChildLast: boolean,
  indexRelativeToParent: number
): boolean => {
  return intersectingIndex === -1 // intersecting index is not set
    ? isCurrentChildLast // current child is not the last child in parallel
    : intersectingIndex === indexRelativeToParent // intersecting index is not equal to indexRelativeToParent (i.e index+1 as parent is 0)
}

const shouldRenderGroupNode = (attachRef: boolean, isCurrentChildLast: boolean): boolean => {
  return attachRef && !isCurrentChildLast // render group node is ref is attached and current node is not the last child
}

const isFirstNodeAGroupNode = (intersectingIndex: number, collapseOnIntersect = false, childLength = 0): boolean =>
  intersectingIndex === 0 && collapseOnIntersect && childLength > 0 // if intersecting index is 0 and collapseOnIntersect is enabled

const showChildNode = (indexRelativeToParent: number, intersectingIndex: number): boolean => {
  return !(indexRelativeToParent > intersectingIndex && intersectingIndex !== -1) // child index is greater than intersectingIndex and intersectingIndex is set to some value
}

const isNodeParallel = (node: PipelineGraphState): boolean => defaultTo(node?.children?.length, 0) > 0

export { shouldAttachRef, shouldRenderGroupNode, isFirstNodeAGroupNode, showChildNode, isNodeParallel }
