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
import { parse } from 'yaml'
import type {
  StageElementWrapperConfig,
  PageConnectorResponse,
  PipelineInfoConfig,
  DeploymentStageConfig
} from 'services/cd-ng'
import type * as Diagram from '@pipeline/components/Diagram'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { SelectorData } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { DefaultNodeModel, DiagramType, Event } from '@pipeline/components/Diagram'
import { PipelineOrStageStatus } from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import { EmptyStageName } from '../PipelineConstants'
import type { PipelineContextInterface, StagesMap } from '../PipelineContext/PipelineContext'
import { getStageFromPipeline } from '../PipelineContext/helpers'
import type { MoveStageDetailsType } from './StageBuilder'

export interface StageState {
  isConfigured: boolean
  stage: StageElementWrapperConfig
}

export enum MoveDirection {
  AHEAD,
  BEHIND
}
export interface PopoverData {
  data?: StageElementWrapperConfig
  isStageView: boolean
  contextType?: string
  groupStages?: StageElementWrapperConfig[]
  isGroupStage?: boolean
  stagesMap: StagesMap
  groupSelectedStageId?: string
  isParallel?: boolean
  event?: any
  addStage?: (
    newStage: StageElementWrapperConfig,
    isParallel?: boolean,
    event?: Diagram.DefaultNodeEvent,
    insertAt?: number,
    openSetupAfterAdd?: boolean,
    pipeline?: PipelineInfoConfig
  ) => void
  addStageNew?: (
    newStage: StageElementWrapper,
    isParallel?: boolean,
    droppedOnLink?: boolean,
    insertAt?: number,
    openSetupAfterAdd?: boolean,
    pipelineTemp?: PipelineInfoConfig,
    destinationNode?: StageElementWrapper
  ) => void
  onSubmitPrimaryData?: (values: StageElementWrapperConfig, identifier: string) => void
  onClickGroupStage?: (stageId: string, type: StageType) => void
  renderPipelineStage: PipelineContextInterface['renderPipelineStage']
  isHoverView?: boolean
  templateTypes: { [key: string]: string }
  setTemplateTypes: (data: { [key: string]: string }) => void
  openTemplateSelector: (selectorData: SelectorData) => void
  closeTemplateSelector: () => void
}

