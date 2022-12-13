/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isNumber } from 'lodash-es'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { dragPlaceholderImageBase64 } from './assets/dragImageBase64'
import { dragStagePlaceholderImageBase64 } from './assets/dragStageImageBase64'
import type { Dimension } from './NodeDimensionStore'

export enum NodeEntity {
  STAGE = 'STAGE',
  STEP = 'STEP'
}
export interface LayoutStyles extends Pick<Dimension, 'height' | 'width'> {
  marginLeft?: string
}

export const COLLAPSED_MATRIX_NODE_LENGTH = 8
export const MAX_ALLOWED_MATRIX_COLLAPSED_NODES = 4
export const DEFAULT_MATRIX_PARALLELISM = 1

export const getPositionOfAddIcon = (props: any, isRightNode?: boolean): string => {
  if (isRightNode) {
    return '-40px'
  }
  if (props?.children?.length) {
    if (props?.prevNode?.children) {
      return '-65px'
    }
    if (props?.prevNode) return '-58px'
  }
  if (props?.prevNode?.children) {
    return '-58px'
  }
  if (props?.parentIdentifier && !props.prevNode) {
    return '-35px'
  }
  return '-50px'
}

export const transformMatrixLabels = (nodeData: string): string => {
  const parsedNodeName = {}
  try {
    // if object parse to yaml
    const parsedVal = JSON.parse(nodeData)
    if (parsedVal && !isNumber(parsedVal)) {
      Object.assign(parsedNodeName, parsedVal)
      return yamlStringify(parsedNodeName, { indent: 4 })
    } else {
      return JSON.stringify(nodeData)
    }
  } catch (_e) {
    // name is string/number, parse it to string
    return JSON.stringify(nodeData)
  }
}

export function getSGDimensions(nodeDimensionMetaData: Dimension, index: number): LayoutStyles {
  if (nodeDimensionMetaData?.isNodeCollapsed) {
    return {
      height: 118,
      width: 134
    }
  }
  const height = nodeDimensionMetaData?.height + 68 + (index > 0 ? 60 : 0)
  const width = nodeDimensionMetaData?.width + 82 + (index > 0 ? 80 : 0)

  return { height, width }
}

export const getMatrixHeight = (
  nodeHeight: number,
  maxChildLength: number,
  parallelism: number,
  showAllNodes: boolean
): number => {
  if (parallelism === 0) {
    // parallel case
    return maxChildLength * nodeHeight
  } else if (!showAllNodes && maxChildLength < parallelism) {
    // collapsed mode, single row
    return nodeHeight
  } else {
    return (
      (Math.floor(maxChildLength / parallelism) + Math.ceil((maxChildLength % parallelism) / parallelism)) * nodeHeight
    )
  }
}

export const attachDragImageToEventHandler = (event: React.DragEvent<HTMLDivElement>, type?: NodeEntity): void => {
  // set drag image preview to custom icon in case of safari browser, as safari blocks image preview if dom tree have transform property on any parent
  if (navigator.userAgent.search('Safari') >= 0 && navigator.userAgent.search('Chrome') < 0) {
    const dragIcon = document.createElement('img')
    dragIcon.src = type === NodeEntity.STAGE ? dragStagePlaceholderImageBase64 : dragPlaceholderImageBase64
    event.dataTransfer.setDragImage(dragIcon, 25, 25)
  }
}
