/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classNames from 'classnames'
import { noop, isNil, debounce } from 'lodash-es'
import type { NodeModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import { GraphCanvasState, useExecutionContext } from '@pipeline/context/ExecutionContext'
import { useDeepCompareEffect, useUpdateQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { Event as DiagramEvent } from '@pipeline/utils/PipelineStudioUtils'
import type { ExecutionPipeline, ExecutionPipelineGroupInfo, ExecutionPipelineItem } from './ExecutionPipelineModel'
import {
  ExecutionStageDiagramConfiguration,
  ExecutionStageDiagramModel,
  GridStyleInterface,
  NodeStyleInterface
} from './ExecutionStageDiagramModel'
import {
  focusRunningNode,
  getGroupsFromData,
  getStageFromDiagramEvent,
  GroupState,
  moveStageToFocusDelayed
} from './ExecutionStageDiagramUtils'
import { CanvasButtons, CanvasButtonsActions } from '../CanvasButtons/CanvasButtons'
import * as Diagram from '../Diagram'
import css from './ExecutionStageDiagram.module.scss'

abstract class ItemEvent<T> extends Event {
  readonly stage: ExecutionPipelineItem<T>
  readonly stageTarget: HTMLElement

  constructor(eventName: string, stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super(eventName)
    this.stage = stage
    this.stageTarget = target
  }
}

abstract class GroupEvent<T> extends Event {
  readonly group: ExecutionPipelineGroupInfo<T>
  readonly stageTarget: HTMLElement

  constructor(eventName: string, group: ExecutionPipelineGroupInfo<T>, target: HTMLElement) {
    super(eventName)
    this.group = group
    this.stageTarget = target
  }
}

export class ItemClickEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemClickEvent', stage, target)
  }
}

export class ItemMouseEnterEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemMouseEnterEvent', stage, target)
  }
}

export class GroupMouseEnterEvent<T> extends GroupEvent<T> {
  constructor(group: ExecutionPipelineGroupInfo<T>, target: HTMLElement) {
    super('GroupMouseEnterEvent', group, target)
  }
}

export class ItemMouseLeaveEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemMouseLeaveEvent', stage, target)
  }
}

export interface ExecutionStageDiagramProps<T> {
  /** pipeline definition */
  data: ExecutionPipeline<T>
  /** selected item id */
  selectedIdentifier: string // TODO: 1. add node style for each type/shape 2. add default value
  /** node style  */
  nodeStyle?: NodeStyleInterface
  /** grid style */
  gridStyle: GridStyleInterface
  graphConfiguration?: Partial<ExecutionStageDiagramConfiguration>
  loading?: boolean
  showStartEndNode?: boolean // Default: true
  showEndNode?: boolean // Default: true
  diagramContainerHeight?: number
  itemClickHandler?: (event: ItemClickEvent<T>) => void
  itemMouseEnter?: (event: ItemMouseEnterEvent<T>) => void
  itemMouseLeave?: (event: ItemMouseLeaveEvent<T>) => void
  mouseEnterStepGroupTitle?: (event: GroupMouseEnterEvent<T>) => void
  mouseLeaveStepGroupTitle?: (event: GroupMouseEnterEvent<T>) => void
  canvasListener?: (action: CanvasButtonsActions) => void
  isWhiteBackground?: boolean // Default: false
  className?: string
  canvasBtnsClass?: string
  graphCanvasState?: GraphCanvasState
  setGraphCanvasState?: (state: GraphCanvasState) => void
  disableCollapseButton?: boolean
  isStepView?: boolean
}

