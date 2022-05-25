import { defaultTo, get } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import type { IconName } from '@harness/uicore'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import type { KVPair } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type { ExecutionWrapperConfig, StageElementWrapperConfig } from 'services/cd-ng'
import type { DependencyElement } from 'services/ci'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import { getConditionalExecutionFlag } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import {
  isCustomGeneratedString,
  StepTypeToPipelineIconMap
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { NodeTypeToNodeMap } from '@pipeline/components/PipelineDiagram/PipelineGraph/PipelineGraphUtils'
import { getDefaultBuildDependencies } from './stageHelpers'
import { stageTypeToIconMap } from './constants'

const Event: KVPair = {
  AddLinkClicked: 'addLinkClicked',
  SelectionChanged: 'selectionChanged',
  ClickNode: 'clickNode',
  ColorChanged: 'colorChanged',
  CanvasClick: 'CanvasClick',
  WidthChanged: 'widthChanged',
  RemoveNode: 'removeNode',
  NodesUpdated: 'nodesUpdated',
  LinksUpdated: 'linksUpdated',
  OffsetUpdated: 'offsetUpdated',
  ZoomUpdated: 'zoomUpdated',
  GridUpdated: 'gridUpdated',
  StepGroupCollapsed: 'stepGroupCollapsed',
  StepGroupClicked: 'stepGroupClicked',
  EntityRemoved: 'entityRemoved',
  RollbackClicked: 'rollbackClicked',
  AddParallelNode: 'addParallelNode',
  SourcePortChanged: 'sourcePortChanged',
  TargetPortChanged: 'targetPortChanged',
  DragStart: 'dragStart',
  DropLinkEvent: 'dropLinkEvent',
  DropNodeEvent: 'dropNodeEvent',
  MouseEnterNode: 'mouseEnterNode',
  MouseOverNode: 'mouseOverNode',
  MouseLeaveNode: 'mouseLeaveNode',
  MouseEnterStepGroupTitle: 'mouseEnterStepGroupTitle',
  MouseLeaveStepGroupTitle: 'mouseLeaveStepGroupTitle'
}
const enum PipelineGraphType {
  STAGE_GRAPH = 'STAGE_GRAPH',
  STEP_GRAPH = 'STEP_GRAPH'
}
interface GetPipelineGraphDataParams {
  data: StageElementWrapperConfig[] | ExecutionWrapperConfig[]
  templateTypes?: KVPair
  serviceDependencies?: DependencyElement[] | undefined
  errorMap?: Map<string, string[]>
  parentPath?: string
}
const getuniqueIdForStep = (step: ExecutionWrapperConfig): string =>
  defaultTo(get(step, 'step.uuid') || get(step, 'step.id'), uuid() as string)

const getPipelineGraphDataType = (data: StageElementWrapperConfig[] | ExecutionWrapperConfig[]): PipelineGraphType => {
  const hasStageData = defaultTo(get(data, '[0].parallel.[0].stage'), get(data, '[0].stage'))
  if (hasStageData) {
    return PipelineGraphType.STAGE_GRAPH
  }
  return PipelineGraphType.STEP_GRAPH
}

const getNodeInfo = (type: string, graphType: PipelineGraphType): { iconName: IconName; nodeType: string } => {
  return graphType === PipelineGraphType.STEP_GRAPH
    ? {
        iconName: StepTypeToPipelineIconMap[type],
        nodeType: NodeTypeToNodeMap[type]
      }
    : {
        iconName: stageTypeToIconMap[type],
        nodeType: NodeTypeToNodeMap[type]
      }
}

const getPipelineGraphData = ({
  data = [],
  templateTypes,
  serviceDependencies,
  errorMap,
  parentPath
}: GetPipelineGraphDataParams): PipelineGraphState[] => {
  let graphState: PipelineGraphState[] = []
  const pipGraphDataType = getPipelineGraphDataType(data)
  if (pipGraphDataType === PipelineGraphType.STAGE_GRAPH) {
    graphState = transformStageData(data, pipGraphDataType, templateTypes, errorMap, parentPath)
  } else {
    graphState = transformStepsData(data, pipGraphDataType, templateTypes, errorMap, parentPath)

    if (Array.isArray(serviceDependencies)) {
      //CI module
      const dependencyStepGroup = getDefaultBuildDependencies(serviceDependencies)
      graphState.unshift(dependencyStepGroup)
    }
  }

  return graphState
}

const transformStageData = (
  stages: StageElementWrapperConfig[],
  graphType: PipelineGraphType,
  templateTypes?: KVPair,
  errorMap?: Map<string, string[]>,
  parentPath?: string,
  offsetIndex = 0
): PipelineGraphState[] => {
  const finalData: PipelineGraphState[] = []
  stages.forEach((stage: StageElementWrapperConfig, index: number) => {
    if (stage?.stage) {
      const updatedStagetPath = `${parentPath}.${index + offsetIndex}`
      const hasErrors =
        errorMap && [...errorMap.keys()].some(key => updatedStagetPath && key.startsWith(updatedStagetPath))
      const templateRef = getIdentifierFromValue(stage.stage?.template?.templateRef as string)

      const type = templateRef ? (templateTypes?.[templateRef] as string) : (stage.stage.type as string)
      const { nodeType, iconName } = getNodeInfo(defaultTo(type, ''), graphType)

      finalData.push({
        id: uuid() as string,
        identifier: stage.stage.identifier as string,
        name: stage.stage.name as string,
        type: type,
        nodeType: nodeType as string,
        icon: iconName,
        data: {
          graphType,
          ...stage,
          isInComplete: isCustomGeneratedString(stage.stage.identifier) || hasErrors,
          conditionalExecutionEnabled: stage.stage.when
            ? stage.stage.when?.pipelineStatus !== 'Success' || !!stage.stage.when?.condition?.trim()
            : false,
          isTemplateNode: Boolean(templateRef)
        }
      })
    } else if (stage?.parallel?.length) {
      const updatedStagetPath = `${parentPath}.${index}.parallel`
      const currentStagetPath = `${updatedStagetPath}.0`

      const hasErrors =
        errorMap && [...errorMap.keys()].some(key => updatedStagetPath && key.startsWith(currentStagetPath))

      const [first, ...rest] = stage.parallel
      const templateRef = getIdentifierFromValue(first.stage?.template?.templateRef as string)
      const type = templateRef ? (templateTypes?.[templateRef] as string) : (first?.stage?.type as string)
      const { nodeType, iconName } = getNodeInfo(defaultTo(type, ''), graphType)
      finalData.push({
        id: uuid() as string,
        identifier: first?.stage?.identifier as string,
        name: first?.stage?.name as string,
        nodeType: nodeType as string,
        type,
        icon: iconName,
        data: {
          graphType,
          ...stage,
          isInComplete: isCustomGeneratedString(first?.stage?.identifier as string) || hasErrors,
          conditionalExecutionEnabled: first?.stage?.when
            ? first?.stage?.when?.pipelineStatus !== 'Success' || !!first?.stage.when?.condition?.trim()
            : false,
          isTemplateNode: Boolean(templateRef)
        },
        children: transformStageData(rest, graphType, templateTypes, errorMap, updatedStagetPath, 1)
      })
    }
  })
  return finalData
}

const transformStepsData = (
  steps: ExecutionWrapperConfig[],
  graphType: PipelineGraphType,
  templateTypes?: KVPair,
  errorMap?: Map<string, string[]>,
  parentPath?: string,
  offsetIndex = 0
): PipelineGraphState[] => {
  const finalData: PipelineGraphState[] = []

  steps.forEach((step: ExecutionWrapperConfig, index: number) => {
    if (step?.step) {
      const updatedStagetPath = `${parentPath}.${index + offsetIndex}`

      const hasErrors =
        errorMap && [...errorMap.keys()].some(key => updatedStagetPath && key.startsWith(updatedStagetPath))

      const templateRef = getIdentifierFromValue(
        (step?.step as unknown as TemplateStepNode)?.template?.templateRef as string
      )
      const stepIcon = get(step, 'step.icon')
      const type = templateRef ? (templateTypes?.[templateRef] as string) : (step?.step?.type as string)
      const { nodeType, iconName } = getNodeInfo(defaultTo(type, ''), graphType)
      const isExecutionView = get(step, 'step.status', false)
      finalData.push({
        id: getuniqueIdForStep(step),
        identifier: step.step.identifier as string,
        name: step.step.name as string,
        type,
        nodeType: nodeType as string,
        icon: stepIcon ? stepIcon : iconName,
        data: {
          graphType,
          ...step,
          isInComplete: isCustomGeneratedString(step.step.identifier) || hasErrors,
          conditionalExecutionEnabled: isExecutionView
            ? getConditionalExecutionFlag(step.step?.when)
            : step.step?.when
            ? step.step?.when?.stageStatus !== 'Success' || !!step.step?.when?.condition?.trim()
            : false,
          isTemplateNode: Boolean(templateRef)
        }
      })
    } else if (step?.parallel?.length) {
      const updatedStagetPath = `${parentPath}.${index}.parallel`
      const currentStagetPath = `${updatedStagetPath}.0`

      const hasErrors =
        errorMap && [...errorMap.keys()].some(key => currentStagetPath && key.startsWith(currentStagetPath))

      const [first, ...rest] = step.parallel
      if (first.stepGroup) {
        const { iconName } = getNodeInfo('', graphType)
        finalData.push({
          id: getuniqueIdForStep(first),
          identifier: first.stepGroup?.identifier as string,
          name: first.stepGroup?.name as string,
          type: 'StepGroup',
          nodeType: 'StepGroup',
          icon: iconName,
          data: {
            ...first,
            isInComplete: isCustomGeneratedString(first.stepGroup?.identifier) || hasErrors,
            graphType
          },
          children: transformStepsData(
            rest as ExecutionWrapperConfig[],
            graphType,
            templateTypes,
            errorMap,
            updatedStagetPath,
            1
          )
        })
      } else {
        const templateRef = getIdentifierFromValue(
          (first?.step as unknown as TemplateStepNode)?.template?.templateRef as string
        )
        const type = templateRef ? (templateTypes?.[templateRef] as string) : (first?.step?.type as string)
        const { nodeType, iconName } = getNodeInfo(defaultTo(type, ''), graphType)
        const isExecutionView = get(first, 'step.status', false)
        finalData.push({
          id: getuniqueIdForStep(first),
          identifier: first?.step?.identifier as string,
          name: first?.step?.name as string,
          type,
          nodeType: nodeType as string,
          icon: iconName,
          data: {
            ...first,
            isInComplete: isCustomGeneratedString(first?.step?.identifier as string) || hasErrors,
            conditionalExecutionEnabled: isExecutionView
              ? getConditionalExecutionFlag(first.step?.when)
              : first.step?.when
              ? first.step?.when?.stageStatus !== 'Success' || !!first.step?.when?.condition?.trim()
              : false,
            isTemplateNode: Boolean(templateRef),
            graphType
          },
          children: transformStepsData(rest, graphType, templateTypes, errorMap, updatedStagetPath, 1)
        })
      }
    } else {
      const { iconName } = getNodeInfo('', graphType)
      const updatedStagetPath = `${parentPath}.${index}.stepGroup.steps`
      const hasErrors =
        errorMap && [...errorMap.keys()].some(key => updatedStagetPath && key.startsWith(updatedStagetPath))
      const isExecutionView = get(step, 'stepGroup.status', false)
      finalData.push({
        id: getuniqueIdForStep(step),
        identifier: step.stepGroup?.identifier as string,
        name: step.stepGroup?.name as string,
        type: 'StepGroup',
        nodeType: 'StepGroup',
        icon: iconName,
        data: {
          ...step,
          conditionalExecutionEnabled: isExecutionView
            ? getConditionalExecutionFlag(step.stepGroup?.when)
            : step.stepGroup?.when
            ? step.stepGroup?.when?.stageStatus !== 'Success' || !!step.stepGroup?.when?.condition?.trim()
            : false,
          graphType,
          isInComplete: isCustomGeneratedString(step.stepGroup?.identifier as string) || hasErrors
        }
      })
    }
  })
  return finalData
}
export { getPipelineGraphData, PipelineGraphType, Event }
