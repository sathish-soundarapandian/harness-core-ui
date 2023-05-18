/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { flatMap, findIndex, cloneDeep, set, noop, isEmpty } from 'lodash-es'
import { Utils } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { v4 as uuid } from 'uuid'
import type { NodeModelListener, LinkModelListener, DiagramEngine } from '@projectstorm/react-diagrams-core'
import produce from 'immer'
import { parse } from '@common/utils/YamlHelperMethods'
import type { PageConnectorResponse, DeploymentStageConfig } from 'services/cd-ng'
import type {
  StageElementWrapperConfig,
  PipelineInfoConfig,
  StageElementConfig,
  StepElementConfig,
  StepGroupElementConfig
} from 'services/pipeline-ng'
import type * as Diagram from '@pipeline/components/Diagram'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type {
  DeploymentStageElementConfig,
  PipelineStageWrapper,
  StageElementWrapper
} from '@pipeline/utils/pipelineTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { DiagramType, Event } from '@pipeline/components/Diagram'
import { PipelineOrStageStatus } from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import type { BaseEvent } from '@pipeline/components/PipelineDiagram/types'
import { EmptyStageName } from '../PipelineConstants'
import type { PipelineContextInterface, StagesMap } from '../PipelineContext/PipelineContext'
import { getStageFromPipeline } from '../PipelineContext/helpers'

export interface StageState {
  isConfigured: boolean
  stage: StageElementWrapperConfig
}

export enum MoveDirection {
  AHEAD,
  BEHIND
}

export enum DiagramTypes {
  GRAPH = 'graph',
  TREE = 'tree'
}
export type AddStage = (
  newStage: StageElementWrapperConfig,
  isParallel?: boolean,
  event?: Diagram.DefaultNodeEvent,
  insertAt?: number,
  openSetupAfterAdd?: boolean,
  pipeline?: PipelineInfoConfig
) => void

export type AddStageNew = (
  newStage: StageElementWrapper,
  isParallel?: boolean,
  droppedOnLink?: boolean,
  insertAt?: number,
  openSetupAfterAdd?: boolean,
  pipelineTemp?: PipelineInfoConfig,
  destinationNode?: StageElementWrapper
) => void
export interface PopoverData {
  data?: StageElementWrapperConfig
  isStageView: boolean
  contextType?: string
  groupStages?: StageElementWrapperConfig[]
  isGroupStage?: boolean
  stagesMap: StagesMap
  groupSelectedStageId?: string
  isParallel?: boolean
  event?: EventStageBaseType
  addStage?: AddStage
  addStageNew?: AddStageNew
  onSubmitPrimaryData?: (values: StageElementWrapperConfig, identifier: string) => void
  onClickGroupStage?: (stageId: string, type: StageType) => void
  renderPipelineStage: PipelineContextInterface['renderPipelineStage']
  isHoverView?: boolean
  templateTypes: { [key: string]: string }
  newPipelineStudioEnabled?: boolean
}

export const getStageIndexByIdentifier = (
  pipeline: PipelineInfoConfig,
  identifier?: string
): { stageIndex: number; parallelStageIndex: number } => {
  const stageDetails = { stageIndex: -1, parallelStageIndex: -1 }
  if (!identifier) {
    return stageDetails
  }
  if (pipeline?.stages) {
    for (const [index, stage] of pipeline.stages.entries()) {
      if (stage?.stage?.identifier === identifier) {
        stageDetails.stageIndex = index
        break
      }
      if (stage?.parallel) {
        const targetStageIndex = stage.parallel.findIndex(pstage => pstage.stage?.identifier === identifier)
        if (targetStageIndex > -1) {
          stageDetails.stageIndex = index
          stageDetails.parallelStageIndex = targetStageIndex
          break
        }
      }
    }
  }
  return stageDetails
}

export const getNewStageFromTemplate = (
  template: TemplateSummaryResponse,
  clearDefaultValues = false
): StageElementWrapperConfig => {
  return {
    stage: {
      ...parse<any>(template?.yaml || '')?.template.spec,
      name: clearDefaultValues ? '' : EmptyStageName,
      identifier: clearDefaultValues ? '' : uuid()
    }
  }
}

