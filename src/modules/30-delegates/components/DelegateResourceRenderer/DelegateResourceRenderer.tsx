import React, { useMemo } from 'react'
import get from 'lodash-es/get'
import { Button } from '@wings-software/uicore'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import type { DelegateGroupDetails } from 'services/portal'
import { useGetDelegateGroupsV2 } from 'services/portal'
import Table from '@common/components/Table/Table'
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
    identifiers.includes(get(group, 'groupId', ''))
  )

  return filteredDelegateGroupDetails && !loading ? (
    <Table
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
                  onResourceSelectionChange(resourceType, false, [get(element, 'row.original.groupId', '')])
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
