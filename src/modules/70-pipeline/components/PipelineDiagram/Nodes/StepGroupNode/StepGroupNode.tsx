/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import cx from 'classnames'
import { Icon, Layout, Text, Button, ButtonVariation, useToaster } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { debounce, defaultTo, get, isEmpty, isUndefined } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'
import { isNodeTypeMatrixOrFor, STATIC_SERVICE_GROUP_NAME } from '@pipeline/utils/executionUtils'
import { useStrings } from 'framework/strings'
import {
  isExecutionRunning,
  ExecutionStatus,
  isExecutionSkipped,
  isExecutionNotStarted,
  isExecutionComplete
} from '@pipeline/utils/statusHelpers'
import type { ExecutionGraph } from 'services/pipeline-ng'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import StepGroupGraph from '../StepGroupGraph/StepGroupGraph'
import { BaseReactComponentProps, NodeType, PipelineGraphState } from '../../types'
import SVGMarker from '../SVGMarker'
import { getPositionOfAddIcon } from '../utils'
import { useNodeDimensionContext } from '../NodeDimensionStore'
import MatrixNodeLabelWrapper from '../MatrixNodeLabelWrapper'
import AddLinkNode from '../DefaultNode/AddLinkNode/AddLinkNode'
import { DiagramDrag, DiagramType, Event } from '../../Constants'
import css from './StepGroupNode.module.scss'
import defaultCss from '../DefaultNode/DefaultNode.module.scss'

