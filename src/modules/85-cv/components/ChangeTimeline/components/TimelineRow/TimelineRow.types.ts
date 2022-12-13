/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { PointMarkerOptionsObject } from 'highcharts'

export interface TimelineData {
  endTime: number
  icon: {
    height: number
    width: number
    fillColor?: string
    url: string
  }
  tooltip?: {
    message: string
    sideBorderColor: string
  }
  startTime: number
}

export interface TimelineDataPoint extends TimelineData {
  leftOffset: number
}
export interface TimelineRowProps {
  labelWidth?: number
  data: TimelineData[]
  labelName: string
  leftOffset?: number
  startTimestamp?: number
  endTimestamp?: number
  isLoading?: boolean
  hideTimeline?: boolean
}

export interface PointMarkerOptionsObjectCustom extends PointMarkerOptionsObject {
  custom: {
    count?: number
    startTime: number
    endTime: number
    color: string
    toolTipLabel: string
  }
}
