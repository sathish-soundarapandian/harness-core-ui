/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import cx from 'classnames'
import { Icon, Layout, Text, Button, ButtonVariation } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { debounce, defaultTo, get, isEmpty } from 'lodash-es'
import { Event, DiagramDrag, DiagramType } from '@pipeline/components/Diagram'
import { STATIC_SERVICE_GROUP_NAME } from '@pipeline/utils/executionUtils'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { isExecutionNotStarted } from '@pipeline/utils/statusHelpers'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import { BaseReactComponentProps, NodeType, PipelineGraphState, PipelineGraphType } from '../../types'
import { getPositionOfAddIcon, matrixNodeNameToJSON } from '../utils'
import { getPipelineGraphData } from '../../PipelineGraph/PipelineGraphUtils'
import MatrixNodeLabelWrapper from '../MatrixNodeLabelWrapper'
import { NodeStatusIndicator } from '../../NodeStatusIndicator/NodeStatusIndicator'
import css from './MatrixNode.module.scss'
import defaultCss from '../DefaultNode/DefaultNode.module.scss'

interface LayoutStyles {
  height: string
  width: string
  marginLeft?: string
}
const COLLAPSED_MATRIX_NODE_LENGTH = 8
const MAX_ALLOWED_MATRIX_COLLAPSED_NODES = 4
const DEFAULT_MATRIX_PARALLELISM = 1

const getHeight = (nodeHeight: number, maxChildLength: number, parallelism: number, showAllNodes: boolean): number => {
  if (parallelism === 0) {
    // parallel case + 20 (nodeGap except last child)
    return maxChildLength * nodeHeight + 20 * (maxChildLength - 1)
  } else if (!showAllNodes && maxChildLength < parallelism) {
    // collapsed mode, single row
    return nodeHeight + 20
  } else {
    return (
      (Math.floor(maxChildLength / parallelism) + Math.ceil((maxChildLength % parallelism) / parallelism)) *
        nodeHeight +
      20
    )
  }
}

const getCalculatedStyles = (data: PipelineGraphState[], parallelism: number, showAllNodes?: boolean): LayoutStyles => {
  const nodeWidth = data?.[0]?.nodeType === StageType.APPROVAL ? 142 : 165 // (125- text with lineClamp,90-PipelineStage), 132(Diamond) + 40(padding)
  const nodeHeight = data?.[0]?.nodeType === StageType.APPROVAL ? 120 : 100 // 40(node) + 60(text)
  parallelism = !parallelism ? 0 : (parallelism === 1 ? data.length : parallelism) || DEFAULT_MATRIX_PARALLELISM // parallelism strategy (undefined)- setting to default 0
  if (showAllNodes) {
    const maxChildLength = defaultTo(data?.length, 0)
    const finalHeight = getHeight(nodeHeight, maxChildLength, parallelism, true)
    const finalWidth = nodeWidth * (parallelism === 0 ? 1 : Math.min(parallelism, (data || []).length))
    return {
      height: `${finalHeight}px`,
      width: `${finalWidth + 40}px`
    }
  } else {
    const updatedParallelism = Math.min(parallelism, MAX_ALLOWED_MATRIX_COLLAPSED_NODES)
    const maxChildLength = Math.min(data.length, COLLAPSED_MATRIX_NODE_LENGTH)
    const finalHeight = getHeight(nodeHeight, maxChildLength, updatedParallelism, false)
    const finalWidth = nodeWidth * (parallelism === 0 ? 1 : Math.min(updatedParallelism, (data || []).length))
    return {
      height: `${finalHeight}px`,
      width: `${finalWidth}px`
    }
  }
}

