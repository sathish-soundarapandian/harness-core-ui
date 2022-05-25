/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const DiagramType: { [key: string]: string } = {
  Default: 'default',
  EmptyNode: 'empty-node',
  CreateNew: 'create-new',
  DiamondNode: 'default-diamond',
  StartNode: 'node-start',
  GroupNode: 'group-node',
  StepGroupNode: 'step-group-node',
  IconNode: 'icon-node',
  Link: 'link'
}

export enum StepsType {
  Normal = 'Normal',
  Rollback = 'Rollback'
}

export const PortName: { [key: string]: string } = {
  In: 'In',
  Out: 'Out'
}

export const DiagramDrag: { [key: string]: string } = {
  NodeDrag: 'diagram-node-drag',
  AllowDropOnLink: 'allow-drop-on-link',
  AllowDropOnNode: 'allow-drop-on-node'
}