export const getNewStageFromType = (type: string, clearDefaultValues = false): StageElementWrapperConfig => {
  // TODO: replace string with type
  if (type === 'ci') {
    return {
      stage: {
        name: clearDefaultValues ? '' : EmptyStageName,
        identifier: clearDefaultValues ? '' : uuid(),
        description: '',
        type: type,
        spec: {
          serviceDependencies: [],
          execution: {}
        } as any
      }
    }
  }

  return {
    stage: {
      name: clearDefaultValues ? '' : EmptyStageName,
      identifier: clearDefaultValues ? '' : uuid(),
      description: '',
      type: type,
      spec: {}
    }
  }
}

export interface Listeners {
  nodeListeners: NodeModelListener
  linkListeners: LinkModelListener
}

export const EmptyNodeSeparator = '$node$'

export const getCommonStyles = (isSelected: boolean): React.CSSProperties => ({
  background: isSelected ? 'var(--pipeline-selected-node)' : Utils.getRealCSSColor(Color.WHITE),
  borderColor: isSelected ? 'var(--diagram-selected)' : 'var(--pipeline-grey-border)',
  borderWidth: isSelected ? '2px' : '1px'
})

export const getStatus = (
  connectorRef: string,
  fetchedConnectorResponse: PageConnectorResponse | undefined,
  accountId: string
): { status?: string; color: string } => {
  if (!connectorRef || !fetchedConnectorResponse) {
    return { status: '', color: '' }
  }

  const connectorScope = getScopeFromValue(connectorRef)
  const connector = getIdentifierFromValue(connectorRef)
  const filteredConnector = fetchedConnectorResponse?.content?.find(item => item.connector?.identifier === connector)
  const scope = getScopeFromDTO({
    accountIdentifier: accountId,
    orgIdentifier: filteredConnector?.connector?.orgIdentifier,
    projectIdentifier: filteredConnector?.connector?.projectIdentifier
  })

  const status = scope === connectorScope ? filteredConnector?.status?.status : ''
  const color = status && status === 'FAILURE' ? Color.RED_500 : status ? Color.GREEN_500 : ''
  return { status, color }
}

export const getStageIndexFromPipeline = (data: PipelineInfoConfig, identifier?: string): { index: number } => {
  let _index = 0

  const { stages } = getFlattenedStages(data)

  _index = findIndex(stages, o => o.stage?.identifier === identifier)
  return { index: _index }
}

export const getStageIndexWithParallelNodesFromPipeline = (
  data: PipelineInfoConfig,
  identifier?: string
): { index: number; parIndex: number } => {
  let _parIndex = 0
  let _index = 0
  data?.stages?.forEach((stage: StageElementWrapperConfig, parIndex: number) => {
    if (stage?.stage && stage?.stage?.identifier === identifier) {
      _parIndex = parIndex
      _index = 0
    } else if (stage?.parallel) {
      stage?.parallel?.forEach((parallelStageNode: StageElementWrapperConfig, index: number) => {
        if (parallelStageNode?.stage?.identifier === identifier) {
          _parIndex = parIndex
          _index = index
        }
      })
    }
  })

  return { index: _index, parIndex: _parIndex }
}

export const getFlattenedStages = (
  data: Partial<PipelineInfoConfig>
): {
  stages: StageElementWrapperConfig[]
} => {
  let stages = []
  stages = flatMap(data?.stages || [], (n: StageElementWrapperConfig) => {
    const k = []
    if (n.parallel) {
      k.push(...n['parallel'])
    } else {
      k.push(n)
    }
    return k
  })
  return { stages }
}

export const mayBeStripCIProps = (pipeline: PipelineInfoConfig): boolean => {
  // no CI stages exist
  const areCIStagesAbsent = pipeline?.stages?.every(stage => stage.stage?.type !== 'CI')
  if (areCIStagesAbsent) {
    const props = Object.keys(pipeline.properties || {})
    // figure out if only properties that are left is related to ci
    const isCIOnly = props.length === 1 && props[0] === 'ci'
    if (isCIOnly) {
      return delete pipeline.properties
    }
    // otherwise figure out if properties object has a ci prop
    const hasCI = props.some(prop => prop === 'ci')
    if (hasCI && pipeline.properties?.ci) {
      return delete pipeline.properties.ci
    }
  }
  return false
}

