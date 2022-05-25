/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Icon, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { Event } from '@pipeline/utils/PipelineStudioUtils'
import type { GroupNodeModel } from './GroupNodeModel'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import { DiagramDrag } from '../../Constants'
import css from '../DefaultNode.module.scss'

export interface GroupNodeProps {
  node: GroupNodeModel
  engine: DiagramEngine
}

const generatePort = (port: DefaultPortModel, props: GroupNodeProps): JSX.Element => {
  return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
}

const onClickNode = (e: React.MouseEvent<Element, MouseEvent>, node: GroupNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.ClickNode)
}

export function GroupNodeWidget(props: GroupNodeProps): JSX.Element {
  const options = props.node.getOptions()
  const allowAdd = options.allowAdd ?? false
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  return (
    <div
      className={css.defaultNode}
      onClick={e => onClickNode(e, props.node)}
      onMouseDown={e => {
        e.stopPropagation()
        props.node.setSelected(true)
      }}
      onDragOver={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(true)
            event.preventDefault()
          }
        }
      }}
      onDragLeave={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(false)
          }
        }
      }}
      onDrop={event => {
        event.stopPropagation()
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          const dropData: { id: string; identifier: string } = JSON.parse(
            event.dataTransfer.getData(DiagramDrag.NodeDrag)
          )
          props.node.setSelected(false)
          props.node.fireEvent({ node: dropData }, Event.DropLinkEvent)
        }
      }}
    >
      <div
        className={css.defaultCard}
        style={{
          position: 'absolute',
          width: options.width,
          height: options.height,
          marginTop: 15 - (options.height || 64) / 2,
          marginLeft: 30
        }}
      ></div>
      <div
        className={css.defaultCard}
        style={{
          position: 'absolute',
          width: options.width,
          height: options.height,
          marginTop: 20 - (options.height || 64) / 2,
          marginLeft: 25
        }}
      ></div>
      <div
        className={cx(css.defaultCard, { [css.selected]: props.node.isSelected() })}
        style={{
          width: options.width,
          height: options.height,
          marginTop: 32 - (options.height || 64) / 2,
          ...options.customNodeStyle
        }}
      >
        <div className={css.iconGroup}>
          {options.icons[0] && <Icon size={28} name={options.icons[0]} {...options.iconPropsAr?.[0]} />}
          {options.icons[1] && <Icon size={28} name={options.icons[1]} {...options.iconPropsAr?.[1]} />}
        </div>
        {options.showPorts && <div>{props.node.getInPorts().map(port => generatePort(port, props))}</div>}
        {options.showPorts && <div>{props.node.getOutPorts().map(port => generatePort(port, props))}</div>}
      </div>
      <Text
        font={{ size: 'normal', align: 'center' }}
        style={{ cursor: 'pointer' }}
        padding="xsmall"
        width={125}
        lineClamp={5}
      >
        {options.name}
      </Text>
      {allowAdd && (
        <div
          onClick={() => {
            setVisibilityOfAdd(true)
          }}
          className={css.addNode}
          data-nodeid="add-parallel"
          style={{
            width: options.width,
            height: options.height,
            display: showAdd ? 'flex' : 'none',
            marginLeft: (126 - (options.width || 64)) / 2
          }}
        >
          <Icon name="plus" style={{ color: 'var(--diagram-add-node-color)' }} />
        </div>
      )}
    </div>
  )
}
