/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { cloneDeep, set, isEmpty, get, defaultTo, omit } from 'lodash-es'
// import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
// import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import { Color } from '@harness/design-system'
import { Button, ButtonVariation, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
// import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { useToaster } from '@common/exports'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StepActions } from '@common/constants/TrackingConstants'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { PipelineOrStageStatus } from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import ConditionalExecutionTooltip from '@pipeline/components/ConditionalExecutionToolTip/ConditionalExecutionTooltip'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type {
  ExecutionElementConfig,
  ExecutionWrapperConfig,
  StageElementConfig,
  StepElementConfig
} from 'services/cd-ng'
import type { DependencyElement } from 'services/ci'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import {
  DiagramFactory,
  // DiagramNodes,
  NodeType,
  // NodeProps,
  CombinedNodeProps,
  PipelineStageNodeMetaDataType
} from '@pipeline/components/PipelineDiagram/DiagramFactory'
import { getPipelineGraphData } from '@pipeline/components/PipelineDiagram/PipelineGraph/PipelineGraphUtils'
import PipelineStepNode from '@pipeline/components/PipelineDiagram/Nodes/DefaultNode/PipelineStepNode/PipelineStepNode'
import { IconNode } from '@pipeline/components/PipelineDiagram/Nodes/IconNode/IconNode'
import CreateNodeStep from '@pipeline/components/PipelineDiagram/Nodes/CreateNode/CreateNodeStep'
import EndNodeStep from '@pipeline/components/PipelineDiagram/Nodes/EndNode/EndNodeStep'
import StartNodeStep from '@pipeline/components/PipelineDiagram/Nodes/StartNode/StartNodeStep'
import { CIDependencyNode } from '@pipeline/components/PipelineDiagram/Nodes/StepGroupNode/CIDependencyNode'
import DiagramLoader from '@pipeline/components/DiagramLoader/DiagramLoader'
import { NodeDimensionProvider } from '@pipeline/components/PipelineDiagram/Nodes/NodeDimensionStore'
import StepGroupNode from '@pipeline/components/PipelineDiagram/Nodes/StepGroupNode/StepGroupNode'
import { DiamondStepNode } from '@pipeline/components/PipelineDiagram/Nodes/DiamondNode/DiamondStepNode'
// import { ExecutionStepModel, GridStyleInterface } from './ExecutionStepModel'
import { StepType as PipelineStepType } from '../../PipelineSteps/PipelineStepInterface'
import {
  addStepOrGroup,
  ExecutionGraphState,
  StepState,
  getStepsState,
  removeStepOrGroup,
  // isLinkUnderStepGroup,
  getStepFromNode,
  generateRandomString,
  getDependenciesState,
  StepType,
  // getDependencyFromNode,
  DependenciesWrapper,
  getDefaultStepState,
  getDefaultStepGroupState,
  getDefaultDependencyServiceState,
  updateStepsState,
  updateDependenciesState,
  applyExistingStates,
  ExecutionWrapper,
  STATIC_SERVICE_GROUP_NAME,
  getDependencyFromNodeV1,
  isServiceDependenciesSupported
} from './ExecutionGraphUtil'
import { EmptyStageName } from '../PipelineConstants'
import {
  // CanvasWidget,
  // createEngine,
  // DefaultLinkEvent,
  // DefaultNodeEvent,
  // DefaultNodeModel,
  // DefaultNodeModelGenerics,
  DiagramType,
  Event,
  RollbackToggleSwitch,
  // StepGroupNodeLayerModel,
  // StepGroupNodeLayerOptions,
  StepsType
} from '../../Diagram'
// import { CanvasButtons } from '../../CanvasButtons/CanvasButtons'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import type {
  EventStepDataType,
  EventStepGroupDataType,
  EventStepOrGroupBaseType,
  ListenerStepReturnType
} from '../StageBuilder/StageBuilderUtil'
import css from './ExecutionGraph.module.scss'
import { isNodeTypeStepGroup } from '@pipeline/components/PipelineDiagram/Nodes/utils'
import type { StepGroupElementConfig } from 'services/pipeline-ng'

