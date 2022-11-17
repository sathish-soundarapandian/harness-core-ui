/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, TableV2, Text, Layout } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import moment from 'moment'
import type { BusinessMapping } from 'services/ce'
import { useStrings } from 'framework/strings'
import MenuCell from './MenuCell'
import css from './BusinessMappingList.module.scss'

interface BusinessMappingListProps {
  data: BusinessMapping[]
  handleDelete: (id: string, name: string) => void
  onEdit: (data: BusinessMapping) => void
}

const BusinessMappingList: (props: BusinessMappingListProps) => React.ReactElement = ({
  data,
  handleDelete,
  onEdit
}) => {
  const { getString } = useStrings()

  const CostBucketCell: Renderer<CellProps<BusinessMapping>> = cell => {
    return <Text font={{ variation: FontVariation.BODY2 }}>{cell.value?.length || 0}</Text>
  }

  const NameCell: Renderer<CellProps<BusinessMapping>> = cell => {
    return (
      <Layout.Horizontal spacing="small" className={css.nameContainer}>
        <Container className={css.iconBox} />
        <Text font={{ variation: FontVariation.BODY2 }}>{cell.value}</Text>
      </Layout.Horizontal>
    )
  }

  // const UserCell: Renderer<CellProps<BusinessMapping>> = cell => {
  //   return <Text>{cell.value?.name || ''}</Text>
  // }

  const UnallocatedCost: Renderer<CellProps<BusinessMapping>> = cell => {
    const label = cell.value?.label
    const strategy = cell.value?.strategy

    if (strategy === 'HIDE') {
      return <Text font={{ variation: FontVariation.BODY }}>{getString('ce.businessMapping.shownAsHidden')}</Text>
    }
    return (
      <Text font={{ variation: FontVariation.BODY }}>{getString('ce.businessMapping.shownAs', { value: label })}</Text>
    )
  }

  const LastEditCell: Renderer<CellProps<BusinessMapping>> = cell => {
    return <Text font={{ variation: FontVariation.BODY }}>{moment.utc(cell.value).format('D MMM, HH:mm')}</Text>
  }

  const MenuOptionsCell: Renderer<CellProps<BusinessMapping>> = ({ row }) => {
    const bmId = row.original.uuid as string
    const bmName = row.original.name as string
    const bmData = row.original

    const handleEdit: () => void = () => {
      onEdit(bmData)
    }

    const onDelete: () => void = () => {
      handleDelete(bmId, bmName)
    }

    return <MenuCell id={bmId} name={bmName} handleDelete={onDelete} handleEdit={handleEdit} />
  }

  const columns: Column<BusinessMapping>[] = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('name'),
        Cell: NameCell,
        width: '25%'
      },
      {
        accessor: 'costTargets',
        Header: getString('ce.businessMapping.tableHeadings.costBuckets'),
        Cell: CostBucketCell,
        width: '15%'
      },
      {
        accessor: 'sharedCosts',
        Header: getString('ce.businessMapping.tableHeadings.sharedCosts'),
        Cell: CostBucketCell,
        width: '15%'
      },
      {
        accessor: 'unallocatedCost',
        Header: getString('ce.businessMapping.tableHeadings.unallocated'),
        Cell: UnallocatedCost,
        width: '25%'
      },
      // {
      //   accessor: 'createdBy',
      //   Header: getString('ce.businessMapping.tableHeadings.createdBy'),
      //   width: '25%',
      //   Cell: UserCell
      // },
      {
        accessor: 'lastUpdatedAt',
        Header: getString('ce.businessMapping.tableHeadings.lastEdit'),
        Cell: LastEditCell,
        width: '15%'
      },
      {
        Header: ' ',
        width: '5%',
        Cell: MenuOptionsCell
      }
    ],
    []
  )

  return (
    <Container
      margin={{
        top: 'medium'
      }}
    >
      <TableV2<BusinessMapping> columns={columns} data={data} />
    </Container>
  )
}

export default BusinessMappingList
