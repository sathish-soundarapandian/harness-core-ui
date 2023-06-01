import { SortMethod } from '@harness/uicore'

export type TableQueryParams = {
  searchTerm?: string
  page?: number
  size?: number
}

export type EnforcementViolationsParamsWithDefaults = RequiredPick<TableQueryParams, 'page' | 'size' | 'searchTerm'>

export const ENFORCEMENT_VIOLATIONS_PAGE_SIZE = 20
export const ENFORCEMENT_VIOLATIONS_PAGE_INDEX = 0
export const ENFORCEMENT_VIOLATIONS_DEFAULT_SORT: SortMethod = SortMethod.Newest
