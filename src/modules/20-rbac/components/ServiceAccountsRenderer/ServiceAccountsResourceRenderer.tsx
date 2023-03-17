/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { getErrorInfoFromErrorObject } from '@harness/uicore'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { PageSpinner, useToaster } from '@common/components'
import { RenderColumnDetails } from '@rbac/components/ServiceAccountsRenderer/ServiceAccountsResourceModalBody'
import { useListAggregatedServiceAccounts } from 'services/cd-ng'
import type { ServiceAccountColumn } from './ServiceAccountsResourceModalBody'

const ServiceAccountsResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

  const { data, loading, error } = useListAggregatedServiceAccounts({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      identifiers: identifiers
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })
  const serviceAccounts = data?.data?.content?.map(serviceAccount => ({
    ...serviceAccount.serviceAccount
  }))

  const { showError } = useToaster()

  useEffect(() => {
    if (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }, [error])

  if (loading) return <PageSpinner />
  return serviceAccounts?.length ? (
    <StaticResourceRenderer<ServiceAccountColumn>
      data={serviceAccounts}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={[
        {
          Header: '',
          id: 'name',
          accessor: row => row.name,
          width: '95%',
          Cell: RenderColumnDetails,
          disableSortBy: true
        }
      ]}
    />
  ) : null
}

export default ServiceAccountsResourceRenderer
