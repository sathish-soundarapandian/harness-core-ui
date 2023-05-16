/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CSSProperties } from 'react';
import React, { useState, useEffect, useRef, useMemo } from 'react'
import type { DateRange } from 'moment-range';
import { extendMoment } from 'moment-range'
import classnames from 'classnames'
import styles from './TimelineView.module.scss'

const moment = extendMoment(require('moment')) // eslint-disable-line
const DAY_HOUR_MINUTE = 'ddd h:mm A'
const MONTH_DAY_MINUTE = 'MMM D, h:mm A'

export interface TimelineBarProps {
  startDate: string | number | Date
  endDate: string | number | Date
  className?: string
  style?: CSSProperties
  columnWidth?: number
}

const TIME_UNITS = [
  { unit: 'minutes', step: 1, format: 'h:mm:ss A' },
  { unit: 'minutes', step: 2, format: 'h:mm A' },
  { unit: 'minutes', step: 5, format: 'h:mm A' },
  { unit: 'minutes', step: 10, format: 'h:mm A' },
  { unit: 'minutes', step: 15, format: 'h:mm A' },
  { unit: 'minutes', step: 30, format: 'h:mm A' },
  { unit: 'hours', step: 1, format: DAY_HOUR_MINUTE },
  { unit: 'hours', step: 2, format: DAY_HOUR_MINUTE },
  { unit: 'hours', step: 4, format: DAY_HOUR_MINUTE },
  { unit: 'hours', step: 12, format: MONTH_DAY_MINUTE },
  { unit: 'days', step: 1, format: MONTH_DAY_MINUTE },
  { unit: 'days', step: 2, format: MONTH_DAY_MINUTE },
  { unit: 'weeks', step: 1, format: MONTH_DAY_MINUTE },
  { unit: 'months', step: 1, format: 'MMM' },
  { unit: 'months', step: 4, format: 'MMM' },
  { unit: 'years', step: 1, format: 'YYYY' }
]

const HOURS_STARTING_INDEX = TIME_UNITS.findIndex(({ unit }) => unit === 'hours')
const DAYS_STARTING_INDEX = TIME_UNITS.findIndex(({ unit }) => unit === 'days')

/**
 * This method finds the best starting point for certain range.
 * If the range is too wide, the goal is to avoid recreating increments of small units.
 * It's just performance optimization and it would work if starting point was always zero.
 */
const findOptimalStartingIndex = (range: DateRange): number => {
  let start = 0
  if (range.diff('days') > 0) {
    /** Start with hours */
    start = HOURS_STARTING_INDEX
    if (range.diff('days') > 10) {
      /** start with days */
      start = DAYS_STARTING_INDEX
    }
  }
  return start
}

const MIN_COL_SIZE = 70

export function TimelineBar({ startDate, endDate, className, style, columnWidth = MIN_COL_SIZE }: TimelineBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0)

  const onResize = () => {
    if (ref.current) {
      setSize(ref.current.getBoundingClientRect().width)
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const items = useMemo(() => {
    if (size === 0) {
      return []
    }

    const range = moment.range(moment(startDate), moment(endDate))

    for (let i = findOptimalStartingIndex(range); i < TIME_UNITS.length; i++) {
      const timeUnit = TIME_UNITS[i]
      const rangeItems = Array.from(range.by(timeUnit.unit as any, { step: timeUnit.step }))
      const colSize = size / rangeItems.length
      if (colSize >= columnWidth) {
        return rangeItems.map((item: any) => ({
          formattedValue: item.format(timeUnit.format),
          originalValue: item
        }))
      }
    }
    return []
  }, [size, startDate, endDate, columnWidth])

  let lastItemCoeff = 0
  let estimatedLastColumnSize = 0
  if (items.length >= 2) {
    const limit = moment(endDate)
    if (limit.isAfter(items[items.length - 1].originalValue)) {
      const a = items[items.length - 1].originalValue.diff(items[items.length - 2].originalValue)
      const b = limit.diff(items[items.length - 1].originalValue)
      lastItemCoeff = b / a
    }
    if (lastItemCoeff > 0) {
      estimatedLastColumnSize = (size / (items.length - 1 + lastItemCoeff)) * lastItemCoeff
    }
  }

  return (
    <div ref={ref} style={style} className={classnames(styles.timelineBar, className)}>
      {items.map((item, i) => (
        <div
          key={i}
          style={
            i === items.length - 1
              ? {
                  flex: lastItemCoeff,
                  visibility: estimatedLastColumnSize > 55 ? 'visible' : 'hidden'
                }
              : undefined
          }
          className={styles.timelineBarItem}
        >
          {item.formattedValue}
        </div>
      ))}
    </div>
  )
}