const diagram = new DiagramFactory<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, any>()
// any is EventStepStepGroupDataType
type StepNodeType = React.FC<
  CombinedNodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepDataType>
>

// const
diagram.registerNode('ShellScript', PipelineStepNode as unknown as StepNodeType, true)
diagram.registerNode(NodeType.CreateNode, CreateNodeStep as unknown as StepNodeType)
diagram.registerNode(NodeType.EndNode, EndNodeStep)
diagram.registerNode(NodeType.StartNode, StartNodeStep)
diagram.registerNode(
  'StepGroup',
  StepGroupNode as React.FC<
    CombinedNodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepGroupDataType>
  >
)
diagram.registerNode('Approval', DiamondStepNode as unknown as StepNodeType)
diagram.registerNode('JiraApproval', DiamondStepNode as unknown as StepNodeType)
diagram.registerNode('HarnessApproval', DiamondStepNode as unknown as StepNodeType)
diagram.registerNode('default-diamond', DiamondStepNode as unknown as StepNodeType)
diagram.registerNode('Barrier', IconNode as unknown as StepNodeType)
diagram.registerNode(STATIC_SERVICE_GROUP_NAME, CIDependencyNode as any)

export const CDPipelineStudioNew = diagram.render()

export interface ExecutionGraphRefObj {
  stepGroupUpdated: (stepOrGroup: ExecutionWrapper) => void
}

export type ExecutionGraphForwardRef =
  | ((instance: ExecutionGraphRefObj | null) => void)
  | React.MutableRefObject<ExecutionGraphRefObj | null>
  | null

interface Labels {
  addStep?: string
  addStepGroup?: string
  useTemplate?: string
}

interface PopoverData {
  event?: { entity: EventStepOrGroupBaseType }
  isParallelNodeClicked?: boolean
  labels?: Labels
  onPopoverSelection?: (
    isStepGroup: boolean,
    isParallelNodeClicked: boolean,
    event?: { entity: EventStepOrGroupBaseType },
    isTemplate?: boolean
  ) => void
  isHoverView?: boolean
  data?: ExecutionWrapper
}

const renderPopover = ({
  onPopoverSelection,
  isParallelNodeClicked = false,
  event,
  labels,
  isHoverView,
  data
}: PopoverData): JSX.Element => {
  if (isHoverView && !!(data as StepElementConfig)?.when) {
    return (
      <HoverCard>
        <ConditionalExecutionTooltip
          status={(data as StepElementConfig)?.when?.stageStatus}
          condition={(data as StepElementConfig)?.when?.condition}
          mode={Modes.STEP}
        />
      </HoverCard>
    )
  } else if (labels) {
    return (
      <>
        <Layout.Vertical className={css.addPopover} spacing="small" padding="small">
          {labels.addStep && (
            <Button
              minimal
              variation={ButtonVariation.PRIMARY}
              data-testid="addStepPipeline"
              icon="Edit"
              text={labels.addStep}
              onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event)}
            />
          )}
          {labels.addStepGroup && (
            <Button
              minimal
              variation={ButtonVariation.PRIMARY}
              icon="step-group"
              text={labels.addStepGroup}
              onClick={() => onPopoverSelection?.(true, isParallelNodeClicked, event)}
            />
          )}
          {labels.useTemplate && (
            <Button
              minimal
              variation={ButtonVariation.PRIMARY}
              icon="template-library"
              text={labels.useTemplate}
              onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event, true)}
            />
          )}
        </Layout.Vertical>
      </>
    )
  } else {
    return <></>
  }
}

export interface ExecutionGraphAddStepEvent {
  entity: EventStepOrGroupBaseType //DefaultNodeModel<DefaultNodeModelGenerics> //NOTE: this is a graph element
  isParallel: boolean
  stepsMap: Map<string, StepState>
  isRollback: boolean
  parentIdentifier?: string
  isTemplate?: boolean
}