export const removeNodeFromPipeline = (
  nodeResponse: { stage?: StageElementWrapperConfig; parent?: StageElementWrapperConfig },
  data: PipelineInfoConfig,
  stageMap?: Map<string, StageState>,
  updateStateMap = true
): boolean => {
  const { stage: node, parent } = nodeResponse
  if (node && data.stages) {
    const index = data.stages.indexOf(node)
    if (index > -1) {
      data?.stages?.splice(index, 1)
      if (updateStateMap) {
        stageMap?.delete(node.stage?.identifier || '')

        data.stages?.map(currentStage => {
          const spec = currentStage.stage?.spec as DeploymentStageConfig
          if (spec?.serviceConfig?.useFromStage?.stage === node?.stage?.identifier) {
            spec.serviceConfig = {}
          }
        })
      }
      return true
    } else if (parent?.parallel) {
      const parallelIndex = parent.parallel?.indexOf(node)
      if (parallelIndex > -1) {
        parent.parallel.splice(parallelIndex, 1)
        if (parent.parallel.length === 0) {
          const emptyParallel = data?.stages?.indexOf(parent)
          if (emptyParallel !== undefined && emptyParallel > -1) {
            data?.stages?.splice(emptyParallel, 1)
          }
        } else if (parent.parallel.length === 1) {
          const oneStageParallel = data?.stages?.indexOf(parent)
          if (oneStageParallel !== undefined && oneStageParallel > -1) {
            data?.stages?.splice(oneStageParallel, 1, parent.parallel[0])
          }
        }
        if (updateStateMap) {
          stageMap?.delete(node.stage?.identifier || '')
        }
        return true
      }
    }
  }
  return false
}
export const getDependantStages = (pipeline: PipelineInfoConfig, node?: StageElementWrapper): string[] => {
  const dependantStages: string[] = []
  const flattenedStages = getFlattenedStages(pipeline).stages

  flattenedStages?.forEach(currentStage => {
    if (
      (currentStage.stage?.spec as DeploymentStageConfig)?.serviceConfig?.useFromStage?.stage ===
      node?.stage?.identifier
    ) {
      dependantStages.push(currentStage.stage?.name || '')
    }
  })
  return dependantStages
}
export const resetDiagram = (engine: DiagramEngine): void => {
  engine.getModel().setZoomLevel(100)
  engine.getModel().setOffset(0, 0)
  engine.repaintCanvas()
}

export const isDuplicateStageId = (id: string, stages: StageElementWrapperConfig[], updateMode?: boolean): boolean => {
  const flattenedStages = getFlattenedStages({
    stages
  })
  if (!updateMode) return flattenedStages.stages?.some(({ stage }) => stage?.identifier === id)
  let duplicatesCount = 0
  for (const stage of flattenedStages.stages) {
    if (stage.stage?.identifier === id) {
      duplicatesCount++
    }
  }
  return duplicatesCount > 1
}

export const getConnectorNameFromValue = (
  connectorRef: string,
  fetchedConnectorResponse: PageConnectorResponse | undefined
): string | undefined => {
  if (!connectorRef || !fetchedConnectorResponse) {
    return undefined
  }

  const connector = getIdentifierFromValue(connectorRef)
  const filteredConnector = fetchedConnectorResponse?.content?.find(item => item.connector?.identifier === connector)
  const connectorName = filteredConnector?.connector?.name
  return connectorName
}

