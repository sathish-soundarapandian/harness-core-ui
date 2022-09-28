/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties } from 'react'
import cx from 'classnames'
import { debounce, defaultTo } from 'lodash-es'
import { Icon, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import type { BaseReactComponentProps } from '../../types'
import css from '../DefaultNode/DefaultNode.module.scss'

interface GroupNodeProps extends BaseReactComponentProps {
  allowAdd: boolean
  children: []
  intersectingIndex: number
  customNodeStyle?: CSSProperties
  defaultSelected: any
  parentIdentifier: string
}
const getDisplayValue = (showAdd: boolean): string => (showAdd ? 'flex' : 'none')

function GroupNode(props: GroupNodeProps): React.ReactElement {
  const allowAdd = props.allowAdd ?? false
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return
    }
    setVisibilityOfAdd(visibility)
  }
  const debounceHideVisibility = debounce(() => {
    setVisibilityOfAdd(false)
  }, 300)
  React.useEffect(() => {
    const currentNode = nodeRef.current
    const onMouseOver = (_e: MouseEvent): void => {
      setAddVisibility(true)
    }
    const onMouseLeave = (_e: MouseEvent): void => {
      setTimeout(() => {
        debounceHideVisibility()
      }, 100)
    }

    currentNode?.addEventListener?.('mouseover', onMouseOver)
    currentNode?.addEventListener?.('mouseleave', onMouseLeave)

    return () => {
      currentNode?.removeEventListener?.('mouseover', onMouseOver)
      currentNode?.removeEventListener?.('mouseleave', onMouseLeave)
    }
  }, [nodeRef, allowAdd])

  const nodesInfo = React.useMemo(() => {
    return props?.children
      ?.slice(props.intersectingIndex - 1)
      .map((node: any) => ({ name: node.name, icon: node.icon, identifier: node.identifier, type: node.type }))
  }, [props?.children, props.intersectingIndex])

  const getGroupNodeName = (): string => {
    return `${defaultTo(nodesInfo?.[0]?.name, '')} +  ${nodesInfo.length - 1} more stages`
  }

  return (
    <div
      className={css.defaultNode}
      ref={nodeRef}
      onClick={(event: any) => {
        event.preventDefault()
        event.stopPropagation()
        props?.fireEvent?.({
          type: Event.ClickNode,
          target: event.target,
          data: {
            entityType: DiagramType.GroupNode,
            identifier: props?.identifier,
            nodesInfo
          }
        })
        props?.setSelectedNode?.(props?.identifier as string)
      }}
      onDragOver={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          setAddVisibility(true)
          event.preventDefault()
        }
      }}
      onDragLeave={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          debounceHideVisibility()
        }
      }}
      onDrop={event => {
        event.stopPropagation()
        props?.fireEvent?.({
          type: Event.DropNodeEvent,
          target: event.target,
          data: {
            entityType: DiagramType.Default as string,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            // last element of groupnode
            destination: props?.children?.slice(-1)?.[0]
          }
        })
      }}
    >
      <div
        className={css.defaultCard}
        style={{
          position: 'absolute',
          width: defaultTo(props.width, 90),
          height: defaultTo(props.height, 40),
          marginTop: -8,
          marginLeft: 8
        }}
      ></div>
      <div
        className={css.defaultCard}
        style={{
          position: 'absolute',
          width: defaultTo(props.width, 90),
          height: defaultTo(props.height, 40),
          marginTop: -4,
          marginLeft: 4
        }}
      ></div>

      <div
        id={props.id}
        data-nodeid={props.id}
        className={cx(css.defaultCard, { [css.selected]: props?.isSelected })}
        style={{
          width: defaultTo(props.width, 90),
          height: defaultTo(props.height, 40),
          marginTop: 32 - defaultTo(props.height, 64) / 2,
          ...props.customNodeStyle
        }}
      >
        <div className={css.iconGroup}>
          {nodesInfo[0].icon && <Icon size={28} name={nodesInfo[0].icon} />}
          {nodesInfo[1].icon && <Icon size={28} name={nodesInfo[1].icon} />}
        </div>
      </div>
      <Text
        font={{ size: 'normal', align: 'center' }}
        color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
        style={{ cursor: 'pointer', lineHeight: '1.5', overflowWrap: 'normal', wordBreak: 'keep-all', height: 55 }}
        padding={'small'}
        lineClamp={2}
      >
        {getGroupNodeName()}
      </Text>
      {allowAdd ? (
        <div
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                identifier: props?.identifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Default,
                node: props
              }
            })
          }}
          className={css.addNode}
          data-nodeid="add-parallel"
          style={{
            width: defaultTo(props.width, 90),
            height: defaultTo(props.height, 40),
            display: getDisplayValue(showAdd)
          }}
        >
          <Icon name="plus" size={22} color={'var(--diagram-add-node-color)'} />
        </div>
      ) : null}
    </div>
  )
}

export default GroupNode
