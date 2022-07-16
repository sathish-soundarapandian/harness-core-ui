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
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import type { ExecutionWrapperConfig, StepElementConfig } from 'services/pipeline-ng'
import type { EventStepDataType } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { PipelineGraphType, NodeType, NodeProps, PipelineStageNodeMetaDataType } from '../../types'
import SVGMarker from '../SVGMarker'
import AddLinkNode from '../DefaultNode/AddLinkNode/AddLinkNode'
import { getPositionOfAddIcon } from '../utils'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './DiamondNode.module.scss'

export function DiamondNodeWidget(
  props: NodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepDataType>
): JSX.Element {
  const { getString } = useStrings()

  // alloAdd missing
  const isSelectedNode = (): boolean =>
    [props?.data?.id, props?.data?.identifier].includes(props.selectedNodeId as string)

  const [showAddLink, setShowAddLink] = React.useState(false)

  const stepStatus = defaultTo(props?.data?.status, props?.data?.metaData?.status as ExecutionStatus)
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getStatusProps(
    stepStatus as ExecutionStatus,
    ExecutionPipelineNodeType.DIAMOND
  )

  const showMarkers = defaultTo(props?.data?.metaData?.nodeMeta?.showMarkers, true)
  const isTemplateNode = props?.data?.metaData?.isTemplateNode

  // const hasChildren = (nodeData: typeof props): boolean => Boolean(defaultTo(nodeData?.data?.children?.length, 0))
  const isParallelNode = (nodeData: typeof props): boolean => Boolean(nodeData?.metaData?.isParallelNode)

  return (
    <div
      className={cx(cssDefault.defaultNode, 'diamond-node')}
      onClick={event => {
        event.stopPropagation()
        if (props?.onClick) {
          props.onClick()
          return
        }
        props?.fireEvent?.({
          type: Event.ClickNode,
          target: event.target,
          data: {
            nodeType: DiagramType.DiamondNode,
            nodeData: {
              id: props?.data?.id,
              data: props?.data?.data?.step,
              metaData: {
                // hasChildren: hasChildren(props),
                // isParallelNode: isParallelNode(props)
              }
            }
          }
        })
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div
        className={cx(
          cssDefault.defaultCard,
          css.diamond,

          {
            [cssDefault.selected]: isSelectedNode(),
            [cssDefault.failed]: stepStatus === ExecutionStatusEnum.Failed,
            [cssDefault.runningNode]: stepStatus === ExecutionStatusEnum.Running,
            [cssDefault.skipped]: stepStatus === ExecutionStatusEnum.Skipped,
            [cssDefault.notStarted]: stepStatus === ExecutionStatusEnum.NotStarted
          },
          { [css.top]: props?.data?.graphType === PipelineGraphType.STAGE_GRAPH }
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
          id={props?.data?.id}
          data-nodeid={props?.data?.id}
          className={css.horizontalBar}
          style={{ height: props.data?.graphType === PipelineGraphType.STAGE_GRAPH ? 40 : 64 }}
          onMouseEnter={event => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.MouseEnterNode,
              target: event.target,
              data: {
                nodeType: DiagramType.Default,
                nodeData: {
                  id: props?.data?.id,
                  data: props?.data?.data?.step,
                  metaData: {
                    // hasChildren: hasChildren(props),
                    // isParallelNode: isParallelNode(props)
                  }
                }
              }
            })
          }}
          onMouseLeave={event => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.MouseLeaveNode,
              target: event.target,
              data: {
                nodeType: DiagramType.Default,
                nodeData: {
                  id: props?.data?.id,
                  data: props?.data?.data?.step,
                  metaData: {
                    // hasChildren: hasChildren(props),
                    // isParallelNode: isParallelNode(props)
                  }
                }
              }
            })
          }}
        >
          {showMarkers && (
            <>
              <div
                className={cx(cssDefault.markerStart, cssDefault.diamondStageLeft, {
                  [cssDefault.diamondStep]: props.data?.graphType === PipelineGraphType.STEP_GRAPH
                })}
              >
                <SVGMarker />
              </div>
              <div
                className={cx(cssDefault.markerEnd, cssDefault.diamondStageRight, {
                  [cssDefault.diamondStep]: props.data?.graphType === PipelineGraphType.STEP_GRAPH
                })}
              >
                <SVGMarker />
              </div>
            </>
          )}
        </div>
        <div className="execution-running-animation" />
        {props?.data?.metaData?.isInComplete && (
          <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />
        )}
        {props?.data?.icon && (
          <Icon
            size={28}
            className={css.primaryIcon}
            name={props?.data?.icon}
            {...(isSelectedNode() ? { color: Color.WHITE, inverse: true } : { color: Color.PRIMARY_7 })}
          />
        )}
        {props?.data?.metaData?.tertiaryIcon && (
          <Icon
            className={css.tertiaryIcon}
            size={15}
            name={props?.data?.metaData?.tertiaryIcon}
            // style={props?.tertiaryIconStyle}
            // {...props.tertiaryIconProps}
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

        {props.data?.metaData?.conditionalExecutionEnabled && (
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
        {props.data?.metaData?.loopingStrategyEnabled && (
          <div className={css.loopingStrategy}>
            <Text
              tooltip={getString('pipeline.loopingStrategy.title')}
              tooltipProps={{
                isDark: true
              }}
            >
              <Icon
                size={16}
                name={'looping'}
                {...(isSelectedNode() ? { color: Color.WHITE, inverse: true } : { color: Color.PRIMARY_7 })}
              />
            </Text>
          </div>
        )}
        {isTemplateNode && (
          <Icon
            size={8}
            className={css.template}
            name={'template-library'}
            color={isSelectedNode() ? Color.WHITE : Color.PRIMARY_7}
          />
        )}
        {!props?.permissions?.readonly && (
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
                target: e.target,
                data: {
                  nodeType: DiagramType.Default,
                  nodeData: {
                    id: props?.data?.id,
                    data: props?.data?.data?.step,
                    metaData: {
                      // hasChildren: hasChildren(props),
                      // isParallelNode: isParallelNode(props)
                    }
                  }
                }
              })
            }}
            withoutCurrentColor={true}
          />
        )}
      </div>
      {props?.data?.name && (
        <div className={cssDefault.nodeNameText}>
          <Text
            width={125}
            font={{ size: 'normal', align: 'center' }}
            color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
            padding={'small'}
            lineClamp={2}
          >
            {props?.data?.name}
          </Text>
        </div>
      )}
      {!isParallelNode(props) && !props?.permissions?.readonly && (
        <AddLinkNode<StepElementConfig, PipelineStageNodeMetaDataType, EventStepDataType>
          isParallelNode={isParallelNode(props)}
          readonly={props?.permissions?.readonly}
          fireEvent={props.fireEvent}
          style={{ left: getPositionOfAddIcon(props) }}
          data={props?.data?.data?.step as StepElementConfig}
          id={props?.data?.id}
          parentIdentifier={props?.metaData?.parentIdentifier}
          className={cx(
            cssDefault.addNodeIcon,
            {
              [cssDefault.show]: showAddLink
            },
            {
              [cssDefault.stepAddIcon]: props.data?.graphType === PipelineGraphType.STEP_GRAPH
            },
            {
              [cssDefault.stageAddIcon]: props.data?.graphType === PipelineGraphType.STAGE_GRAPH
            }
          )}
          setShowAddLink={setShowAddLink}
        />
      )}
      {(props?.metaData?.nextNode?.type === NodeType.StepGroupNode ||
        (!props?.metaData?.nextNode && props?.metaData?.parentIdentifier)) &&
        !isParallelNode(props) &&
        !props?.permissions?.readonly && (
          <AddLinkNode<StepElementConfig, PipelineStageNodeMetaDataType, EventStepDataType>
            parentIdentifier={props?.metaData?.parentIdentifier}
            isParallelNode={isParallelNode(props)}
            readonly={props?.permissions?.readonly}
            fireEvent={props.fireEvent}
            data={props?.data?.data?.step as StepElementConfig}
            style={{ right: getPositionOfAddIcon(props, true) }}
            isRightAddIcon={true}
            className={cx(
              cssDefault.addNodeIcon,
              {
                [cssDefault.stepAddIcon]: props.data?.graphType === PipelineGraphType.STEP_GRAPH
              },
              {
                [cssDefault.stageAddIcon]: props.data?.graphType === PipelineGraphType.STAGE_GRAPH
              }
            )}
            setShowAddLink={setShowAddLink}
          />
        )}
    </div>
  )
}
