/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { DiagramDrag, DiagramType, Event } from '../../Constants'
import CreateNode from './CreateNode'
import type { FireEventMethod } from '../../types'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './CreateNode.module.scss'

interface CreateNodeStepProps {
  onMouseOver?: () => void
  onMouseLeave?: () => void
  onDragLeave?: () => void
  onDragOver?: () => void
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
  fireEvent?: FireEventMethod
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  identifier: string
  name: string
  disabled?: boolean
  node?: CreateNodeStepProps & { isSelected?: boolean }
  titleClassName?: string
  className?: string
  wrapperClassname?: string
  hidden?: boolean
}

function CreateNodeStep(props: CreateNodeStepProps): React.ReactElement {
  return (
    <div
      data-testid="create-node-step"
      onMouseOver={(event: any) => {
        event?.stopPropagation()
        props.onMouseOver?.()
      }}
      onMouseLeave={() => {
        props.onMouseLeave?.()
      }}
      className={cx(cssDefault.defaultNode, props.wrapperClassname)}
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
        props?.fireEvent?.({
          type: Event.DropNodeEvent,
          target: event.target,
          data: {
            identifier: props.identifier,
            entityType: DiagramType.CreateNew,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: props
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
            entityType: DiagramType.CreateNew,
            identifier: props.identifier
          }
        })
      }}
    >
      <CreateNode
        identifier={props.identifier}
        titleClassName={props.titleClassName}
        name={props.name}
        className={cx(
          cssDefault.defaultCard,
          css.createNode,
          'stepAddIcon',
          { [css.disabled]: props.disabled || false },
          { [css.selected]: props?.node?.isSelected },
          props?.className
        )}
        hidden={props.hidden}
      />
    </div>
  )
}

export default CreateNodeStep
