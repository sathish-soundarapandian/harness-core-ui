/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react'
import classNames from 'classnames'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { v4 as uuid } from 'uuid'
import { Event } from '@pipeline/components/Diagram'
import {
  CANVAS_CLICK_EVENT,
  dispatchCustomEvent,
  getScaleToFitValue,
  getSVGLinksFromPipeline,
  getTerminalNodeLinks,
  INITIAL_ZOOM_LEVEL,
  scrollZoom,
  setupDragEventListeners
} from './PipelineGraphUtils'
import GraphActions from '../GraphActions/GraphActions'
import { PipelineGraphRecursive } from './PipelineGraphNode'
import type { NodeCollapsibleProps, NodeIds, PipelineGraphState, SVGPathRecord, GetNodeMethod, KVPair } from '../types'
import GraphConfigStore from './GraphConfigStore'
import css from './PipelineGraph.module.scss'

interface ControlPosition {
  x: number
  y: number
}

const DEFAULT_POSITION: ControlPosition = { x: 30, y: 120 }
export interface PipelineGraphProps {
  data: PipelineGraphState[]
  fireEvent: (event: any) => void
  getNode: GetNodeMethod
  getDefaultNode: GetNodeMethod
  selectedNodeId?: string
  collapsibleProps?: NodeCollapsibleProps
  readonly?: boolean
  loaderComponent?: React.FC
  /** parent element selector to listen resize event on */
  parentSelector?: string
  panZoom?: boolean
  createNodeTitle?: string
  showEndNode?: boolean
  graphActionsLayout?: 'horizontal' | 'vertical'
  graphLinkClassname?: string
  optimizeRender?: boolean
}

