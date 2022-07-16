/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { Icon, Text, Button, ButtonVariation, IconName, Utils } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import stepsfactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { getStatusProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { useStrings } from 'framework/strings'
import type { EventStepDataType } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { ExecutionWrapperConfig, StepElementConfig } from 'services/pipeline-ng'
import SVGMarker from '../../SVGMarker'
import { NodeProps, NodeType, PipelineStageNodeMetaDataType } from '../../../types'
import AddLinkNode from '../AddLinkNode/AddLinkNode'
import { getPositionOfAddIcon } from '../../utils'
import defaultCss from '../DefaultNode.module.scss'

const CODE_ICON: IconName = 'command-echo'

const TEMPLATE_ICON: IconName = 'template-library'

function PipelineStepNode(
  props: NodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepDataType>
): JSX.Element {
  const { getString } = useStrings()
  const allowAdd = defaultTo(props?.permissions?.allowAdd, false)
  const [showAddNode, setVisibilityOfAdd] = React.useState(false)
  const stepType = props?.data?.data?.step?.type || ''
  const stepData = stepsfactory.getStepData(stepType)
  const stepIconSize = stepsfactory.getStepIconSize(stepType)
  let stepIconColor = stepsfactory.getStepIconColor(stepType)
  if (stepIconColor && Object.values(Color).includes(stepIconColor)) {
    stepIconColor = Utils.getRealCSSColor(stepIconColor)
  }
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const showMarkers = defaultTo(props?.data?.metaData?.nodeMeta?.showMarkers, true)

  const stepStatus = defaultTo(props?.data?.status, props?.data?.metaData?.status as ExecutionStatus)
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getStatusProps(
    stepStatus as ExecutionStatus,
    ExecutionPipelineNodeType.NORMAL
  )
  const isSelectedNode = (): boolean =>
    [props?.data?.id, props?.data?.identifier].includes(props.selectedNodeId as string)
  const isServiceStep = stepType === 'Service'
  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return
    }
    setVisibilityOfAdd(visibility)
  }

  const isTemplateNode = props?.data?.metaData?.isTemplateNode
  const stepIcon = defaultTo(stepData?.icon, props?.data?.icon)
  const hasChildren = (nodeData: typeof props): boolean => Boolean(defaultTo(nodeData?.data?.children?.length, 0))
  const isParallelNode = (nodeData: typeof props): boolean => Boolean(nodeData?.metaData?.isParallelNode)

  const onDropEvent = (event: React.DragEvent): void => {
    event.stopPropagation()
    const nodeData = JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)) as typeof props

    props?.fireEvent?.({
      type: Event.DropNodeEvent,
      target: event.target,
      data: {
        nodeType: DiagramType.Default,
        nodeData: {
          id: nodeData?.data?.id,
          data: nodeData?.data?.data?.step,
          metaData: {
            hasChildren: hasChildren(nodeData),
            isParallelNode: isParallelNode(nodeData)
          }
        },
        destinationNode: {
          id: props?.data?.id,
          data: props?.data?.data?.step,
          metaData: {
            hasChildren: hasChildren(props),
            isParallelNode: isParallelNode(props)
          }
        }
      }
    })
  }

  return (
    <div
      className={cx(defaultCss.defaultNode, 'default-node', {
        draggable: !props?.permissions?.readonly
      })}
      onMouseOver={e => {
        e.stopPropagation()
        setAddVisibility(true)
      }}
      onMouseLeave={e => {
        e.stopPropagation()
        setAddVisibility(false)
      }}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
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
              data: props?.data?.data?.step,
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
      onDrop={onDropEvent}
    >
      {!isServiceStep && showMarkers && (
        <div className={cx(defaultCss.markerStart, defaultCss.stepMarker, defaultCss.stepMarkerLeft)}>
          <SVGMarker />
        </div>
      )}
      <div
        id={props?.data?.id}
        data-nodeid={props?.data?.id}
        draggable={!props?.permissions?.readonly}
        className={cx(defaultCss.defaultCard, {
          [defaultCss.selected]: isSelectedNode(),
          [defaultCss.failed]: stepStatus === ExecutionStatusEnum.Failed,
          [defaultCss.runningNode]: stepStatus === ExecutionStatusEnum.Running,
          [defaultCss.skipped]: stepStatus === ExecutionStatusEnum.Skipped,
          [defaultCss.notStarted]: stepStatus === ExecutionStatusEnum.NotStarted
        })}
        style={{
          width: 64,
          height: 64
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
                data: props?.data?.data?.step,
                metaData: {
                  hasChildren: hasChildren(props),
                  isParallelNode: isParallelNode(props)
                }
              }
            }
          })
        }}
        onDragEnd={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
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
                  hasChildren: hasChildren(props),
                  isParallelNode: isParallelNode(props)
                }
              }
            }
          })
        }}
        onMouseLeave={event => {
          event.stopPropagation()
          setVisibilityOfAdd(false)
          props?.fireEvent?.({
            type: Event.MouseLeaveNode,
            target: event.target,
            data: {
              nodeType: DiagramType.Default,
              nodeData: {
                id: props?.data?.id,
                data: props?.data?.data?.step,
                metaData: {
                  hasChildren: hasChildren(props),
                  isParallelNode: isParallelNode(props)
                }
              }
            }
          })
        }}
      >
        <div className="execution-running-animation" />
        {props?.data?.metaData?.isInComplete && (
          <Icon className={defaultCss.inComplete} size={12} name={'warning-sign'} color="orange500" />
        )}
        {stepIcon && (
          <>
            <Icon
              size={stepIconSize || 28}
              {...(isSelectedNode() ? { color: Color.WHITE, className: defaultCss.primaryIcon, inverse: true } : {})}
              name={defaultTo(stepIcon, 'cross') as IconName}
            />
          </>
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
        {props.data?.loopingStrategyEnabled && (
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
            className={defaultCss.codeIcon}
            color={isSelectedNode() ? Color.WHITE : undefined}
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
                  data: props?.data?.data?.step,
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
      {!isServiceStep && showMarkers && (
        <div className={cx(defaultCss.markerEnd, defaultCss.stepMarker, defaultCss.stepMarkerRight)}>
          <SVGMarker />
        </div>
      )}
      {props?.data?.name && (
        <div className={defaultCss.nodeNameText}>
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
      {allowAdd && CreateNode && !props?.permissions?.readonly && !isServiceStep && (
        <CreateNode
          {...props}
          onMouseOver={() => setAddVisibility(true)}
          onDragOver={() => setAddVisibility(true)}
          onDrop={onDropEvent}
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
                  data: props?.data?.data?.step,
                  metaData: {
                    hasChildren: hasChildren(props),
                    isParallelNode: isParallelNode(props)
                  }
                }
              }
            })
          }}
          className={cx(defaultCss.addNode, defaultCss.stepAddNode, { [defaultCss.visible]: showAddNode })}
          data-nodeid="add-parallel"
        />
      )}
      {!isParallelNode(props) && !isServiceStep && !props?.permissions?.readonly && (
        <AddLinkNode<StepElementConfig, PipelineStageNodeMetaDataType, EventStepDataType>
          data={props?.data?.data?.step as StepElementConfig}
          id={props?.data?.id}
          parentIdentifier={props?.metaData?.parentIdentifier}
          isParallelNode={isParallelNode(props)}
          readonly={props?.permissions?.readonly}
          fireEvent={props.fireEvent}
          style={{ left: getPositionOfAddIcon(props) }}
          className={cx(defaultCss.addNodeIcon, defaultCss.stepAddIcon)}
        />
      )}
      {!props?.metaData?.nextNode &&
        !isServiceStep &&
        props?.metaData?.parentIdentifier &&
        !props?.permissions?.readonly &&
        !isParallelNode(props) && (
          <AddLinkNode<StepElementConfig, PipelineStageNodeMetaDataType, EventStepDataType>
            data={props?.data?.data?.step as StepElementConfig}
            id={props?.data?.id}
            parentIdentifier={props?.metaData?.parentIdentifier}
            isParallelNode={isParallelNode(props)}
            readonly={props?.permissions?.readonly}
            fireEvent={props.fireEvent}
            isRightAddIcon={true}
            style={{ right: getPositionOfAddIcon(props, true) }}
            className={cx(defaultCss.addNodeIcon, defaultCss.stepAddIcon)}
          />
        )}
    </div>
  )
}

export default PipelineStepNode
