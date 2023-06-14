/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { stageGroupTypes, StageType } from '@pipeline/utils/stageHelpers'
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
import { DiagramType, Event } from '../../Constants'
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
  isParentMatrix?: boolean
  type?: string
  baseFqn?: string
  isContainerStepGroup?: boolean
}

function StepGroupGraph(props: StepGroupGraphProps): React.ReactElement {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [state, setState] = useState<PipelineGraphState[]>([])
  const graphRef = useRef<HTMLDivElement>(null)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const { graphScale } = useContext(GraphConfigStore)
  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  const { errorMap } = useValidationErrors()
  const {
    state: { templateTypes, templateIcons }
  } = usePipelineContext()

  const baseFQN = `${props?.baseFqn}.steps`
  useLayoutEffect(() => {
    if (stageGroupTypes.includes(props?.type as StageType)) setState(props.data as PipelineGraphState[])
    else if (props?.data?.length) {
      setState(
        getPipelineGraphData({
          data: props.data,
          templateTypes: templateTypes,
          templateIcons,
          serviceDependencies: undefined,
          errorMap: errorMap,
          parentPath: baseFQN,
          isNestedGroup: true,
          isContainerStepGroup: props.isContainerStepGroup
        })
      )
    }
  }, [treeRectangle, props.data, templateTypes, templateIcons, baseFQN])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
    }
    updateGraphLinks()
  }, [state, props?.isNodeCollapsed])

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