function PipelineGraph({
  data,
  getNode,
  fireEvent,
  collapsibleProps,
  getDefaultNode,
  selectedNodeId = '',
  readonly,
  loaderComponent,
  parentSelector,
  panZoom = true,
  createNodeTitle,
  showEndNode = true,
  graphActionsLayout = 'vertical',
  graphLinkClassname,
  optimizeRender
}: PipelineGraphProps): React.ReactElement {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])

  const [shouldDelayRender, setDelayRender] = useState<boolean>(false)
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [state, setState] = useState<PipelineGraphState[]>(data)
  const [graphScale, setGraphScale] = useState(INITIAL_ZOOM_LEVEL)
  const [position, setPosition] = useState<ControlPosition>(DEFAULT_POSITION)
  const [isDragging, setDragging] = useState(false)
  const draggableRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const uniqueNodeIds = useMemo(
    (): NodeIds => ({
      startNode: uuid(),
      endNode: uuid(),
      createNode: uuid()
    }),
    []
  )

  const updateGraphScale = (newScale: number): void => {
    setGraphScale(newScale)
  }

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }
  useLayoutEffect(() => {
    setState(data)
  }, [treeRectangle, data])

  useLayoutEffect(() => {
    shouldDelayRender ? renderSVGLinksDelayed() : redrawSVGLinks()
  }, [state, graphScale])

  const redrawSVGLinks = (): void => {
    setSVGLinks()
  }

  const renderSVGLinksDelayed = (): void => {
    setTimeout(redrawSVGLinks, 300)
  }

  const setSVGLinks = (): void => {
    const lastNode = state?.[state?.length - 1]
    const terminalNodeLinks: SVGPathRecord[] = getTerminalNodeLinks({
      startNodeId: uniqueNodeIds.startNode,
      endNodeId: uniqueNodeIds.endNode,
      firstNodeId: state?.[0]?.id,
      lastNodeId: lastNode?.id,
      createNodeId: uniqueNodeIds.createNode,
      readonly,
      scalingFactor: graphScale
    })
    let endNodeId: string | undefined
    if (readonly && showEndNode) {
      endNodeId = uniqueNodeIds.endNode
    }
    if (!readonly) {
      endNodeId = uniqueNodeIds.createNode
    }
    const SVGLinks = getSVGLinksFromPipeline({
      states: state,
      parentElement: undefined,
      resultArr: undefined,
      endNodeId,
      scalingFactor: graphScale
    })

    return setSvgPath([...SVGLinks, ...terminalNodeLinks])
  }

  useEffect(() => {
    updateTreeRect()
    const draggableParent = draggableRef.current
    const overlay = overlayRef.current as HTMLElement
    if (draggableParent && overlay) {
      setupDragEventListeners(draggableParent, overlay)
      panZoom && scrollZoom(overlay, 40, 0.01, updateGraphScale)
    }
  }, [])

  const handleScaleToFit = (): void => {
    setPosition(DEFAULT_POSITION)

    setGraphScale(
      getScaleToFitValue(
        canvasRef.current as unknown as HTMLElement,
        document.querySelector(parentSelector as string) as HTMLElement,
        DEFAULT_POSITION.x,
        DEFAULT_POSITION.y
      )
    )
    setDelayRender(true)
  }
  const onDrag = (_e: DraggableEvent, dragData: DraggableData): void => {
    if (position.x === dragData.x && position.y == dragData.y) {
      return
    }
    setPosition({ x: dragData.x, y: dragData.y })
    setDragging(false)
    redrawSVGLinks()
  }
  const resetGraphState = (): void => {
    setGraphScale(INITIAL_ZOOM_LEVEL)
    setPosition(DEFAULT_POSITION)
  }
  return (
    <GraphConfigStore.Provider
      value={{
        graphScale,
        showEndNode,
        parentSelector,
        loaderComponent,
        selectedNodeId,
        graphActionsLayout,
        panZoom,
        readonly,
        createNodeTitle,
        collapsibleProps,
        graphLinkClassname
      }}
    >
      <div id="draggable-parent" className={css.draggableParent} ref={draggableRef}>
        <Draggable
          scale={graphScale}
          position={position}
          onStart={() => setDragging(true)}
          onStop={onDrag}
          offsetParent={document.body}
        >
          <div
            id="overlay"
            onClick={() => {
              fireEvent?.({ type: Event.CanvasClick })
              dispatchCustomEvent(CANVAS_CLICK_EVENT, {})
            }}
            className={css.overlay}
            ref={overlayRef}
          >
            <div className={css.graphMain} ref={canvasRef} style={{ transform: `scale(${graphScale})` }}>
              <SVGComponent svgPath={svgPath} className={graphLinkClassname} />
              <PipelineGraphRecursive
                key="PipelineGraphRecursive"
                fireEvent={fireEvent}
                getNode={getNode}
                nodes={state}
                selectedNode={selectedNodeId}
                uniqueNodeIds={uniqueNodeIds}
                updateGraphLinks={redrawSVGLinks}
                collapsibleProps={collapsibleProps}
                getDefaultNode={getDefaultNode}
                readonly={readonly}
                isDragging={isDragging}
                parentSelector={parentSelector}
                createNodeTitle={createNodeTitle}
                showEndNode={showEndNode}
                optimizeRender={optimizeRender}
              />
            </div>
          </div>
        </Draggable>
        <GraphActions
          resetGraphState={resetGraphState}
          setGraphScale={setGraphScale}
          graphScale={graphScale}
          handleScaleToFit={handleScaleToFit}
          graphActionsLayout={graphActionsLayout}
        />
      </div>
    </GraphConfigStore.Provider>
  )
}

interface SVGComponentProps {
  svgPath: SVGPathRecord[]
  className?: string
}

export function SVGComponent({ svgPath, className }: SVGComponentProps): React.ReactElement {
  const svgPathFlattened: SVGPathRecord[] = []
  for (const path of svgPath) {
    if (Object.keys(path).length > 1) {
      Object.entries(path)?.forEach?.(
        ([key, value]: [
          string,
          {
            pathData: string
            className?: string
            getLinkStyles?: () => void
            dataProps?: KVPair
          }
        ]) => svgPathFlattened.push({ [key]: value })
      )
    } else {
      svgPathFlattened.push(path)
    }
  }
  return (
    <svg className={css.common} id="graph-svg">
      {svgPathFlattened.map((path, idx) => {
        const [[nodeId, pathDetails]] = Object.entries(path)
        return (
          <path
            className={classNames(css.svgArrow, className)}
            id={`${nodeId}-link`}
            key={idx}
            d={pathDetails.pathData}
            {...pathDetails.dataProps}
          />
        )
      })}
    </svg>
  )
}

export default PipelineGraph
