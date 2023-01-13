/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import cx from 'classnames'
import { Icon, Layout, Text, Button, ButtonVariation, ButtonProps, ButtonSize } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { debounce, defaultTo, get, lowerCase } from 'lodash-es'
import { STATIC_SERVICE_GROUP_NAME } from '@pipeline/utils/executionUtils'
import { useStrings } from 'framework/strings'
import { useDeepCompareEffect } from '@common/hooks'
import { useCollapsedNodeStore } from '@pipeline/components/ExecutionNodeList/CollapsedNodeStore'
import { BaseReactComponentProps, NodeType, PipelineGraphState } from '../../types'
import {
  COLLAPSED_MATRIX_NODE_LENGTH,
  DEFAULT_MATRIX_PARALLELISM,
  getMatrixHeight,
  getPositionOfAddIcon,
  LayoutStyles,
  MAX_ALLOWED_MATRIX_COLLAPSED_NODES
} from '../utils'
import { DiagramDrag, DiagramType, Event } from '../../Constants'
import { Dimensions, useNodeDimensionContext } from '../NodeDimensionStore'
import MatrixNodeLabelWrapper from '../MatrixNodeLabelWrapper'
import { NodeStatusIndicator } from '../../NodeStatusIndicator/NodeStatusIndicator'
import css from './MatrixStepNode.module.scss'
import defaultCss from '../DefaultNode/DefaultNode.module.scss'

export const getCalculatedStepNodeStyles = (
  data: PipelineGraphState[],
  parallelism: number,
  showAllNodes?: boolean,
  childrenDimensions?: Dimensions
): LayoutStyles => {
  let nodeWidth = 105 //118+60
  let nodeHeight = 142 //(64+50+25)
  parallelism = !parallelism ? 0 : (parallelism === 1 ? data.length : parallelism) || DEFAULT_MATRIX_PARALLELISM

  const maxChildrenDimension = {
    height: 0,
    width: 0
  }
  data.forEach(nodeData => {
    const dimen = childrenDimensions?.[defaultTo((nodeData as any)?.step?.data?.id, (nodeData as any)?.step?.uuid)]
    const getSGHeight = dimen?.isNodeCollapsed ? 118 : dimen?.height ? dimen?.height + 118 : 0 //nodeHeight +( px: 40, title: 26, mb:30, rowGap:20 )
    const getSGWidth = dimen?.isNodeCollapsed ? 134 : dimen?.width ? dimen?.width + 160 : 0 // nodeWidth + (py: 80)
    maxChildrenDimension.height = Math.max(maxChildrenDimension.height, getSGHeight)
    maxChildrenDimension.width = Math.max(maxChildrenDimension.width, getSGWidth)
  })
  nodeHeight = maxChildrenDimension?.height > 0 ? maxChildrenDimension?.height : nodeHeight //nodeHeight +( px: 72, title: 26, mb:30, rowGap:20 )
  nodeWidth = maxChildrenDimension?.width > 0 ? maxChildrenDimension?.width : nodeWidth

  if (showAllNodes) {
    const maxChildLength = defaultTo(data.length, 0)
    const finalHeight = getMatrixHeight(nodeHeight, maxChildLength, parallelism, true)
    const finalWidth =
      nodeWidth * (parallelism === 0 ? 1 : Math.min(parallelism, (data || []).length)) + ((parallelism || 1) - 1) * 60 // colGap
    return {
      height: finalHeight,
      width: finalWidth
    }
  } else {
    const updatedParallelism = Math.min(parallelism, MAX_ALLOWED_MATRIX_COLLAPSED_NODES)
    const maxChildLength = Math.min(data.length, COLLAPSED_MATRIX_NODE_LENGTH)
    const finalHeight = getMatrixHeight(nodeHeight, maxChildLength, updatedParallelism, false)
    const finalWidth =
      nodeWidth * (parallelism === 0 ? 1 : Math.min(updatedParallelism, (data || []).length)) +
      ((updatedParallelism || 1) - 1) * 60 // colGap
    return {
      height: finalHeight,
      width: finalWidth
    }
  }
}

