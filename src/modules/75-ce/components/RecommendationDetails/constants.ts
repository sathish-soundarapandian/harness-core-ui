/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TimeRange, NodepoolTimeRange } from '@ce/types'
import { NodepoolTimeRangeType, TimeRangeType } from '@common/types'

export const ViewTimeRange = [
  {
    label: TimeRange.LAST_7,
    value: TimeRangeType.LAST_7
  },
  {
    label: TimeRange.LAST_30,
    value: TimeRangeType.LAST_30
  }
]

export const ViewNodepoolTimeRange = [
  {
    label: NodepoolTimeRange.LAST_DAY,
    value: NodepoolTimeRangeType.LAST_DAY
  },
  {
    label: NodepoolTimeRange.LAST_7,
    value: NodepoolTimeRangeType.LAST_7
  },
  {
    label: NodepoolTimeRange.LAST_30,
    value: NodepoolTimeRangeType.LAST_30
  }
]

export enum RecommendationType {
  CostOptimized = 'Cost Optimized',
  PerformanceOptimized = 'Performance Optimized',
  Custom = 'Custom'
}

export enum ChartColors {
  'BLUE' = '#25a6f7',
  'GREEN' = '#38d168',
  'GREY' = '#c4c4c4',
  'GREEN_300' = '#d7f4e0'
}

export enum PercentileValues {
  P50 = 50,
  P90 = 90,
  P95 = 95
}
