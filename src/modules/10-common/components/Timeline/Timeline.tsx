/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text } from '@harness/uicore'
import css from './Timeline.module.scss'
export interface TimelineNode {
  label: string
  id: string
  childItems?: TimelineNode[]
}
export interface TimelineProps {
  nodes: TimelineNode[]
  onNodeClick: (itemId: string) => void
}
const Timeline = (props: TimelineProps): JSX.Element => {
  const { nodes, onNodeClick } = props
  const [activeId, setActiveId] = React.useState(props.nodes?.[0]?.id || '')
  const onItemClick = (data: any) => {
    const itemId = data.currentTarget.dataset.id
    setActiveId(itemId)
    onNodeClick(itemId)
  }

  return (
    <div className={cx(css.timeline, 'timeline-sidebar-main')}>
      <ul>
        {nodes.map(({ label, id, childItems }, index) => {
          let moreItems: JSX.Element[] = []
          if (childItems) {
            moreItems = childItems.map(({ label: childLabel, id: childId }, childIndex) => (
              <li
                data-id={childId}
                className={cx(css.timelineItem, { [css.active]: activeId === childId }, css.childItem)}
                onClick={onItemClick}
                id={`timeline--${childId}`}
                key={`timeline-item-${childIndex}-${childLabel}`}
              >
                <Text font={{ size: 'small', weight: 'semi-bold' }} lineClamp={1}>
                  {childLabel}
                </Text>
              </li>
            ))
          }
          return [
            <li
              data-id={id}
              className={cx(css.timelineItem, { [css.active]: activeId === id })}
              onClick={onItemClick}
              id={`timeline--${id}`}
              key={`timeline-item-${index}`}
            >
              <Text font={{ size: 'small', weight: 'semi-bold' }} lineClamp={1}>
                {label}
              </Text>
            </li>,
            ...moreItems
          ]
        })}
      </ul>
    </div>
  )
}
const TimeLineWrapper = (props: TimelineProps): JSX.Element => {
  const [sidebarVisible, setSidebarVisible] = React.useState(true)
  return (
    <div className={cx(css.timelineSidebar, { [css.hidden]: !sidebarVisible })}>
      <Timeline {...props} />
      <div className={css.sidebarToggle} onClick={() => setSidebarVisible(!sidebarVisible)}>
        <span className={css.sidebarToggleContent}>{sidebarVisible ? '<' : '>'}</span>
      </div>
    </div>
  )
}
export default TimeLineWrapper