export const getStageIndexByIdentifier = (
  pipeline: PipelineInfoConfig,
  identifier?: string
): { stageIndex: number; parallelStageIndex: number } => {
  const stageDetails = { stageIndex: -1, parallelStageIndex: -1 }
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
      ...parse(template?.yaml || '')?.template.spec,
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
    return ''
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
    if (!stage) {
      return
    }

    if (parent) {
      const { parallelStageIndex, stageIndex: parentStageIndex } = getStageIndexByIdentifier(pipeline, stageId)
      const updatedStage = resetStageServiceSpec(stagesCopy?.[parentStageIndex]?.parallel?.[parallelStageIndex] || {})
      set(stagesCopy, [parentStageIndex, 'parallel', parallelStageIndex], updatedStage)
      return
    }
    let stageIndex = pipeline.stages?.indexOf(stage)
    stageIndex = stageIndex !== undefined ? stageIndex : -1
    const updatedStage = resetStageServiceSpec(stage)
    stagesCopy[stageIndex] = updatedStage
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
          manifests: [],

          artifactOverrideSets: [],
          manifestOverrideSets: []
        }
      }
    }
  })

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
  openTemplateSelector: (selectorData: SelectorData) => void,
  closeTemplateSelector: () => void,
  openSplitView: boolean,
  updateMoveStageDetails: (moveStageDetails: MoveStageDetailsType) => void,
  confirmMoveStage: () => void,
  stageMap: Map<string, StageState>
): LinkModelListener => {
  const {
    state: { pipeline, templateTypes },
    contextType = 'Pipeline',
    stagesMap,
    renderPipelineStage,
    getStageFromPipeline: getStageFromPipelineContext,
    setTemplateTypes
  } = pipelineContext

  return {
    [Event.AddLinkClicked]: (event: any) => {
      event = { ...event, ...event.data }
      dynamicPopoverHandler?.hide()
      if (event.identifier) {
        dynamicPopoverHandler?.show(
          `[data-linkid="${event.identifier}"]`,
          {
            addStageNew,
            isStageView: true,
            event: event,
            stagesMap,
            renderPipelineStage,
            contextType,
            templateTypes,
            setTemplateTypes,
            openTemplateSelector,
            closeTemplateSelector
          },
          { useArrows: false, darkMode: false, fixedPosition: openSplitView }
        )
      }
    },
    [Event.DropLinkEvent]: (event: any) => {
      event = { ...event, ...event.data }
      if (event?.node?.identifier === event?.destination?.identifier) {
        return
      }
      if (event.node?.identifier) {
        const dropNode = getStageFromPipelineContext(event.node.identifier).stage
        const destination = getStageFromPipelineContext(event.destination.identifier).stage
        const parentStageName = (dropNode?.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.useFromStage
          ?.stage
        const dependentStages = getDependantStages(pipeline, dropNode)

        if (parentStageName?.length) {
          const node = event.entity.getTargetPort().getNode() as DefaultNodeModel
          const { stage } = getStageFromPipelineContext(node.getIdentifier())
          const dropIndex = pipeline?.stages?.indexOf(stage!) || -1
          const { stageIndex: parentIndex = -1 } = getStageIndexByIdentifier(pipeline, parentStageName)

          if (dropIndex < parentIndex) {
            updateMoveStageDetails({
              event,
              direction: MoveDirection.AHEAD
            })
            confirmMoveStage()
            return
          }
        } else if (dependentStages?.length) {
          let dropIndex = -1
          const node = event.entity.getSourcePort().getNode() as DefaultNodeModel
          const { stage } = getStageFromPipelineContext(node.getIdentifier())
          if (!stage) {
            //  node on sourceport is parallel so split nodeId to get original node identifier
            const nodeId = node.getIdentifier().split(EmptyNodeSeparator)[1]

            const { stageIndex: nextStageIndex } = getStageIndexByIdentifier(pipeline, nodeId)
            dropIndex = nextStageIndex + 1 // adding 1 as we checked source port that is prev to index where we will move this node
          } else {
            dropIndex = pipeline?.stages?.indexOf(stage!) || -1
          }

          const { stageIndex: firstDependentStageIndex = -1 } = getStageIndexByIdentifier(pipeline, dependentStages[0])

          if (dropIndex >= firstDependentStageIndex) {
            const stagesTobeUpdated = getAffectedDependentStages(dependentStages, dropIndex, pipeline)

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
          getStageFromPipelineContext(event.node.identifier),
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

export const getNodeEventListerner = (
  updateStageOnAddLinkNew: (event: any, dropNode: StageElementWrapper | undefined, current: any) => void,
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
  openTemplateSelector: (selectorData: SelectorData) => void,
  closeTemplateSelector: () => void,
  updateMoveStageDetails: (moveStageDetails: MoveStageDetailsType) => void,
  confirmMoveStage: () => void,
  stageMap: Map<string, StageState>
): NodeModelListener => {
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
    getStageFromPipeline: getStageFromPipelineContext,
    setTemplateTypes
  } = pipelineContext
  return {
    // Can not remove this Any because of React Diagram Issue
    [Event.ClickNode]: (event: any) => {
      // const eventTemp = event as DefaultNodeEvent
      event = { ...event, ...event?.data }
      dynamicPopoverHandler?.hide()
      /* istanbul ignore else */ if (event.entityType) {
        const domTarget =
          document.querySelector(`[data-nodeid="${event.identifier}"]`) ||
          (document.querySelector(`[data-nodeid="${event.id}"]`) as Element)
        if (event.entityType === DiagramType.CreateNew) {
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
              setTemplateTypes,
              openTemplateSelector,
              closeTemplateSelector
            },
            { useArrows: true, darkMode: false, fixedPosition: false }
          )
        } else if (event.entityType === DiagramType.GroupNode && event?.identifier) {
          /* istanbul ignore else */ if (event?.nodesInfo) {
            dynamicPopoverHandler?.show(
              domTarget,
              {
                isGroupStage: true,
                groupSelectedStageId: event?.identifier,
                isStageView: false,
                groupStages: event?.nodesInfo,
                onClickGroupStage: (stageId: string) => {
                  dynamicPopoverHandler?.hide()
                  setSelectionRef.current({ stageId })
                  // moveStageToFocusDelayed(engine, stageId, true)
                },
                stagesMap,
                renderPipelineStage,
                contextType,
                templateTypes,
                setTemplateTypes,
                openTemplateSelector,
                closeTemplateSelector
              },
              { useArrows: false, darkMode: false, fixedPosition: false }
            )
          }
        } /* istanbul ignore else */ else if (event.entityType !== DiagramType.StartNode) {
          const data = getStageFromPipelineContext(event.identifier).stage
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
                  setTemplateTypes,
                  openTemplateSelector,
                  closeTemplateSelector
                },
                { useArrows: false, darkMode: false, fixedPosition: false }
              )
              setSelectionRef.current({ stageId: undefined, sectionId: undefined })
            } else {
              setSelectionRef.current({ stageId: data?.stage?.identifier, sectionId: undefined })
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
                  setTemplateTypes,
                  openTemplateSelector,
                  closeTemplateSelector
                },
                { useArrows: false, darkMode: false, fixedPosition: false }
              )
            }
          }
        }
      }
    },
    // Can not remove this Any because of React Diagram Issue
    [Event.RemoveNode]: (event: any) => {
      event = { ...event, ...event?.data }
      const stageIdToBeRemoved = event.identifier
      updateDeleteId(stageIdToBeRemoved)
      confirmDeleteStage()
    },
    [Event.AddParallelNode]: (event: any) => {
      event = { ...event, ...event?.data }
      dynamicPopoverHandler?.hide()
      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: false,
        splitViewData: {}
      })
      setSelectionRef.current({ stageId: undefined, sectionId: undefined })

      if (event.identifier) {
        dynamicPopoverHandler?.show(
          `[data-nodeid="${event.identifier}"] ~[data-nodeid="add-parallel"]`,
          {
            addStageNew,
            isParallel: true,
            isStageView: false,
            event: event,
            stagesMap,
            renderPipelineStage,
            contextType,
            templateTypes,
            setTemplateTypes,
            openTemplateSelector,
            closeTemplateSelector
          },
          { useArrows: false, darkMode: false, fixedPosition: false },
          event.callback
        )
      }
    },
    [Event.DropNodeEvent]: (event: any) => {
      event = { ...event, ...event?.data }
      if (event.node?.identifier) {
        const dropNode = getStageFromPipelineContext(event?.node?.identifier).stage
        const current = getStageFromPipelineContext(event?.destination?.identifier)
        const dependentStages = getDependantStages(pipeline, dropNode)
        const parentStageId = (dropNode?.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.useFromStage
          ?.stage
        if (parentStageId?.length) {
          const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)

          const { index: parentIndex } = getStageIndexFromPipeline(pipeline, parentStageId)
          if (stageIndex <= parentIndex) {
            updateMoveStageDetails({
              event,
              direction: MoveDirection.AHEAD,
              currentStage: current
            })
            confirmMoveStage()
            return
          }

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
    [Event.MouseEnterNode]: (event: any) => {
      const eventTemp = { ...event, ...event.data }

      const current = getStageFromPipeline(eventTemp?.identifier, pipeline)
      if (current.stage?.stage?.when) {
        const { pipelineStatus, condition } = current.stage.stage.when
        if (pipelineStatus === PipelineOrStageStatus.SUCCESS && isEmpty(condition)) {
          return
        }
        dynamicPopoverHandler?.show(
          `[data-nodeid="${eventTemp?.node?.id}"]`,
          {
            event: eventTemp,
            data: current.stage,
            isStageView: false,
            isHoverView: true,
            stagesMap,
            renderPipelineStage,
            contextType,
            templateTypes,
            setTemplateTypes,
            openTemplateSelector,
            closeTemplateSelector
          },
          { useArrows: true, darkMode: false, fixedPosition: false, placement: 'top' },
          noop,
          true
        )
      }
    },
    [Event.MouseLeaveNode]: (_event: any) => {
      if (dynamicPopoverHandler?.isHoverView?.()) {
        dynamicPopoverHandler?.hide()
      }
    }
  }
}
