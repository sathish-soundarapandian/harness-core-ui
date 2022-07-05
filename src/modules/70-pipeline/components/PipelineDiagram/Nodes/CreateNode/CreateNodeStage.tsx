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
import type { ExecutionWrapperConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import type { EventDataType } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import CreateNode from './CreateNode'
import type { NodeProps, PipelineStageNodeMetaDataType, TerminalNodeProps } from '../../types'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './CreateNode.module.scss'
interface CreateNodeStageProps extends TerminalNodeProps<EventDataType> {
  onMouseOver?: () => void
  onMouseLeave?: () => void
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
}
function CreateNodeStage(props: CreateNodeStageProps): React.ReactElement | null {
  const hasChildren = (
    nodeData: NodeProps<
      StageElementWrapperConfig | ExecutionWrapperConfig,
      PipelineStageNodeMetaDataType,
      EventDataType
    >
  ): boolean => Boolean(defaultTo(nodeData?.data?.children?.length, 0))
  const isParallelNode = (
    nodeData: NodeProps<
      StageElementWrapperConfig | ExecutionWrapperConfig,
      PipelineStageNodeMetaDataType,
      EventDataType
    >
  ): boolean => Boolean(nodeData?.metaData?.isParallelNode)

  return (
    <div
      data-nodeid="add-parallel"
      onMouseOver={() => {
        props.onMouseOver?.()
      }}
      onMouseLeave={() => {
        props.onMouseLeave?.()
      }}
      className={cssDefault.defaultNode}
      onDragOver={event => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onDrop={event => {
        props?.onDrop?.(event)
        event.stopPropagation()
        const nodeData = JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag))
        props?.fireEvent?.({
          type: Event.DropNodeEvent,
          target: event.target,
          data: {
            nodeType: DiagramType.CreateNew,
            nodeData: {
              id: nodeData?.data?.id,
              data: nodeData?.data?.data?.stage,
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
        props?.fireEvent?.({
          type: Event.AddLinkClicked,
          target: event.target,
          data: {
            nodeType: DiagramType.CreateNew,
            nodeData: {
              id: props?.id
            }
          }
        })
      }}
    >
      <CreateNode
        identifier={props?.identifier}
        name={props?.name as string}
        className={cx(props?.className, cssDefault.defaultCard, css.createNode, css.stageAddIcon)}
      />
    </div>
  )
}

export default CreateNodeStage
