/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { CSSProperties } from 'react'
import type { ExecutionWrapperConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import type { EventWithBaseType } from '../PipelineStudio/StageBuilder/StageBuilderUtil'

export interface ListenerHandle {
  deregister: () => any
  id: string
  listener: BaseListener
}

export interface NodeData {
  name: string
  icon: IconName
  selectedColour: string
  unSelectedColour: string
  selectedIconColour: string
  unSelectedIconColour: string
}

export type BaseListener = (event: any) => void

export const enum PipelineGraphType {
  STAGE_GRAPH = 'STAGE_GRAPH',
  STEP_GRAPH = 'STEP_GRAPH'
}

export interface BaseEvent<T> {
  type: string
  target: EventTarget
  data?: T
}

export interface PipelineGraphState<T, U, V> {
  id: string
  identifier: string
  type: string
  name: string
  icon: IconName
  status?: string
  data: T
  metaData: U
  nodeType?: string
  graphType?: PipelineGraphType
  children?: PipelineGraphState<T, U, V>[]
  parentStepGroupId?: string
  readonly?: boolean
  stageNodeId?: string
}

export interface BaseMetaDataType<T, U, V> {
  nextNode?: PipelineGraphState<T, U, V>
  prevNode?: PipelineGraphState<T, U, V>
  isParallelNode?: boolean
  parentIdentifier?: string
  className?: string
  isFirstParallelNode?: boolean
}
export interface NodeProps<T, U, V> {
  defaultSelected?: string //default selected id
  selectedNodeId?: string
  // icon?: string //data
  metaData?: BaseMetaDataType<T, U, V>
  data: PipelineGraphState<T, U, V>
  permissions?: {
    readonly?: boolean
    allowAdd?: boolean //default selected id
  }
  graphConfig?: {
    isDragging?: boolean
    collapsibleProps?: NodeCollapsibleProps
    parentSelector?: string
  }
  getNode: GetNodeMethod<T, U, V>
  fireEvent: FireEventMethod<V>
  getDefaultNode: GetNodeMethod<T, U, V>
  updateGraphLinks: () => void
  onClick?: any // remove later
}

export type PipelineGraphDataType =
  | PipelineGraphState<StageElementWrapperConfig, PipelineStageNodeMetaDataType, EventWithBaseType>[]
  | PipelineGraphState<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventWithBaseType>[]
export interface TerminalNodeProps<V> {
  id: string
  name?: string
  identifier?: string
  className?: string
  fireEvent: FireEventMethod<V>
  disabled?: boolean
}

export type CombinedNodeProps<T, U, V> = NodeProps<T, U, V> | TerminalNodeProps<V>

// move to desired file later
export interface NodeGraphMetaType {
  nodeMeta: {
    graphType: string
    nodeType: string
    showMarkers?: boolean
  }
}
// rename as it is generic to stage and step
export interface PipelineStageNodeMetaDataType extends NodeGraphMetaType {
  //metaData
  conditionalExecutionEnabled: boolean
  isInComplete: boolean
  isTemplateNode: boolean
  loopingStrategyEnabled: boolean
  tertiaryIcon?: IconName
  iconStyle?: CSSProperties
  status?: string //data
  isNestedGroup?: boolean
  maxParallelism?: number
}

export interface NodeIds {
  startNode: string
  createNode: string
  endNode: string
}
export interface KVPair {
  [key: string]: string
}
export interface SVGPathRecord {
  [key: string]: {
    pathData: string
    className?: string
    getLinkStyles?: () => void
    dataProps?: KVPair
  }
}

export type NodeBank<T, U, V> = Map<string, NodeDetails<T, U, V>>
export interface NodeDetails<T, U, V> {
  component: React.FC<CombinedNodeProps<T, U, V>>
  isDefault?: boolean
}

export interface NodeCollapsibleProps {
  /** percent child visible to collapse */
  percentageNodeVisible?: number
  /** margin from child bottom to start expanding */
  bottomMarginInPixels?: number
}

export enum NodeStatus {
  Loading = 'Loading',
  Success = 'Success',
  Failure = 'Failure'
}

export enum NodeType {
  Default = 'default-node',
  EmptyNode = 'empty-node',
  CreateNode = 'create-node',
  DiamondNode = 'default-diamond',
  StartNode = 'start-node',
  GroupNode = 'group-node',
  IconNode = 'icon-node',
  EndNode = 'end-node',
  StepGroupNode = 'StepGroup',
  MatrixNode = 'MATRIX',
  LoopNode = 'LOOP',
  PARALLELISM = 'PARALLELISM'
}

export interface NodeInterface {
  identifier: string
  type: NodeType
  name: string
  defaultIcon: IconName
  secondaryIcon?: IconName
  selectedColour?: string
  unSelectedColour?: string
  selectedIconColour?: string
  unSelectedIconColour?: string
}

export type FireEventMethod<T> = (arg0: BaseEvent<T>) => void

export interface NodeInfo {
  name: string
  icon: string
  identifier: string
  type: string
}

export type GetNodeMethod<T, U, V> = (type?: string | undefined) => NodeDetails<T, U, V> | null
