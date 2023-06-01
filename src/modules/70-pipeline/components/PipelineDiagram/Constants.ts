/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const Event = {
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
  MouseLeaveStepGroupTitle: 'mouseLeaveStepGroupTitle',
  CollapsedNodeClick: 'collapsedNodeClick'
} as const

export type EventType = ValueOf<typeof Event>

export const DiagramType = {
  Default: 'default',
  EmptyNode: 'empty-node',
  CreateNew: 'create-new',
  DiamondNode: 'default-diamond',
  StartNode: 'node-start',
  GroupNode: 'group-node',
  StepGroupNode: 'step-group-node',
  IconNode: 'icon-node',
  Link: 'link',
  MatrixNode: 'MATRIX'
} as const

export enum StepsType {
  Normal = 'Normal',
  Rollback = 'Rollback'
}

export const PortName = {
  In: 'In',
  Out: 'Out'
} as const

export const DiagramDrag = {
  NodeDrag: 'diagram-node-drag',
  AllowDropOnLink: 'allow-drop-on-link',
  AllowDropOnNode: 'allow-drop-on-node'
} as const
