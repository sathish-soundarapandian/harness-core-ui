import type { QlceViewTimeGroupType, QlceViewFilterInput, QlceViewFieldInputInput } from 'services/ce/services'

export interface TimeRangeFilterType {
  to: string
  from: string
}

export enum TimeRangeType {
  'LAST_7' = 'LAST_7',
  'LAST_30' = 'LAST_30'
}

export enum NodepoolTimeRangeType {
  'LAST_DAY' = 'LAST_DAY',
  'LAST_7' = 'LAST_7',
  'LAST_30' = 'LAST_30'
}

export type setFiltersFn = (newFilters: QlceViewFilterInput[]) => void
export type setAggregationFn = (newAgg: QlceViewTimeGroupType) => void
export type setGroupByFn = (groupBy: QlceViewFieldInputInput) => void
export type setTimeRangeFn = (timeRange: TimeRangeFilterType) => void
