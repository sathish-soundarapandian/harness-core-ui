/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import type { CellProps } from 'react-table'
import { defaultTo } from 'lodash-es'

import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { EnvironmentGroupResponseDTO, useGetEnvironmentGroupList } from 'services/cd-ng'

import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'

import { PageSpinner } from '@common/components'
import { useMutateAsGet } from '@common/hooks'

function RenderEnvironmentGroup({ row }: CellProps<EnvironmentGroupResponseDTO>) {
  const rowdata = row.original
  const { name, identifier, description } = rowdata

  return (
    <Layout.Vertical spacing="small" data-testid={identifier}>
      <Text color={Color.GREY_800} iconProps={{ size: 16 }}>
        {name}
      </Text>
      {description && <Text color={Color.GREY_400}>{description}</Text>}
    </Layout.Vertical>
  )
}

function EnvironmentGroupsResourceModal({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}: RbacResourceModalProps): React.ReactElement {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const { getString } = useStrings()
  const [page, setPage] = useState(0)

  const { data, loading } = useMutateAsGet(useGetEnvironmentGroupList, {
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      size: 10,
      page,
      searchTerm
    },
    body: {
      filterType: 'EnvironmentGroup'
    }
  })

  const response = data?.data
  const hasContent = Boolean(!loading && response?.empty === false)
  const environmentGroupsData = useMemo(() => response?.content?.map(item => ({ ...item.envGroup })), [response])

  return loading ? (
    <PageSpinner />
  ) : hasContent ? (
    <Container>
      <ResourceHandlerTable
        data={defaultTo(environmentGroupsData as ResourceHandlerTableData[], [])}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('common.environmentGroup.label'),
            id: 'name',
            Cell: RenderEnvironmentGroup,
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: defaultTo(response?.totalItems, 0),
          pageSize: defaultTo(response?.pageSize, 10),
          pageCount: defaultTo(response?.totalPages, -1),
          pageIndex: defaultTo(response?.pageIndex, 0),
          gotoPage: setPage
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

export default EnvironmentGroupsResourceModal
