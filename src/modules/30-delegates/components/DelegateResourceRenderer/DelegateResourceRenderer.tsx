/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { get } from 'lodash-es'
import { Button, TableV2 } from '@wings-software/uicore'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import type { DelegateGroupDetails } from 'services/portal'
import { useGetDelegateGroupsV2 } from 'services/portal'
import { PageSpinner } from '@common/components'

type CellType = { row: { original: DelegateGroupDetails } }

const DelegateResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const queryParams = useMemo(
    () => ({
      accountId: accountIdentifier,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      module
    }),
    [accountIdentifier, orgIdentifier, projectIdentifier]
  )
  const { data, loading } = useGetDelegateGroupsV2({ queryParams })

  const delegateGroupDetails: DelegateGroupDetails[] = get(data, 'resource.delegateGroupDetails', [])

  const filteredDelegateGroupDetails = delegateGroupDetails.filter(group =>
    identifiers.includes(get(group, 'delegateGroupIdentifier', ''))
  )

  return filteredDelegateGroupDetails && !loading ? (
    <TableV2
      columns={[
        {
          Header: '',
          id: 'name',
          accessor: 'groupName',
          width: '95%',
          // eslint-disable-next-line react/display-name
          Cell: (element: CellType) => <div>{element.row.original.groupName}</div>,
          disableSortBy: true
        },
        {
          id: 'removeBtn',
          width: '5%',
          disableSortBy: true,
          // eslint-disable-next-line react/display-name
          Cell: (element: CellType) => {
            return (
              <Button
                icon="trash"
                minimal
                onClick={() => {
                  onResourceSelectionChange(resourceType, false, [
                    get(element, 'row.original.delegateGroupIdentifier', '')
                  ])
                }}
              />
            )
          }
        }
      ]}
      data={filteredDelegateGroupDetails}
      hideHeaders={true}
    />
  ) : (
    <PageSpinner />
  )
}

export default DelegateResourceRenderer
