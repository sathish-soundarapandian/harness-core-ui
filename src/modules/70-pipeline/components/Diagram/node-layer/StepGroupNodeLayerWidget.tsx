/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { map } from 'lodash-es'
import classnames from 'classnames'
import { DiagramEngine, NodeWidget, NodeModel } from '@projectstorm/react-diagrams-core'
import { Text, Icon, Layout, Link } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { StepGroupNodeLayerModel } from './StepGroupNodeLayerModel'
import { Event, StepsType, DiagramDrag } from '../Constants'
import { RollbackToggleSwitch } from '../canvas/RollbackToggleSwitch/RollbackToggleSwitch'
import css from './StepGroupNodeLayer.module.scss'

export interface StepGroupNodeLayerWidgetProps {
  layer: StepGroupNodeLayerModel
  engine: DiagramEngine
}

const onAddNodeClick = (
  e: React.MouseEvent<Element, MouseEvent>,
  node: StepGroupNodeLayerModel,
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

const onMouseOverNode = (e: MouseEvent, layer: StepGroupNodeLayerModel): void => {
  e.stopPropagation()
  layer.fireEvent({ target: e.target }, Event.MouseOverNode)
}

const onMouseEnterNode = (e: MouseEvent, layer: StepGroupNodeLayerModel): void => {
  e.stopPropagation()
  layer.fireEvent({ target: e.target }, Event.MouseEnterNode)
}

const onMouseLeaveNode = (e: MouseEvent, layer: StepGroupNodeLayerModel): void => {
  e.stopPropagation()
  layer.fireEvent({ target: e.target }, Event.MouseLeaveNode)
}

export function StepGroupNodeLayerWidget(props: StepGroupNodeLayerWidgetProps): JSX.Element {
  const options = props.layer.getOptions()
  const allowAdd = options.allowAdd
  const childrenDistance = options.childrenDistance || 140
  const { getString } = useStrings()
  const rollBackProps = options.rollBackProps || {}
  const config = {
    maxX: props.layer.endNode.getPosition().x,
    maxY: 0,
    minX: props.layer.startNode.getPosition().x,
    minY: 0
  }
  const nodes = props.layer.getNodes()
  const layerRef = React.useRef<HTMLDivElement>(null)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [addClicked, setAddClicked] = React.useState(false)
  // const [hover, setHover] = React.useState(false)
  React.useEffect(() => {
    const nodeLayer = layerRef.current

    const onMouseOver = (e: MouseEvent): void => {
      if (!addClicked) {
        setVisibilityOfAdd(true)
      }
      onMouseOverNode(e, props.layer)
    }

    const onMouseEnter = (e: MouseEvent): void => {
      onMouseEnterNode(e, props.layer)
    }

    const onMouseLeave = (e: MouseEvent): void => {
      if (!addClicked) {
        setVisibilityOfAdd(false)
      }
      onMouseLeaveNode(e, props.layer)
    }

    if (nodeLayer && allowAdd) {
      nodeLayer.addEventListener('mouseenter', onMouseEnter)
      nodeLayer.addEventListener('mouseover', onMouseOver)
      nodeLayer.addEventListener('mouseleave', onMouseLeave)
    }
    return () => {
      if (nodeLayer && allowAdd) {
        nodeLayer.removeEventListener('mouseenter', onMouseEnter)
        nodeLayer.removeEventListener('mouseover', onMouseOver)
        nodeLayer.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [layerRef, allowAdd, addClicked])

  React.useEffect(() => {
    if (!addClicked) {
      setVisibilityOfAdd(false)
    }
  }, [addClicked])

  let nodeWidth = 0
  let nodeHeight = 0
  map(nodes, (node: NodeModel) => {
    const position = node.getPosition()
    if (node.width > nodeWidth) {
      nodeWidth = node.width
      nodeHeight = node.height
    }
    if (config.maxY === 0) {
      config.maxY = position.y
      config.minY = position.y
    }
    if (config.maxY < position.y) {
      config.maxY = position.y
    }
    if (config.minY > position.y) {
      config.minY = position.y
    }
  })
  const depth = options.depth || 1
  const headerDepth = options.headerDepth || 0
  const width = config.maxX - config.minX

  const height = childrenDistance * depth + 20

  return (
    <>
      <div
        className={classnames(css.stepGroup)}
        ref={layerRef}
        style={{
          left: config.minX,
          cursor: 'pointer',
          top: config.minY - childrenDistance * headerDepth,
          pointerEvents: allowAdd ? 'all' : 'none',
          position: 'absolute',
          height: height
        }}
        onDragOver={event => {
          if (allowAdd) {
            setVisibilityOfAdd(true)
            event.preventDefault()
          }
        }}
        onDragLeave={() => {
          if (allowAdd) {
            setVisibilityOfAdd(false)
          }
        }}
        onDrop={event => {
          event.stopPropagation()
          const dropData: { id: string; identifier: string } = JSON.parse(
            event.dataTransfer.getData(DiagramDrag.NodeDrag)
          )
          props.layer.fireEvent({ node: dropData }, Event.DropLinkEvent)
        }}
      >
        <div
          className={css.groupLayer}
          ref={layerRef}
          style={{
            width,
            height,
            ...options.containerCss
            //background: 'rgba(0,0,0,0.1)'
          }}
        ></div>
        {options.showRollback && (
          <div onMouseDown={e => e.stopPropagation()}>
            <RollbackToggleSwitch
              disabled={options.inComplete}
              large={false}
              style={{ left: width - 60, top: 0 }}
              {...rollBackProps}
              onChange={type => props.layer.fireEvent({ type }, Event.RollbackClicked)}
            />
          </div>
        )}
        {/*NOTE: "!!nodeWidth"  is a workaround for CDNG-7023 */}
        {allowAdd && !!nodeWidth && (
          <div
            onClick={e => {
              setAddClicked(true)
              onAddNodeClick(e, props.layer, setAddClicked)
            }}
            className={css.addNode}
            style={{
              left: config.minX + width / 2 - nodeWidth / 2,
              top: config.minY + height - 20,
              width: nodeWidth,
              height: nodeHeight,
              display: showAdd ? 'flex' : 'none'
            }}
          >
            <Icon name="plus" style={{ color: 'var(--diagram-add-node-color)' }} />
          </div>
        )}
      </div>
      <Layout.Horizontal
        spacing="xsmall"
        className={css.header}
        style={{
          top: config.minY - (childrenDistance * headerDepth - 5),
          left: config.minX + 10,
          width: width - 20 - (options.showRollback ? 50 : 0),
          alignItems: 'center'
        }}
        onMouseOver={e => {
          e.stopPropagation()
          //setHover(true)
        }}
        onMouseOut={e => {
          e.stopPropagation()
          //setHover(false)
        }}
      >
        <Icon
          className={css.collapseIcon}
          name="minus"
          onClick={e => {
            e.stopPropagation()
            props.layer.fireEvent({}, Event.StepGroupCollapsed)
          }}
        />

        {options.skipCondition && (
          <div className={css.conditional}>
            <Link
              tooltip={`Skip condition:\n${options.skipCondition}`}
              tooltipProps={{
                isDark: true
              }}
              withoutHref
            >
              <Icon size={26} name={'conditional-skip-new'} />
            </Link>
          </div>
        )}
        {options.conditionalExecutionEnabled && (
          <div className={css.conditional}>
            <Text
              tooltip={getString('pipeline.conditionalExecution.title')}
              tooltipProps={{
                isDark: true
              }}
            >
              <Icon size={26} name={'conditional-skip-new'} />
            </Text>
          </div>
        )}
        <Text
          tooltipProps={{ portalClassName: css.labelTooltip }}
          icon={options.inComplete ? 'warning-sign' : undefined}
          iconProps={{ color: Color.ORANGE_500 }}
          style={{ ...options.textCss }}
          lineClamp={1}
          onClick={e => {
            e.stopPropagation()
            props.layer.fireEvent({}, Event.StepGroupClicked)
          }}
          onMouseEnter={e => {
            e.stopPropagation()
            props.layer.fireEvent({ target: e.target }, Event.MouseEnterStepGroupTitle)
          }}
          onMouseLeave={e => {
            e.stopPropagation()
            props.layer.fireEvent({ target: e.target }, Event.MouseLeaveStepGroupTitle)
          }}
        >
          {options.label} {options.rollBackProps?.active === StepsType.Rollback && `(${getString('rollbackLabel')})`}
        </Text>
      </Layout.Horizontal>
      <>
        {map(nodes, (node: NodeModel) => {
          return <NodeWidget key={node.getID()} diagramEngine={props.engine} node={node} />
        })}
      </>
    </>
  )
}