export default function ExecutionStageDiagram<T>(props: ExecutionStageDiagramProps<T>): React.ReactElement {
  const {
    data,
    className,
    selectedIdentifier,
    nodeStyle = { width: 50, height: 50 },
    graphConfiguration = {},
    gridStyle,
    diagramContainerHeight,
    showStartEndNode = true,
    showEndNode = true,
    itemClickHandler = noop,
    itemMouseEnter = noop,
    itemMouseLeave = noop,
    mouseEnterStepGroupTitle = noop,
    mouseLeaveStepGroupTitle = noop,
    canvasListener = noop,
    loading = false,
    isWhiteBackground = false,
    canvasBtnsClass = '',
    graphCanvasState,
    setGraphCanvasState,
    disableCollapseButton,
    isStepView = false
  } = props

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSetGraphCanvasState = React.useCallback(
    debounce((values: GraphCanvasState) => {
      return setGraphCanvasState?.(values)
    }, 250),
    []
  )
  const { queryParams, selectedStageId, selectedStepId } = useExecutionContext()
  const { replaceQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const [autoPosition, setAutoPosition] = React.useState(true)

  const [groupState, setGroupState] = React.useState<Map<string, GroupState<T>>>()

  function stopAutoSelection(): void {
    // istanbul ignore else
    if (queryParams.stage && queryParams.step) {
      return
    }
    // istanbul ignore else
    if (selectedStageId && selectedStepId) {
      replaceQueryParams({
        ...queryParams,
        stage: selectedStageId,
        step: selectedStepId
      })
    }
  }

  React.useEffect(() => {
    if (isStepView) {
      engine.getModel().setZoomLevel(100)
      engine.zoomToFit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStageId, isStepView])

  useDeepCompareEffect(() => {
    const stageData = getGroupsFromData(data.items)
    setGroupState(stageData)
  }, [data])

  const updateGroupStage = (event: Diagram.DefaultNodeEvent): void => {
    const group = groupState?.get(event.entity.getIdentifier())
    if (group && groupState) {
      groupState?.set(event.entity.getIdentifier(), {
        ...group,
        collapsed: !group.collapsed
      })
      setGroupState(new Map([...groupState]))
    }
  }

  //setup the diagram engine
  const engine = React.useMemo(
    () =>
      Diagram.createEngine({
        registerDefaultZoomCanvasAction: false
      }),
    []
  )

  //setup the diagram model
  const model = React.useMemo(() => new ExecutionStageDiagramModel(), [])
  model.setDefaultNodeStyle(nodeStyle)
  model.setGraphConfiguration(graphConfiguration)
  model.setGridStyle(gridStyle)

  // Graph position and zoom set (set values from context)
  React.useEffect(() => {
    const { offsetX, offsetY, zoom } = graphCanvasState || {}
    if (!isNil(offsetX) && offsetX !== model.getOffsetX() && !isNil(offsetY) && offsetY !== model.getOffsetY()) {
      model.setOffset(offsetX, offsetY)
    }
    if (!isNil(zoom) && zoom !== model.getZoomLevel()) {
      model.setZoomLevel(zoom)
    }
  }, [graphCanvasState, model])

  // Graph position and zoom change - event handling (update context value)
  React.useEffect(() => {
    const offsetUpdateHandler = function (event: any): void {
      if (graphCanvasState) {
        graphCanvasState.offsetX = event.offsetX
        graphCanvasState.offsetY = event.offsetY
        debounceSetGraphCanvasState({
          ...graphCanvasState
        })
      }
    }
    const zoomUpdateHandler = function (event: any): void {
      if (graphCanvasState) {
        graphCanvasState.zoom = event.zoom
        debounceSetGraphCanvasState({ ...graphCanvasState })
      }
    }
    const listenerHandle = model.registerListener({
      [DiagramEvent.OffsetUpdated]: offsetUpdateHandler,
      [DiagramEvent.ZoomUpdated]: zoomUpdateHandler
    })
    return () => {
      model.deregisterListener(listenerHandle)
    }
  }, [model])

  const nodeListeners: NodeModelListener = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [DiagramEvent.ClickNode]: (event: any) => {
      /* istanbul ignore else */ if (autoPosition) {
        setAutoPosition(false)
      }
      const group = groupState?.get(event.entity.getIdentifier())
      if (group && group.collapsed) {
        updateGroupStage(event)
      } else {
        const stage = getStageFromDiagramEvent(event, data)
        /* istanbul ignore else */ if (stage) itemClickHandler(new ItemClickEvent(stage, event.target))
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [DiagramEvent.MouseEnterNode]: (event: any) => {
      const stage = getStageFromDiagramEvent(event, data)
      /* istanbul ignore else */ if (stage) itemMouseEnter(new ItemMouseEnterEvent(stage, event.target))
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [DiagramEvent.MouseLeaveNode]: (event: any) => {
      const stage = getStageFromDiagramEvent(event, data)
      // dynamicPopoverHandler?.hide()
      /* istanbul ignore else */ if (stage) itemMouseLeave(new ItemMouseLeaveEvent(stage, event.target))
    }
  }
  const layerListeners: BaseModelListener = {
    [DiagramEvent.StepGroupCollapsed]: (event: any) => updateGroupStage(event),
    [DiagramEvent.MouseEnterStepGroupTitle]: (event: any) => {
      const groupData = groupState?.get(event.entity.getIdentifier())
      if (groupData?.group) {
        mouseEnterStepGroupTitle(new GroupMouseEnterEvent(groupData?.group, event.target))
      }
    },
    [DiagramEvent.MouseLeaveStepGroupTitle]: (event: any) => {
      const groupData = groupState?.get(event.entity.getIdentifier())
      if (groupData?.group) {
        mouseLeaveStepGroupTitle(new GroupMouseEnterEvent(groupData?.group, event.target))
      }
    }
  }

  React.useEffect(() => {
    setAutoPosition(true)
  }, [data.identifier])

  React.useEffect(() => {
    moveStageToFocusDelayed(engine, selectedIdentifier, true)
  }, [selectedIdentifier])

  React.useEffect(() => {
    model.clearAllNodesAndLinks()
    engine.repaintCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.identifier])

  React.useEffect(() => {
    !loading &&
      model.addUpdateGraph(
        data,
        { nodeListeners: nodeListeners, linkListeners: {}, layerListeners },
        selectedIdentifier,
        diagramContainerHeight,
        showStartEndNode,
        showEndNode,
        groupState,
        disableCollapseButton
      )
  }, [
    data,
    diagramContainerHeight,
    groupState,
    layerListeners,
    loading,
    model,
    nodeListeners,
    selectedIdentifier,
    showStartEndNode,
    showEndNode
  ])

  //Load model into engine
  engine.setModel(model)
  autoPosition && focusRunningNode(engine, data)

  return (
    <div
      className={classNames(css.main, { [css.whiteBackground]: isWhiteBackground }, className)}
      onMouseDown={() => {
        setAutoPosition(false)
      }}
      onClick={stopAutoSelection}
    >
      <Diagram.CanvasWidget engine={engine} className={css.canvas} />
      <CanvasButtons
        engine={engine}
        className={canvasBtnsClass}
        callback={action => {
          canvasListener(action)
        }}
        tooltipPosition="right"
      />
    </div>
  )
}
