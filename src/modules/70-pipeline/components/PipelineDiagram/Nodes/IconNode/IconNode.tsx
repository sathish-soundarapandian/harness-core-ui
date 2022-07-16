/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Text, Icon, Button, ButtonVariation } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import type { ExecutionWrapperConfig, StepElementConfig } from 'services/pipeline-ng'
import type { EventStepDataType } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { PipelineGraphType, NodeType, NodeProps, PipelineStageNodeMetaDataType } from '../../types'
import AddLinkNode from '../DefaultNode/AddLinkNode/AddLinkNode'
import { getPositionOfAddIcon } from '../utils'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './IconNode.module.scss'

export function IconNode(
  props: NodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepDataType>
): React.ReactElement {
  const allowAdd = defaultTo(props?.permissions?.allowAdd, false)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component

  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return
    }
    setVisibilityOfAdd(visibility)
  }
  const isSelectedNode = (): boolean =>
    [props?.data?.id, props?.data?.identifier].includes(props.selectedNodeId as string)

  const hasChildren = (nodeData: typeof props): boolean => Boolean(defaultTo(nodeData?.data?.children?.length, 0))
  const isParallelNode = (nodeData: typeof props): boolean => Boolean(nodeData?.metaData?.isParallelNode)

  const onDropEvent = (event: React.DragEvent) => {
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
      className={cx(cssDefault.defaultNode, css.iconNodeContainer)}
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
            nodeType: DiagramType.IconNode,
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
      onDrop={event => {
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
      }}
    >
      <div
        id={props?.data?.id}
        data-nodeid={props?.data?.id}
        draggable={!props?.permissions?.readonly}
        className={cx(cssDefault.defaultCard, 'icon-node', css.iconNode, { [cssDefault.selected]: isSelectedNode() })}
        onDragStart={event => {
          event.stopPropagation()
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          //   event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          // if (options.allowDropOnNode) event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          event.dataTransfer.dropEffect = 'move'

          // ***********FIRE_EVENT_EVENT>DRAGSTART MISSING*******************
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
              nodeType: DiagramType.IconNode,
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

          props?.fireEvent?.({
            type: Event.MouseLeaveNode,
            target: event.target,
            data: {
              nodeType: DiagramType.IconNode,
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
        <div>
          {props?.data?.metaData?.isInComplete && (
            <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />
          )}
          {!props?.permissions?.readonly && (
            <Button
              className={cx(cssDefault.closeNode)}
              variation={ButtonVariation.PRIMARY}
              minimal
              withoutCurrentColor
              icon="cross"
              iconProps={{ size: 10 }}
              onMouseDown={e => {
                e.stopPropagation()
                props?.fireEvent?.({
                  type: Event.RemoveNode,
                  target: e.target,
                  data: {
                    nodeType: DiagramType.IconNode,
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
            />
          )}
          <Icon name={props?.data?.icon} size={50} inverse={isSelectedNode()} />
        </div>
      </div>
      {!isEmpty(props?.data?.name) && (
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
      {allowAdd && !props?.permissions?.readonly && CreateNode && (
        <CreateNode
          {...props}
          onMouseOver={() => setAddVisibility(true)}
          onMouseLeave={() => setAddVisibility(false)}
          onDragOver={() => setAddVisibility(true)}
          onDrop={onDropEvent}
          onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                nodeType: DiagramType.IconNode,
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
          className={cx(
            cssDefault.addNode,
            { [cssDefault.visible]: showAdd },
            {
              [cssDefault.stepAddNode]: props.data.graphType === PipelineGraphType.STEP_GRAPH
            },
            {
              [cssDefault.stageAddNode]: props.data.graphType === PipelineGraphType.STAGE_GRAPH
            }
          )}
          data-nodeid="add-parallel"
        />
      )}
      {!isParallelNode(props) && !props?.permissions?.readonly && (
        <AddLinkNode<StepElementConfig, PipelineStageNodeMetaDataType, EventStepDataType>
          data={props?.data?.data?.step as StepElementConfig}
          id={props?.data?.id}
          parentIdentifier={props?.metaData?.parentIdentifier}
          isParallelNode={isParallelNode(props)}
          readonly={props?.permissions?.readonly}
          fireEvent={props.fireEvent}
          style={{ left: getPositionOfAddIcon(props) }}
          className={cx(
            cssDefault.addNodeIcon,
            cssDefault.left,
            {
              [cssDefault.stepAddIcon]: props.data.graphType === PipelineGraphType.STEP_GRAPH
            },
            {
              [cssDefault.stageAddIcon]: props.data.graphType === PipelineGraphType.STAGE_GRAPH
            }
          )}
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
              cssDefault.right,
              {
                [cssDefault.stepAddIcon]: props.data.graphType === PipelineGraphType.STEP_GRAPH
              },
              {
                [cssDefault.stageAddIcon]: props.data.graphType === PipelineGraphType.STAGE_GRAPH
              }
            )}
          />
        )}
    </div>
  )
}
