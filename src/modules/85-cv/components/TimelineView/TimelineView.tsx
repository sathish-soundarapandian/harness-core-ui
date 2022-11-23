/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Container, Text } from '@harness/uicore'
import { Classes } from '@blueprintjs/core'
import { isUndefined } from 'lodash-es'
import moment from 'moment'
import classnames from 'classnames'
import { TimeBasedShadedRegion, TimeBasedShadedRegionProps } from '../TimeBasedShadedRegion/TimeBasedShadedRegion'
import { TimelineBar, TimelineBarProps } from './TimelineBar'
import styles from './TimelineView.module.scss'

interface RowItem {
  startTime: string | number | Date
  endTime?: string | number | Date
  [x: string]: any
}

interface RowConfig {
  name?: string | JSX.Element
  data: Array<RowItem>
  className?: string
}

export interface TimelineViewProps {
  startTime: string | number | Date
  endTime: string | number | Date
  rows: Array<RowConfig>
  minItemsDistance?: number
  renderItem(item: RowItem): JSX.Element
  renderBatch?(items: Array<RowItem>): JSX.Element
  className?: string
  labelsWidth?: number
  loading?: boolean
  hideTimelineBar?: boolean
  rowHeight?: number
  timelineBarProps?: Omit<TimelineBarProps, 'startDate' | 'endDate'>
  shadedRegionProps?: Omit<TimeBasedShadedRegionProps, 'parentRef'>
}

export default function TimelineView({
  startTime,
  endTime,
  rows,
  minItemsDistance,
  renderItem,
  renderBatch,
  className,
  loading,
  labelsWidth = 125,
  hideTimelineBar = false,
  rowHeight = 50,
  timelineBarProps,
  shadedRegionProps
}: TimelineViewProps): JSX.Element {
  const start = moment(startTime)
  const end = moment(endTime)
  const distance = end.diff(start)
  const ref = useRef<HTMLDivElement>(null)
  const timelineRowRef = useRef<HTMLDivElement>(null)
  const [rowWidth, setRowWidth] = useState(0)

  const leftPosition = (itemStartDate: any) => (100 * itemStartDate.diff(start)) / distance
  const rightPosition = (itemEndDate: any) => (100 * end.diff(itemEndDate)) / distance

  const onResize = () => {
    if (ref.current) {
      const rowElem = ref.current.querySelector(`.${styles.rowItems}`)
      if (rowElem) {
        setRowWidth(rowElem.getBoundingClientRect().width)
      }
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const rowsInternal = useMemo(() => {
    return rows.map(row => {
      let data: Array<any> = row.data.map(item => ({
        left: leftPosition(moment(item.startTime)),
        right: rightPosition(moment(item.endTime || item.startTime)),
        item,
        batch: []
      }))
      if (!!minItemsDistance && data.length >= 2) {
        data = calculateInternals(data, rowWidth, minItemsDistance)
      }
      return {
        name: row.name,
        data
      }
    })
  }, [rows, rowWidth])

  const showLabels = rowsInternal.some(row => !isUndefined(row.name))
  return (
    <div className={classnames(styles.timelineView, 'timelineView', className)} ref={ref}>
      {!hideTimelineBar && (
        <TimelineBar
          style={showLabels ? { marginLeft: labelsWidth, marginBottom: 'var(--spacing-small)' } : undefined}
          className={styles.timelineViewBar}
          {...timelineBarProps}
          startDate={startTime}
          endDate={endTime}
        />
      )}
      {rowsInternal.map((row, rowIndex) => (
        <div key={rowIndex} className={classnames(styles.timelineRow, 'timelineRow')} style={{ height: rowHeight }}>
          {showLabels && (
            <Container className={styles.nameWrapper} width={labelsWidth}>
              {typeof row.name === 'string' ? <Text width={labelsWidth}>{row.name}</Text> : row.name}
            </Container>
          )}
          <div
            className={classnames(
              styles.rowItems,
              'rowItems',
              loading ? classnames(styles.loading, Classes.SKELETON) : undefined
            )}
            ref={rowIndex === 0 ? timelineRowRef : undefined}
          >
            {row.data.map((item, itemIndex) => (
              <Container
                key={itemIndex}
                style={{
                  left: `${item.left}%`,
                  right: `${item.right}%`
                }}
                className={styles.rowItem}
              >
                {item.left >= 0 && item.left <= 100 && (
                  <>
                    {item.item && renderItem(item.item)}
                    {!!item.batch.length && renderBatch?.(item.batch)}
                  </>
                )}
              </Container>
            ))}
          </div>
        </div>
      ))}
      {shadedRegionProps && <TimeBasedShadedRegion {...shadedRegionProps} parentRef={timelineRowRef?.current} />}
    </div>
  )
}

function calculateInternals(data: Array<any>, rowWidth: number, minItemsDistance: number) {
  if (rowWidth) {
    data.sort((a, b) => a.left - b.left)
    for (let i = 0, j = 1; j < data.length; ) {
      if (data[i].batch.length) {
        // previous is batch
        const x1 = (rowWidth * data[i].left) / 100
        const x2 = (rowWidth * data[j].left) / 100
        if (x2 - minItemsDistance <= x1) {
          data[i].batch.push(data[j].item)
          data[j].item = undefined
          data[i].right = data[j].right
          j++
        } else {
          i = j
          j++
        }
      } else {
        const x1 = rowWidth * (1 - data[i].right / 100)
        const x2 = (rowWidth * data[j].left) / 100
        if (x2 - minItemsDistance <= x1) {
          data[i].batch = [data[i].item, data[j].item]
          data[i].item = data[j].item = undefined
          data[i].right = data[j].right
          j++
        } else {
          i = j
          j++
        }
      }
    }
    return data.filter(e => e.item || e.batch.length)
  } else {
    return []
  }
}
