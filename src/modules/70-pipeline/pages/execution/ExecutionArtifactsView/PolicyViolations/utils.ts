import { SortMethod } from '@harness/uicore'
import { useQueryParamsOptions } from '@common/hooks/useQueryParams'

export type TableQueryParams = {
  searchTerm?: string
  page?: number
  size?: number
}

export type EnforcementViolationsParamsWithDefaults = RequiredPick<TableQueryParams, 'page' | 'size' | 'searchTerm'>

export const ENFORCEMENT_VIOLATIONS_PAGE_SIZE = 20
export const ENFORCEMENT_VIOLATIONS_PAGE_INDEX = 0
export const ENFORCEMENT_VIOLATIONS_DEFAULT_SORT: SortMethod = SortMethod.Newest

export const useEnforcementViolationsQueryParamOptions = () => {
  return useQueryParamsOptions({
    page: ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
    size: ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
    sort: ENFORCEMENT_VIOLATIONS_DEFAULT_SORT,
    searchTerm: ''
  })
}
