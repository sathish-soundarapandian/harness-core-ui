/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties } from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { Icon, IconName, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import { NodeType, BaseReactComponentProps } from '../../types'
import css from '../DefaultNode/DefaultNode.module.scss'

export interface GroupNodeProps extends BaseReactComponentProps {
  intersectingIndex: number
  children?: any
  customNodeStyle?: CSSProperties | undefined
}
interface Node {
  name: string
  icon: IconName
  identifier: string
  id: string
  type: string
}
function GroupNode(props: GroupNodeProps): React.ReactElement {
  const [selected, setSelected] = React.useState<boolean>(false)
  const allowAdd = defaultTo(props.allowAdd, false)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const CreateNode: React.FC<BaseReactComponentProps> | undefined = props?.getNode?.(NodeType.CreateNode)?.component

  const nodesInfo = React.useMemo(() => {
    let nodesArr
    if (props.intersectingIndex < 1) {
      const firstNodeData: Node = {
        name: props.name as string,
        icon: props.icon as IconName,
        identifier: props.identifier as string,
        id: props.id,
        type: props.type as string
      }
      nodesArr = [firstNodeData, ...props?.children]
    } else {
      nodesArr = props?.children?.slice(props.intersectingIndex - 1)
    }

    const nodesFinal: Node[] = []
    let isNodeSelected = false
    nodesArr.forEach((node: Node) => {
      const isSelectedNode = node.identifier === props.selectedNodeId || node.id === props.selectedNodeId
      if (isSelectedNode) {
        isNodeSelected = isSelectedNode
      }
      const nodeToBePushed = {
        name: node.name,
        icon: node.icon as IconName,
        identifier: node.identifier,
        id: node.id,
        type: node.type
      }
      if (isSelectedNode) {
        nodesFinal.unshift(nodeToBePushed)
      } else {
        nodesFinal.push(nodeToBePushed)
      }
    })
    if (isNodeSelected !== selected) {
      setSelected(isNodeSelected)
    }
    return nodesFinal
  }, [props?.children, props.intersectingIndex, props.selectedNodeId])

  const getGroupNodeName = (): string => {
    return `${defaultTo(nodesInfo?.[0]?.name, '')} +  ${nodesInfo.length - 1} more stages`
  }

  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return
    }
    setVisibilityOfAdd(visibility)
  }
  return (
    <div style={{ position: 'relative' }}>
      <div
        className={css.defaultNode}
        onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          event.preventDefault()
          event.stopPropagation()
          props?.fireEvent?.({
            type: Event.ClickNode,
            target: event.target,
            data: {
              entityType: DiagramType.GroupNode,
              identifier: props?.identifier,
              nodesInfo,
              ...props
            }
          })
        }}
        onMouseOver={() => setAddVisibility(true)}
        onMouseLeave={() => setAddVisibility(false)}
        onDragOver={event => {
          if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
            setAddVisibility(true)
            event.preventDefault()
          }
        }}
        onDragLeave={event => {
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
          className={cx(css.defaultCard, { [css.selected]: selected })}
          style={{
            width: defaultTo(props.width, 90),
            height: defaultTo(props.height, 40),
            marginTop: 32 - defaultTo(props.height, 64) / 2,
            ...props.customNodeStyle
          }}
        >
          <div className={css.iconGroup}>
            {nodesInfo?.[0]?.icon && nodesInfo[0].icon && <Icon size={28} name={nodesInfo[0].icon} />}
            {nodesInfo?.[1]?.icon && nodesInfo[1].icon && <Icon size={28} name={nodesInfo[1].icon} />}
          </div>
        </div>

        <div className={cx(css.nodeNameText, css.stageName)}>
          <Text
            width={125}
            font={{ size: 'normal', align: 'center' }}
            color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
            padding={'small'}
            lineClamp={2}
          >
            {getGroupNodeName()}
          </Text>
        </div>
      </div>
      {allowAdd && CreateNode && (
        <CreateNode
          id={props.id}
          onMouseOver={() => setAddVisibility(true)}
          onMouseLeave={() => setAddVisibility(false)}
          onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
          className={cx(css.addNode, { [css.visible]: showAdd }, css.stageAddNode)}
          data-nodeid="add-parallel"
        />
      )}
    </div>
  )
}

export default GroupNode
