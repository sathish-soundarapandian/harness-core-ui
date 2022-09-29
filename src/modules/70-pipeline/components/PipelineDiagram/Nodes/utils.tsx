/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { KVPair } from '../types'

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

export const matrixNodeNameToJSON = (nodeName: KVPair): string => {
  const parsedNodeName = {}

  try {
    // if object parse to yaml
    if (JSON.parse(Object.values(nodeName)[0])) {
      Object.values(nodeName).map((nodeDetails: string) => Object.assign(parsedNodeName, JSON.parse(nodeDetails)))
      return yamlStringify(parsedNodeName, { indent: 4 })
    }
  } catch (_e) {
    // name is string, parse it to string
    return `(${Object.values(nodeName)?.join(', ')}): ` as string
  }
  return JSON.stringify(nodeName)
}
