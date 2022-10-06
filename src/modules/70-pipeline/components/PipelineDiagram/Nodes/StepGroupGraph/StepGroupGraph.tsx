/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { DiagramType, Event } from '@pipeline/components/Diagram'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useDeepCompareEffect } from '@common/hooks'
import { SVGComponent } from '../../PipelineGraph/PipelineGraph'
import { PipelineGraphRecursive } from '../../PipelineGraph/PipelineGraphNode'
import {
  getFinalSVGArrowPath,
  getPipelineGraphData,
  getSVGLinksFromPipeline
} from '../../PipelineGraph/PipelineGraphUtils'
import type { GetNodeMethod, NodeDetails, NodeIds, PipelineGraphState, SVGPathRecord } from '../../types'
import { NodeType } from '../../types'
import GraphConfigStore from '../../PipelineGraph/GraphConfigStore'
import { Dimension, Dimensions, useNodeDimensionContext } from '../NodeDimensionStore'
import css from './StepGroupGraph.module.scss'

interface StepGroupGraphProps {
  id?: string
  data?: any[]
  getNode: GetNodeMethod
  getDefaultNode(): NodeDetails | null
  selectedNodeId?: string
  uniqueNodeIds?: NodeIds
  fireEvent: (event: any) => void
  startEndNodeNeeded?: boolean
  updateSVGLinks?: (svgPath: string[]) => void
  prevNodeIdentifier?: string
  identifier?: string
  isNodeCollapsed: boolean
  updateGraphLinks: () => void
  parentIdentifier?: string
  readonly?: boolean
  hideLinks?: boolean
  hideAdd?: boolean
  setVisibilityOfAdd: React.Dispatch<React.SetStateAction<boolean>>
}

interface LayoutStyles extends Pick<Dimension, 'height' | 'width'> {
  marginLeft?: string
}

const getCalculatedStyles = (data: PipelineGraphState[], childrenDimensions: Dimensions): LayoutStyles => {
  let width = 0
  let height = 0
  let maxChildLength = 0
  let finalHeight = 0
  data.forEach(node => {
    const childrenNodesId = defaultTo(node?.children, []).map(o => o.id) // list of all parallel nodes of current node
    const childNodesId = [node.id, ...childrenNodesId] // node + all parallel nodes id list

    if (childrenDimensions[node.id]) {
      // stepGroup child dimension from context
      let nodeHeight = 0
      let nodeWidth = 0
      childNodesId.forEach((childNode, index) => {
        // check all parallel nodes
        const dimensionMetaData = childrenDimensions[childNode]

        let hh = dimensionMetaData?.height + (dimensionMetaData?.isNodeCollapsed ? 0 : 68) // padding for StepGroupNode
        let ww = dimensionMetaData?.width + (dimensionMetaData?.isNodeCollapsed ? 0 : 82) // padding for StepGroupNode

        if (dimensionMetaData?.type === 'matrix') {
          hh += 45
          ww -= 20
        }
        nodeHeight += hh || 0 // height added for all child (68 -> padding of StepGroupNode)
        nodeWidth = Math.max(nodeWidth, ww || 0) // width is max of all child nodes

        nodeHeight += index > 0 ? 120 : 20 //nodeGap for parallel nodes
      })
      if (node.children?.length && data.length > 0) {
        width += 40 // for parallel node -> parallel link joint
      }

      height = Math.max(height, nodeHeight) //+ 40 //(each node)
      width = width + nodeWidth + 80 //+ 40 // gap
      finalHeight = Math.max(finalHeight, height)
    } else {
      let nodeHeight = 0
      let nodeWidth = 0
      childNodesId.forEach((childNode, index) => {
        const dimensionMetaData = childrenDimensions[childNode]
        const hh = dimensionMetaData?.height ? dimensionMetaData?.height + 68 : 138
        const ww = dimensionMetaData?.width ? dimensionMetaData?.width + 82 + (index > 0 ? 80 : 0) : 150
        nodeHeight += hh
        nodeWidth = Math.max(nodeWidth, ww)
      })
      width += nodeWidth + 10

      maxChildLength = Math.max(maxChildLength, node?.children?.length || 0)
      finalHeight = Math.max(finalHeight, nodeHeight)
    }
  })

  return { height: finalHeight, width: width - 80 } // 80 is link gap that we dont need for last stepgroup node
}

