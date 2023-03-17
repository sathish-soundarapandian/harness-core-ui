/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { ApplicationFilterActions, ApplicationFilters } from './types'

function processQueryParams(data: any): ApplicationFilters {
  return {
    page: Math.max(parseInt(defaultTo(data.page, '1'), 10) - 1, 0),
    size: parseInt(defaultTo(data.size, '10'), 10),
    search: defaultTo(data.search, ''),
    agents: defaultTo(data.agents, []),
    healthStatus: defaultTo(data.healthStatus, []),
    syncStatus: defaultTo(data.syncStatus, []),
    namespaces: defaultTo(data.namespaces, []),
    repo: defaultTo(data.repo, [])
  }
}

export function useApplicationsFilter(): [ApplicationFilters, ApplicationFilterActions] {
  const filters = useQueryParams<ApplicationFilters>({ processQueryParams })
  const { updateQueryParams } = useUpdateQueryParams<Partial<ApplicationFilters>>()

  return [
    filters,
    {
      search: (search: string) => updateQueryParams({ search, page: 1 })
    }
  ]
}
