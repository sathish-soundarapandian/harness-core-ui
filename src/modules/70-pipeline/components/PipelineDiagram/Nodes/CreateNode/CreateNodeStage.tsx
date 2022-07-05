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
import type { StageElementConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import type { EventDataType } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import CreateNode from './CreateNode'
import type { NodeProps, PipelineStageNodeMetaDataType, TerminalNodeProps } from '../../types'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './CreateNode.module.scss'
// interface CreateNodeStageProps {
//   onMouseOver?: () => void
//   onMouseLeave?: () => void
//   onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
//   fireEvent?: FireEventMethod
//   onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
//   identifier: string
//   name: string
//   disabled?: boolean
//   node: CreateNodeStageProps
//   visible?: boolean
//   className?: string
// }
function CreateNodeStage(props: TerminalNodeProps<EventDataType>): React.ReactElement | null {
  return (
    <div
      data-nodeid="add-parallel"
      // onMouseOver={() => {
      //   props.onMouseOver?.()
      // }}
      // onMouseLeave={() => {
      //   props.onMouseLeave?.()
      // }}
      // className={cssDefault.defaultNode}
      // onDragOver={event => {
      //   event.preventDefault()
      //   event.stopPropagation()
      // }}
      // onDrop={event => {
      //   props?.onDrop?.(event)
      //   event.stopPropagation()
      //   props?.fireEvent?.({
      //     type: Event.DropNodeEvent,
      //     target: event.target,
      //     data: {
      //       entityType: DiagramType.CreateNew,
      //       node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
      //       destination: props,
      //       identifier: props.identifier
      //     }
      //   })
      // }}
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
        identifier={props.identifier}
        name={props.name as string}
        className={cx(
          props?.className,
          cssDefault.defaultCard,
          css.createNode,
          css.stageAddIcon,
          { [css.disabled]: defaultTo(props.disabled, false) } //allowAdd or readonly
        )}
      />
    </div>
  )
}

export default CreateNodeStage
