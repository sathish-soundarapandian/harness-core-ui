/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ResponsePageEntitySetupUsageDTO,
  ListReferredByEntitiesQueryParams,
  useListAllEntityUsageByFqn
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { UseGetMockData } from '@common/utils/testUtils'
import EntityUsageListingPage from './EntityUsageListingPage'

interface EntityUsageProps {
  entityIdentifier?: string
  entityType: ListReferredByEntitiesQueryParams['referredEntityType']
  mockData?: UseGetMockData<ResponsePageEntitySetupUsageDTO>
  pageSize?: number
  pageHeaderClassName?: string
  pageBodyClassName?: string
  withSearchBarInPageHeader?: boolean
}

const DEFAULT_PAGE_SIZE = 10

interface Params {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  entityIdentifier?: string
}

const getReferredEntityFQN = (params: Params): string => {
  const { accountId, orgIdentifier, projectIdentifier, entityIdentifier } = params
  let referredEntityFQN = `${accountId}/`
  if (orgIdentifier) {
    referredEntityFQN += `${orgIdentifier}/`
  }
  if (projectIdentifier) {
    referredEntityFQN += `${projectIdentifier}/`
  }
  referredEntityFQN += `${entityIdentifier}`

  return referredEntityFQN
}

const EntityUsage: React.FC<EntityUsageProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)
  const {
    entityIdentifier,
    entityType,
    mockData,
    pageSize,
    pageBodyClassName,
    withSearchBarInPageHeader = true,
    pageHeaderClassName
  } = props

  const { data, loading, refetch, error } = useListAllEntityUsageByFqn({
    queryParams: {
      accountIdentifier: accountId,
      referredEntityFQN: getReferredEntityFQN({ accountId, orgIdentifier, projectIdentifier, entityIdentifier }),
      referredEntityType: entityType,
      searchTerm: searchTerm,
      pageIndex: page,
      pageSize: pageSize || DEFAULT_PAGE_SIZE
    },
    debounce: 300,
    mock: mockData
  })

  return (
    <EntityUsageListingPage
      withSearchBarInPageHeader={withSearchBarInPageHeader}
      pageHeaderClassName={pageHeaderClassName}
      pageBodyClassName={pageBodyClassName}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      setPage={setPage}
      apiReturnProps={{
        data,
        loading,
        refetch,
        error
      }}
    />
  )
}

export default EntityUsage
