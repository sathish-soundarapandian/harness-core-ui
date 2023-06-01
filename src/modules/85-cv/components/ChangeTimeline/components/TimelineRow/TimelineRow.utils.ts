/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TimelineDataPoint, TimelineData } from './TimelineRow.types'

export function getDataWithPositions(
  containerWidth: number,
  startOfTimestamps?: number,
  endOfTimestamps?: number,
  data?: TimelineData[]
): TimelineDataPoint[] {
  if (!data?.length || !startOfTimestamps || !endOfTimestamps) {
    return []
  }

  data.forEach((item, index) => {
    const preChartStartTime = startOfTimestamps > item.startTime && endOfTimestamps < item.endTime
    if (preChartStartTime) {
      data[index].startTime = startOfTimestamps
    }
  })

  const timelineDataPoints: TimelineDataPoint[] = []
  for (const datum of data) {
    const { startTime, endTime, icon, tooltip, type, identifiers } = datum || {}

    if (startTime && endTime) {
      timelineDataPoints.push({
        endTime,
        startTime,
        icon,
        tooltip,
        type,
        identifiers,
        leftOffset: containerWidth * (1 - (endOfTimestamps - startTime) / (endOfTimestamps - startOfTimestamps))
      })
    }
  }

  return timelineDataPoints
}

export function isWidgetWithSameStartTime(
  dataGroupedWithStartTime: { [key: string]: TimelineDataPoint[] },
  currentStartTime: string,
  startTimestamp?: number,
  endTimestamp?: number
): boolean {
  return (
    dataGroupedWithStartTime[currentStartTime]?.length >= 1 &&
    Number(currentStartTime) > Number(startTimestamp) &&
    Number(currentStartTime) <= Number(endTimestamp)
  )
}

export function isWidgetWithUniqStartTime(
  dataGroupedWithStartTime: { [key: string]: TimelineDataPoint[] },
  currentStartTime: string,
  startTimestamp?: number,
  endTimestamp?: number
): boolean {
  return (
    dataGroupedWithStartTime[currentStartTime]?.length === 1 &&
    Number(currentStartTime) >= Number(startTimestamp) &&
    Number(currentStartTime) <= Number(endTimestamp)
  )
}

export function getInitialPositionOfWidget(
  position: number,
  height = 16,
  width = 16
): { left: number; height: number; width: number } {
  return {
    left: position,
    height,
    width
  }
}

export function getWidgetsGroupedWithStartTime(dataWithPositions: TimelineDataPoint[]): {
  [key: string]: TimelineDataPoint[]
} {
  const widgetsGroupedWithStartTime: { [key: string]: TimelineDataPoint[] } = {}
  for (const el of dataWithPositions) {
    if (el?.startTime in widgetsGroupedWithStartTime) {
      widgetsGroupedWithStartTime[el?.startTime?.toString()] = [...widgetsGroupedWithStartTime[el?.startTime], el]
    } else {
      widgetsGroupedWithStartTime[el?.startTime?.toString()] = [el]
    }
  }
  return widgetsGroupedWithStartTime
}
