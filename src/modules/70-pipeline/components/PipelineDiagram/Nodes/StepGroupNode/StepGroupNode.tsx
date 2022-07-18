/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import cx from 'classnames'
import { Icon, Layout, Text, Button, ButtonVariation } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import { Event, DiagramDrag, DiagramType } from '@pipeline/components/Diagram'
import { STATIC_SERVICE_GROUP_NAME } from '@pipeline/utils/executionUtils'
import { useStrings } from 'framework/strings'
import type { ExecutionWrapperConfig } from 'services/pipeline-ng'
import type {
  EventStepDataType,
  EventStepGroupDataType
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { StepGroupElementConfig } from 'services/cd-ng'
import StepGroupGraph from '../StepGroupGraph/StepGroupGraph'
import { NodeProps, NodeType, PipelineStageNodeMetaDataType } from '../../types'
import SVGMarker from '../SVGMarker'
import { useNodeDimensionContext } from '../NodeDimensionStore'
import MatrixNodeLabelWrapper from '../MatrixNodeLabelWrapper'
import { getPositionOfAddIcon, hasStepGroupChild } from '../utils'
import { NodeDimensionProvider } from '../NodeDimensionStore'
import AddLinkNode from '../DefaultNode/AddLinkNode/AddLinkNode'
import css from './StepGroupNode.module.scss'
import defaultCss from '../DefaultNode/DefaultNode.module.scss'

function StepGroupNodeWrapper(
  props: NodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepGroupDataType>
): JSX.Element {
  const allowAdd = defaultTo(props.permissions?.allowAdd, false)
  const { getString } = useStrings()
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  // const [showAddLink, setShowAddLink] = React.useState(false)
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const DefaultNode: React.FC<any> | undefined = props?.getDefaultNode()?.component

  const isExecutionView = Boolean(props?.data?.status)

  const { updateDimensions } = useNodeDimensionContext()
  const stepGroupData = props?.data?.data?.stepGroup
  //defaultTo(props?.data?.data?.stepGroup, props?.data?.data?.step?.data?.stepGroup) || props?.data?.step
  const stepsData = stepGroupData?.steps

  const isNestedStepGroup = Boolean(props.data.metaData.isNestedGroup)
  const isParallelNode = (nodeData: typeof props): boolean => Boolean(nodeData?.metaData?.isParallelNode)
  const hasChildren = (nodeData: typeof props): boolean => Boolean(defaultTo(nodeData?.data?.children?.length, 0))

  React.useEffect(() => {
    props?.updateGraphLinks?.()
    updateDimensions?.({ [(props?.data?.id || props?.id) as string]: { height: 100, width: 115 } })
  }, [isNodeCollapsed])

  React.useEffect(() => {
    // collapse stepGroup in execution view till data loads
    if (stepsData?.length === 0 && isExecutionView) {
      setNodeCollapsed(true)
    }
  }, [stepsData])

  const nodeType = Object.keys(props?.data?.stepGroup?.strategy || {})[0]
  const onDropEvent = (event: React.DragEvent): void => {
    event.stopPropagation()
    const nodeData = JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)) as typeof props

    props?.fireEvent?.({
      type: Event.DropNodeEvent,
      target: event.target,
      data: {
        nodeType: DiagramType.StepGroupNode,
        nodeData: {
          id: nodeData?.data?.id,
          data: nodeData?.data?.data?.stepGroup,
          metaData: {
            hasChildren: hasChildren(nodeData),
            isParallelNode: isParallelNode(nodeData)
          }
        },
        destinationNode: {
          id: props?.data?.id,
          data: props?.data?.data?.stepGroup,
          metaData: {
            hasChildren: hasChildren(props),
            isParallelNode: isParallelNode(props)
          }
        }
      }
    })
  }

  return (
    <>
      {isNodeCollapsed && DefaultNode ? (
        <DefaultNode
          onClick={() => {
            setNodeCollapsed(false)
          }}
          {...props}
          icon="step-group"
        />
      ) : (
        <div style={{ position: 'relative' }}>
          {props.data?.loopingStrategyEnabled && (
            <MatrixNodeLabelWrapper isParallelNode={props?.isParallelNode} nodeType={nodeType} />
          )}
          <div
            onMouseOver={e => {
              e.stopPropagation()
              allowAdd && setVisibilityOfAdd(true)
            }}
            onMouseLeave={e => {
              e.stopPropagation()
              allowAdd && setVisibilityOfAdd(false)
            }}
            onDragLeave={() => allowAdd && setVisibilityOfAdd(false)}
            // remove container CSS later - derive from data
            // style={stepGroupData ? stepGroupData?.containerCss : undefined}
            className={cx(
              css.stepGroup,
              { [css.firstnode]: !isParallelNode(props) },
              { [css.marginBottom]: isParallelNode(props) },
              { [css.nestedGroup]: isNestedStepGroup },
              { [css.stepGroupParent]: hasStepGroupChild },
              { [css.stepGroupNormal]: !isNestedStepGroup && !hasStepGroupChild }
            )}
          >
            <div
              className={cx(
                defaultCss.markerStart,
                defaultCss.stepMarker,
                defaultCss.stepGroupMarkerLeft,
                css.markerStart
              )}
            >
              <SVGMarker />
            </div>
            <div
              className={cx(
                defaultCss.markerEnd,
                defaultCss.stepMarker,
                defaultCss.stepGroupMarkerRight,
                css.markerStart
              )}
            >
              <SVGMarker />
            </div>
            <div id={props?.data?.id} className={css.horizontalBar}></div>
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
            <div className={css.stepGroupHeader}>
              <Layout.Horizontal
                spacing="xsmall"
                onMouseOver={e => {
                  e.stopPropagation()
                }}
                onMouseOut={e => {
                  e.stopPropagation()
                }}
              >
                <Icon
                  className={css.collapseIcon}
                  name="minus"
                  onClick={e => {
                    e.stopPropagation()
                    setNodeCollapsed(true)
                  }}
                />
                <Text
                  data-nodeid={props.data?.id}
                  className={css.cursor}
                  onMouseEnter={event => {
                    event.stopPropagation()
                    props?.fireEvent?.({
                      type: Event.MouseEnterNode,
                      target: event.target,
                      data: {
                        nodeType: DiagramType.StepGroupNode,
                        nodeData: {
                          id: props?.data?.id,
                          data: props?.data?.data?.stepGroup as StepGroupElementConfig,
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
                        nodeType: DiagramType.StepGroupNode,
                        nodeData: {
                          id: props?.data?.id,
                          data: props?.data?.data?.stepGroup as StepGroupElementConfig,
                          metaData: {
                            hasChildren: hasChildren(props),
                            isParallelNode: isParallelNode(props)
                          }
                        }
                      }
                    })
                  }}
                  lineClamp={1}
                  onClick={event => {
                    event.stopPropagation()
                    setVisibilityOfAdd(false)
                    props?.fireEvent?.({
                      type: Event.StepGroupClicked,
                      target: event.target,
                      data: {
                        nodeType: DiagramType.StepGroupNode,
                        nodeData: {
                          id: props?.data?.id,
                          data: props?.data?.data?.stepGroup as StepGroupElementConfig,
                          metaData: {
                            hasChildren: hasChildren(props),
                            isParallelNode: isParallelNode(props)
                          }
                        }
                      }
                    })
                  }}
                >
                  {props.data?.name}
                </Text>
              </Layout.Horizontal>
            </div>
            <div className={css.stepGroupBody}>
              <StepGroupGraph
                {...props}
                id={props.data?.id}
                stepsData={stepsData as ExecutionWrapperConfig[]}
                isNodeCollapsed={isNodeCollapsed}
                parentIdentifier={props?.data?.identifier}
                hideLinks={props?.data?.identifier === STATIC_SERVICE_GROUP_NAME}
              />
            </div>
            {!props?.permissions?.readonly && props?.data?.identifier !== STATIC_SERVICE_GROUP_NAME && (
              <Button
                className={cx(css.closeNode, { [css.readonly]: props?.permissions?.readonly })}
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
                      nodeType: DiagramType.StepGroupNode,
                      nodeData: {
                        id: props?.data?.id,
                        data: props?.data?.data?.stepGroup as StepGroupElementConfig,
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
            )}
          </div>
          {!isParallelNode(props) && !props?.permissions?.readonly && (
            <AddLinkNode<StepGroupElementConfig, PipelineStageNodeMetaDataType, EventStepDataType>
              data={props?.data?.data?.stepGroup as StepGroupElementConfig}
              id={props?.data?.id}
              parentIdentifier={props?.metaData?.parentIdentifier}
              isParallelNode={isParallelNode(props)}
              readonly={props?.permissions?.readonly}
              fireEvent={props.fireEvent}
              style={{ left: getPositionOfAddIcon(props) }}
              className={cx(defaultCss.addNodeIcon, defaultCss.stepAddIcon)}
            />
          )}
          {allowAdd && !props?.permissions?.readonly && CreateNode && (
            <CreateNode
              {...props}
              className={cx(
                defaultCss.addNode,
                { [defaultCss.visible]: showAdd },
                { [defaultCss.marginBottom]: isParallelNode(props) }
              )}
              onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
              onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
              onDrop={onDropEvent}
              onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                event.stopPropagation()
                props?.fireEvent?.({
                  type: Event.AddParallelNode,
                  target: event.target,
                  data: {
                    nodeType: DiagramType.StepGroupNode,
                    parentIdentifier: props?.metaData?.parentIdentifier,
                    nodeData: {
                      id: props?.data?.id,
                      data: props?.data?.data?.stepGroup,
                      metaData: {
                        hasChildren: hasChildren(props),
                        isParallelNode: isParallelNode(props)
                      }
                    }
                  }
                })
              }}
              id={props?.data?.id}
              hidden={!showAdd}
            />
          )}
        </div>
      )}
    </>
  )
}
const StepGroupNode: React.FC<
  NodeProps<ExecutionWrapperConfig, PipelineStageNodeMetaDataType, EventStepGroupDataType>
> = StepGroupNodeWrapper
export default StepGroupNode