export function StepGroupNode(props: any): JSX.Element {
  const { replaceQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const { queryParams, selectedStageId } = useExecutionContext()
  const allowAdd = defaultTo(props.allowAdd, false)
  const { getString } = useStrings()
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(props?.type === StageType.PIPELINE)
  const [childPipelineData, setChildPipelineData] = React.useState<PipelineGraphState[]>([])
  const [executionMetaData, setExecutionMetaData] = React.useState<ExecutionGraph['executionMetadata'] | undefined>(
    undefined
  )
  const { showPrimary } = useToaster()
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const DefaultNode: React.FC<any> | undefined = props?.getDefaultNode()?.component
  const stepGroupData = defaultTo(props?.data?.stepGroup, props?.data?.step?.data?.stepGroup) || props?.data?.step
  const stepsData = stepGroupData?.steps || stepGroupData?.template?.templateInputs?.steps
  const isParentMatrix = defaultTo(props?.isParentMatrix, false)
  const { module, source = 'executions' } = useParams<PipelineType<ExecutionPathProps>>()

  const stepStatus = defaultTo(props?.status || props?.data?.status, props?.data?.step?.status as ExecutionStatus)
  const isExecutionView = Boolean(stepStatus)
  const displayName = props.name || props.identifier
  const showTemplateIcon = !!props.data?.isTemplateNode || !!props?.data?.stepGroup?.template
  const { updateDimensions } = useNodeDimensionContext()
  const isNestedStepGroup = Boolean(
    get(props, 'data.step.data.isNestedGroup') || (get(props, 'data.isNestedGroup') && props?.parentIdentifier)
  )

  React.useEffect(() => {
    if (
      props?.type === StageType.PIPELINE &&
      (isExecutionRunning(props?.status) || isExecutionComplete(props?.status)) &&
      isNodeCollapsed &&
      childPipelineData &&
      childPipelineData?.length > 0
    ) {
      setNodeCollapsed(false)
    }
  }, [props?.status, childPipelineData])

  React.useEffect(() => {
    if (props?.type === StageType.PIPELINE && !isExecutionRunning(props?.status) && props?.id !== selectedStageId)
      setNodeCollapsed(true)
  }, [props?.status, selectedStageId])

  React.useEffect(() => {
    if (props?.childPipelineData?.length) setChildPipelineData(props?.childPipelineData)
  }, [props?.childPipelineData])

  React.useEffect(() => {
    if (props?.executionMetaData) setExecutionMetaData(props?.executionMetaData)
  }, [props?.executionMetaData])

  React.useEffect(() => {
    props?.updateGraphLinks?.()
    updateDimensions?.({
      [(props?.id || props?.data?.id) as string]: {
        height: 100,
        width: 80,
        type: props?.type,
        isNodeCollapsed
      }
    })
  }, [isNodeCollapsed])

  React.useEffect(() => {
    // collapse stepGroup in execution view till data loads
    if (props?.type !== StageType.PIPELINE) setNodeCollapsed(stepsData?.length === 0 && isExecutionView)
  }, [stepsData])

  const debounceHideVisibility = debounce(() => {
    setVisibilityOfAdd(false)
  }, 300)

  const nodeType = Object.keys(props?.data?.stepGroup?.strategy || {})[0]
  const showExecutionMetaDataForChainedPipeline = props?.type === StageType.PIPELINE && !!executionMetaData

  React.useEffect(() => {
    // collapse stepGroup template
    if (!isEmpty(props?.data?.stepGroup?.template)) {
      setNodeCollapsed(true)
    }
  }, [props?.data?.stepGroup])

  return (
    <>
      {isNodeCollapsed && DefaultNode ? (
        <DefaultNode
          onClick={(event: Event) => {
            if (!isEmpty(props?.data?.stepGroup?.template)) {
              event.stopPropagation()
              debounceHideVisibility()
              props?.fireEvent?.({
                type: Event.StepGroupClicked,
                target: event.target,
                data: { ...props }
              })
              return
            }

            if (props?.type !== StageType.PIPELINE && isEmpty(stepsData) && isExecutionView) {
              showPrimary(getString('pipeline.execution.emptyStepGroup'))
            }
            if (props?.type === StageType.PIPELINE) {
              if (isExecutionNotStarted(props?.status) || isExecutionSkipped(props?.status)) return
              const params = {
                ...queryParams,
                stage: props?.id,
                ...(childPipelineData &&
                  childPipelineData.length > 0 &&
                  (isNodeTypeMatrixOrFor(childPipelineData[0]?.type)
                    ? {
                        childStage: get(
                          childPipelineData,
                          [0, 'data', 'children', 0, 'stageNodeId'],
                          childPipelineData[0]?.id
                        ) as string,
                        stageExecId: get(
                          childPipelineData,
                          [0, 'data', 'children', 0, 'id'],
                          childPipelineData[0]?.id
                        ) as string
                      }
                    : { childStage: childPipelineData[0]?.id }))
              }
              delete params?.step
              if (!isNodeTypeMatrixOrFor(childPipelineData[0]?.type)) delete params?.stageExecId
              if (isUndefined(childPipelineData) || isEmpty(childPipelineData)) delete params?.childStage
              replaceQueryParams(params)
              // Once the childPipelineData is available after refresh, the node will uncollapse.
              if (isUndefined(childPipelineData) || isEmpty(childPipelineData)) return
            }
            setNodeCollapsed(false)
          }}
          {...props}
          isNodeCollapsed={true}
          icon={props?.type === StageType.PIPELINE ? 'chained-pipeline' : 'step-group'}
          selectedNodeId={props?.type === StageType.PIPELINE ? selectedStageId : props?.selectedNodeId} // In order to apply selected node background color on collapsing the node after execution is completed
        />
      ) : (
        <div style={{ position: 'relative' }}>
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
            style={stepGroupData?.containerCss ? stepGroupData?.containerCss : undefined}
            className={cx(css.stepGroup, css.marginBottom, {
              [css.firstnode]: !props?.isParallelNode,
              [css.parallelNodes]: props?.isParallelNode,
              [css.nestedGroup]: isNestedStepGroup,
              [css.stepGroupNormal]: !isNestedStepGroup,
              parentMatrix: isParentMatrix,
              [css.templateStepGroup]: !!props?.data?.isTemplateNode,
              [css.rollbackGroup]: StageType.ROLLBACK === props?.type
            })}
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
            {props.data?.loopingStrategyEnabled && (
              <MatrixNodeLabelWrapper isParallelNode={props?.isParallelNode} nodeType={nodeType} />
            )}

            <div
              id={props?.id}
              className={cx('stepGroupNode', css.horizontalBar)}
              data-collapsedNode={isNodeCollapsed}
            ></div>
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
            <div
              className={cx(css.stepGroupHeader, {
                [css.pipelineStageHeader]: showExecutionMetaDataForChainedPipeline
              })}
            >
              <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'space-between' }} width={'100%'}>
                <Layout.Horizontal
                  onMouseOver={e => {
                    e.stopPropagation()
                  }}
                  onMouseOut={e => {
                    e.stopPropagation()
                  }}
                  flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                  width={showExecutionMetaDataForChainedPipeline ? '50%' : '100%'}
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
                    data-nodeid={props.id}
                    className={css.cursor}
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
                    tooltipProps={{
                      position: 'bottom'
                    }}
                  >
                    {displayName}
                  </Text>
                  {showTemplateIcon && <Icon size={12} name={'template-library'} margin={{ left: 'xsmall' }} />}
                </Layout.Horizontal>
                {showExecutionMetaDataForChainedPipeline && (
                  <Link
                    to={routes.toExecutionPipelineView({
                      accountId: get(executionMetaData, 'accountId', ''),
                      orgIdentifier: get(executionMetaData, 'orgIdentifier', ''),
                      projectIdentifier: get(executionMetaData, 'projectIdentifier', ''),
                      pipelineIdentifier: get(executionMetaData, 'pipelineIdentifier', '-1'),
                      executionIdentifier: get(executionMetaData, 'planExecutionId', '-1'),
                      module,
                      source
                    })}
                    target="_blank"
                    className={css.childPipelineDetails}
                  >
                    <Text
                      font={{ variation: FontVariation.LEAD }}
                      color={Color.PRIMARY_7}
                      lineClamp={1}
                      style={{ lineHeight: '18px', maxWidth: '90px' }}
                      margin={{ right: 'xsmall' }}
                    >
                      {`${executionMetaData?.pipelineIdentifier}`}
                    </Text>
                    <Text
                      font={{ variation: FontVariation.LEAD }}
                      color={Color.PRIMARY_7}
                      lineClamp={1}
                      style={{ lineHeight: '18px' }}
                    >
                      {`(ID: ${executionMetaData?.runSequence})`}
                    </Text>
                    <Icon name="launch" color={Color.PRIMARY_7} size={14} margin={{ left: 'xsmall' }} />
                  </Link>
                )}
              </Layout.Horizontal>
            </div>
            <div className={css.stepGroupBody}>
              <StepGroupGraph
                {...props}
                data={[StageType.PIPELINE, StageType.ROLLBACK].includes(props?.type) ? childPipelineData : stepsData}
                isNodeCollapsed={isNodeCollapsed}
                parentIdentifier={props?.identifier}
                hideLinks={props?.identifier === STATIC_SERVICE_GROUP_NAME}
                setVisibilityOfAdd={setVisibilityOfAdd}
                type={props?.type}
              />
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
          </div>
          {!props.isParallelNode && !props.readonly && (
            <AddLinkNode<BaseReactComponentProps>
              nextNode={props?.nextNode}
              parentIdentifier={props?.parentIdentifier}
              isParallelNode={props.isParallelNode}
              readonly={props.readonly}
              data={props}
              fireEvent={props.fireEvent}
              identifier={props.identifier}
              prevNodeIdentifier={props.prevNodeIdentifier as string}
              style={{ left: getPositionOfAddIcon(props), top: isNestedStepGroup ? '48px' : '22px' }}
              className={cx(defaultCss.addNodeIcon, 'stepAddIcon', defaultCss.stepGroupAddIcon)}
            />
          )}
          {!props?.nextNode && props?.parentIdentifier && !props.readonly && !props.isParallelNode && (
            <AddLinkNode<BaseReactComponentProps>
              nextNode={props?.nextNode}
              style={{ right: getPositionOfAddIcon(props, true), top: isNestedStepGroup ? '48px' : '22px' }}
              parentIdentifier={props?.parentIdentifier}
              isParallelNode={props.isParallelNode}
              readonly={props.readonly}
              data={props}
              fireEvent={props.fireEvent}
              isRightAddIcon={true}
              identifier={props.identifier}
              prevNodeIdentifier={props.prevNodeIdentifier as string}
              className={cx(defaultCss.addNodeIcon, 'stepAddIcon')}
            />
          )}
          {allowAdd && !props.readonly && CreateNode && (
            <CreateNode
              className={cx(
                defaultCss.addNode,
                { [defaultCss.visible]: showAdd },
                { [defaultCss.marginBottom]: props?.isParallelNode }
              )}
              onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
              onMouseLeave={() => allowAdd && debounceHideVisibility()}
              onDragLeave={debounceHideVisibility}
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
        </div>
      )}
    </>
  )
}