export function MatrixStepNode(props: any): JSX.Element {
  const allowAdd = defaultTo(props.allowAdd, false)
  const { getString } = useStrings()
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [showAddLink, setShowAddLink] = React.useState(false)
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(false)
  const [layoutStyles, setLayoutStyles] = React.useState<LayoutStyles>({ height: 100, width: 70 })
  const [concurrentNodes, setConcurrentNodes] = React.useState<number>(MAX_ALLOWED_MATRIX_COLLAPSED_NODES)
  const [{ visibilityMap }] = useCollapsedNodeStore()

  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const DefaultNode: React.FC<any> | undefined = props?.getDefaultNode()?.component
  const nestedStepsData = defaultTo(props?.data?.stepGroup?.steps, props?.data?.step?.data?.stepGroup?.steps)
  const maxParallelism = defaultTo(props?.data?.maxParallelism, props?.data?.step?.data?.maxParallelism)
  const nodeType = defaultTo(props?.data?.nodeType, props?.data?.step?.data?.nodeType)

  const isNestedStepGroup = Boolean(get(props, 'data.step.data.isNestedGroup'))
  const hasChildrenToBeCollapsed = nestedStepsData?.length > COLLAPSED_MATRIX_NODE_LENGTH

  const { selectedNestedSteps, hasSelectedNestedSteps } = React.useMemo(() => {
    const selected = nestedStepsData?.filter((item: any) => visibilityMap.get(item?.step?.uuid)) ?? []

    return {
      selectedNestedSteps: selected,
      hasSelectedNestedSteps: selected.length > 0
    }
  }, [nestedStepsData, visibilityMap])

  const { updateDimensions, childrenDimensions } = useNodeDimensionContext()

  React.useEffect(() => {
    props?.updateGraphLinks?.()
  }, [isNodeCollapsed])

  React.useLayoutEffect(() => {
    props?.updateGraphLinks?.()
    // collapsed default matrix node dimensions
    isNodeCollapsed
      ? updateDimensions?.({
          [(props?.data?.id || props?.id) as string]: { height: 165, width: 165, type: 'matrix', isNodeCollapsed }
        })
      : updateDimensions?.({
          [(props?.data?.id || props?.id) as string]: { ...layoutStyles, type: 'matrix', isNodeCollapsed }
        })
  }, [layoutStyles])

  React.useLayoutEffect(() => {
    if (nestedStepsData?.length) {
      setLayoutStyles(
        getCalculatedStepNodeStyles(
          hasSelectedNestedSteps ? selectedNestedSteps : nestedStepsData,
          maxParallelism,
          hasSelectedNestedSteps,
          childrenDimensions
        )
      )
    } else {
      setNodeCollapsed(true)
    }
  }, [nestedStepsData, selectedNestedSteps, isNodeCollapsed, props?.isNodeCollapsed, hasSelectedNestedSteps])

  const debounceHideVisibility = debounce(() => {
    setVisibilityOfAdd(false)
  }, 300)

  React.useEffect(() => {
    const visibleStepsData = hasSelectedNestedSteps ? selectedNestedSteps : nestedStepsData
    if (hasSelectedNestedSteps) {
      setConcurrentNodes(maxParallelism === 0 ? 1 : Math.min(maxParallelism, (visibleStepsData || []).length))
    } else {
      const updatedParallelism = Math.min(maxParallelism, MAX_ALLOWED_MATRIX_COLLAPSED_NODES) || 1
      setConcurrentNodes(maxParallelism === 0 ? 1 : Math.min(updatedParallelism, (visibleStepsData || []).length))
    }
  }, [maxParallelism, hasSelectedNestedSteps, selectedNestedSteps, nestedStepsData])

  useDeepCompareEffect(() => {
    if (nestedStepsData?.length) {
      setLayoutStyles(
        getCalculatedStepNodeStyles(
          hasSelectedNestedSteps ? selectedNestedSteps : nestedStepsData,
          maxParallelism,
          hasSelectedNestedSteps,
          childrenDimensions
        )
      )
    }
  }, [childrenDimensions])

  const onShowAll: ButtonProps['onClick'] = e => {
    e.stopPropagation()
    props?.fireEvent?.({
      type: Event.CollapsedNodeClick,
      data: { ...props }
    })
  }

  return (
    <>
      <div
        style={{ position: 'relative' }}
        className={cx({
          [css.topParentMargin]: Boolean(props?.parentIdentifier)
        })}
      >
        <div
          onMouseOver={e => {
            e.stopPropagation()
            allowAdd && setVisibilityOfAdd(true)
          }}
          onMouseLeave={e => {
            e.stopPropagation()
            allowAdd && debounceHideVisibility()
          }}
          onDragLeave={() => allowAdd && debounceHideVisibility()}
          style={nestedStepsData?.containerCss ? nestedStepsData?.containerCss : undefined}
          className={cx(
            css.matrixStepGroup,
            { [css.firstnode]: !props?.isParallelNode },
            { [(css.marginBottom, css.marginTop)]: props?.isParallelNode },
            { [css.nestedGroup]: isNestedStepGroup }
            // { [css.stepGroupParent]: hasStepGroupChild }
            // { [css.stepGroupNormal]: !isNestedStepGroup && !hasStepGroupChild }
          )}
        >
          <MatrixNodeLabelWrapper isParallelNode={props?.isParallelNode} nodeType={nodeType} />
          <div id={props?.id} className={css.horizontalBar}></div>
          {props.data?.skipCondition && (
            <div className={css.conditional}>
              <Text
                tooltip={`Skip condition:\n${props.data?.skipCondition}`}
                tooltipProps={{
                  isDark: true
                }}
              >
                <Icon size={26} name={'conditional-skip-new'} />
              </Text>
            </div>
          )}
          {props.data?.conditionalExecutionEnabled && (
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
          <div className={css.stepGroupHeader}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Layout.Horizontal
                spacing="small"
                className={css.headerTitle}
                onMouseOver={e => {
                  e.stopPropagation()
                }}
                onMouseOut={e => {
                  e.stopPropagation()
                }}
              >
                <Icon
                  className={css.collapseIcon}
                  name={isNodeCollapsed ? 'plus' : 'minus'}
                  onClick={e => {
                    e.stopPropagation()
                    setNodeCollapsed(!isNodeCollapsed)
                  }}
                />
                <Text
                  data-nodeid={props.id}
                  font={{ weight: 'semi-bold' }}
                  className={css.cursor}
                  onMouseEnter={event => {
                    props?.fireEvent?.({
                      type: Event.MouseEnterNode,
                      target: event.target,
                      data: { ...props }
                    })
                  }}
                  onMouseLeave={event => {
                    debounceHideVisibility()
                    props?.fireEvent?.({
                      type: Event.MouseLeaveNode,
                      target: event.target,
                      data: { ...props }
                    })
                  }}
                  lineClamp={1}
                  onClick={event => {
                    event.stopPropagation()
                    debounceHideVisibility()
                    props?.fireEvent?.({
                      type: Event.StepGroupClicked,
                      target: event.target,
                      data: { ...props }
                    })
                  }}
                >
                  {props.name}
                </Text>
              </Layout.Horizontal>
              {/* Execution summary on collapse */}
              <NodeStatusIndicator nodeState={nestedStepsData} className={css.headerStatus} />
            </Layout.Horizontal>
          </div>
          <div
            className={cx(css.collapsedMatrixWrapper, {
              [css.isNodeCollapsed]: isNodeCollapsed,
              [css.nestedStepGroup]: lowerCase(nestedStepsData?.[0]?.step?.type) === lowerCase(NodeType.StepGroupNode)
            })}
          >
            {isNodeCollapsed && DefaultNode ? (
              <DefaultNode
                onClick={() => {
                  setNodeCollapsed(false)
                }}
                {...props}
                icon="looping"
                showMarkers={false}
                name={`[+] ${nestedStepsData?.length} Steps`} //matrix collapsed node
                isNodeCollapsed={true}
              />
            ) : (
              <>
                <div
                  className={cx(css.stepGroupBody, { [css.hasMoreChild]: maxParallelism || hasChildrenToBeCollapsed })}
                >
                  <div
                    className={css.matrixNodesGridWrapper}
                    style={{ '--columns': concurrentNodes } as React.CSSProperties}
                  >
                    {(hasSelectedNestedSteps ? selectedNestedSteps : nestedStepsData)?.map(
                      ({ step: node }: any, index: number) => {
                        const defaultNode = props?.getDefaultNode()?.component
                        const NodeComponent: React.FC<BaseReactComponentProps> = defaultTo(
                          props.getNode?.(node?.type)?.component,
                          defaultNode
                        ) as React.FC<BaseReactComponentProps>
                        const matrixNodeName = defaultTo(node?.matrixNodeName, node?.data?.matrixNodeName)
                        return (
                          <React.Fragment key={node.data?.identifier}>
                            {index <
                            (hasSelectedNestedSteps ? selectedNestedSteps.length : COLLAPSED_MATRIX_NODE_LENGTH) ? (
                              <NodeComponent
                                {...node}
                                id={node?.uuid}
                                nodeType={node?.type}
                                parentIdentifier={node.parentIdentifier}
                                key={node.data?.identifier}
                                getNode={props.getNode}
                                fireEvent={props.fireEvent}
                                getDefaultNode={props.getDefaultNode}
                                className={cx(css.graphNode, node.className)}
                                isSelected={
                                  node?.selectedNode && node.selectedNode === (node.data?.id || node.data?.uuid)
                                }
                                isParallelNode={node.isParallelNode}
                                allowAdd={
                                  (!node.data?.children?.length && !node.isParallelNode) ||
                                  (node.isParallelNode && node.isLastChild)
                                }
                                isFirstParallelNode={true}
                                prevNodeIdentifier={node.prevNodeIdentifier}
                                prevNode={node.prevNode}
                                nextNode={node.nextNode}
                                updateGraphLinks={node.updateGraphLinks}
                                readonly={props.readonly}
                                selectedNodeId={props?.selectedNodeId}
                                showMarkers={false}
                                name={node.name}
                                matrixNodeName={matrixNodeName}
                                isParentMatrix={true}
                              />
                            ) : null}
                          </React.Fragment>
                        )
                      }
                    )}
                  </div>
                </div>
                {!props.readonly && props?.identifier !== STATIC_SERVICE_GROUP_NAME && (
                  <Button
                    className={cx(css.closeNode, { [css.readonly]: props.readonly })}
                    minimal
                    icon="cross"
                    variation={ButtonVariation.PRIMARY}
                    iconProps={{ size: 10 }}
                    onMouseDown={e => {
                      e.stopPropagation()
                      props?.fireEvent?.({
                        type: Event.RemoveNode,
                        data: {
                          identifier: props?.identifier,
                          node: props
                        }
                      })
                    }}
                    withoutCurrentColor={true}
                  />
                )}
                {(maxParallelism || hasChildrenToBeCollapsed) && (
                  <Layout.Horizontal className={css.matrixFooter}>
                    <Layout.Horizontal className={css.matrixBorderWrapper}>
                      <Layout.Horizontal margin={0} className={css.showNodes}>
                        {hasChildrenToBeCollapsed && (
                          <>
                            <Text padding={0}>{`${
                              hasSelectedNestedSteps
                                ? selectedNestedSteps.length
                                : Math.min(nestedStepsData?.length, COLLAPSED_MATRIX_NODE_LENGTH)
                            }/${nestedStepsData?.length}`}</Text>
                            <Button
                              intent="primary"
                              minimal
                              withoutBoxShadow
                              size={ButtonSize.SMALL}
                              text={getString('showAll')}
                              onClick={onShowAll}
                            />
                          </>
                        )}
                      </Layout.Horizontal>
                      {maxParallelism && (
                        <Text font="normal" className={css.concurrencyLabel}>
                          {maxParallelism ? `${getString('pipeline.MatrixNode.maxConcurrency')} ${maxParallelism}` : ''}
                        </Text>
                      )}
                    </Layout.Horizontal>
                  </Layout.Horizontal>
                )}

                {!props.isParallelNode && !props.readonly && (
                  <div
                    style={{ left: getPositionOfAddIcon(props) }}
                    data-linkid={props?.identifier}
                    onMouseOver={event => event.stopPropagation()}
                    onClick={event => {
                      event.stopPropagation()
                      props?.fireEvent?.({
                        type: Event.AddLinkClicked,
                        target: event.target,
                        data: {
                          entityType: DiagramType.Link,
                          node: props,
                          prevNodeIdentifier: props?.prevNodeIdentifier,
                          parentIdentifier: props?.parentIdentifier,
                          identifier: props?.identifier
                        }
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
                      setShowAddLink(false)
                      props?.fireEvent?.({
                        type: Event.DropLinkEvent,
                        target: event.target,
                        data: {
                          linkBeforeStepGroup: false,
                          entityType: DiagramType.Link,
                          node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                          destination: props
                        }
                      })
                    }}
                    className={cx(defaultCss.addNodeIcon, 'stepAddIcon', defaultCss.stepGroupAddIcon, {
                      [defaultCss.show]: showAddLink
                    })}
                  >
                    <Icon name="plus" color={Color.WHITE} />
                  </div>
                )}
                {allowAdd && !props.readonly && CreateNode && (
                  <CreateNode
                    className={cx(
                      defaultCss.addNode,
                      { [defaultCss.visible]: showAdd },
                      { [defaultCss.marginBottom]: props?.isParallelNode }
                    )}
                    onDragLeave={debounceHideVisibility}
                    onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
                    onMouseLeave={() => allowAdd && debounceHideVisibility()}
                    onDrop={(event: any) => {
                      props?.fireEvent?.({
                        type: Event.DropNodeEvent,
                        data: {
                          entityType: DiagramType.Default,
                          node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                          destination: props
                        }
                      })
                    }}
                    onClick={(event: any): void => {
                      event.stopPropagation()
                      props?.fireEvent?.({
                        type: Event.AddParallelNode,
                        target: event.target,
                        data: {
                          identifier: props?.identifier,
                          parentIdentifier: props?.parentIdentifier,
                          entityType: DiagramType.StepGroupNode,
                          node: props
                        }
                      })
                    }}
                    name={''}
                    hidden={!showAdd}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
