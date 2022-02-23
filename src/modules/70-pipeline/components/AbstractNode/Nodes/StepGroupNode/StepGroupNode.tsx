/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import classnames from 'classnames'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { Event, DiagramDrag } from '@pipeline/components/Diagram'
import type { StepGroupNodeLayerModel } from '../../../Diagram/node-layer/StepGroupNodeLayerModel'
import CreateNode from '../CreateNode/CreateNode'
import css from './StepGroupNode.module.scss'
import PipelineGraph from '../../PipelineGraph/PipelineGraph'
import StepGroupGraph from '../StepGroupGraph/StepGroupGraph'

const onAddNodeClick = (
  e: React.MouseEvent<Element, MouseEvent>,
  _node: StepGroupNodeLayerModel,
  _setAddClicked: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  e.stopPropagation()
  // node.fireEvent(
  //   {
  //     callback: () => {
  //       setAddClicked(false)
  //     },
  //     target: e.target
  //   },
  //   Event.AddParallelNode
  // )
}

const onMouseOverNode = (e: MouseEvent, _layer: StepGroupNodeLayerModel): void => {
  e.stopPropagation()
  // layer.fireEvent({ target: e.target }, Event.MouseOverNode)
}

const onMouseEnterNode = (e: MouseEvent, _layer: StepGroupNodeLayerModel): void => {
  e.stopPropagation()
  // layer.fireEvent({ target: e.target }, Event.MouseEnterNode)
}

const onMouseLeaveNode = (e: MouseEvent, _layer: StepGroupNodeLayerModel): void => {
  e.stopPropagation()
  // layer.fireEvent({ target: e.target }, Event.MouseLeaveNode)
}

export const StepGroupNode = (props: any): JSX.Element => {
  const allowAdd = props.allowAdd

  const layerRef = React.useRef<HTMLDivElement>(null)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [addClicked, setAddClicked] = React.useState(false)
  // const [hover, setHover] = React.useState(false)
  //   React.useEffect(() => {
  //     const nodeLayer = layerRef.current

  //     const onMouseOver = (e: MouseEvent): void => {
  //       if (!addClicked) {
  //         setVisibilityOfAdd(true)
  //       }
  //       onMouseOverNode(e, props.layer)
  //     }

  //     const onMouseEnter = (e: MouseEvent): void => {
  //       onMouseEnterNode(e, props.layer)
  //     }

  //     const onMouseLeave = (e: MouseEvent): void => {
  //       if (!addClicked) {
  //         setVisibilityOfAdd(false)
  //       }
  //       onMouseLeaveNode(e, props.layer)
  //     }

  //     if (nodeLayer && allowAdd) {
  //       nodeLayer.addEventListener('mouseenter', onMouseEnter)
  //       nodeLayer.addEventListener('mouseover', onMouseOver)
  //       nodeLayer.addEventListener('mouseleave', onMouseLeave)
  //     }
  //     return () => {
  //       if (nodeLayer && allowAdd) {
  //         nodeLayer.removeEventListener('mouseenter', onMouseEnter)
  //         nodeLayer.removeEventListener('mouseover', onMouseOver)
  //         nodeLayer.removeEventListener('mouseleave', onMouseLeave)
  //       }
  //     }
  //   }, [layerRef, allowAdd, addClicked])

  React.useEffect(() => {
    if (!addClicked) {
      setVisibilityOfAdd(false)
    }
  }, [addClicked])

  return (
    <>
      <div
        // id={props.identifier}
        className={classnames(css.stepGroup, css.firstnode)}
        ref={layerRef}
        onDragOver={event => {
          if (allowAdd) {
            setVisibilityOfAdd(true)
            event.preventDefault()
          }
        }}
        onDragLeave={() => {
          if (allowAdd) {
            setVisibilityOfAdd(false)
          }
        }}
        onDrop={event => {
          event.stopPropagation()
          const dropData: { id: string; identifier: string } = JSON.parse(
            event.dataTransfer.getData(DiagramDrag.NodeDrag)
          )
          props.fireEvent(Event.DropLinkEvent, { node: dropData })
        }}
      >
        <div id={props?.identifier} className={css.horizontalBar}></div>
        <div id={`left-${props?.identifier}`} className={css.svgLeftJointPoint}></div>
        <div id={`right-${props?.identifier}`} className={css.svgRightJointPoint}></div>
        <div className={css.stepGroupHeader}>
          <Layout.Horizontal
            spacing="xsmall"
            onMouseOver={e => {
              e.stopPropagation()
              //setHover(true)
            }}
            onMouseOut={e => {
              e.stopPropagation()
              //setHover(false)
            }}
          >
            <Icon
              className={css.collapseIcon}
              name="minus"
              onClick={e => {
                e.stopPropagation()
                // props.layer.fireEvent({}, Event.StepGroupCollapsed)
              }}
            />
            <Text lineClamp={1}>{props.name}</Text>
          </Layout.Horizontal>
        </div>
        <div className={css.stepGroupBody}>
          <StepGroupGraph
            identifier={props?.identifier}
            prevNodeIdentifier={props?.prevNodeIdentifier}
            data={props?.data?.stepGroup?.steps}
            fireEvent={props?.fireEvent}
            getNode={props?.getNode}
            updateSVGLinks={props.updateSVGLinks}
          />
        </div>
      </div>
    </>
  )
}
