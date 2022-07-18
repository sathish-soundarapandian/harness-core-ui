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
import { isNodeTypeMatrixOrFor } from '@pipeline/utils/executionUtils'
import { useDeepCompareEffect } from '@common/hooks'
import type { EventStepGroupDataType } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { ExecutionWrapperConfig } from 'services/pipeline-ng'
import { SVGComponent } from '../../PipelineGraph/PipelineGraph'
import { PipelineGraphRecursive } from '../../PipelineGraph/PipelineGraphNode'
import {
  getFinalSVGArrowPath,
  getPipelineGraphData,
  getSVGLinksFromPipeline
} from '../../PipelineGraph/PipelineGraphUtils'
import type { NodeProps, PipelineGraphState, PipelineStageNodeMetaDataType, SVGPathRecord } from '../../types'
import { NodeType } from '../../types'
import GraphConfigStore from '../../PipelineGraph/GraphConfigStore'
import { getCalculatedStepNodeStyles } from '../MatrixStepNode/MatrixStepNode'
import { Dimension, Dimensions, useNodeDimensionContext } from '../NodeDimensionStore'
import css from './StepGroupGraph.module.scss'

interface StepGroupGraphProps
  extends NodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepGroupDataType> {
  id: string
  parentIdentifier?: string
  stepsData?: ExecutionWrapperConfig[]
  isNodeCollapsed?: boolean
  hideLinks?: boolean
  hideAdd?: boolean // for dependency node
  updateSVGLinks?: (svgPath: string[]) => void
}

interface LayoutStyles extends Dimension {
  marginLeft?: string
}

const getNestedStepGroupHeight = (steps?: ExecutionWrapperConfig[]): number => {
  let maxParalellNodesCount = 0
  steps?.forEach(step => {
    if (step?.parallel) {
      maxParalellNodesCount = Math.max(maxParalellNodesCount, step.parallel.length)
    }
  })
  return maxParalellNodesCount
}

const getCalculatedStyles = (
  data: PipelineGraphState<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepGroupDataType>[],
  childrenDimensions: Dimensions
): LayoutStyles => {
  let width = 0
  let height = 0
  let maxChildLength = 0
  let hasStepGroupNode = false
  let finalHeight = 0
  data.forEach(node => {
    const childSteps = node.data.stepGroup?.steps
    const childrenNodesId = defaultTo(node?.children, []).map(o => o.id)
    const childNodesId = [node.id, ...childrenNodesId]

    if (childrenDimensions[node.id]) {
      let nodeHeight = 0
      let nodeWidth = 0
      childNodesId.forEach(childNode => {
        const dimension = childrenDimensions[childNode]
        nodeHeight += dimension?.height || 0
        nodeWidth = Math.max(nodeWidth, dimension?.width || 0)
        nodeHeight += 120 //nodeGap
      })

      height = Math.max(height, nodeHeight) + 40 //(each node)
      width = width + nodeWidth + 120 // gap
    } else {
      if (node.type === 'STEP_GROUP') {
        hasStepGroupNode = true
      }
      const maxParallelism = defaultTo(node?.metaData?.maxParallelism, 1)

      if (isNodeTypeMatrixOrFor(node.type)) {
        const dimensions = getCalculatedStepNodeStyles(childSteps as any, maxParallelism, false)
        width += dimensions.width
        height += dimensions.height
        // height += 50 // 30 for matrixWrapper type + padding
      } else if (childSteps) {
        const count = getNestedStepGroupHeight(childSteps)
        maxChildLength = Math.max(maxChildLength, count)
        width += childSteps.length * 170
      }
      if (node.children?.length && data.length > 1) {
        width += 40
      }
      width += 150
      maxChildLength = Math.max(maxChildLength, node?.children?.length || 0)
      finalHeight = (maxChildLength + 1) * 120
    }
  })
  finalHeight = hasStepGroupNode ? finalHeight + 50 : finalHeight
  return { height: finalHeight + height, width: width - 80 } // 80 is link gap that we dont need for last stepgroup node
}

function StepGroupGraph(props: StepGroupGraphProps): React.ReactElement {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [layoutStyles, setLayoutStyles] = useState<LayoutStyles>({ height: 100, width: 70 })
  const [state, setState] = useState<
    PipelineGraphState<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepGroupDataType>[]
  >([])
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

  const stagePath = getStagePathFromPipeline(props?.data?.identifier || '', 'pipeline.stages')

  const stepsData = props?.stepsData

  // move to utilsw
  const hasChildren = (nodeData: typeof props): boolean => Boolean(defaultTo(nodeData?.data?.children?.length, 0))
  const isParallelNode = (nodeData: typeof props): boolean => Boolean(nodeData?.metaData?.isParallelNode)

  useLayoutEffect(() => {
    if (stepsData?.length) {
      setState(
        getPipelineGraphData({
          data: stepsData,
          templateTypes: templateTypes,
          serviceDependencies: undefined,
          errorMap: errorMap,
          parentPath: `${stagePath}.stage.spec.execution.steps.stepGroup.steps` //index after step missing - getStepPathFromPipeline??
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
      updateDimensions?.({ [props?.id as string]: layoutStyles })
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
    /* direction is required to connect internal nodes to step group terminals */
    const SVGLinks = getSVGLinksFromPipeline(state, undefined, undefined, undefined, graphScale)
    const firstNodeIdentifier = state?.[0]?.id
    const lastNodeIdentifier = state?.[state?.length - 1]?.id
    const parentElement = graphRef.current?.querySelector('#tree-container') as HTMLDivElement
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
  // export from diagram PipelineGraphRecursive
  return (
    <div className={css.main} style={layoutStyles} ref={graphRef}>
      <SVGComponent svgPath={svgPath} className={cx(css.stepGroupSvg)} />
      {stepsData?.length ? (
        <>
          <PipelineGraphRecursive<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepGroupDataType>
            nodes={state}
            parentIdentifier={props?.parentIdentifier}
            startEndNodeNeeded={false}
            readonly={props?.permissions?.readonly}
            optimizeRender={false}
            fireEvent={props.fireEvent}
            getNode={props.getNode}
            selectedNodeId={defaultTo(props?.selectedNodeId, '')}
            updateGraphLinks={updateGraphLinks}
            getDefaultNode={props?.getDefaultNode}
          />
        </>
      ) : (
        !props.hideAdd &&
        CreateNode &&
        !props?.permissions?.readonly && (
          <CreateNode
            {...props}
            isInsideStepGroup={true}
            onClick={(event: any) => {
              props?.fireEvent?.({
                type: Event.ClickNode,
                target: event.target,
                data: {
                  nodeType: DiagramType.Default,
                  parentIdentifier: props?.parentIdentifier,
                  nodeData: {
                    id: props?.data?.id,
                    data: props?.data?.data?.stepGroup,
                    metaData: {
                      hasChildren: hasChildren(props),
                      isParallelNode: isParallelNode(props)
                    }
                  }
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
