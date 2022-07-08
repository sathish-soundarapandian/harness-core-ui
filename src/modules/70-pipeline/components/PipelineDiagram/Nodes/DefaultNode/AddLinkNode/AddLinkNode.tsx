/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties } from 'react'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { Icon } from '@harness/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import type { FireEventMethod, NodeProps } from '@pipeline/components/PipelineDiagram/types'
import type { EventMetaDataProps, EventProps } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'

interface AddLinkNodeProps<T, U, V>
  extends Omit<NodeProps<T, U, V>, 'data' | 'fireEvent' | 'getNode' | 'getDefaultNode' | 'updateGraphLinks'> {
  parentIdentifier?: string
  isParallelNode?: boolean
  readonly?: boolean
  showAddLink?: boolean
  className?: string
  id?: string
  isRightAddIcon?: boolean
  style?: CSSProperties
  data: T
  setShowAddLink?: (data: boolean) => void
  fireEvent?: FireEventMethod<EventProps<T, EventMetaDataProps>>
}

type AddLinkNodeStageProps<T, U, V> = AddLinkNodeProps<T, U, V>

export default function AddLinkNode<T, U, V>(props: AddLinkNodeStageProps<T, U, V>): React.ReactElement | null {
  return (
    <div
      style={props?.style}
      data-linkid={props?.id}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        props?.fireEvent?.({
          type: Event.AddLinkClicked,
          target: event.target,
          data: {
            parentIdentifier: props?.parentIdentifier,
            nodeType: DiagramType.Link,
            nodeData: {
              id: props?.id as string,
              data: props?.data,
              metaData: {
                isRightAddIcon: props?.isRightAddIcon
              }
            }
          }
        })
      }}
      onDragOver={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        event.preventDefault()
        props?.setShowAddLink && props?.setShowAddLink(true)
      }}
      onDrop={event => {
        const nodeData = JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag))
        event.stopPropagation()
        props?.fireEvent?.({
          type: Event.DropLinkEvent,
          target: event.target,
          data: {
            parentIdentifier: props?.parentIdentifier,
            nodeType: DiagramType.Link,
            nodeData: {
              id: nodeData?.data.id,
              data: nodeData?.data?.data?.stage,
              metaData: {
                isRightAddIcon: nodeData?.isRightAddIcon
              }
            },
            destinationNode: {
              id: props?.id as string,
              data: props?.data,
              metaData: {
                isRightAddIcon: props?.isRightAddIcon
              }
            }
          }
        })
        props?.setShowAddLink && props?.setShowAddLink(false)
      }}
      className={cx(props.className, 'Plus-class')}
    >
      <Icon name="plus" color={Color.WHITE} />
    </div>
  )
}
