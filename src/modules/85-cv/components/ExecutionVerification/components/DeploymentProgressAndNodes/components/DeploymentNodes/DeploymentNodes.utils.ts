/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DeploymentNodeSubPartSize} from './DeploymentNodes.constants';
import { DefaultNodeSubPartSize, HexagonSizes } from './DeploymentNodes.constants'

export type HexagonCoordinates = { x: number; y: number }

const A = (2 * Math.PI) / 6

export function drawGrid(width: number, totalNodes: number, hexagonRadius: number): HexagonCoordinates[] {
  const cooordinates: HexagonCoordinates[] = []
  const radiusWithMargin = hexagonRadius + 2.4
  for (let y = radiusWithMargin, nodesGenerated = 0; nodesGenerated < totalNodes; y += radiusWithMargin * Math.sin(A)) {
    for (
      let x = radiusWithMargin, j = 0;
      x + radiusWithMargin * (1 + Math.cos(A)) < width && nodesGenerated < totalNodes;
      x += radiusWithMargin * (1 + Math.cos(A)), y += (-1) ** j++ * radiusWithMargin * Math.sin(A), nodesGenerated++
    ) {
      cooordinates.push({ x, y })
    }
  }

  return cooordinates
}

export function getHexagonSubPartSize(containerWidth: number): DeploymentNodeSubPartSize {
  for (const sizeObject of HexagonSizes) {
    if (containerWidth <= sizeObject.containerWidth) {
      return sizeObject
    }
  }

  return DefaultNodeSubPartSize
}
