/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties } from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { Icon, Text, Button, ButtonVariation, IconName } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import SVGMarker from '../SVGMarker'
import type { NodeProps, PipelineGraphState } from '../../types'
import css from './DefaultNode.module.scss'

export interface NodeDataType {
  identifier?: string
}
interface NodeMetaDataType {
  // status: string //data

  showMarkers?: boolean
  conditionalExecutionEnabled: boolean
  graphType: string
  isInComplete: boolean
  isTemplateNode: boolean
  loopingStrategyEnabled: boolean
  tertiaryIcon?: IconName
  iconStyle: CSSProperties
}

function DefaultNode(props: NodeProps<PipelineGraphState<any, NodeMetaDataType>, NodeMetaDataType>): JSX.Element {
  const allowAdd = defaultTo(props?.permissions?.allowAdd, false)
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return
    }
    setVisibilityOfAdd(visibility)
  }

  const isSelected = props?.data?.id === props?.selectedNodeId
  React.useEffect(() => {
    const currentNode = nodeRef.current
    const onMouseOver = (_e: MouseEvent): void => {
      setAddVisibility(true)
    }
    const onMouseLeave = (_e: MouseEvent): void => {
      setTimeout(() => {
        setAddVisibility(false)
      }, 100)
    }

    currentNode?.addEventListener?.('mouseover', onMouseOver)
    currentNode?.addEventListener?.('mouseleave', onMouseLeave)

    return () => {
      currentNode?.removeEventListener?.('mouseover', onMouseOver)
      currentNode?.removeEventListener?.('mouseleave', onMouseLeave)
    }
  }, [nodeRef, allowAdd])

  return (
    <div
      className={`${cx(css.defaultNode, 'default-node', {
        [css.marginBottom]: props?.metaData?.isParallelNode
      })} draggable`}
      ref={nodeRef}
      onClick={event => {
        event.stopPropagation()

        props?.fireEvent?.({
          type: Event.ClickNode,
          target: event.target,
          data: {
            entityType: DiagramType.Default,
            ...props
          }
        })
      }}
      onMouseDown={e => e.stopPropagation()}
      onDragOver={event => {
        event.stopPropagation()

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          setAddVisibility(true)
          event.preventDefault()
        }
      }}
      onDragLeave={event => {
        event.stopPropagation()

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          setAddVisibility(false)
        }
      }}
      onDrop={event => {
        event.stopPropagation()
        props?.fireEvent?.({
          type: Event.DropNodeEvent,
          target: event.target,
          data: {
            entityType: DiagramType.Default,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: props
          }
        })
      }}
    >
      <div
        id={props?.data?.id}
        data-nodeid={props?.data?.id}
        draggable={true}
        className={cx(css.defaultCard, { [css.selected]: isSelected })}
        style={{
          width: 90,
          height: 40
        }}
        onDragStart={event => {
          event.stopPropagation()
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div className={css.markerStart}>
          <SVGMarker />
        </div>
        <div className="execution-running-animation" />
        {props?.data?.icon ? (
          <Icon
            size={28}
            name={props?.data?.icon as IconName}
            inverse={isSelected}
            style={{ pointerEvents: 'none', ...props?.data?.metaData?.iconStyle }}
          />
        ) : null}
        <Button
          className={cx(css.closeNode, { [css.readonly]: props?.permissions?.readonly })}
          minimal
          icon="cross"
          variation={ButtonVariation.PRIMARY}
          iconProps={{ size: 10 }}
          onMouseDown={e => {
            e.stopPropagation()
            props?.fireEvent?.({
              type: Event.RemoveNode,
              target: e.target,
              data: {
                identifier: props?.data?.identifier,
                node: props
              }
            })
          }}
          withoutCurrentColor={true}
        />
        <div className={css.markerEnd}>
          <SVGMarker />
        </div>
      </div>
      {props?.data?.name ? (
        <Text
          width={125}
          font={{ size: 'normal', align: 'center' }}
          color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
          className={css.nameText}
          padding={'small'}
          lineClamp={2}
          data-node-name={props?.data?.name}
        >
          {props?.data?.name}
        </Text>
      ) : null}
      {allowAdd ? (
        <div
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                entityType: DiagramType.Default,
                identifier: props?.data?.identifier,
                parentIdentifier: props?.metaData?.parentIdentifier,
                node: props
              }
            })
          }}
          className={css.addNode}
          data-nodeid="add-parallel"
          style={{
            width: 90,
            height: 40,
            visibility: showAdd ? 'visible' : 'hidden'
          }}
        >
          <Icon name="plus" size={22} color={'var(--diagram-add-node-color)'} />
        </div>
      ) : null}
    </div>
  )
}

export default DefaultNode
