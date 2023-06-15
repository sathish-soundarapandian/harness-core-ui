/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties } from 'react'
import cx from 'classnames'
import { Icon, Text, Layout, Button, ButtonVariation, IconName } from '@harness/uicore'
import { debounce, defaultTo } from 'lodash-es'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/PipelineDiagram/Constants'
import { useStrings } from 'framework/strings'
import { ImagePreview } from '@common/components/ImagePreview/ImagePreview'
import { StageType } from '@pipeline/utils/stageHelpers'
import { FireEventMethod, NodeType } from '../../../types'
import SVGMarker from '../../SVGMarker'
import StepsGraph from './StepsGraph'
import PipelineStageNode from '../PipelineStageNode/PipelineStageNode'
import AddLinkNode from '../AddLinkNode/AddLinkNode'
import { getPositionOfAddIcon, isStageNodeExpansionDisabled } from '../../utils'
import MatrixNodeLabelWrapper from '../../MatrixNodeLabelWrapper'
import { DiamondNodeWidget } from '../../DiamondNode/DiamondNode'
import defaultCss from '../DefaultNode.module.scss'
import css from './PipelineStageNode.module.scss'

export interface PipelineStageNodeProps {
  getNode?: (node: NodeType) => { component: React.FC<any> }
  fireEvent?: FireEventMethod
  status: string
  data: any
  readonly: boolean
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  id: string
  isSelected: boolean
  icon: string
  iconUrl?: string
  identifier: string
  name: JSX.Element | string
  defaultSelected: any
  parentIdentifier?: string
  isParallelNode: boolean
  prevNodeIdentifier?: string
  nextNode?: any
  allowAdd?: boolean
  selectedNodeId?: string
  showMarkers?: boolean
  matrixNodeName?: string
  customNodeStyle?: CSSProperties
  updateGraphLinks?: () => void
  type?: string
}
function PipelineStageNodeV1(props: PipelineStageNodeProps): JSX.Element {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()
  const { getString } = useStrings()

  const NodeComponent = props?.type === StageType.APPROVAL ? DiamondNodeWidget : PipelineStageNode
  const allowAdd = defaultTo(props.allowAdd, false)
  const [showAddNode, setVisibilityOfAdd] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component

  const [isNodeExpanded, setNodeExpanded] = React.useState(selectedStageId === props.identifier || false)
  const [nodeType] = Object.keys(props.data?.stage?.strategy || {})

  React.useEffect(() => {
    setTimeout(() => props?.updateGraphLinks?.(), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNodeExpanded])

  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return
    }
    setVisibilityOfAdd(visibility)
  }

  const onDropEvent = (event: React.DragEvent): void => {
    event.stopPropagation()

    props?.fireEvent?.({
      type: Event.DropNodeEvent,
      target: event.target,
      data: {
        entityType: DiagramType.Default,
        node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
        destination: props
      }
    })
  }
  const debounceHideVisibility = debounce(() => {
    setVisibilityOfAdd(false)
  }, 300)

  const isNodeCollapsed = !isNodeExpanded || props.data?.isTemplateNode || isStageNodeExpansionDisabled(props?.type)

  React.useEffect(() => {
    setNodeExpanded(selectedStageId === props.identifier)
  }, [props.identifier, selectedStageId])

  return (
    <>
      {isNodeCollapsed ? (
        <NodeComponent {...props} />
      ) : (
        <div style={{ position: 'relative' }}>
          <div
            className={cx(css.marginBottom, css.nodeExpandedWrapper, {
              [css.firstnode]: !props?.isParallelNode
            })}
          >
            <div className={cx(defaultCss.markerStart, defaultCss.stepMarker, defaultCss.stepGroupMarkerLeft)}>
              <SVGMarker />
            </div>
            <div className={cx(defaultCss.markerEnd, defaultCss.stepMarker, defaultCss.stepGroupMarkerRight)}>
              <SVGMarker />
            </div>
            {props.data?.loopingStrategyEnabled && (
              <MatrixNodeLabelWrapper isParallelNode={props?.isParallelNode} nodeType={nodeType} />
            )}

            <div
              id={props?.id}
              className={cx('stepGroupNode', css.horizontalBar)}
              data-collapsedNode={isNodeExpanded}
            ></div>

            {props?.data?.isInComplete && (
              <Icon className={css.incomplete} size={12} name={'warning-sign'} color="orange500" />
            )}
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

            <div className={cx(css.nodeHeader, {})}>
              <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'space-between' }} width={'100%'}>
                <Layout.Horizontal
                  onMouseOver={e => {
                    e.stopPropagation()
                  }}
                  onMouseOut={e => {
                    e.stopPropagation()
                  }}
                  flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                  width={'100%'}
                >
                  <Icon
                    className={css.collapseIcon}
                    name="minus"
                    margin={{ right: 'small' }}
                    onClick={e => {
                      e.stopPropagation()
                      setNodeExpanded(false)
                    }}
                  />
                  <Layout.Horizontal flex={{ alignItems: 'center' }}>
                    {props.iconUrl ? (
                      <ImagePreview src={props.iconUrl} size={16} fallbackIcon={props.icon as IconName} />
                    ) : (
                      props.icon && <Icon size={16} name={props.icon as IconName} />
                    )}
                    <Text
                      data-nodeid={props.id}
                      padding={{ left: 'small' }}
                      className={css.cursor}
                      lineClamp={1}
                      tooltipProps={{
                        position: 'bottom'
                      }}
                      font={{ weight: 'bold' }}
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
                    >
                      {props.name || props.identifier}
                    </Text>
                  </Layout.Horizontal>
                </Layout.Horizontal>
              </Layout.Horizontal>
              {/* STAGE METADATA CONTROLS SECTION HERE */}
              <div className={css.nodeBody}>
                <StepsGraph
                  isReadonly={props.readonly}
                  selectedStageId={props.identifier}
                  type={props?.type as StageType}
                />
              </div>
            </div>
            {!props.readonly && (
              <Button
                className={cx(css.closeNode, { [defaultCss.readonly]: props.readonly })}
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
                      identifier: props?.identifier as string,
                      node: props
                    }
                  })
                }}
                withoutCurrentColor={true}
              />
            )}
          </div>
          {allowAdd && CreateNode && !props.readonly && (
            <CreateNode
              onMouseOver={() => setAddVisibility(true)}
              onDragOver={() => setAddVisibility(true)}
              onDrop={onDropEvent}
              onMouseLeave={debounceHideVisibility}
              onDragLeave={debounceHideVisibility}
              onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                event.stopPropagation()
                props?.fireEvent?.({
                  type: Event.AddParallelNode,
                  target: event.target,
                  data: {
                    identifier: props?.identifier,
                    parentIdentifier: props?.parentIdentifier,
                    entityType: DiagramType.Default,
                    node: props
                  }
                })
              }}
              className={cx(defaultCss.addNode, defaultCss.stageAddNode, { [defaultCss.visible]: showAddNode })}
            />
          )}
          {!props.isParallelNode && !props.readonly && (
            <AddLinkNode<PipelineStageNodeProps>
              id={props.id}
              nextNode={props?.nextNode}
              parentIdentifier={props?.parentIdentifier}
              isParallelNode={props.isParallelNode}
              readonly={props.readonly}
              data={props}
              fireEvent={props?.fireEvent}
              style={{ left: getPositionOfAddIcon(props) }}
              identifier={props.identifier}
              prevNodeIdentifier={props.prevNodeIdentifier as string}
              className={cx(defaultCss.addNodeIcon, defaultCss.left, defaultCss.stageAddIcon)}
            />
          )}
        </div>
      )}
    </>
  )
}

export default PipelineStageNodeV1
