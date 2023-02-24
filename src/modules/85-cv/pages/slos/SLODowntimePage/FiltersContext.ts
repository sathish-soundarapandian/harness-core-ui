/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { createContext } from 'react'
import type { ResponsePageMSDropdownResponse } from 'services/cv'
import type { QueryParamsProps, PathParamsProps } from './SLODowntimePage.types'

interface FiltersContextParams {
  monitoredServicesData: ResponsePageMSDropdownResponse | null
  monitoredServicesLoading: boolean
  monitoredServiceOption: SelectOption
  setMonitoredServiceOption: React.Dispatch<React.SetStateAction<SelectOption>>
  filter: string
  setFilter: React.Dispatch<React.SetStateAction<string>>
  pageNumber: number
  setPageNumber: React.Dispatch<React.SetStateAction<number>>
  hideResetFilterButton: boolean
  queryParams: QueryParamsProps
  pathParams: PathParamsProps
  appliedSearchAndFilter: boolean
}

export const FiltersContext = createContext<FiltersContextParams>({} as FiltersContextParams)
