/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { Icon } from '@harness/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import type { NodeProps, PipelineStageNodeMetaDataType } from '@pipeline/components/PipelineDiagram/types'
import type { StageElementWrapperConfig } from 'services/pipeline-ng'
import type { EventDataType } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { getPositionOfAddIcon } from '../../utils'
interface AddLinkNodeProps extends NodeProps<StageElementWrapperConfig, PipelineStageNodeMetaDataType, EventDataType> {
  parentIdentifier?: string
  isParallelNode?: boolean
  readonly?: boolean
  identifier?: string
  showAddLink?: boolean
  className?: string
  id?: string
  isRightAddIcon?: boolean
  setShowAddLink?: (data: boolean) => void
}
export default function AddLinkNode(props: AddLinkNodeProps): React.ReactElement | null {
  return (
    <div
      style={{ left: getPositionOfAddIcon(props) }}
      data-linkid={props?.identifier}
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
              data: props?.data?.data?.stage,
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
              data: props?.data?.data?.stage,
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
