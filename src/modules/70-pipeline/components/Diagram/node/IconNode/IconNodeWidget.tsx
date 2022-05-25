/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Text, IconName, Icon, Button, ButtonVariation } from '@wings-software/uicore'
import { Position } from '@blueprintjs/core'
import { Event } from '@pipeline/utils/PipelineStudioUtils'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import type { IconNodeModel } from './IconNodeModel'
import type { DefaultNodeModel } from '../DefaultNodeModel'
import { DiagramDrag } from '../../Constants'
import cssDefault from '../DefaultNode.module.scss'
import css from './IconNode.module.scss'

export interface IconNodeWidgetProps {
  node: IconNodeModel
  engine: DiagramEngine
}

const generatePort = (port: DefaultPortModel, props: IconNodeWidgetProps): JSX.Element => {
  return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
}

const onAddNodeClick = (
  e: React.MouseEvent<Element, MouseEvent>,
  node: DefaultNodeModel,
  setAddClicked: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  e.stopPropagation()
  node.fireEvent(
    {
      callback: () => {
        setAddClicked(false)
      },
      target: e.target
    },
    Event.AddParallelNode
  )
}

const onClickNode = (e: React.MouseEvent<Element, MouseEvent>, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.ClickNode)
}

const onMouseOverNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseOverNode)
}
const onClick = (e: React.MouseEvent<Element, MouseEvent>, node: IconNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.RemoveNode)
}
const onMouseEnterNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseEnterNode)
}

const onMouseLeaveNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseLeaveNode)
}
export function IconNodeWidget(props: IconNodeWidgetProps): React.ReactElement {
  const options = props.node.getOptions()
  const [dropable, setDropable] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const allowAdd = options.allowAdd ?? false

  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [addClicked, setAddClicked] = React.useState(false)
  const onMouseOver = (e: MouseEvent): void => {
    if (!addClicked && allowAdd) {
      setVisibilityOfAdd(true)
    }
    onMouseOverNode(e, props.node)
  }
  const onMouseLeave = (e: MouseEvent): void => {
    setVisibilityOfAdd(false)
    onMouseLeaveNode(e, props.node)
  }
  return (
    <div
      className={cx(cssDefault.defaultNode, css.iconNodeContainer)}
      onClick={e => onClickNode(e, props.node)}
      onMouseDown={e => {
        e.stopPropagation()
        props.node.setSelected(true)
      }}
      onDragOver={event => {
        setDropable(true)
        if (allowAdd) {
          setVisibilityOfAdd(true)
          event.preventDefault()
        }
      }}
      onDragLeave={() => {
        setDropable(false)
        if (allowAdd) {
          setVisibilityOfAdd(false)
        }
      }}
      onDrop={event => {
        event.stopPropagation()
        setDropable(false)
        const dropData: { id: string; identifier: string } = JSON.parse(
          event.dataTransfer.getData(DiagramDrag.NodeDrag)
        )
        props.node.setSelected(false)
        props.node.fireEvent({ node: dropData }, Event.DropLinkEvent)
      }}
      onMouseEnter={event => onMouseEnterNode(event as any as MouseEvent, props.node)}
      onMouseLeave={event => onMouseLeave(event as any as MouseEvent)}
      onMouseOver={event => onMouseOver(event as any as MouseEvent)}
    >
      <div
        className={cx(
          cssDefault.defaultCard,
          css.iconNode,
          { [cssDefault.selected]: props.node.isSelected() },
          { [cssDefault.selected]: dropable }
        )}
        draggable={options.draggable}
        style={{
          marginTop: 32 - (options.height || 64) / 2,
          width: options.width,
          height: options.height,
          opacity: dragging ? 0.4 : 1,
          ...options.customNodeStyle
        }}
        onDragStart={event => {
          setDragging(true)
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props.node.serialize()))
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          setDragging(false)
        }}
      >
        <div>
          {options.isInComplete && (
            <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />
          )}
          {options.canDelete && (
            <Button
              className={cx(cssDefault.closeNode)}
              variation={ButtonVariation.PRIMARY}
              minimal
              withoutCurrentColor
              icon="cross"
              iconProps={{ size: 10 }}
              onMouseDown={e => onClick(e, props.node)}
            />
          )}
          <Icon
            name={options.icon as IconName}
            size={options.iconSize}
            inverse={options.defaultSelected ?? props.node.isSelected()}
            style={{ pointerEvents: 'none', ...options.iconStyle }}
          />
          <div>
            <div style={{ visibility: options.showPorts ? 'visible' : 'hidden' }}>
              {props.node.getInPorts().map(port => generatePort(port, props))}
            </div>
            <div style={{ visibility: options.showPorts ? 'visible' : 'hidden' }}>
              {props.node.getOutPorts().map(port => generatePort(port, props))}
            </div>
          </div>
        </div>
      </div>
      {!isEmpty(options.name) && (
        <Text
          font={{ size: 'normal', align: 'center' }}
          style={{
            cursor: 'pointer',
            lineHeight: '1.6',
            overflowWrap: 'normal',
            wordBreak: 'keep-all',
            marginLeft: '0px',
            marginRight: '0px'
          }}
          padding="xsmall"
          lineClamp={2}
          tooltipProps={{ position: Position.RIGHT, portalClassName: css.hoverName }}
        >
          {options.name}
        </Text>
      )}
      {allowAdd && (
        <div
          onClick={e => {
            setAddClicked(true)
            setVisibilityOfAdd(true)
            onAddNodeClick(e, props.node, setAddClicked)
          }}
          className={cssDefault.addNode}
          data-nodeid="add-parallel"
          style={{
            width: options.width,
            height: options.height,
            opacity: showAdd ? 1 : 0,
            marginLeft: (126 - (options.width || 64)) / 2
          }}
        >
          <Icon name="plus" style={{ color: 'var(--diagram-add-node-color)' }} />
        </div>
      )}
    </div>
  )
}
