/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import { useListSecretsV2 } from 'services/cd-ng'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { PageSpinner } from '@common/components'
import { RenderColumnDetails, RenderColumnSecret } from '../SecretResourceModalBody/SecretResourceModalBody'

const SecretResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const { data, loading } = useListSecretsV2({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      identifiers
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    debounce: 300
  })

  const secretData = useMemo(() => data?.data?.content?.map(secretResponse => secretResponse.secret), [data?.data])

  return secretData && !loading ? (
    <StaticResourceRenderer
      data={secretData}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={[
        {
          Header: '',
          id: 'name',
          accessor: 'name',
          width: '40%',
          Cell: RenderColumnSecret,
          disableSortBy: true
        },
        {
          Header: '',
          accessor: 'description',
          id: 'details',
          width: '55%',
          Cell: RenderColumnDetails,
          disableSortBy: true
        }
      ]}
    />
  ) : (
    <PageSpinner />
  )
}

export default SecretResourceRenderer
