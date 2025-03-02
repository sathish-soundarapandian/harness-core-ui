/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { cloneDeep, set, isEmpty, get, defaultTo, omit } from 'lodash-es'
import { Color } from '@harness/design-system'
import { Button, ButtonVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
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
import {
  DiagramFactory,
  DiagramNodes,
  NodeType,
  BaseReactComponentProps
} from '@pipeline/components/PipelineDiagram/DiagramFactory'
import { DiamondNodeWidget } from '@pipeline/components/PipelineDiagram/Nodes/DiamondNode/DiamondNode'
import { getPipelineGraphData } from '@pipeline/components/PipelineDiagram/PipelineGraph/PipelineGraphUtils'
import PipelineStepNode from '@pipeline/components/PipelineDiagram/Nodes/DefaultNode/PipelineStepNode/PipelineStepNode'
import { IconNode } from '@pipeline/components/PipelineDiagram/Nodes/IconNode/IconNode'
import CreateNodeStep from '@pipeline/components/PipelineDiagram/Nodes/CreateNode/CreateNodeStep'
import EndNodeStep from '@pipeline/components/PipelineDiagram/Nodes/EndNode/EndNodeStep'
import StartNodeStep from '@pipeline/components/PipelineDiagram/Nodes/StartNode/StartNodeStep'
import { CIDependencyNode } from '@pipeline/components/PipelineDiagram/Nodes/StepGroupNode/CIDependencyNode'
import DiagramLoader from '@pipeline/components/DiagramLoader/DiagramLoader'
import { NodeDimensionProvider } from '@pipeline/components/PipelineDiagram/Nodes/NodeDimensionStore'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { StepType as ExecutionStepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { TemplateIcons } from '@pipeline/utils/types'
import { DiagramType, Event, StepsType } from '@pipeline/components/PipelineDiagram/Constants'
import { RollbackToggleSwitch } from '@pipeline/components/PipelineDiagram/RollbackToggleSwitch/RollbackToggleSwitch'
import { StepType as PipelineStepType } from '../../PipelineSteps/PipelineStepInterface'
import {
  addStepOrGroup,
  ExecutionGraphState,
  StepState,
  getStepsState,
  removeStepOrGroup,
  getStepFromNode,
  generateRandomString,
  getDependenciesState,
  StepType,
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
  isServiceDependenciesSupported,
  getStepFromId
} from './ExecutionGraphUtil'
import { EmptyStageName } from '../PipelineConstants'

import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { getFlattenedSteps } from '../CommonUtils/CommonUtils'
import css from './ExecutionGraph.module.scss'

const diagram = new DiagramFactory('graph')

diagram.registerNode('ShellScript', PipelineStepNode as React.FC<BaseReactComponentProps>, true)
diagram.registerNode(NodeType.CreateNode, CreateNodeStep as unknown as React.FC<BaseReactComponentProps>)
diagram.registerNode(NodeType.EndNode, EndNodeStep)
diagram.registerNode(NodeType.StartNode, StartNodeStep)
diagram.registerNode('StepGroup', DiagramNodes[NodeType.StepGroupNode])
diagram.registerNode('Approval', DiamondNodeWidget)
diagram.registerNode('JiraApproval', DiamondNodeWidget)
diagram.registerNode('HarnessApproval', DiamondNodeWidget)
diagram.registerNode('default-diamond', DiamondNodeWidget)
diagram.registerNode('Barrier', IconNode)
diagram.registerNode(STATIC_SERVICE_GROUP_NAME, CIDependencyNode)

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
  addLinkedTemplates?: string
}

interface PopoverData {
  event?: any
  isParallelNodeClicked?: boolean
  labels?: Labels
  onPopoverSelection?: (
    isStepGroup: boolean,
    isParallelNodeClicked: boolean,
    event?: any,
    isTemplate?: boolean,
    isLinkedTemplate?: boolean
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
          {labels.addLinkedTemplates && (
            <RbacButton
              minimal
              variation={ButtonVariation.PRIMARY}
              icon="plus"
              text={labels.addLinkedTemplates}
              onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event, true, true)}
              featuresProps={{
                featuresRequest: {
                  featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
                }
              }}
            />
          )}
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
            <RbacButton
              minimal
              variation={ButtonVariation.PRIMARY}
              icon="template-library"
              text={labels.useTemplate}
              onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event, true)}
              featuresProps={{
                featuresRequest: {
                  featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
                }
              }}
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
  entity: any //NOTE: this is a graph element
  isParallel: boolean
  stepsMap: Map<string, StepState>
  isRollback: boolean
  parentIdentifier?: string
  isTemplate?: boolean
  isLinkedTemplate?: boolean
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
  templateIcons?: TemplateIcons
  addLinkedTemplatesLabel?: string
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
    isReadonly,
    onEditStep,
    onSelectStep,
    selectedStepId,
    rollBackPropsStyle = {},
    rollBackBannerStyle = {},
    canvasButtonsLayout,
    templateTypes,
    templateIcons,
    addLinkedTemplatesLabel
  } = props
  const {
    state: { pipelineView },
    getStagePathFromPipeline,
    updatePipelineView
  } = usePipelineContext()
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

  const onPopoverSelection = (
    isStepGroup: boolean,
    isParallelNodeClicked: boolean,
    event?: any,
    isTemplate = false,
    isLinkedTemplate = false
  ): void => {
    if (!isStepGroup && event) {
      addStep({
        entity: event.entity,
        isRollback: state.isRollback,
        stepsMap: state.states,
        isParallel: isParallelNodeClicked,
        isTemplate: isTemplate,
        isLinkedTemplate
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
    event?: any,
    onHide?: () => void | undefined
  ): void => {
    const options: Labels = { addStep: getString('addStep') }
    if (allowAddGroup && showStepGroup) {
      options.addStepGroup = getString('addStepGroup')
    }
    options.useTemplate = getString('common.useTemplate')
    if (!isEmpty(addLinkedTemplatesLabel)) {
      options.addLinkedTemplates = addLinkedTemplatesLabel
    }
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

  const dropNodeListenerNew = (event: any): void => {
    event = { ...event, ...event?.data }
    if (event?.node?.identifier && event?.node?.data) {
      const drop = getStepFromNode({
        stepData: state.stepsData,
        isComplete: true,
        isFindParallelNode: false,
        nodeId: event?.node?.identifier,
        parentId: event?.node?.parentIdentifier,
        isRollback: state.isRollback
      })
      const dropNode = drop?.node as ExecutionWrapperConfig
      const current = getStepFromNode({
        stepData: state.stepsData,
        node: event?.entity,
        isComplete: true,
        isFindParallelNode: true,
        nodeId: event?.destination?.identifier,
        parentId: event?.destination?.parentIdentifier,
        isRollback: state.isRollback
      }) as {
        node: ExecutionWrapperConfig
        parent?: ExecutionWrapperConfig[]
      }
      const skipFlattenIfSameParallel = drop.parent === current.node?.parallel
      // Check Drop Node and Current node should not be same
      if (event.node?.identifier !== event?.destination?.identifier && dropNode) {
        const isRemove = removeStepOrGroup({
          state,
          entity: event,
          skipFlatten: skipFlattenIfSameParallel,
          isRollback: state.isRollback
        })
        if (isRemove) {
          if (current.node) {
            if (
              event?.entityType === DiagramType.CreateNew &&
              event?.destination?.isInsideStepGroup &&
              event?.destination?.nodeType === NodeType.StepGroupNode &&
              event?.destination?.data?.length === 0
            ) {
              if (current.node.stepGroup) current.node.stepGroup.steps?.push(dropNode)
              else if (current.node.parallel) {
                const index = current.node.parallel.findIndex(
                  obj => obj?.stepGroup?.identifier === event?.destination?.identifier
                )
                if (index > -1) {
                  current.node.parallel?.[index].stepGroup?.steps?.push(dropNode)
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
              { ...event, node: { ...event?.destination } },
              state.stepsData,
              dropNode,
              false,
              state.isRollback
            )
            updateStageWithNewData(state)
          }
        }
      }
      // const dropEntity = model.getNodeFromId(event.node.id)
      // if (dropEntity) {
      // }
    }
  }
  const dragStart = (event: any): void => {
    const eventTemp = event as any
    eventTemp.stopPropagation?.()
    dynamicPopoverHandler?.hide()
  }
  const mouseEnterNodeListener = (event: any): void => {
    const eventTemp = event as any
    eventTemp.stopPropagation?.()
    dynamicPopoverHandler?.hide()
    const node = getStepFromNode({
      stepData: state.stepsData,
      node: eventTemp.entity,
      isComplete: false,
      isFindParallelNode: false,
      isRollback: state.isRollback
    }).node as StepElementConfig
    const stepCondition = get(eventTemp, 'data.data.step.when')
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
        eventTemp.target,
        {
          event: defaultTo(get(eventTemp, 'data.data'), eventTemp),
          isHoverView: true,
          data: defaultTo(stepData || stepGroupData, node)
        },
        { useArrows: true, darkMode: false, fixedPosition: false, placement: 'top' }
      )
    }
  }

  const mouseLeaveNodeListener = (event: any): void => {
    const eventTemp = event as any
    eventTemp.stopPropagation?.()
    dynamicPopoverHandler?.hide()
  }

  const nodeListenersNew: any = {
    [Event.ClickNode]: (event: any) => {
      event = { ...event, ...event?.data }
      const stepState = state?.states?.get(event?.identifier)
      dynamicPopoverHandler?.hide()
      const nodeRender = document.querySelector(`[data-nodeid="${event?.identifier}"]`)

      if (event?.entityType === DiagramType.CreateNew && nodeRender) {
        if (event?.parentIdentifier === STATIC_SERVICE_GROUP_NAME) {
          addStep({
            entity: event.entity,
            isRollback: state.isRollback,
            isParallel: false,
            stepsMap: state.states,
            parentIdentifier: event?.parentIdentifier // (event.entity.getParent().getOptions() as StepGroupNodeLayerOptions).identifier
          })
        } else {
          handleAdd(false, nodeRender, true, { entity: { ...event } })
        }
      } else if (stepState && stepState.isStepGroupCollapsed) {
        const stepStates = state.states.set(event?.identifier, {
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
            nodeId: event?.identifier,
            parentId: event?.parentIdentifier,
            isRollback: state.isRollback
          }).node
        } else if (stepState?.stepType === StepType.SERVICE) {
          node = getDependencyFromNodeV1(state.dependenciesData, event?.identifier).node
        }
        /* istanbul ignore else */ if (node) {
          editStep({
            node: node,
            isUnderStepGroup: event?.parentIdentifier,
            isStepGroup: false,
            stepsMap: state.states,
            addOrEdit: 'edit',
            stepType: stepState?.stepType
          })

          onSelectStep?.((node as DependencyElement).identifier)
        }
      }
    },
    [Event.RemoveNode]: (event: any) => {
      event = { ...event, ...event?.data }
      dynamicPopoverHandler?.hide()

      const isRemoved = removeStepOrGroup({
        state,
        entity: event,
        isRollback: state.isRollback
      })
      if (isRemoved) {
        const newStateMap = new Map<string, StepState>([...state.states])
        newStateMap.delete(event?.identifier)
        setState(prevState => ({
          ...prevState,
          states: newStateMap
        }))

        // If after removing step, all steps in step group are of Command type
        // then add repeat looping strategy for the step group
        if (event?.node?.parentIdentifier) {
          const parentStepGroupNode = getStepFromId(
            state.stepsData,
            defaultTo(event?.node?.parentIdentifier, ''),
            false,
            false,
            state.isRollback
          ).node
          if (parentStepGroupNode) {
            const allSteps = parentStepGroupNode.steps
            const allFlattenedSteps = getFlattenedSteps(allSteps)
            if (!isEmpty(allFlattenedSteps)) {
              const commandSteps = allFlattenedSteps.filter(
                (currStep: StepElementConfig) => currStep.type === ExecutionStepType.Command
              )
              if (
                (commandSteps.length === allFlattenedSteps.length &&
                  !isEmpty(parentStepGroupNode.strategy) &&
                  !parentStepGroupNode.strategy?.repeat) ||
                (commandSteps.length === allFlattenedSteps.length && isEmpty(parentStepGroupNode.strategy))
              ) {
                parentStepGroupNode['strategy'] = {
                  repeat: {
                    items: '<+stage.output.hosts>' as any, // used any because BE needs string variable while they can not change type
                    maxConcurrency: 1,
                    start: 0,
                    end: 1,
                    unit: 'Count'
                  }
                }
              }
            }
          }
        }

        updateStageWithNewData(state)
        trackEvent(StepActions.DeleteStep, { type: event?.entityType || '' })
      }
    },
    [Event.AddParallelNode]: (event: any) => {
      event = { ...event, ...event?.data }
      // event.stopPropagation()
      const layer = event?.parentIdentifier
      if (layer) {
        const node = getStepFromNode({
          stepData: state.stepsData,
          isComplete: false,
          isFindParallelNode: false,
          nodeId: event?.identifier,
          parentId: event?.parentIdentifier,
          isRollback: state.isRollback
        }).node
        if (node) {
          handleAdd(true, event.target, true, { entity: { ...event } }, event.callback)
        }
      } else {
        /* istanbul ignore else */ if (event.target) {
          handleAdd(true, event.target, true, { entity: { ...event } }, event.callback)
        }
      }
    },
    [Event.DropNodeEvent]: dropNodeListenerNew,
    [Event.MouseEnterNode]: mouseEnterNodeListener,
    [Event.MouseLeaveNode]: mouseLeaveNodeListener
  }

  const linkListenersNew: any = {
    [Event.AddLinkClicked]: (event: any) => {
      event = { ...event, ...event?.data }
      // event.stopPropagation()
      dynamicPopoverHandler?.hide()
      const targetEl = event?.target
      const linkRender = targetEl || document.querySelector(`[data-linkid="${event.identifier}"]`)
      if (linkRender) {
        handleAdd(false, linkRender, true, { entity: { ...event } })
      }
    },
    [Event.DropLinkEvent]: (event: any) => {
      event = { ...event, ...event?.data }
      if (event.node?.identifier === event.destination?.identifier) {
        return
      }
      const stepDetails = omit(event.node.data, [
        'conditionalExecutionEnabled',
        'graphType',
        'isInComplete',
        'isTemplateNode',
        'loopingStrategyEnabled',
        'isNestedGroup',
        'nodeType',
        'type',
        'fqnPath'
      ])
      const isRemove = removeStepOrGroup({
        state,
        entity: event,
        isRollback: state.isRollback
      })
      if (isRemove) {
        addStepOrGroup(
          { ...event, node: { ...event?.destination } },
          state.stepsData,
          stepDetails,
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

  // renderParallelNodes(model)

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

  const canvasClick = (): void => {
    dynamicPopoverHandler?.hide()
  }

  const listerners = {
    [Event.ClickNode]: nodeListenersNew[Event.ClickNode],
    [Event.AddParallelNode]: nodeListenersNew[Event.AddParallelNode],
    [Event.DropNodeEvent]: nodeListenersNew[Event.DropNodeEvent],
    [Event.RemoveNode]: nodeListenersNew[Event.RemoveNode],
    [Event.AddLinkClicked]: linkListenersNew[Event.AddLinkClicked],
    [Event.DropLinkEvent]: linkListenersNew[Event.DropLinkEvent],
    [Event.CanvasClick]: canvasClick,
    [Event.MouseEnterNode]: mouseEnterNodeListener,
    [Event.MouseLeaveNode]: mouseLeaveNodeListener,
    [Event.DragStart]: dragStart,
    [Event.StepGroupClicked]: (event: any) => {
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
          templateIcons,
          serviceDependencies: undefined,
          errorMap: errorMap,
          parentPath: `${stagePath}.stage.spec.execution.rollbackSteps`
        })
      : getPipelineGraphData({
          data: stage?.stage?.spec?.execution?.steps as ExecutionWrapperConfig[],
          templateTypes: templateTypes,
          templateIcons,
          serviceDependencies: serviceDependencies,
          errorMap: errorMap,
          parentPath: `${stagePath}.stage.spec.execution.steps`
        })
  }, [stage, state?.isRollback, templateTypes, templateIcons])

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

        <>
          <NodeDimensionProvider>
            <CDPipelineStudioNew
              readonly={isReadonly}
              parentSelector=".Pane2"
              selectedNodeId={selectedStepId}
              loaderComponent={DiagramLoader}
              data={stepsData}
              createNodeTitle={getString('addStep')}
              graphActionsLayout={canvasButtonsLayout}
              graphLinkClassname={css.graphLink}
              optimizeRender={false}
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

        <DynamicPopover
          className={css.addStepPopover}
          darkMode={true}
          hoverShowDelay={200}
          render={renderPopover}
          bind={setDynamicPopoverHandler}
          usePortal
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
