/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Icon } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Text } from '@wings-software/uicore'
import { Event } from '@pipeline/utils/PipelineStudioUtils'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import type { CreateNewModel, CreateNewModelOptions } from './CreateNewModel'
import type { DefaultNodeModel } from '../DefaultNodeModel'
import { DiagramDrag } from '../../Constants'
import cssDefault from '../DefaultNode.module.scss'
import css from './CreateNew.module.scss'

export interface CreateNewWidgetProps {
  node: CreateNewModel
  engine?: DiagramEngine
}
const generatePort = (port: DefaultPortModel, props: CreateNewWidgetProps): JSX.Element => {
  return props.engine ? <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} /> : <></>
}

const onClickNode = (e: React.MouseEvent<Element, MouseEvent>, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.ClickNode)
}

export function CreateNewWidget(props: CreateNewWidgetProps): React.ReactElement {
  const options: CreateNewModelOptions = props.node.getOptions()
  const { disabled = false } = options
  const [dropable, setDropable] = React.useState(false)

  // NOTE: adjust x position node in order to get node box cornet at x zero position
  const marginAdjustment = -(128 - (options?.width || 64)) / 2

  return (
    <div
      className={cx(cssDefault.defaultNode, css.createNode, 'create-node')}
      style={{ marginLeft: `${marginAdjustment}px` }}
      onClick={e => !disabled && onClickNode(e, props.node)}
      onMouseDown={e => {
        e.stopPropagation()
        !disabled && props.node.setSelected(true)
      }}
      onDragOver={event => {
        setDropable(true)
        event.preventDefault()
      }}
      onDragLeave={() => {
        setDropable(false)
      }}
      onDrop={event => {
        event.stopPropagation()
        setDropable(false)
        const dropData: { id: string; identifier: string } = JSON.parse(
          event.dataTransfer.getData(DiagramDrag.NodeDrag)
        )
        props.node.fireEvent({ node: dropData }, Event.DropLinkEvent)
      }}
    >
      <div
        className={cx(
          cssDefault.defaultCard,
          css.createNew,
          { [css.disabled]: disabled },
          { [css.selected]: props.node.isSelected() },
          { [cssDefault.selected]: dropable },
          options.nodeClassName
        )}
        style={{
          marginTop: 32 - (options.height || 64) / 2,
          width: options.width,
          height: options.height,
          ...options.customNodeStyle
        }}
      >
        <div>
          <Icon icon="plus" iconSize={22} color={'var(--diagram-add-node-color)'} />

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
          data-name="node-name"
          font={{ align: 'center' }}
          padding={{ top: 'small' }}
          lineClamp={2}
          style={{ marginLeft: '-30px', marginRight: '-30px' }}
        >
          {options.name}
        </Text>
      )}
    </div>
  )
}
