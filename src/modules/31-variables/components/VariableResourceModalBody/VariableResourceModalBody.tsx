/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import type { Column } from 'react-table'
import { Container, Layout, Text, Icon } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useGetVariablesList, VariableResponseDTO } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'

import { useStrings } from 'framework/strings'
import { VariableListColumnHeader } from '@variables/pages/variables/views/VariableListView'

type ParsedColumnContent = VariableResponseDTO & { identifier: string }
const VariableResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const [page, setPage] = useState(0)
  const { getString } = useStrings()

  const { data: variableResponse, loading } = useGetVariablesList({
    queryParams: {
      accountIdentifier,
      searchTerm,
      pageIndex: page,
      pageSize: 10,
      orgIdentifier,
      projectIdentifier
    },
    debounce: 300
  })

  const variableList = variableResponse?.data?.content?.map(dataContent => ({
    identifier: dataContent.variable.identifier,
    ...dataContent
  }))

  const columns: Column<ParsedColumnContent>[] = useMemo(
    () => VariableListColumnHeader(getString) as Column<ParsedColumnContent>[],
    []
  )
  if (loading) {
    return <PageSpinner />
  }
  return variableList?.length ? (
    <Container>
      <ResourceHandlerTable
        data={variableList as ParsedColumnContent[]}
        selectedData={selectedData}
        columns={columns}
        pagination={{
          itemCount: variableResponse?.data?.totalItems || 0,
          pageSize: variableResponse?.data?.pageSize || 10,
          pageCount: variableResponse?.data?.totalPages || -1,
          pageIndex: variableResponse?.data?.pageIndex || 0,
          gotoPage: /* istanbul ignore next */ pageNumber => setPage(pageNumber)
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

export default VariableResourceModalBody
