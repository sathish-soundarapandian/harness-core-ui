/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties } from 'react'
import cx from 'classnames'
import { debounce, defaultTo } from 'lodash-es'
import { Icon, Text, Button, ButtonVariation, IconName, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/PipelineDiagram/Constants'
import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { getStatusProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import { ImagePreview } from '@common/components/ImagePreview/ImagePreview'
import SVGMarker from '../../SVGMarker'
import AddLinkNode from '../AddLinkNode/AddLinkNode'
import { FireEventMethod, NodeType } from '../../../types'
import { getPositionOfAddIcon, attachDragImageToEventHandler, NodeEntity } from '../../utils'
import MatrixNodeNameLabelWrapper from '../../MatrixNodeNameLabelWrapper'
import defaultCss from '../DefaultNode.module.scss'
import css from './PipelineStageNode.module.scss'

const CODE_ICON: IconName = 'command-echo'
const TEMPLATE_ICON: IconName = 'template-library'
interface PipelineStageNodeProps {
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
}
function PipelineStageNode(props: PipelineStageNodeProps): JSX.Element {
  const { getString } = useStrings()
  const allowAdd = defaultTo(props.allowAdd, false)
  const [showAddNode, setVisibilityOfAdd] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
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
  const showMarkers = defaultTo(props?.showMarkers, true)
  const stageStatus = defaultTo(props?.status, props?.data?.stage?.status as ExecutionStatus)
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
  const debounceHideVisibility = debounce(() => {
    setVisibilityOfAdd(false)
  }, 300)
  const isSelectedNode = (): boolean => props.isSelected || props.id === props?.selectedNodeId
  const isTemplateNode = props?.data?.isTemplateNode
  return (
    <div
      className={cx(defaultCss.defaultNode, 'default-node', {
        draggable: !props.readonly
      })}
      onMouseOver={() => setAddVisibility(true)}
      onMouseLeave={debounceHideVisibility}
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
            entityType: DiagramType.Default,
            ...props
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
          debounceHideVisibility()
        }
      }}
      onDrop={event => {
        if (!props.allowAdd) {
          return
        }
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
      }}
    >
      {showMarkers && (
        <div className={cx(defaultCss.markerStart, defaultCss.stageMarkerLeft)}>
          <SVGMarker />
        </div>
      )}
      <Container
        id={props.id}
        data-nodeid={props.id}
        style={{
          height: 64
        }}
        flex={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <div
          draggable={!props.readonly}
          className={cx(defaultCss.defaultCard, {
            [defaultCss.selected]: isSelectedNode(),
            [defaultCss.failed]: stageStatus === ExecutionStatusEnum.Failed,
            [defaultCss.runningNode]: stageStatus === ExecutionStatusEnum.Running,
            [defaultCss.skipped]: stageStatus === ExecutionStatusEnum.Skipped,
            [defaultCss.notStarted]: stageStatus === ExecutionStatusEnum.NotStarted
          })}
          style={{
            width: 90,
            height: 40,
            ...props.customNodeStyle
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
                identifier: props?.identifier as string,
                node: props,
                id: props.id
              }
            })
          }}
          onMouseLeave={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            debounceHideVisibility()
            event.stopPropagation()
            props?.fireEvent?.({
              type: Event.MouseLeaveNode,
              target: event.target,
              data: { ...props }
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
              data: { ...props }
            })
            attachDragImageToEventHandler(event, NodeEntity.STAGE)
          }}
          onDragEnd={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <div className="execution-running-animation" />
          {props?.data?.isInComplete && (
            <Icon className={defaultCss.incomplete} size={12} name={'warning-sign'} color="orange500" />
          )}
          {props.iconUrl ? (
            <ImagePreview src={props.iconUrl} size={28} fallbackIcon={props.icon as IconName} />
          ) : (
            props.icon && (
              <Icon
                size={28}
                name={props.icon as IconName}
                {...(isSelectedNode() ? { color: Color.WHITE, className: defaultCss.primaryIcon, inverse: true } : {})}
              />
            )
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
          {props?.data?.tertiaryIcon && (
            <Icon name={props?.data?.tertiaryIcon} size={13} className={defaultCss.tertiaryIcon} />
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
            className={cx(defaultCss.closeNode, { [defaultCss.readonly]: props.readonly })}
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
        </div>
      </Container>
      {showMarkers && (
        <div className={cx(defaultCss.markerEnd, defaultCss.stageMarkerRight)}>
          <SVGMarker />
        </div>
      )}
      {props.name && (
        <div className={cx(defaultCss.nodeNameText, defaultCss.stageName)}>
          <Text
            width={125}
            height={64}
            font={{ size: 'normal', align: 'center' }}
            color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
            padding={'small'}
            lineClamp={2}
            tooltipProps={{ popoverClassName: props?.matrixNodeName ? 'matrixNodeNameLabel' : '' }}
          >
            {props?.matrixNodeName ? (
              <MatrixNodeNameLabelWrapper
                matrixNodeName={props?.matrixNodeName}
                nodeName={props?.name as unknown as string}
              />
            ) : (
              props.name
            )}
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
      {props.data?.loopingStrategyEnabled && (
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
              {...(isSelectedNode() ? { color: Color.WHITE, className: defaultCss.primaryIcon, inverse: true } : {})}
            />
          </Text>
        </div>
      )}
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
  )
}

export default PipelineStageNode
