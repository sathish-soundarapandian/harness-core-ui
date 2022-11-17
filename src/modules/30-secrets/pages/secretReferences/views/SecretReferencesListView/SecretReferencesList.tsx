/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import ReactTimeago from 'react-timeago'
import type { Column, Renderer, CellProps } from 'react-table'
import { Text, Layout, TableV2 } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { EntitySetupUsageDTO, PageEntitySetupUsageDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import ResourceDetailFactory from '@common/factories/ResourceDetailFactory'
import css from './SecretReferencesList.module.scss'

interface SecretsListProps {
  secrets?: PageEntitySetupUsageDTO
  gotoPage: (pageNumber: number) => void
}

const RenderColumnEntity: Renderer<CellProps<EntitySetupUsageDTO>> = ({ row }) => {
  const data = row.original
  const chkReferredByEntityTypeHandler = ResourceDetailFactory.getReferredByEntityTypeHandler(
    data.referredByEntity.type
  )
  if (chkReferredByEntityTypeHandler)
    return chkReferredByEntityTypeHandler.getResourceDetailViewAndAction({ referredByEntity: data.referredByEntity })
  else
    return (
      <Layout.Vertical>
        <Layout.Horizontal>
          <Text color={Color.BLACK}>{data.referredByEntity?.name}</Text>
        </Layout.Horizontal>
        <Text color={Color.GREY_400}>{data.referredByEntity?.type}</Text>
      </Layout.Vertical>
    )
}
const RenderColumnDetail: Renderer<CellProps<EntitySetupUsageDTO>> = ({ row }) => {
  const data = row.original
  const chkReferredEntityDetailHandler = ResourceDetailFactory.getReferredEntityUsageDetailTypeHandler(
    data.detail?.type
  )
  if (chkReferredEntityDetailHandler)
    return chkReferredEntityDetailHandler.getResourceDetailViewAndAction({
      referredEntity: data.referredEntity,
      referredByEntity: data.referredByEntity,
      detail: data.detail
    })
  else return null
}

const RenderColumnActivity: Renderer<CellProps<EntitySetupUsageDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      {data.createdAt ? <ReactTimeago date={data.createdAt} /> : null}
    </Layout.Horizontal>
  )
}

const SecretReferencesList: React.FC<SecretsListProps> = ({ secrets, gotoPage }) => {
  const data: EntitySetupUsageDTO[] = secrets?.content || []
  const { getString } = useStrings()
  const columns: Column<EntitySetupUsageDTO>[] = useMemo(
    () => [
      {
        Header: getString('entity'),
        accessor: 'referredByEntity',
        width: '33%',
        Cell: RenderColumnEntity
      },
      {
        Header: getString('details'),
        accessor: 'detail',
        width: '33%',
        Cell: RenderColumnDetail
      },
      {
        Header: getString('lastActivity'),
        accessor: 'createdAt',
        width: '34%',
        Cell: RenderColumnActivity
      }
    ],
    [data]
  )

  return (
    <TableV2<EntitySetupUsageDTO>
      className={css.table}
      columns={columns}
      data={data}
      // onRowClick={secret => {
      //   history.push(`${pathname}/${secret.secret?.identifier}`)
      // }}
      pagination={{
        itemCount: secrets?.totalElements || 0,
        pageSize: secrets?.size || 10,
        pageCount: secrets?.totalPages || 0,
        pageIndex: secrets?.pageable?.pageNumber || 0,
        gotoPage
      }}
    />
  )
}

export default SecretReferencesList
