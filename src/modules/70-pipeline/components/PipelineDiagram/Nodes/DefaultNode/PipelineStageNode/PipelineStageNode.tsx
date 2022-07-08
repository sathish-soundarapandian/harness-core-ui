/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { Icon, Text, Button, ButtonVariation, IconName } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { getStatusProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import type { StageElementConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import type { EventStageDataType } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import SVGMarker from '../../SVGMarker'
import AddLinkNode from '../AddLinkNode/AddLinkNode'
import { NodeProps, NodeType, PipelineStageNodeMetaDataType } from '../../../types'
import { getPositionOfAddIcon } from '../../utils'
import defaultCss from '../DefaultNode.module.scss'

const CODE_ICON: IconName = 'command-echo'
const TEMPLATE_ICON: IconName = 'template-library'

export interface NodeDataType {
  identifier?: string
}

function PipelineStageNode(
  props: NodeProps<StageElementWrapperConfig, PipelineStageNodeMetaDataType, EventStageDataType>
): JSX.Element {
  const { getString } = useStrings()
  const allowAdd = defaultTo(props?.permissions?.allowAdd, false)
  const [showAddNode, setVisibilityOfAdd] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component

  const showMarkers = defaultTo(props?.data?.metaData?.nodeMeta?.showMarkers, true)
  const stageStatus = defaultTo(props?.data?.status, props?.data?.metaData?.status as ExecutionStatus)
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getStatusProps(
    stageStatus as ExecutionStatus,
    ExecutionPipelineNodeType.NORMAL
  )
  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return
    }
    setVisibilityOfAdd(visibility)
  }

  // move to utils for falsy values filter
  const isSelectedNode = (): boolean =>
    [props?.data?.id, props?.data?.identifier].includes(props.selectedNodeId as string)

  const isTemplateNode = props?.data?.metaData?.isTemplateNode
  //move to util
  const hasChildren = (nodeData: typeof props): boolean => Boolean(defaultTo(nodeData?.data?.children?.length, 0))
  const isParallelNode = (nodeData: typeof props): boolean => Boolean(nodeData?.metaData?.isParallelNode)
  return (
    <div
      className={cx(defaultCss.defaultNode, 'default-node', {
        draggable: !props?.permissions?.readonly
      })}
      onMouseOver={() => setAddVisibility(true)}
      onMouseLeave={() => setAddVisibility(false)}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        // rewmove onClick
        if (props?.onClick) {
          props.onClick(event)
          return
        }
        props?.fireEvent?.({
          type: Event.ClickNode,
          target: event.target,
          data: {
            nodeType: DiagramType.Default,
            nodeData: {
              id: props?.data?.id,
              data: props?.data?.data?.stage as StageElementConfig,
              metaData: {
                hasChildren: hasChildren(props),
                isParallelNode: isParallelNode(props)
              }
            }
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
        if (!props?.permissions?.allowAdd) {
          return
        }
        event.stopPropagation()

        const nodeData = JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)) as typeof props
        props?.fireEvent?.({
          type: Event.DropNodeEvent,
          target: event.target,
          data: {
            nodeType: DiagramType.Default,
            nodeData: {
              id: nodeData?.data?.id,
              data: nodeData?.data?.data?.stage,
              metaData: {
                hasChildren: hasChildren(nodeData),
                isParallelNode: isParallelNode(nodeData)
              }
            },
            destinationNode: {
              id: props?.data?.id,
              data: props?.data?.data?.stage,
              metaData: {
                hasChildren: hasChildren(props),
                isParallelNode: isParallelNode(props)
              }
            }
          }
        })
      }}
    >
      {showMarkers && (
        <div className={cx(defaultCss.markerStart, defaultCss.stageMarkerLeft)}>
          <SVGMarker />
        </div>
      )}
      <div
        id={props?.data?.id}
        data-nodeid={props?.data?.id}
        draggable={!props?.permissions?.readonly}
        className={cx(defaultCss.defaultCard, {
          [defaultCss.selected]: isSelectedNode(),
          [defaultCss.failed]: stageStatus === ExecutionStatusEnum.Failed,
          [defaultCss.runningNode]: stageStatus === ExecutionStatusEnum.Running,
          [defaultCss.skipped]: stageStatus === ExecutionStatusEnum.Skipped,
          [defaultCss.notStarted]: stageStatus === ExecutionStatusEnum.NotStarted
        })}
        style={{
          width: 90,
          height: 40
        }}
        onMouseOver={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation()
          setAddVisibility(true)
        }}
        onMouseEnter={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          event.stopPropagation()
          props?.fireEvent?.({
            type: Event.MouseEnterNode,
            target: event.target,
            data: {
              nodeType: DiagramType.Default,
              nodeData: {
                id: props?.data?.id,
                data: props?.data?.data?.stage as StageElementConfig,
                metaData: {
                  hasChildren: hasChildren(props),
                  isParallelNode: isParallelNode(props)
                }
              }
            }
          })
        }}
        onMouseLeave={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          setAddVisibility(false)
          event.stopPropagation()
          props?.fireEvent?.({
            type: Event.MouseLeaveNode,
            target: event.target,
            data: {
              nodeType: DiagramType.Default,
              nodeData: {
                id: props?.data?.id,
                data: props?.data?.data?.stage as StageElementConfig,
                metaData: {
                  hasChildren: hasChildren(props),
                  isParallelNode: isParallelNode(props)
                }
              }
            }
          })
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
          props?.fireEvent?.({
            type: Event.DragStart,
            target: event.target,
            data: {
              nodeType: DiagramType.Default,
              nodeData: {
                id: props?.data?.id,
                data: props?.data?.data?.stage as StageElementConfig,
                metaData: {
                  hasChildren: hasChildren(props),
                  isParallelNode: isParallelNode(props)
                }
              }
            }
          })
        }}
        onDragEnd={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div className="execution-running-animation" />
        {props?.data?.metaData?.isInComplete && (
          <Icon className={defaultCss.inComplete} size={12} name={'warning-sign'} color="orange500" />
        )}
        {props?.data?.icon && (
          <Icon
            size={28}
            name={props?.data?.icon as IconName}
            {...(isSelectedNode() ? { color: Color.WHITE, className: defaultCss.primaryIcon, inverse: true } : {})}
          />
        )}
        {secondaryIcon && (
          <Icon
            name={secondaryIcon}
            style={secondaryIconStyle}
            size={13}
            className={defaultCss.secondaryIcon}
            {...secondaryIconProps}
          />
        )}
        {props?.data?.metaData?.tertiaryIcon && (
          <Icon name={props?.data?.metaData?.tertiaryIcon} size={13} className={defaultCss.tertiaryIcon} />
        )}
        {isTemplateNode && (
          <Icon
            {...(isSelectedNode()
              ? { color: Color.WHITE, className: cx(defaultCss.primaryIcon, defaultCss.templateIcon), inverse: true }
              : { className: defaultCss.templateIcon })}
            size={8}
            name={TEMPLATE_ICON}
          />
        )}
        {CODE_ICON && (
          <Icon
            {...(isSelectedNode()
              ? { color: Color.WHITE, className: cx(defaultCss.primaryIcon, defaultCss.codeIcon), inverse: true }
              : { className: defaultCss.codeIcon })}
            size={8}
            name={CODE_ICON}
          />
        )}
        <Button
          className={cx(defaultCss.closeNode, { [defaultCss.readonly]: props?.permissions?.readonly })}
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
                nodeType: DiagramType.Default,
                nodeData: {
                  id: props?.data?.id,
                  data: props?.data?.data?.stage as StageElementConfig,
                  metaData: {
                    hasChildren: hasChildren(props),
                    isParallelNode: isParallelNode(props)
                  }
                }
              }
            })
          }}
          withoutCurrentColor={true}
        />
      </div>
      {showMarkers && (
        <div className={cx(defaultCss.markerEnd, defaultCss.stageMarkerRight)}>
          <SVGMarker />
        </div>
      )}
      {props?.data?.name && (
        <div className={cx(defaultCss.nodeNameText, defaultCss.stageName)}>
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
      {props.data?.metaData?.conditionalExecutionEnabled && (
        <div className={defaultCss.conditional}>
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
        <div className={defaultCss.loopingStrategy}>
          <Text
            tooltip={getString('pipeline.loopingStrategy.title')}
            tooltipProps={{
              isDark: true
            }}
          >
            <Icon
              size={16}
              name={'looping'}
              {...(isSelectedNode() ? { color: Color.WHITE, className: defaultCss.primaryIcon, inverse: true } : {})}
            />
          </Text>
        </div>
      )}
      {allowAdd && CreateNode && !props?.permissions?.readonly && showAddNode && (
        <CreateNode
          {...props}
          onMouseOver={() => setAddVisibility(true)}
          onMouseLeave={() => setAddVisibility(false)}
          onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.AddParallelNode,
              target: event.target,
              // extract common data to top
              data: {
                nodeType: DiagramType.Default,
                parentIdentifier: props?.metaData?.parentIdentifier,
                nodeData: {
                  id: props?.data?.id,
                  data: props?.data?.data?.stage as StageElementConfig,
                  metaData: {
                    hasChildren: hasChildren(props),
                    isParallelNode: isParallelNode(props)
                  }
                }
              }
            })
          }}
          className={cx(defaultCss.addNode, defaultCss.stageAddNode, { [defaultCss.visible]: showAddNode })}
        />
      )}

      {!isParallelNode(props) && !props?.permissions?.readonly && (
        <AddLinkNode<StageElementConfig, PipelineStageNodeMetaDataType, EventStageDataType>
          data={props?.data?.data?.stage as StageElementConfig}
          id={props?.data?.id}
          parentIdentifier={props?.metaData?.parentIdentifier}
          isParallelNode={isParallelNode(props)}
          readonly={props?.permissions?.readonly}
          fireEvent={props.fireEvent}
          className={cx(defaultCss.addNodeIcon, defaultCss.left, defaultCss.stageAddIcon)}
          style={{ left: getPositionOfAddIcon(props) }}
        />
      )}
    </div>
  )
}

export default PipelineStageNode
