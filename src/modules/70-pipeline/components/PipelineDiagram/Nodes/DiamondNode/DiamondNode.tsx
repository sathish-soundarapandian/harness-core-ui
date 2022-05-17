/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Text, Button, ButtonVariation, IconName } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { getStatusProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { PipelineGraphType, NodeType } from '../../types'
import SVGMarker from '../SVGMarker'
import { getPositionOfAddIcon } from '../utils'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './DiamondNode.module.scss'

export function DiamondNodeWidget(props: any): JSX.Element {
  const { getString } = useStrings()
  const isSelected = props?.isSelected || props?.selectedNodeId === props?.id
  const [showAddLink, setShowAddLink] = React.useState(false)
  const stepStatus = defaultTo(props?.status, props?.data?.step?.status as ExecutionStatus)
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getStatusProps(
    stepStatus as ExecutionStatus,
    ExecutionPipelineNodeType.DIAMOND
  )
  return (
    <div
      className={cssDefault.defaultNode}
      onClick={event => {
        event.stopPropagation()
        if (props?.onClick) {
          props.onClick()
          return
        }
        props?.fireEvent?.({
          ...props,
          entityType: DiagramType.Default,
          type: Event.ClickNode
        })
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div
        className={cx(
          cssDefault.defaultCard,
          css.diamond,
          { [cssDefault.selected]: isSelected },
          { [css.top]: props.data.graphType === PipelineGraphType.STAGE_GRAPH }
        )}
        draggable={true}
        onDragStart={event => {
          event.stopPropagation()
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div
          id={props.id}
          data-nodeid={props.id}
          className={css.horizontalBar}
          style={{ height: props.data.graphType === PipelineGraphType.STAGE_GRAPH ? 40 : 64 }}
          onMouseEnter={event => {
            event.stopPropagation()

            props?.fireEvent?.({
              type: Event.MouseEnterNode,
              target: event.target,
              data: { ...props }
            })
          }}
          onMouseLeave={event => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.MouseLeaveNode,
              target: event.target,
              data: { ...props }
            })
          }}
        >
          <div
            className={cx(cssDefault.markerStart, cssDefault.diamondStageLeft, {
              [cssDefault.diamondStep]: props.data.graphType === PipelineGraphType.STEP_GRAPH
            })}
          >
            <SVGMarker />
          </div>
          <div
            className={cx(cssDefault.markerEnd, cssDefault.diamondStageRight, {
              [cssDefault.diamondStep]: props.data.graphType === PipelineGraphType.STEP_GRAPH
            })}
          >
            <SVGMarker />
          </div>
        </div>
        <div className="execution-running-animation" />
        {props.data.isInComplete && (
          <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />
        )}
        {props.icon && (
          <Icon
            size={28}
            className={css.primaryIcon}
            inverse={isSelected}
            name={props.icon}
            color={isSelected ? Color.WHITE : Color.PRIMARY_7}
          />
        )}
        {props.isInComplete && <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />}
        {props?.tertiaryIcon && (
          <Icon
            className={css.tertiaryIcon}
            size={15}
            name={props?.tertiaryIcon}
            style={props?.tertiaryIconStyle}
            {...props.tertiaryIconProps}
          />
        )}
        {secondaryIcon && (
          <Icon
            name={secondaryIcon as IconName}
            style={secondaryIconStyle}
            size={13}
            className={css.secondaryIcon}
            {...secondaryIconProps}
          />
        )}
        {props.skipCondition && (
          <div className={css.conditional}>
            <Text
              tooltip={`Skip condition:\n${props.skipCondition}`}
              tooltipProps={{
                isDark: true
              }}
            >
              <Icon size={26} name={'conditional-skip-new'} color="white" />
            </Text>
          </div>
        )}
        {props.conditionalExecutionEnabled && (
          <div className={css.conditional}>
            <Text
              tooltip={getString('pipeline.conditionalExecution.title')}
              tooltipProps={{
                isDark: true
              }}
            >
              <Icon size={26} name={'conditional-skip-new'} color="white" />
            </Text>
          </div>
        )}
        {props.isTemplate && (
          <Icon
            size={8}
            className={css.template}
            name={'template-library'}
            color={isSelected ? Color.WHITE : Color.PRIMARY_7}
          />
        )}
        {!props.readonly && (
          <Button
            className={cx(cssDefault.closeNode, css.diamondClose)}
            minimal
            variation={ButtonVariation.PRIMARY}
            icon="cross"
            iconProps={{ size: 10 }}
            onMouseDown={e => {
              e.stopPropagation()
              props?.fireEvent?.({
                type: Event.RemoveNode,
                identifier: props?.identifier,
                node: props
              })
            }}
            withoutCurrentColor={true}
          />
        )}
      </div>
      {props.name && (
        <div className={cssDefault.nodeNameText}>
          <Text
            width={125}
            font={{ size: 'normal', align: 'center' }}
            color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
            padding={'small'}
            lineClamp={2}
          >
            {props.name}
          </Text>
        </div>
      )}
      {!props.isParallelNode && (
        <div
          data-linkid={props?.identifier}
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.AddLinkClicked,
              entityType: DiagramType.Link,
              node: props,
              prevNodeIdentifier: props?.prevNodeIdentifier,
              parentIdentifier: props?.parentIdentifier,
              identifier: props?.identifier
            })
          }}
          onDragOver={event => {
            event.stopPropagation()
            event.preventDefault()
            setShowAddLink(true)
          }}
          onDragLeave={event => {
            event.stopPropagation()
            event.preventDefault()
            setShowAddLink(false)
          }}
          onDrop={event => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.DropLinkEvent,
              linkBeforeStepGroup: false,
              entityType: DiagramType.Link,
              node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
              destination: props
            })
          }}
          style={{ left: getPositionOfAddIcon(props) }}
          className={cx(
            cssDefault.addNodeIcon,
            {
              [cssDefault.show]: showAddLink
            },
            {
              [cssDefault.stepAddIcon]: props.data.graphType === PipelineGraphType.STEP_GRAPH
            },
            {
              [cssDefault.stageAddIcon]: props.data.graphType === PipelineGraphType.STAGE_GRAPH
            }
          )}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
      {(props?.nextNode?.nodeType === NodeType.StepGroupNode || (!props?.nextNode && props?.parentIdentifier)) &&
        !props.isParallelNode && (
          <div
            data-linkid={props?.identifier}
            onClick={event => {
              event.stopPropagation()
              props?.fireEvent?.({
                type: Event.AddLinkClicked,
                linkBeforeStepGroup: true,
                prevNodeIdentifier: props?.prevNodeIdentifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Link,
                identifier: props?.identifier,
                node: props
              })
            }}
            onDragOver={event => {
              event.stopPropagation()
              event.preventDefault()
            }}
            style={{ left: getPositionOfAddIcon(props) }}
            onDrop={event => {
              event.stopPropagation()
              props?.fireEvent?.({
                type: Event.DropLinkEvent,
                linkBeforeStepGroup: true,
                entityType: DiagramType.Link,
                node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                destination: props
              })
            }}
            className={cx(
              cssDefault.addNodeIcon,
              {
                [cssDefault.stepAddIcon]: props.data.graphType === PipelineGraphType.STEP_GRAPH
              },
              {
                [cssDefault.stageAddIcon]: props.data.graphType === PipelineGraphType.STAGE_GRAPH
              }
            )}
          >
            <Icon name="plus" color={Color.WHITE} />
          </div>
        )}
    </div>
  )
}
