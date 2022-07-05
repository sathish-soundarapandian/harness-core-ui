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
import { get } from 'lodash-es'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import type { NodeProps, PipelineStageNodeMetaDataType } from '@pipeline/components/PipelineDiagram/types'
import type {
  ExecutionWrapperConfig,
  StageElementConfig,
  StageElementWrapperConfig,
  StepElementConfig
} from 'services/pipeline-ng'
import type {
  EventStageDataType,
  EventStepDataType
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
interface AddLinkNodeProps<T, U, V> extends NodeProps<T, U, V> {
  parentIdentifier?: string
  isParallelNode?: boolean
  readonly?: boolean
  showAddLink?: boolean
  className?: string
  id?: string
  isRightAddIcon?: boolean
  style?: CSSProperties
  setShowAddLink?: (data: boolean) => void
}

type AddLinkNodeStageProps<T, U, V> = AddLinkNodeProps<T, U, V>

type AddLinkNodeStepProps = AddLinkNodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepDataType>

export default function AddLinkNode<T, U, V>(props: AddLinkNodeStageProps<T, U, V>): React.ReactElement | null {
  const data = get(props, 'data.data.stage')
    ? (get(props, 'data.data.stage') as StageElementConfig)
    : (get(props, 'data.data.step') as StepElementConfig)
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
              id: props?.data.id,
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
              id: props?.data.id,
              data: data!,
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

export function AddStageLinkNode(props: AddLinkNodeStageProps): React.ReactElement | null {
  return (
    <AddLinkNode
      {...props}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        props?.fireEvent?.({
          type: Event.AddLinkClicked,
          target: event.target,
          data: {
            parentIdentifier: props?.parentIdentifier,
            nodeType: DiagramType.Link,
            nodeData: {
              id: props?.data.id,
              data: props.data?.data?.stage,
              metaData: {
                isRightAddIcon: props?.isRightAddIcon
              }
            }
          }
        })
      }}
    />
  )
}

export function AddStepLinkNode(props: AddLinkNodeStepProps): React.ReactElement | null {
  return (
    <AddLinkNode
      {...props}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        props?.fireEvent?.({
          type: Event.AddLinkClicked,
          target: event.target,
          data: {
            parentIdentifier: props?.parentIdentifier,
            nodeType: DiagramType.Link,
            nodeData: {
              id: props?.data.id,
              data: props.data?.data?.step,
              metaData: {
                isRightAddIcon: props?.isRightAddIcon
              }
            }
          }
        })
      }}
    />
  )
}
