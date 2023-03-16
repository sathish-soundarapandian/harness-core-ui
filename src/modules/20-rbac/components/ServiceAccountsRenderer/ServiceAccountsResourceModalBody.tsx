/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Layout, Text, Icon, useToaster, getErrorInfoFromErrorObject } from '@harness/uicore'
import { Color } from '@harness/design-system'

import type { CellProps, Renderer } from 'react-table'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import { ServiceAccountDTO, useListAggregatedServiceAccounts } from 'services/cd-ng'

export type ServiceAccountColumn = ServiceAccountDTO
export const RenderColumnDetails: Renderer<CellProps<ServiceAccountColumn>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Layout.Vertical spacing="xsmall" padding={{ left: 'small', right: 'small' }} width={'100%'}>
        <Text color={Color.BLACK} lineClamp={1}>
          {data.name}
        </Text>
        <Text color={Color.GREY_600} lineClamp={1} font="small">
          {getString('idLabel', { id: data.identifier })}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
const ServiceAccountsResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { data, loading, error } = useListAggregatedServiceAccounts({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      searchTerm,
      accountIdentifier,
      pageIndex: page,
      pageSize: 10
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
    <Container>
      <ResourceHandlerTable<ServiceAccountColumn>
        data={serviceAccounts}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('rbac.serviceAccounts.label'),
            id: 'name',
            accessor: row => row.name,
            width: '95%',
            Cell: RenderColumnDetails,
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: data?.data?.totalItems || 0,
          pageSize: data?.data?.pageSize || 10,
          pageCount: data?.data?.totalPages || -1,
          pageIndex: data?.data?.pageIndex || 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default ServiceAccountsResourceModalBody
