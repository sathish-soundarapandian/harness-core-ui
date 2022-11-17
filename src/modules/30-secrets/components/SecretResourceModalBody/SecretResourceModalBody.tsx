/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useListSecretsV2, SecretDTOV2, SecretTextSpecDTO } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { getStringForType } from '@secrets/utils/SSHAuthUtils'
import { useStrings } from 'framework/strings'
import css from './SecretResourceModalBody.module.scss'

export const RenderColumnSecret: Renderer<CellProps<SecretDTOV2>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical padding={{ left: 'small' }} className={css.secretDetails}>
      <Text color={Color.BLACK} lineClamp={1}>
        {data.name}
      </Text>
      <Text color={Color.GREY_400} lineClamp={1}>
        {data.identifier}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderColumnDetails: Renderer<CellProps<SecretDTOV2>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical className={css.secretDetails}>
      {data.type === 'SecretText' || data.type === 'SecretFile' ? (
        <Text color={Color.BLACK} lineClamp={1} width={230}>
          {(data.spec as SecretTextSpecDTO).secretManagerIdentifier}
        </Text>
      ) : null}
      <Text color={Color.GREY_400}>{getStringForType(data.type)}</Text>
    </Layout.Vertical>
  )
}

const SecretResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { data, loading } = useListSecretsV2({
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
  const secretData = data?.data?.content?.map(secretResponse => secretResponse.secret)

  if (loading) return <PageSpinner />
  return secretData?.length ? (
    <Container>
      <ResourceHandlerTable
        data={secretData}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('secretType'),
            id: 'name',
            accessor: 'name',
            width: '40%',
            Cell: RenderColumnSecret,
            disableSortBy: true
          },
          {
            Header: getString('details'),
            accessor: 'description',
            id: 'details',
            width: '55%',
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

export default SecretResourceModalBody
