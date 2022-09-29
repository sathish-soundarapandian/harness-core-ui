/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import cx from 'classnames'
import { Icon, Layout, Text, Button, ButtonVariation } from '@wings-software/uicore'
import { debounce, defaultTo, get } from 'lodash-es'
import { Event, DiagramDrag, DiagramType } from '@pipeline/components/Diagram'
import { STATIC_SERVICE_GROUP_NAME } from '@pipeline/utils/executionUtils'
import { useStrings } from 'framework/strings'
import StepGroupGraph from '../StepGroupGraph/StepGroupGraph'
import { BaseReactComponentProps, NodeType } from '../../types'
import SVGMarker from '../SVGMarker'
import { getPositionOfAddIcon } from '../utils'
import { useNodeDimensionContext } from '../NodeDimensionStore'
import MatrixNodeLabelWrapper from '../MatrixNodeLabelWrapper'
import AddLinkNode from '../DefaultNode/AddLinkNode/AddLinkNode'
import css from './StepGroupNode.module.scss'
import defaultCss from '../DefaultNode/DefaultNode.module.scss'

export function StepGroupNode(props: any): JSX.Element {
  const allowAdd = defaultTo(props.allowAdd, false)
  const { getString } = useStrings()
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [showAddLink, setShowAddLink] = React.useState(false)
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const DefaultNode: React.FC<any> | undefined = props?.getDefaultNode()?.component
  const stepGroupData = defaultTo(props?.data?.stepGroup, props?.data?.step?.data?.stepGroup) || props?.data?.step
  const stepsData = stepGroupData?.steps

  const isExecutionView = Boolean(props?.data?.status)

  const { updateDimensions } = useNodeDimensionContext()
  const isNestedStepGroup = Boolean(
    get(props, 'data.step.data.isNestedGroup') || (get(props, 'data.isNestedGroup') && props?.parentIdentifier)
  )

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
    if (stepsData?.length === 0 && isExecutionView) {
      setNodeCollapsed(true)
    }
  }, [stepsData])

  const debounceHideVisibility = debounce(() => {
    setVisibilityOfAdd(false)
  }, 300)
  const nodeType = Object.keys(props?.data?.stepGroup?.strategy || {})[0]
  return (
    <>
      {isNodeCollapsed && DefaultNode ? (
        <DefaultNode
          onClick={() => {
            setNodeCollapsed(false)
          }}
          {...props}
          isNodeCollapsed={true}
          icon="step-group"
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
            className={cx(css.stepGroup, {
              [css.firstnode]: !props?.isParallelNode,
              [css.parallelNodes]: props?.isParallelNode,
              [css.marginBottom]: props?.isParallelNode,
              [css.nestedGroup]: isNestedStepGroup,
              // [css.stepGroupParent]: hasStepGroupChild,
              [css.stepGroupNormal]: !isNestedStepGroup //&& !hasStepGroupChild
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
                >
                  {props.name}
                </Text>
              </Layout.Horizontal>
            </div>
            <div className={css.stepGroupBody}>
              <StepGroupGraph
                {...props}
                data={stepsData}
                isNodeCollapsed={isNodeCollapsed}
                parentIdentifier={props?.identifier}
                hideLinks={props?.identifier === STATIC_SERVICE_GROUP_NAME}
                setVisibilityOfAdd={setVisibilityOfAdd}
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
              setShowAddLink={setShowAddLink}
              className={cx(defaultCss.addNodeIcon, 'stepAddIcon', defaultCss.stepGroupAddIcon, {
                [defaultCss.show]: showAddLink
              })}
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
              setShowAddLink={setShowAddLink}
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