export const resetServiceSelectionForStages = (
  stages: string[] = [],
  pipeline: PipelineInfoConfig
): StageElementWrapperConfig[] => {
  const stagesCopy = cloneDeep(pipeline.stages) || []
  stages.forEach(stageId => {
    const { stage, parent = null } = getStageFromPipeline(stageId, pipeline)
    const parentStageId = (stage?.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.useFromStage?.stage
    const { stageIndex: propagatingParentIndex } = getStageIndexByIdentifier(pipeline, parentStageId)
    if (!stage) {
      return
    }

    if (parent) {
      const { parallelStageIndex, stageIndex: parentStageIndex } = getStageIndexByIdentifier(pipeline, stageId)
      const updatedStage = resetStageServiceSpec(stagesCopy?.[parentStageIndex]?.parallel?.[parallelStageIndex] || {})
      set(stagesCopy, `${parentStageIndex}.parallel.${parallelStageIndex}`, updatedStage)
      return
    }
    let stageIndex = pipeline.stages?.indexOf(stage)
    stageIndex = stageIndex !== undefined ? stageIndex : -1
    if (stageIndex <= propagatingParentIndex) {
      const updatedStage = resetStageServiceSpec(stage)
      stagesCopy[stageIndex] = updatedStage
    }
  })
  return stagesCopy
}

export const getAffectedDependentStages = (
  dependentStages: string[] = [],
  dropIndex: number,
  pipeline: PipelineInfoConfig,
  parallelStageIndex = -1
): string[] => {
  const affectedStages: Set<string> = new Set()
  dependentStages.forEach(stageId => {
    const { stage: currentStage, parent = null } = getStageFromPipeline(stageId, pipeline)
    if (!currentStage) {
      return false
    }
    if (parent) {
      parent?.parallel?.forEach((pStageId: StageElementWrapperConfig, index: number) => {
        const stageIndex = dependentStages.indexOf(pStageId?.stage?.identifier || '')
        if (parallelStageIndex !== -1) {
          stageIndex > -1 && index <= parallelStageIndex && affectedStages.add(stageId)
        } else {
          stageIndex > -1 && index <= dropIndex && affectedStages.add(stageId)
        }
      })
      return
    }
    const stageIndex = pipeline.stages?.indexOf(currentStage || {})

    if (stageIndex !== undefined && stageIndex > -1) {
      return stageIndex <= dropIndex && affectedStages.add(stageId)
    }
    return
  })
  return [...affectedStages]
}

export const resetStageServiceSpec = (stage: StageElementWrapperConfig): StageElementWrapperConfig =>
  produce(stage, draft => {
    const spec = (draft.stage?.spec as DeploymentStageConfig) || {}
    spec.serviceConfig = {
      serviceRef: '',
      serviceDefinition: {
        type: 'Kubernetes',
        spec: {
          artifacts: {
            sidecars: []
          },
          manifests: []
        }
      }
    }
  })

export interface EventProps<T, U> {
  //refactor later
  nodeType?: string // TODO--PRAT-- move inside nodeData
  // parentIdentifier?: string
  metaData?: {
    prevNode?: T
    nextNode?: T
  }
  nodeData: {
    id: string
    data?: T
    metaData?: U
    parentIdentifier?: string //TODO--PRAT--//remove | undefined //TODO--PRAT--//remove
  }
  destinationNode?: {
    id: string
    data?: T
    metaData?: U
    parentIdentifier?: string //TODO--PRAT--//remove | undefined //TODO--PRAT--//remove
    nodeType?: string // Needed for stepGroup case
  }
}

export interface EventMetaDataProps {
  hasChildren?: boolean
  isParallelNode?: boolean
  isRightAddIcon?: boolean
}

export type EventStageDataType = EventProps<StageElementConfig, EventMetaDataProps>
export type EventStepDataType = EventProps<StepElementConfig, EventMetaDataProps>
export type EventStepGroupDataType = EventProps<StepGroupElementConfig, EventMetaDataProps>
export type EventStepStepGroupDataType = EventStepDataType | EventStepGroupDataType

export type EventDataType = EventStageDataType | EventStepDataType | EventStepGroupDataType
export type EventWithBaseType = BaseEvent<EventDataType>

// stage types
export type EventStageBaseType = BaseEvent<EventStageDataType>
// stage type
export type EventStepOrGroupBaseType = BaseEvent<EventStepDataType | EventStepGroupDataType>
export interface ListenerReturnType {
  [key: string]: (E: EventWithBaseType) => void
}

// step/stepGroup return type
export interface ListenerStepReturnType {
  [key: string]: (E: EventStepOrGroupBaseType) => void
}

export interface ListenerReturnTypeForStage {
  [key: string]: (E: EventStageBaseType) => void
}

// check new
export const getLinkEventListeners = (
  dynamicPopoverHandler: DynamicPopoverHandlerBinding<PopoverData> | undefined,
  pipelineContext: PipelineContextInterface,
  addStageNew: (
    newStage: StageElementWrapper,
    isParallel?: boolean,
    droppedOnLink?: boolean,
    insertAt?: number,
    openSetupAfterAdd?: boolean,
    pipelineTemp?: PipelineInfoConfig,
    destinationNode?: StageElementWrapper
  ) => void,
  updateMoveStageDetails: (moveStageDetails: MoveStageDetailsType) => void,
  confirmMoveStage: () => void,
  stageMap: Map<string, StageState>,
  newPipelineStudioEnabled?: boolean
): ListenerReturnTypeForStage => {
  const {
    state: { pipeline, templateTypes },
    contextType = 'Pipeline',
    stagesMap,
    renderPipelineStage,
    getStageFromPipeline: getStageFromPipelineContext
  } = pipelineContext

  return {
    [Event.AddLinkClicked]: (event: EventStageBaseType) => {
      dynamicPopoverHandler?.hide()
      const { setSelection } = pipelineContext
      const nodeData = event?.data?.nodeData
      if (nodeData?.id) {
        setSelection({ stageId: undefined, sectionId: undefined })

        dynamicPopoverHandler?.show(
          `[data-linkid="${nodeData.id}"]`,
          {
            addStageNew,
            isStageView: true,
            event: event,
            stagesMap,
            renderPipelineStage,
            contextType,
            templateTypes,
            newPipelineStudioEnabled
          },
          { useArrows: false, darkMode: false, fixedPosition: false }
        )
      }
    },
    [Event.DropLinkEvent]: (event: EventStageBaseType) => {
      const nodeData = event?.data?.nodeData?.data
      const destinationData = event?.data?.destinationNode?.data
      // if user is  dropping same node ahead or behind  itself and is a serial node dont do anything
      if (
        nodeData?.identifier === destinationData?.identifier &&
        !event?.data?.destinationNode?.metaData?.hasChildren
      ) {
        return
      }
      if (nodeData?.identifier) {
        const dropNode = getStageFromPipelineContext(nodeData.identifier).stage
        const destination = getStageFromPipelineContext(destinationData?.identifier as string).stage
        const parentStageName = (dropNode?.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.useFromStage
          ?.stage
        const dependentStages = getDependantStages(pipeline, dropNode)
        const { stageIndex: destinationIndex } = getStageIndexByIdentifier(pipeline, destinationData?.identifier)
        if (parentStageName?.length) {
          const { stageIndex: propagatingParentIndex = -1 } = getStageIndexByIdentifier(pipeline, parentStageName)

          if (destinationIndex <= propagatingParentIndex) {
            updateMoveStageDetails({
              event,
              direction: MoveDirection.AHEAD
            })
            confirmMoveStage()
            return
          }
        } else if (dependentStages?.length) {
          let indexToDropAt = -1
          const { stage } = getStageFromPipelineContext(destinationData?.identifier as string)
          if (!stage) {
            //  node on sourceport is parallel so split nodeId to get original node identifier
            const nodeId = destinationData?.identifier?.split(EmptyNodeSeparator)[1]

            const { stageIndex: nextStageIndex } = getStageIndexByIdentifier(pipeline, nodeId)
            indexToDropAt = nextStageIndex + 1 // adding 1 as we checked source port that is prev to index where we will move this node
          } else {
            indexToDropAt = pipeline?.stages?.indexOf(stage) || -1
          }

          const { stageIndex: firstDependentStageIndex = -1 } = getStageIndexByIdentifier(pipeline, dependentStages[0])

          if (indexToDropAt > firstDependentStageIndex) {
            const stagesTobeUpdated = getAffectedDependentStages(dependentStages, indexToDropAt, pipeline)

            updateMoveStageDetails({
              event,
              direction: MoveDirection.BEHIND,
              dependentStages: stagesTobeUpdated
            })
            confirmMoveStage()
            return
          }
        }

        const isRemove = removeNodeFromPipeline(
          getStageFromPipelineContext(nodeData.identifier),
          pipeline,
          stageMap,
          false
        )
        if (isRemove && dropNode) {
          addStageNew(dropNode, false, true, undefined, undefined, undefined, destination)
        }
      }
    }
  }
}

// check new
export const getNodeEventListerner = (
  updateStageOnAddLinkNew: (
    event: EventStageBaseType,
    dropNode: StageElementWrapper | undefined,
    current: PipelineStageWrapper<StageElementConfig>
  ) => void,
  setSelectionRef: any,
  confirmDeleteStage: () => void,
  updateDeleteId: (id: string | undefined) => void,

  dynamicPopoverHandler: DynamicPopoverHandlerBinding<PopoverData> | undefined,
  pipelineContext: PipelineContextInterface,
  addStageNew: (
    newStage: StageElementWrapper,
    isParallel?: boolean,
    droppedOnLink?: boolean,
    insertAt?: number,
    openSetupAfterAdd?: boolean,
    pipelineTemp?: PipelineInfoConfig,
    destinationNode?: StageElementWrapper
  ) => void,

  updateMoveStageDetails: (moveStageDetails: MoveStageDetailsType) => void,
  confirmMoveStage: () => void,
  stageMap: Map<string, StageState>,
  newPipelineStudioEnabled?: boolean,
  sectionId?: string | null
): ListenerReturnTypeForStage => {
  const {
    state: {
      pipeline,
      pipelineView: { isSplitViewOpen },
      pipelineView,
      templateTypes
    },
    contextType = 'Pipeline',
    stagesMap,
    updatePipeline,
    updatePipelineView,
    renderPipelineStage,
    getStageFromPipeline: getStageFromPipelineContext
  } = pipelineContext
  return {
    // Can not remove this Any because of React Diagram Issue
    [Event.ClickNode]: (event: EventStageBaseType) => {
      // const eventTemp = event as DefaultNodeEvent
      dynamicPopoverHandler?.hide()

      const nodeData = event.data?.nodeData
      const nodeType = event.data?.nodeType
      /* istanbul ignore else */ if (nodeType) {
        const domTarget = document.querySelector(`[data-nodeid="${nodeData?.id}"]`) as Element
        if (nodeType === DiagramType.CreateNew) {
          setSelectionRef.current({ stageId: undefined, sectionId: undefined })
          dynamicPopoverHandler?.show(
            domTarget,
            {
              addStageNew,
              isStageView: false,
              renderPipelineStage,
              stagesMap,
              contextType,
              templateTypes,
              newPipelineStudioEnabled
            },
            { useArrows: true, darkMode: false, fixedPosition: false }
          )
        } else if (nodeType === DiagramType.GroupNode && nodeData?.data?.identifier) {
          setSelectionRef.current({ stageId: nodeData?.data?.identifier })
        } /* istanbul ignore else */ else if (nodeType !== DiagramType.StartNode) {
          const data = getStageFromPipelineContext(nodeData?.data?.identifier as string).stage
          if (isSplitViewOpen && data?.stage?.identifier) {
            if (data?.stage?.name === EmptyStageName) {
              // TODO: check if this is unused code
              dynamicPopoverHandler?.show(
                domTarget,
                {
                  isStageView: true,
                  data,
                  onSubmitPrimaryData: (node, identifier) => {
                    updatePipeline(pipeline)
                    stageMap.set(node.stage?.identifier || '', { isConfigured: true, stage: node })
                    dynamicPopoverHandler.hide()
                    setSelectionRef.current({ stageId: identifier })
                  },
                  stagesMap,
                  renderPipelineStage,
                  contextType,
                  templateTypes,
                  newPipelineStudioEnabled
                },
                { useArrows: false, darkMode: false, fixedPosition: false }
              )
              setSelectionRef.current({ stageId: undefined, sectionId: undefined })
            } else {
              setSelectionRef.current({ stageId: data?.stage?.identifier, sectionId })
            }
          } /* istanbul ignore else */ else if (!isSplitViewOpen) {
            if (stageMap.has(data?.stage?.identifier || '')) {
              setSelectionRef.current({ stageId: data?.stage?.identifier })
            } else {
              // TODO: check if this is unused code
              dynamicPopoverHandler?.show(
                domTarget,
                {
                  isStageView: true,
                  data,
                  onSubmitPrimaryData: (node, identifier) => {
                    updatePipeline(pipeline)
                    stageMap.set(node.stage?.identifier || '', { isConfigured: true, stage: node })
                    dynamicPopoverHandler.hide()
                    setSelectionRef.current({ stageId: identifier })
                  },
                  stagesMap,
                  renderPipelineStage,
                  contextType,
                  templateTypes,
                  newPipelineStudioEnabled
                },
                { useArrows: false, darkMode: false, fixedPosition: false }
              )
            }
          }
        }
      }
    },
    // Can not remove this Any because of React Diagram Issue
    [Event.RemoveNode]: (event: EventStageBaseType) => {
      const nodeData = event.data?.nodeData
      const stageIdToBeRemoved = nodeData?.data?.identifier
      updateDeleteId(stageIdToBeRemoved)
      confirmDeleteStage()
    },
    [Event.AddParallelNode]: (event: EventStageBaseType) => {
      const nodeData = event.data?.nodeData
      dynamicPopoverHandler?.hide()
      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: false,
        splitViewData: {}
      })
      setSelectionRef.current({ stageId: undefined, sectionId: undefined })

      if (nodeData?.data?.identifier) {
        dynamicPopoverHandler?.show(
          `[data-nodeid="${nodeData?.id}"] ~[data-nodeid="add-parallel"]`,
          {
            addStageNew,
            isParallel: true,
            isStageView: false,
            event: event,
            stagesMap,
            renderPipelineStage,
            contextType,
            templateTypes,
            newPipelineStudioEnabled
          },
          { useArrows: false, darkMode: false, fixedPosition: false }
        )
      }
    },
    [Event.DropNodeEvent]: (event: EventStageBaseType) => {
      const nodeData = event?.data?.nodeData
      const destinationData = event?.data?.destinationNode

      if (nodeData?.data?.identifier) {
        const dropNode = getStageFromPipelineContext(nodeData?.data?.identifier).stage
        const current = getStageFromPipelineContext(destinationData?.data?.identifier as string)
        const dependentStages = getDependantStages(pipeline, dropNode)
        const parentStageId = (dropNode?.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.useFromStage
          ?.stage
        const isDropNodeParallel = nodeData?.metaData?.isParallelNode || nodeData?.metaData?.hasChildren
        const { stageIndex: dropNodeIndex } = getStageIndexByIdentifier(pipeline, dropNode?.stage?.identifier)
        if (parentStageId?.length) {
          const { stageIndex: indexToDropAt } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)

          const { stageIndex: propagatingParentIndex } = getStageIndexByIdentifier(pipeline, parentStageId)
          // if dropping last serial node to Add Stage icon , do nothing
          if (indexToDropAt == -1 && !isDropNodeParallel) {
            return
          }
          // if dropping parallel node  ahead of its index and is not  a  terminal  index(first and last) node
          const showConfirmation = isDropNodeParallel && dropNodeIndex > indexToDropAt && indexToDropAt !== -1
          // if dropping last parrallel node to Add Stage icon , do nothing
          if (indexToDropAt <= propagatingParentIndex && showConfirmation) {
            updateMoveStageDetails({
              event,
              direction: MoveDirection.AHEAD,
              currentStage: current
            })
            confirmMoveStage()
            return
          }
          updateStageOnAddLinkNew(event, dropNode, current)
          return
        } else if (dependentStages?.length) {
          let finalDropIndex = -1
          let firstDependentStageIndex
          const { stageIndex: dependentStageIndex, parallelStageIndex: dependentParallelIndex = -1 } =
            getStageIndexByIdentifier(pipeline, dependentStages[0])

          firstDependentStageIndex = dependentStageIndex

          if (current.parent) {
            const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)
            finalDropIndex = stageIndex
            firstDependentStageIndex = dependentStageIndex
          } else if (current?.stage) {
            const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)
            finalDropIndex = stageIndex
          }

          finalDropIndex = finalDropIndex === -1 ? pipeline.stages?.length || 0 : finalDropIndex
          const stagesTobeUpdated = getAffectedDependentStages(
            dependentStages,
            finalDropIndex,
            pipeline,
            dependentParallelIndex
          )
          if (finalDropIndex >= firstDependentStageIndex) {
            updateMoveStageDetails({
              event,
              direction: MoveDirection.BEHIND,
              dependentStages: stagesTobeUpdated,
              currentStage: current,
              isLastAddLink: !current.parent
            })

            confirmMoveStage()
            return
          }
        }
        updateStageOnAddLinkNew(event, dropNode, current)
      }
    },
    [Event.MouseEnterNode]: (event: EventStageBaseType) => {
      const nodeData = event.data?.nodeData
      const current = getStageFromPipeline(nodeData?.data?.identifier as string, pipeline)
      if (current.stage?.stage?.when) {
        const { pipelineStatus, condition } = current.stage.stage.when
        if (pipelineStatus === PipelineOrStageStatus.SUCCESS && isEmpty(condition)) {
          return
        }
        dynamicPopoverHandler?.show(
          `[data-nodeid="${nodeData?.id}"]`,
          {
            event,
            data: current.stage,
            isStageView: false,
            isHoverView: true,
            stagesMap,
            renderPipelineStage,
            contextType,
            templateTypes,
            newPipelineStudioEnabled
          },
          { useArrows: true, darkMode: false, fixedPosition: false, placement: 'top' },
          noop,
          true
        )
      }
    },
    [Event.MouseLeaveNode]: (_event: EventStageBaseType) => {
      if (dynamicPopoverHandler?.isHoverView?.()) {
        dynamicPopoverHandler?.hide()
      }
    }
  }
}
export interface MoveStageDetailsType {
  direction: MoveDirection
  event?: any
  dependentStages?: string[]
  currentStage?: unknown
  isLastAddLink?: boolean
}
interface MoveStageParams {
  moveStageDetails: MoveStageDetailsType
  pipelineContext: PipelineContextInterface
  // updateStageOnAddLink: (event: any, dropNode: StageElementWrapper | undefined, current: any) => void
  updateStageOnAddLinkNew: (
    event: EventStageBaseType,
    dropNode: StageElementWrapper | undefined,
    current: PipelineStageWrapper<StageElementConfig>
  ) => void
  resetPipelineStages: (stages: StageElementWrapperConfig[]) => void
  stageMap: Map<string, StageState>
  addStage: AddStage
  addStageNew: AddStageNew
  newPipelineStudioEnabled: boolean
}
export const moveStage = ({
  moveStageDetails,
  pipelineContext,
  updateStageOnAddLinkNew,
  resetPipelineStages,
  addStage,
  stageMap,
  addStageNew,
  newPipelineStudioEnabled
}: MoveStageParams): void => {
  const {
    event,
    dependentStages = [],
    currentStage = false,
    isLastAddLink = false
  }: {
    event?: EventStageBaseType
    dependentStages?: string[]
    currentStage?: any
    isLastAddLink?: boolean
  } = moveStageDetails

  const {
    getStageFromPipeline: getStageFromPipelineData,
    state: { pipeline }
  } = pipelineContext
  const nodeIdentifier = event?.data?.nodeData?.data?.identifier as string
  const destinationIdentifier = event?.data?.destinationNode?.data?.identifier as string
  const nodeToBeDropped = getStageFromPipelineData(nodeIdentifier).stage // node which is being dragged
  const destinationNode = getStageFromPipelineData(destinationIdentifier).stage // destination node where dragged node is dropped

  if (currentStage?.parent?.parallel || isLastAddLink) {
    if (nodeToBeDropped && nodeIdentifier !== destinationIdentifier) {
      updateStageOnAddLinkNew(event as EventStageBaseType, nodeToBeDropped, currentStage)

      const updatedStages = resetServiceSelectionForStages(
        dependentStages.length ? dependentStages : [nodeIdentifier],
        pipeline
      )
      resetPipelineStages(updatedStages)
    }
    // removed old code
  } else {
    const isRemove = removeNodeFromPipeline(getStageFromPipelineData(nodeIdentifier), pipeline, stageMap, false)
    if (isRemove && nodeToBeDropped) {
      newPipelineStudioEnabled
        ? addStageNew(nodeToBeDropped, !!currentStage, !currentStage, undefined, undefined, undefined, destinationNode)
        : addStage(nodeToBeDropped, !!currentStage, event as any)
      const updatedStages = resetServiceSelectionForStages(
        dependentStages.length ? dependentStages : [nodeIdentifier],
        pipeline
      )
      resetPipelineStages(updatedStages)
    }
  }
}
