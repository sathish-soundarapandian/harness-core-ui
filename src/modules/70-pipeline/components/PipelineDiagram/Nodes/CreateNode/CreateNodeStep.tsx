/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import type {
  EventStepStepGroupDataType
  // EventStepDataType
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { ExecutionWrapperConfig } from 'services/pipeline-ng'
import CreateNode from './CreateNode'
import type {
  // FireEventMethod,
  NodeProps,
  PipelineStageNodeMetaDataType,
  TerminalNodeProps
} from '../../types'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './CreateNode.module.scss'

// interface CreateNodeStepProps {
//   onMouseOver?: () => void
//   onMouseLeave?: () => void
//   onDragLeave?: () => void
//   onDragOver?: () => void
//   onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
//   fireEvent?: FireEventMethod<EventStepDataType>
//   onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
//   identifier: string
//   id: string
//   name: string
//   disabled?: boolean
//   node: CreateNodeStepProps & { isSelected?: boolean }
//   titleClassName?: string
//   className?: string
//   hidden?: boolean
// }

interface CreateNodeStepProps1 extends TerminalNodeProps<EventStepStepGroupDataType> {
  onMouseOver?: () => void
  onMouseLeave?: () => void
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
  onDragLeave?: () => void
  onDragOver?: () => void
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  titleClassName?: string
}

function CreateNodeStep(props: CreateNodeStepProps1): React.ReactElement | null {
  const hasChildren = (
    nodeData: NodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepStepGroupDataType>
  ): boolean => Boolean(defaultTo(nodeData?.data?.children?.length, 0))
  const isParallelNode = (
    nodeData: NodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepStepGroupDataType>
  ): boolean => Boolean(nodeData?.metaData?.isParallelNode)

  return (
    <div
      onMouseOver={(event: any) => {
        event?.stopPropagation()
        props.onMouseOver?.()
      }}
      onMouseLeave={() => {
        props.onMouseLeave?.()
      }}
      className={cssDefault.defaultNode}
      onDragOver={event => {
        event.preventDefault()
        event.stopPropagation()
        props.onDragOver?.()
      }}
      onDragLeave={event => {
        event.preventDefault()
        event.stopPropagation()
        props.onDragLeave?.()
      }}
      onDrop={event => {
        props.onDrop?.(event)
        event.stopPropagation()

        const nodeData = JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag))
        props?.fireEvent?.({
          type: Event.DropNodeEvent,
          target: event.target,
          data: {
            nodeType: DiagramType.CreateNew,
            nodeData: {
              id: nodeData?.data?.id,
              data: nodeData?.data?.data?.step, // TODO--PRAT-- stepGroup also
              metaData: {
                hasChildren: hasChildren(nodeData),
                isParallelNode: isParallelNode(nodeData)
              }
            },
            destinationNode: {
              id: props?.id
            }
          }
        })
      }}
      onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        if (props?.onClick) {
          props?.onClick(event)
          return
        }
        props?.fireEvent?.({
          type: Event.AddLinkClicked,
          target: event.target,
          data: {
            nodeType: DiagramType.CreateNew,
            nodeData: {
              // parentIdentifier: props?.metaData?.parentIdentifier,
              id: props?.id,
              data: {
                identifier: props?.identifier as string,
                name: props?.name as string,
                type: ''
              }
              // metaData: {
              //   hasChildren: hasChildren(nodeData),
              //   isParallelNode: isParallelNode(nodeData)
              // }
            }
            // identifier: props.identifier
          }
        })
      }}
    >
      <CreateNode
        identifier={props.identifier}
        titleClassName={props.titleClassName}
        name={props.name as string}
        className={cx(
          cssDefault.defaultCard,
          css.createNode,
          css.stepAddIcon,
          { [css.disabled]: props.disabled || false },
          // { [css.selected]: props?.node?.isSelected },
          props?.className
        )}
        // hidden={props.hidden}
      />
    </div>
  )
}

export default CreateNodeStep