function StepGroupGraph(props: StepGroupGraphProps): React.ReactElement {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [layoutStyles, setLayoutStyles] = useState<LayoutStyles>({ height: 100, width: 70 })
  const [state, setState] = useState<PipelineGraphState[]>([])
  const graphRef = useRef<HTMLDivElement>(null)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const { graphScale } = useContext(GraphConfigStore)
  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  const { updateDimensions, childrenDimensions } = useNodeDimensionContext()
  const { errorMap } = useValidationErrors()
  const {
    state: { templateTypes },
    getStagePathFromPipeline
  } = usePipelineContext()

  const stagePath = getStagePathFromPipeline(props?.identifier || '', 'pipeline.stages')
  useLayoutEffect(() => {
    if (props?.data?.length) {
      setState(
        getPipelineGraphData({
          data: props.data,
          templateTypes: templateTypes,
          serviceDependencies: undefined,
          errorMap: errorMap,
          parentPath: `${stagePath}.stage.spec.execution.steps.stepGroup.steps`, //index after step missing - getStepPathFromPipeline??
          isNestedGroup: true
        })
      )
    }
  }, [treeRectangle, props.data, templateTypes])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
      setLayoutStyles(getCalculatedStyles(state, childrenDimensions))
    }
  }, [state, props?.isNodeCollapsed])

  useDeepCompareEffect(() => {
    if (state?.length) {
      updateGraphLinks()
      setLayoutStyles(getCalculatedStyles(state, childrenDimensions))
    }
  }, [childrenDimensions])

  useLayoutEffect(() => {
    if (state?.length) {
      props?.updateGraphLinks?.()
      updateDimensions?.({
        [props?.id as string]: {
          ...layoutStyles,
          type: 'STEP_GROUP',
          isNodeCollapsed: props?.isNodeCollapsed
        }
      })
    }
  }, [layoutStyles])

  const updateGraphLinks = (): void => {
    setSVGLinks()
    props?.updateGraphLinks?.()
  }
  const setSVGLinks = (): void => {
    if (props.hideLinks) {
      return
    }
    const SVGLinks = getSVGLinksFromPipeline({
      states: state,
      parentElement: undefined,
      resultArr: undefined,
      endNodeId: undefined,
      scalingFactor: graphScale,
      isStepGroup: true
    })
    const firstNodeIdentifier = state?.[0]?.id
    const lastNodeIdentifier = state?.[state?.length - 1]?.id
    const parentElement = graphRef.current?.querySelector('#tree-container') as HTMLDivElement
    /* direction is required to connect internal nodes to step group terminals */
    const finalPaths = [
      ...SVGLinks,
      getFinalSVGArrowPath(props?.id, firstNodeIdentifier as string, {
        direction: 'ltl',
        parentElement,
        scalingFactor: graphScale
      }),
      getFinalSVGArrowPath(lastNodeIdentifier as string, props?.id, {
        direction: 'rtr',
        parentElement,
        scalingFactor: graphScale
      })
    ]
    return setSvgPath(finalPaths)
  }

  useEffect(() => {
    updateTreeRect()
  }, [])
  return (
    <div
      className={css.main}
      style={layoutStyles}
      data-stepGroup-name={props?.identifier}
      data-stepGroup-id={props?.id}
      ref={graphRef}
      onMouseEnter={e => {
        e.stopPropagation()
        props.setVisibilityOfAdd?.(false)
      }}
      onMouseOut={e => {
        e.stopPropagation()
        props.setVisibilityOfAdd?.(false)
      }}
    >
      <SVGComponent svgPath={svgPath} className={cx(css.stepGroupSvg)} />
      {props?.data?.length ? (
        <>
          <PipelineGraphRecursive
            getDefaultNode={props?.getDefaultNode}
            parentIdentifier={props?.identifier}
            fireEvent={props.fireEvent}
            getNode={props.getNode}
            nodes={state}
            selectedNode={defaultTo(props?.selectedNodeId, '')}
            startEndNodeNeeded={false}
            readonly={props.readonly}
            optimizeRender={false}
            updateGraphLinks={updateGraphLinks}
          />
        </>
      ) : (
        !props.hideAdd &&
        CreateNode &&
        !props.readonly && (
          <CreateNode
            {...props}
            isInsideStepGroup={true}
            onClick={(event: any) => {
              props?.fireEvent?.({
                type: Event.ClickNode,
                target: event.target,
                data: {
                  identifier: props?.identifier,
                  parentIdentifier: props?.identifier,
                  entityType: DiagramType.CreateNew,
                  node: props
                }
              })
            }}
            name={null}
          />
        )
      )}
    </div>
  )
}

export default StepGroupGraph