export interface ExecutionGraphEditStepEvent {
  /** step or dependency model */
  node: ExecutionWrapper | DependenciesWrapper
  isStepGroup: boolean
  stepsMap: Map<string, StepState>
  isUnderStepGroup?: boolean
  addOrEdit: 'add' | 'edit'
  stepType: StepType | undefined
}

export interface ExecutionGraphProp<T extends StageElementConfig> {
  /*Allow adding group*/
  allowAddGroup?: boolean
  /*Hide or show rollback button*/
  hasRollback?: boolean
  /*Set to true if  model has spec.serviceDependencies array */
  hasDependencies?: boolean
  isReadonly: boolean
  stage: StageElementWrapper<T>
  originalStage?: StageElementWrapper<T>
  updateStage: (stage: StageElementWrapper<T>) => void
  onAddStep: (event: ExecutionGraphAddStepEvent) => void
  onEditStep: (event: ExecutionGraphEditStepEvent) => void
  selectedStepId?: string
  onSelectStep?: (stepId: string) => void
  rollBackPropsStyle?: React.CSSProperties
  rollBackBannerStyle?: React.CSSProperties
  canvasButtonsLayout?: 'horizontal' | 'vertical'
  templateTypes: { [key: string]: string }
}

function ExecutionGraphRef<T extends StageElementConfig>(
  props: ExecutionGraphProp<T>,
  ref: ExecutionGraphForwardRef
): JSX.Element {
  const {
    allowAddGroup = true,
    hasDependencies = false,
    hasRollback = true,
    stage,
    originalStage,
    updateStage,
    onAddStep,
    // isReadonly,
    onEditStep,
    onSelectStep,
    selectedStepId,
    rollBackPropsStyle = {},
    rollBackBannerStyle = {},
    canvasButtonsLayout,
    templateTypes
  } = props
  const {
    state: { pipelineView },
    getStagePathFromPipeline,
    updatePipelineView
  } = usePipelineContext()
  const newPipelineStudioEnabled: boolean = useFeatureFlag(FeatureFlag.NEW_PIPELINE_STUDIO)
  // NOTE: we are using ref as DynamicPopover use memo
  const stageCloneRef = React.useRef<StageElementWrapper<T>>({})
  stageCloneRef.current = cloneDeep(stage)
  const { trackEvent } = useTelemetry()

  const updateStageWithNewData = (stateToApply: ExecutionGraphState): void => {
    set(stageCloneRef.current, 'stage.spec.execution', stateToApply.stepsData)
    set(stageCloneRef.current, 'stage.spec.serviceDependencies', stateToApply.dependenciesData)
    updateStage(stageCloneRef.current)
  }

  const { getString } = useStrings()
  const { errorMap } = useValidationErrors()

  const addStep = (event: ExecutionGraphAddStepEvent): void => {
    onAddStep(event)
  }

  const editStep = (event: ExecutionGraphEditStepEvent): void => {
    onEditStep(event)
  }

  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const [state, setState] = React.useState<ExecutionGraphState>({
    states: new Map<string, StepState>(),
    stepsData: { steps: [], rollbackSteps: [] },
    dependenciesData: [],
    isRollback: false
  })

  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<PopoverData> | undefined
  >()

  const { showError } = useToaster()

  const onPopoverSelection = (
    isStepGroup: boolean,
    isParallelNodeClicked: boolean,
    event?: { entity: EventStepOrGroupBaseType },
    isTemplate = false
  ): void => {
    if (!isStepGroup && event) {
      addStep({
        entity: event.entity, // TODO--PRAT--expect string??
        isRollback: state.isRollback,
        stepsMap: state.states,
        isParallel: isParallelNodeClicked,
        isTemplate: isTemplate
      })
    } else if (event?.entity) {
      const node = {
        name: EmptyStageName,
        identifier: generateRandomString(EmptyStageName),
        steps: []
      }
      addStepOrGroup(
        event.entity,
        state.stepsData,
        {
          stepGroup: node
        },
        isParallelNodeClicked,
        state.isRollback
        // newPipelineStudioEnabled
      )
      editStep({
        node,
        isStepGroup: true,
        stepsMap: state.states,
        addOrEdit: 'edit',
        stepType: StepType.STEP
      })
      stepGroupUpdated(node)
      updateStageWithNewData(state)
    }
    dynamicPopoverHandler?.hide()
  }

  const handleAdd = (
    isParallel: boolean,
    el: Element,
    showStepGroup: boolean,
    event?: { entity: EventStepOrGroupBaseType },
    onHide?: () => void | undefined
  ): void => {
    const options: Labels = { addStep: getString('addStep') }
    if (allowAddGroup && showStepGroup) {
      options.addStepGroup = getString('addStepGroup')
    }
    options.useTemplate = getString('common.useTemplate')
    if (Object.keys(options).length === 1 && options.addStep) {
      onPopoverSelection(false, isParallel, event)
    } else {
      dynamicPopoverHandler?.show(
        el,
        {
          event,
          isParallelNodeClicked: isParallel,
          onPopoverSelection,
          labels: options
        },
        { useArrows: true, darkMode: true, fixedPosition: false },
        onHide
      )
    }
  }

  const dropNodeListenerNew = (event: EventStepOrGroupBaseType): void => {
    const identifier = event?.data?.nodeData?.data?.identifier as string
    const parentIdentifier = event?.data?.nodeData?.parentIdentifier as string

    if (identifier && event?.data?.nodeData) {
      const drop = getStepFromNode({
        stepData: state.stepsData,
        isComplete: true,
        isFindParallelNode: false,
        nodeId: identifier,
        parentId: parentIdentifier,
        isRollback: state.isRollback
      })
      const dropNode = drop?.node as ExecutionWrapperConfig
      const current = getStepFromNode({
        stepData: state.stepsData,
        // node: event?.entity,
        isComplete: true,
        isFindParallelNode: true,
        nodeId: event?.data?.destinationNode?.data?.identifier,
        parentId: event?.data?.destinationNode?.parentIdentifier, // TODO--PRAT-- destinatino parentIdentifer
        isRollback: state.isRollback
      }) as {
        node: ExecutionWrapperConfig
        parent?: ExecutionWrapperConfig[]
      }
      const skipFlattenIfSameParallel = drop.parent === current.node?.parallel
      // Check Drop Node and Current node should not be same
      if (identifier !== event?.data?.destinationNode?.data?.identifier && dropNode) {
        if (dropNode?.stepGroup && event?.data?.destinationNode?.parentIdentifier) {
          showError(getString('stepGroupInAnotherStepGroup'), undefined, 'pipeline.setgroup.error')
        } else {
          const isRemove = removeStepOrGroup({
            state,
            entity: event,
            skipFlatten: skipFlattenIfSameParallel,
            newPipelineStudioEnabled: newPipelineStudioEnabled,
            isRollback: state.isRollback
          })
          if (isRemove) {
            if (current.node) {
              if (
                event?.data?.nodeType === DiagramType.CreateNew &&
                // event?.destination?.isInsideStepGroup &&
                event?.data?.destinationNode?.nodeType === NodeType.StepGroupNode
                //  &&   event?.data?.destinationNode?.data?.length === 0 // Check
              ) {
                if (current.node.stepGroup) current.node.stepGroup.steps.push(dropNode)
                else if (current.node.parallel) {
                  const index = current.node.parallel.findIndex(
                    obj => obj?.stepGroup?.identifier === event?.data?.destinationNode?.data?.identifier
                  )
                  if (index > -1) {
                    current.node.parallel?.[index].stepGroup?.steps.push(dropNode)
                  }
                }
              } else if (current.parent && (current.node.step || current.node.stepGroup)) {
                const index = current.parent?.indexOf(current.node) ?? -1
                if (index > -1) {
                  // Remove current Stage also and make it parallel
                  current.parent?.splice(index, 1, { parallel: [current.node, dropNode] })
                  // updateStageWithNewData(state)
                }
              } else if (current.node.stepGroup && current.node.stepGroup?.steps?.length === 0) {
                current.node.stepGroup.steps.push(dropNode)
              } else if (current.node.parallel && (current.node.parallel?.length || 0) > 0) {
                current.node.parallel?.push?.(dropNode)
                // updateStageWithNewData(state)
              }
              updateStageWithNewData(state)
            } else {
              addStepOrGroup(
                {
                  ...event,
                  data: { nodeData: event?.data?.destinationNode as typeof event.data.nodeData }
                  //  node: { ...event?.destination }
                },
                state.stepsData,
                dropNode,
                false,
                state.isRollback
                // newPipelineStudioEnabled
              )
              updateStageWithNewData(state)
            }
          }
        }
      }
      // const dropEntity = model.getNodeFromId(event.node.id)
      // if (dropEntity) {
      // }
    }
  }
  const dragStart = (): void => {
    // const eventTemp = event
    // eventTemp.stopPropagation?.()
    dynamicPopoverHandler?.hide()
  }
  const mouseEnterNodeListener = (event: EventStepOrGroupBaseType): void => {
    const eventTemp = event
    // eventTemp.stopPropagation?.()
    dynamicPopoverHandler?.hide()
    const node = getStepFromNode({
      stepData: state.stepsData,
      // node: eventTemp.entity,
      nodeId: event?.data?.nodeData?.data?.identifier,
      isComplete: false,
      isFindParallelNode: false,
      isRollback: state.isRollback
    }).node as StepElementConfig
    const stepCondition = event?.data?.nodeData?.data?.when //get(eventTemp, 'data.data.step.when')
    const stepGroupCondition = get(eventTemp, 'data.data.stepGroup.when')
    const whenCondition = defaultTo(stepCondition || stepGroupCondition, node?.when)
    if (whenCondition) {
      const { stageStatus, condition } = whenCondition
      if (stageStatus === PipelineOrStageStatus.SUCCESS && isEmpty(condition)) {
        return
      }
      const stepData = get(eventTemp, 'data.data.step')
      const stepGroupData = get(eventTemp, 'data.data.stepGroup')
      dynamicPopoverHandler?.show(
        event.target as Element, // TODO--PRAT---CHECK type
        {
          event: defaultTo(get(eventTemp, 'data.data'), eventTemp),
          isHoverView: true,
          data: defaultTo(stepData || stepGroupData, node)
        },
        { useArrows: true, darkMode: false, fixedPosition: false, placement: 'top' }
      )
    }
  }

  const mouseLeaveNodeListener = (): void => {
    // const eventTemp = event as DefaultNodeEvent
    // eventTemp.stopPropagation?.()
    dynamicPopoverHandler?.hide()
  }

  const nodeListenersNew: ListenerStepReturnType = {
    [Event.ClickNode]: (event: EventStepOrGroupBaseType) => {
      // event = { ...event, ...event?.data }
      const identifier = event?.data?.nodeData?.data?.identifier as string
      const parentIdentifier = event?.data?.nodeData?.parentIdentifier as string
      const stepState = state?.states?.get(identifier)
      dynamicPopoverHandler?.hide()
      const nodeRender = document.querySelector(`[data-nodeid="${identifier}"]`)

      if (event?.data?.nodeType === DiagramType.CreateNew && nodeRender) {
        if (parentIdentifier === STATIC_SERVICE_GROUP_NAME) {
          addStep({
            entity: event,
            isRollback: state.isRollback,
            isParallel: false,
            stepsMap: state.states,
            parentIdentifier: parentIdentifier // (event.entity.getParent().getOptions() as StepGroupNodeLayerOptions).identifier
          })
        } else {
          handleAdd(false, nodeRender, !parentIdentifier, { entity: { ...event } })
        }
      } else if (stepState && stepState.isStepGroupCollapsed) {
        const stepStates = state.states.set(identifier, {
          ...stepState,
          isStepGroupCollapsed: !stepState.isStepGroupCollapsed
        })
        setState(prev => ({ ...prev, states: stepStates }))
      } else {
        let node: ExecutionWrapper | DependencyElement | undefined
        if (stepState?.stepType === StepType.STEP) {
          node = getStepFromNode({
            stepData: state.stepsData,
            isComplete: false,
            isFindParallelNode: false,
            nodeId: identifier,
            parentId: parentIdentifier,
            isRollback: state.isRollback
          }).node
        } else if (stepState?.stepType === StepType.SERVICE) {
          node = getDependencyFromNodeV1(state.dependenciesData, identifier).node
        }
        /* istanbul ignore else */ if (node) {
          editStep({
            node: node,
            isUnderStepGroup: Boolean(parentIdentifier),
            isStepGroup: false,
            stepsMap: state.states,
            addOrEdit: 'edit',
            stepType: stepState?.stepType
          })

          onSelectStep?.((node as DependencyElement).identifier)
        }
      }
    },
    [Event.RemoveNode]: (event: EventStepOrGroupBaseType) => {
      // event = { ...event, ...event?.data }
      dynamicPopoverHandler?.hide()
      const nodeData = event.data?.nodeData
      const isRemoved = removeStepOrGroup({
        state,
        entity: event,
        newPipelineStudioEnabled: newPipelineStudioEnabled,
        isRollback: state.isRollback
      })
      if (isRemoved) {
        const newStateMap = new Map<string, StepState>([...state.states])
        newStateMap.delete(nodeData?.data?.identifier as string)
        setState(prevState => ({
          ...prevState,
          states: newStateMap
        }))
        updateStageWithNewData(state)
        trackEvent(StepActions.DeleteStep, { type: event.data?.nodeType || '' })
      }
    },

    [Event.AddParallelNode]: (event: EventStepOrGroupBaseType) => {
      // event = { ...event, ...event?.data }
      // event.stopPropagation()
      const identifier = event?.data?.nodeData?.data?.identifier as string
      const parentIdentifier = event?.data?.nodeData?.parentIdentifier as string

      // const layer = parentIdentifier
      if (parentIdentifier) {
        const node = getStepFromNode({
          stepData: state.stepsData,
          isComplete: false,
          isFindParallelNode: false,
          nodeId: identifier,
          parentId: parentIdentifier,
          isRollback: state.isRollback
        }).node
        if (node) {
          handleAdd(true, event.target as Element, false, { entity: { ...event } }, (event as any).callback) // TODO--PRAT--check for callback
        }
      } else {
        /* istanbul ignore else */ if (event.target) {
          handleAdd(true, event.target as Element, true, { entity: { ...event } }, (event as any).callback)
        }
      }
    },
    [Event.DropNodeEvent]: dropNodeListenerNew,
    [Event.MouseEnterNode]: mouseEnterNodeListener,
    [Event.MouseLeaveNode]: mouseLeaveNodeListener
  }

  const linkListenersNew: ListenerStepReturnType = {
    [Event.AddLinkClicked]: (event: EventStepOrGroupBaseType) => {
      // event = { ...event, ...event?.data }
      // event.stopPropagation()
      const identifier = event?.data?.nodeData?.data?.identifier as string
      const parentIdentifier = event?.data?.nodeData?.parentIdentifier as string

      dynamicPopoverHandler?.hide()
      const targetEl = event?.target
      const linkRender = (targetEl as Element) || document.querySelector(`[data-linkid="${identifier}"]`) // TODO--PRAT-- (as Element vc EventTarget)
      // check if the link is under step group then directly show add Step
      if (parentIdentifier && linkRender) {
        handleAdd(false, linkRender, false, { entity: { ...event } })
      } else if (linkRender) {
        handleAdd(false, linkRender, true, { entity: { ...event } })
      }
    },
    [Event.DropLinkEvent]: (event: EventStepOrGroupBaseType) => {
      // event = { ...event, ...event?.data }
      if (event?.data?.nodeData?.data?.identifier === event.data?.destinationNode?.data?.identifier) {
        return
      }
      const stepDetails = event?.data?.nodeData?.data
      //  omit(event.node.data, [
      //   'conditionalExecutionEnabled',
      //   'graphType',
      //   'isInComplete',
      //   'isTemplateNode',
      //   'loopingStrategyEnabled'
      // ])
      const isRemove = removeStepOrGroup({
        state,
        entity: event,
        newPipelineStudioEnabled: newPipelineStudioEnabled,
        isRollback: state.isRollback
      })
      if (isRemove) {
        addStepOrGroup(
          event,
          state.stepsData,
          isNodeTypeStepGroup(stepDetails)
            ? { stepGroup: stepDetails as StepGroupElementConfig }
            : { step: stepDetails as StepElementConfig },
          false,
          state.isRollback
        )
        updateStageWithNewData(state)
      }
    }
  }
  const onRollbackToggleSwitchClick = (type: StepsType) => {
    const isRollbackToggled = type === StepsType.Rollback
    setState(prev => ({ ...prev, isRollback: isRollbackToggled }))
    updatePipelineView({ ...pipelineView, isRollbackToggled })
  }

  useEffect(() => {
    if (stageCloneRef.current?.stage?.spec?.execution) {
      const newStateMap = new Map<string, StepState>()
      getStepsState(stageCloneRef.current.stage.spec.execution, newStateMap)
      applyExistingStates(newStateMap, state.states)
      if (hasDependencies && (stageCloneRef.current?.stage as BuildStageElementConfig)?.spec?.serviceDependencies) {
        getDependenciesState(
          (stageCloneRef.current.stage as BuildStageElementConfig)?.spec?.serviceDependencies as any,
          newStateMap
        )
        applyExistingStates(newStateMap, state.states)
        if ((originalStage?.stage as BuildStageElementConfig)?.spec?.serviceDependencies) {
          updateDependenciesState(
            (originalStage!.stage as BuildStageElementConfig)?.spec?.serviceDependencies as any,
            newStateMap
          )
        }
      }
      if (originalStage?.stage?.spec?.execution) {
        updateStepsState(originalStage.stage.spec.execution, newStateMap)
      }

      setState(prevState => ({
        ...prevState,
        states: newStateMap
      }))
    }
  }, [originalStage, stage, ref])

  useEffect(() => {
    if (stageCloneRef.current?.stage?.spec?.execution) {
      setState(prevState => ({
        ...prevState,
        stepsData: (stageCloneRef.current.stage as BuildStageElementConfig).spec?.execution as ExecutionElementConfig,
        dependenciesData: (stageCloneRef.current.stage as BuildStageElementConfig)?.spec?.serviceDependencies as any
      }))
    }
  }, [stage, ref])

  const stepGroupUpdated = React.useCallback(
    stepOrGroup => {
      if (stepOrGroup.identifier) {
        const newStateMap = new Map<string, StepState>([...state.states])
        if (stepOrGroup.steps) {
          newStateMap.set(stepOrGroup.identifier, getDefaultStepGroupState())
        } else {
          newStateMap.set(
            stepOrGroup.identifier,
            stepOrGroup.type === PipelineStepType.Dependency
              ? getDefaultDependencyServiceState()
              : getDefaultStepState()
          )
        }
        setState(prev => ({ ...prev, states: newStateMap }))
      }
    },
    [state.states]
  )

  useEffect(() => {
    if (!ref) return

    if (typeof ref === 'function') {
      return
    }

    ref.current = {
      stepGroupUpdated
    }
  }, [ref, stepGroupUpdated])

  const canvasClick = () => {
    dynamicPopoverHandler?.hide()
  }

  const listerners = {
    [Event.ClickNode]: nodeListenersNew[Event.ClickNode],
    [Event.AddParallelNode]: nodeListenersNew[Event.AddParallelNode],
    [Event.AddLinkClicked]: linkListenersNew[Event.AddLinkClicked],
    [Event.RemoveNode]: nodeListenersNew[Event.RemoveNode],
    [Event.DropNodeEvent]: nodeListenersNew[Event.DropNodeEvent],
    [Event.DropLinkEvent]: linkListenersNew[Event.DropLinkEvent],
    [Event.CanvasClick]: canvasClick,
    [Event.MouseEnterNode]: mouseEnterNodeListener,
    [Event.MouseLeaveNode]: mouseLeaveNodeListener,
    [Event.DragStart]: dragStart,
    [Event.StepGroupClicked]: (event: EventStepOrGroupBaseType) => {
      const eventTemp = event
      // state.stepsData, eventTemp.data, undefined, undefined, event.data.identifier
      const node = getStepFromNode({
        stepData: state.stepsData,
        node: eventTemp.data,
        isComplete: false,
        isFindParallelNode: false,
        nodeId: event.data.identifier,
        isRollback: state.isRollback
      }).node
      if (node) {
        editStep({
          node: node,
          isStepGroup: true,
          addOrEdit: 'edit',
          stepsMap: state.states,
          stepType: StepType.STEP
        })
      }
    }
  }
  diagram.registerListeners(listerners)

  const stepsData = React.useMemo(() => {
    const serviceDependencies: DependencyElement[] | undefined = isServiceDependenciesSupported(
      stage?.stage?.type || ''
    )
      ? get(stage, 'stage.spec.serviceDependencies')
      : undefined

    const stagePath = getStagePathFromPipeline(stage?.stage?.identifier || '', 'pipeline.stages')

    return state?.isRollback
      ? getPipelineGraphData({
          data: stage?.stage?.spec?.execution?.rollbackSteps as ExecutionWrapperConfig[],
          templateTypes: templateTypes,
          serviceDependencies: undefined,
          errorMap: errorMap,
          parentPath: `${stagePath}.stage.spec.execution.rollbackSteps`
        })
      : getPipelineGraphData({
          data: stage?.stage?.spec?.execution?.steps as ExecutionWrapperConfig[],
          templateTypes: templateTypes,
          serviceDependencies: serviceDependencies,
          errorMap: errorMap,
          parentPath: `${stagePath}.stage.spec.execution.steps`
        })
  }, [stage, state?.isRollback, templateTypes])

  return (
    <div
      className={css.container}
      onClick={e => {
        const div = e.target as HTMLDivElement
        if (div === canvasRef.current?.children[0]) {
          dynamicPopoverHandler?.hide()
        }
      }}
    >
      <div className={css.canvas} ref={canvasRef}>
        {state.isRollback && (
          <Text font={{ size: 'medium' }} className={css.rollbackBanner} style={rollBackBannerStyle}>
            {getString('rollbackLabel')}
          </Text>
        )}
        {newPipelineStudioEnabled ? (
          <>
            <NodeDimensionProvider>
              <CDPipelineStudioNew
                parentSelector=".Pane2"
                selectedNodeId={selectedStepId}
                loaderComponent={DiagramLoader}
                data={stepsData}
                createNodeTitle={getString('addStep')}
                graphActionsLayout={canvasButtonsLayout}
                graphLinkClassname={css.graphLink}
              />
              {hasRollback && (
                <RollbackToggleSwitch
                  style={{ top: 62, ...rollBackPropsStyle, background: Color.WHITE }}
                  active={state.isRollback ? StepsType.Rollback : StepsType.Normal}
                  onChange={type => onRollbackToggleSwitchClick(type)}
                />
              )}
            </NodeDimensionProvider>
          </>
        ) : (
          <></>
        )}
        <DynamicPopover
          className={css.addStepPopover}
          darkMode={true}
          hoverShowDelay={200}
          render={renderPopover}
          bind={setDynamicPopoverHandler}
          usePortal
          portalClassName={css.portalVisibility}
          closeOnMouseOut
        />
      </div>
    </div>
  )
}

/**
 * As per https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref/58473012
 * Forward Ref components do not support generic out of the box
 */
const ExecutionGraph = React.forwardRef(ExecutionGraphRef) as <T extends StageElementConfig>(
  props: ExecutionGraphProp<T> & { ref?: ExecutionGraphForwardRef }
) => React.ReactElement
export default ExecutionGraph