export function MatrixNode(props: any): JSX.Element {
  const allowAdd = defaultTo(props.allowAdd, false)
  const { getString } = useStrings()
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [showAddLink, setShowAddLink] = React.useState(false)
  const [treeRectangle, setTreeRectangle] = React.useState<DOMRect | void>()
  const [state, setState] = React.useState<PipelineGraphState[]>([])
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(false)
  const [showAllNodes, setShowAllNodes] = React.useState(false)
  const [layoutStyles, setLayoutStyles] = React.useState<LayoutStyles>({ height: '100px', width: '70px' })
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const DefaultNode: React.FC<any> | undefined = props?.getDefaultNode()?.component
  const queryParams = useQueryParams<ExecutionPageQueryParams>()
  const defaultNode = props.getDefaultNode()?.component
  const { selectedStageExecutionId } = useExecutionContext()
  const isNestedStepGroup = Boolean(get(props, 'data.step.data.isNestedGroup'))
  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }
  const maxParallelism = props?.data?.maxParallelism
  const { errorMap } = useValidationErrors()
  const {
    state: { templateTypes },
    getStagePathFromPipeline
  } = usePipelineContext()

  const stagePath = getStagePathFromPipeline(props?.identifier || '', 'pipeline.stages')
  const hasChildrenToBeCollapsed = state.length > COLLAPSED_MATRIX_NODE_LENGTH

  const debounceHideVisibility = debounce(() => {
    setVisibilityOfAdd(false)
  }, 300)

  React.useEffect(() => {
    props?.updateGraphLinks?.()
  }, [isNodeCollapsed])

  React.useEffect(() => {
    props?.data?.status && setNodeCollapsed(isExecutionNotStarted(props?.data?.status))
  }, [props?.data?.status])

  React.useLayoutEffect(() => {
    if (state?.length) {
      props?.updateGraphLinks?.()
    }
  }, [layoutStyles])

  React.useEffect(() => {
    updateTreeRect()
  }, [])

  React.useLayoutEffect(() => {
    if (props?.data?.children?.length) {
      setState(
        getPipelineGraphData({
          data: props.data?.children,
          templateTypes: templateTypes,
          serviceDependencies: undefined,
          errorMap: errorMap,
          graphDataType: PipelineGraphType.STAGE_GRAPH,
          parentPath: `${stagePath}.stage.spec.execution.steps.stepGroup.steps` //index after step missing - getStepPathFromPipeline??
        })
      )
    } else {
      setState([])
      setNodeCollapsed(true)
    }
  }, [treeRectangle, props.data, templateTypes])

  React.useLayoutEffect(() => {
    if (state?.length) {
      setLayoutStyles(getCalculatedStyles(state, maxParallelism, showAllNodes))
    } else {
      setLayoutStyles({ height: '100px', width: '70px' })
    }
  }, [state, props?.isNodeCollapsed, showAllNodes, isNodeCollapsed])

  const isSelectedNode = React.useMemo(() => {
    return state.some(node => node?.id && node.id === queryParams?.stageExecId)
  }, [queryParams?.stageExecId, isNodeCollapsed])

  useDeepCompareEffect(() => {
    !maxParallelism && !hasChildrenToBeCollapsed && setShowAllNodes(true)
  }, [maxParallelism])

  return (
    <>
      <div style={{ position: 'relative' }}>
        <div
          onMouseOver={e => {
            e.stopPropagation()
            !props.readonly && allowAdd && setVisibilityOfAdd(true)
          }}
          onMouseLeave={e => {
            e.stopPropagation()
            !props.readonly && allowAdd && debounceHideVisibility()
          }}
          onDragLeave={() => !props.readonly && allowAdd && debounceHideVisibility()}
          className={cx(css.stepGroup, {
            [css.firstnode]: !props?.isParallelNode,
            [css.marginBottom]: props?.isParallelNode,
            [css.nestedGroup]: isNestedStepGroup
          })}
        >
          <MatrixNodeLabelWrapper isParallelNode={props?.isParallelNode} nodeType={props?.data?.nodeType} />
          <div id={props?.id} className={css.horizontalBar}></div>
          {props.data?.skipCondition && (
            <div className={css.conditional}>
              <Text
                tooltip={`Skip condition:\n${props.data?.skipCondition}`}
                tooltipProps={{
                  isDark: true
                }}
              >
                <Icon size={26} name={'conditional-skip-new'} color="white" />
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
                <Icon size={26} name={'conditional-skip-new'} color="white" />
              </Text>
            </div>
          )}
          <div className={css.stepGroupHeader}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Layout.Horizontal
                spacing="small"
                width="60%"
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
              <NodeStatusIndicator nodeState={state} />
            </Layout.Horizontal>
          </div>
          <div
            className={cx(css.collapsedMatrixWrapper, {
              [css.isNodeCollapsed]: isNodeCollapsed,
              [css.approvalStage]: isNodeCollapsed || state?.[0]?.type === StageType.APPROVAL
            })}
          >
            {isNodeCollapsed && DefaultNode ? (
              <DefaultNode
                onClick={() => {
                  setNodeCollapsed(false)
                }}
                {...props}
                isSelected={isSelectedNode}
                icon="looping"
                showMarkers={false}
                name={`[+] ${state.length} Stages`} //matrix collapsed node
              />
            ) : (
              <>
                <div
                  className={cx(css.stepGroupBody, { [css.hasMoreChild]: hasChildrenToBeCollapsed })}
                  style={layoutStyles}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '80px', rowGap: '20px' }}>
                    {state.map((node: any, index: number) => {
                      const NodeComponent: React.FC<BaseReactComponentProps> = defaultTo(
                        props.getNode?.(node?.type)?.component,
                        defaultNode
                      ) as React.FC<BaseReactComponentProps>

                      const formattedMatrixName = node?.matrixNodeName
                        ? `${matrixNodeNameToJSON(node.matrixNodeName)} ${node.name}`
                        : node?.name
                      return (
                        <React.Fragment key={node.data?.identifier}>
                          {index < (showAllNodes ? state?.length : COLLAPSED_MATRIX_NODE_LENGTH) ? (
                            <NodeComponent
                              {...node}
                              parentIdentifier={node.parentIdentifier}
                              key={node.data?.identifier}
                              getNode={props.getNode}
                              fireEvent={props.fireEvent}
                              getDefaultNode={props.getDefaultNode}
                              className={cx(css.graphNode, node.className)}
                              isSelected={node.selectedNode === node.data?.id}
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
                              selectedNodeId={
                                isEmpty(queryParams?.stageExecId)
                                  ? selectedStageExecutionId
                                  : queryParams?.stageExecId || props?.selectedNodeId
                              }
                              showMarkers={false}
                              name={formattedMatrixName}
                            />
                          ) : null}
                        </React.Fragment>
                      )
                    })}
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
                {maxParallelism && (
                  <Layout.Horizontal className={css.matrixFooter}>
                    <Layout.Horizontal className={css.matrixBorderWrapper}>
                      <Layout.Horizontal className={css.showNodes}>
                        {hasChildrenToBeCollapsed && (
                          <>
                            <Text padding={0}>{`${
                              !showAllNodes ? Math.min(state.length, COLLAPSED_MATRIX_NODE_LENGTH) : state.length
                            }/ ${state.length}`}</Text>
                            <Text
                              className={css.showNodeText}
                              padding={0}
                              onClick={() => setShowAllNodes(!showAllNodes)}
                            >
                              {`${!showAllNodes ? getString('showAll') : getString('common.hideAll')}`}
                            </Text>
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
                    onMouseOver={() => !props.readonly && allowAdd && setVisibilityOfAdd(true)}
                    onMouseLeave={() => !props.readonly && allowAdd && debounceHideVisibility()}
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
                          entityType: DiagramType.MatrixNode,
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
