/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState, useLayoutEffect } from 'react'
import cx from 'classnames'
import { isEqual } from 'lodash-es'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { AbstractAnalysedNode } from 'services/cv'
import { HexagonCoordinates, drawGrid, getHexagonSubPartSize } from './DeploymentNodes.utils'
import { DeploymentNodeSubPartSize, DefaultNodeSubPartSize } from './DeploymentNodes.constants'
import css from './DeploymentNodes.module.scss'

export interface DeploymentNodesProps {
  className?: string
  nodes: AbstractAnalysedNode[]
  onClick?: (node: AbstractAnalysedNode) => void
  selectedNode?: AbstractAnalysedNode
  nodeType?: string
}

interface NodeHealthPopoverProps {
  analysisResult: AbstractAnalysedNode
}

function NodeHealthPopover(props: NodeHealthPopoverProps): JSX.Element {
  const { analysisResult } = props
  const { getString } = useStrings()
  return (
    <Container className={css.nodeHealthPopoverContent}>
      <Container
        className={cx(css.nodeHealth, css.popoverNodeHealth)}
        height={10}
        style={{ backgroundColor: getRiskColorValue(analysisResult?.verificationResult) }}
      />
      <Container>
        <Text color={Color.BLACK} font={{ weight: 'bold' }}>
          {analysisResult?.nodeIdentifier}
        </Text>
        <Text color={Color.BLACK_100}>{`${analysisResult?.failedMetrics ?? 0} ${getString(
          'pipeline.verification.metricsInViolation'
        )}`}</Text>
        <Text color={Color.BLACK_100}>{`${analysisResult?.failedLogClusters ?? 0} ${getString(
          'pipeline.verification.logClustersInViolation'
        )}`}</Text>
      </Container>
    </Container>
  )
}

export function DeploymentNodes(props: DeploymentNodesProps): JSX.Element {
  const { className, nodes: deploymentNodes, onClick, selectedNode, nodeType } = props
  const ref = useRef<HTMLDivElement>(null)
  const [coordinates, setCoordinates] = useState<HexagonCoordinates[]>([])
  const [hexagonPartSizes, setHexagonPartSizes] = useState<DeploymentNodeSubPartSize>(DefaultNodeSubPartSize)
  const [displayTooltip, setDisplayTooltip] = useState<AbstractAnalysedNode | undefined>()

  useLayoutEffect(() => {
    if (!ref?.current) return

    const containerWidth = ref.current.getBoundingClientRect().width
    const sizeObject = getHexagonSubPartSize(containerWidth)
    setHexagonPartSizes(sizeObject)
    setCoordinates(drawGrid(containerWidth, deploymentNodes?.length || 0, sizeObject.hexagonRadius))
  }, [ref])
  const nodes = deploymentNodes || []

  return (
    <Container className={cx(css.mainContainer)}>
      {displayTooltip && <NodeHealthPopover analysisResult={displayTooltip} />}
      <Container className={cx(css.main, className)}>
        <Container className={css.hexagonList} ref={ref}>
          {coordinates.map((coordinate, index) => {
            const nodeHealthColor = getRiskColorValue(nodes[index]?.verificationResult)
            return (
              <Container
                key={index}
                className={css.hexagonContainer}
                data-testid={nodeType ? `${nodeType}Node-${index}` : ''}
                onClick={() => {
                  onClick?.(nodes?.[index])
                }}
                style={{
                  height: hexagonPartSizes.hexagonContainerSize,
                  width: hexagonPartSizes.hexagonContainerSize,
                  top: coordinate.y,
                  left: coordinate.x
                }}
                onMouseOver={() => {
                  if (nodes[index] && nodes[index] !== displayTooltip) {
                    setDisplayTooltip(nodes[index])
                  }
                }}
                onMouseOut={() => {
                  setDisplayTooltip(undefined)
                }}
              >
                <Container
                  className={cx(
                    css.hexagon,
                    selectedNode && isEqual(selectedNode, nodes[index]) ? css.selected : undefined
                  )}
                  style={{
                    height: hexagonPartSizes.hexagonSize,
                    width: hexagonPartSizes.hexagonSize
                  }}
                />
                <Container
                  key={index}
                  className={css.nodeHealth}
                  data-node-health-color={nodeHealthColor}
                  style={{
                    backgroundColor: nodeHealthColor,
                    width: hexagonPartSizes.nodeHealthSize,
                    height: hexagonPartSizes.nodeHealthSize
                  }}
                />
              </Container>
            )
          })}
        </Container>
      </Container>
    </Container>
  )
}
