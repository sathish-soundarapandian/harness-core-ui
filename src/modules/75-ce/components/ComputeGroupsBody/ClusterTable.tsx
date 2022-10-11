/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react'
import type { CellProps, Column } from 'react-table'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  Icon,
  Layout,
  Popover,
  TableV2,
  Text
} from '@harness/uicore'
import { get } from 'lodash-es'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { TableCell } from '@ce/components/COGatewayConfig/steps/ManageResources/common'
import formatCost from '@ce/utils/formatCost'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetClustersList } from 'services/lw'
import css from './ComputeGroupsBody.module.scss'

const NameIdCell = (tableProps: CellProps<any>) => {
  // TODO: correct type here
  return (
    <Container style={{ width: '80%' }}>
      <Text lineClamp={1}>{tableProps.row.original.name}</Text>
      <Text lineClamp={1}>{tableProps.row.original.id}</Text>
    </Container>
  )
}

const ValueWithBreakdown = (tableProps: CellProps<any>) => {
  const { getString } = useStrings()
  const data = tableProps.row.original
  const nodes = data.nodes.total
  return (
    <Popover
      position={Position.RIGHT_TOP}
      interactionKind={PopoverInteractionKind.HOVER}
      className={Classes.DARK}
      content={
        <Container className={css.tableValuePopover}>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text font={{ variation: FontVariation.LEAD }}>{getString('ce.computeGroups.totalNodes')}</Text>
            <Text>{nodes}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.nodeRecommendation.onDemand')}</Text>
            <Text>{data.nodes['on_demand']}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.nodeRecommendation.spot')}</Text>
            <Text>{data.nodes.spot}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.fallback')}</Text>
            <Text>{data.nodes.fallback}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.commitments')}</Text>
            <Text>{data.nodes.committed}</Text>
          </Layout.Horizontal>
        </Container>
      }
    >
      <Text font={{ variation: FontVariation.LEAD }} rightIcon="pie-chart" rightIconProps={{ color: Color.PRIMARY_4 }}>
        {nodes}
      </Text>
    </Popover>
  )
}

const CPUValueWithBreakdown = (tableProps: CellProps<any>) => {
  const { getString } = useStrings()
  const data = tableProps.row.original
  return (
    <Popover
      position={Position.RIGHT_TOP}
      interactionKind={PopoverInteractionKind.HOVER}
      className={Classes.DARK}
      content={
        <Container className={css.tableValuePopover}>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text font={{ variation: FontVariation.LEAD }}>{getString('delegate.totalCpu')}</Text>
            <Text>{data.cpu.total}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.utilized')}</Text>
            <Text>{get(data, 'cpu.utilized', 0).toFixed(2)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.idle')}</Text>
            <Text>{get(data, 'cpu.idle', 0).toFixed(2)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.businessMapping.tableHeadings.unallocated')}</Text>
            <Text>{get(data, 'cpu.un_allocated', 0).toFixed(2)}</Text>
          </Layout.Horizontal>
        </Container>
      }
    >
      <Text font={{ variation: FontVariation.LEAD }} rightIcon="pie-chart" rightIconProps={{ color: Color.PRIMARY_4 }}>
        {data.cpu.total}
      </Text>
    </Popover>
  )
}

const MemoryValueWithBreakdown = (tableProps: CellProps<any>) => {
  const { getString } = useStrings()
  const data = tableProps.row.original
  return (
    <Popover
      position={Position.RIGHT_TOP}
      interactionKind={PopoverInteractionKind.HOVER}
      className={Classes.DARK}
      content={
        <Container className={css.tableValuePopover}>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text font={{ variation: FontVariation.LEAD }}>{getString('delegate.totalCpu')}</Text>
            <Text>{get(data, 'memory.total', 0).toFixed(2)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.utilized')}</Text>
            <Text>{get(data, 'memory.utilized', 0).toFixed(2)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.idle')}</Text>
            <Text>{get(data, 'memory.idle', 0).toFixed(2)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.businessMapping.tableHeadings.unallocated')}</Text>
            <Text>{get(data, 'memory.un_allocated', 0).toFixed(2)}</Text>
          </Layout.Horizontal>
        </Container>
      }
    >
      <Text font={{ variation: FontVariation.LEAD }} rightIcon="pie-chart" rightIconProps={{ color: Color.PRIMARY_4 }}>
        {data.cpu.total}
      </Text>
    </Popover>
  )
}

const StatusCell = (tableProps: CellProps<any>) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const history = useHistory()
  if (tableProps.value === true) {
    return (
      <Container className={css.enableCell}>
        <Text font={{ variation: FontVariation.LEAD }} iconProps={{ size: 14 }} icon="command-artifact-check">
          {getString('enabledLabel')}
        </Text>
      </Container>
    )
  }
  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      icon="plus"
      text={getString('enable')}
      onClick={e => {
        e.stopPropagation()
        history.push(routes.toComputeGroupsSetup({ accountId }))
      }}
    />
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const RowMenu = () => {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      isOpen={open}
      onInteraction={nextOpenState => {
        setOpen(nextOpenState)
      }}
      // className={Classes.DARK}
      position={Position.BOTTOM_RIGHT}
    >
      <Button
        minimal
        icon="Options"
        iconProps={{ color: Color.PRIMARY_5 }}
        onClick={e => {
          e.stopPropagation()
          setOpen(true)
        }}
        data-testid={`menu-options`}
      />
    </Popover>
  )
}

const ClusterTable: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  const { data, loading } = useGetClustersList({
    account_id: accountId,
    queryParams: { accountIdentifier: accountId }
  })
  const columns: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'id',
        Header: getString('ce.computeGroups.table.headers.name'),
        width: '20%',
        Cell: NameIdCell,
        disableSortBy: true
      },
      {
        accessor: 'region',
        Header: getString('regionLabel'),
        width: '15%',
        Cell: TableCell,
        disableSortBy: true
      },
      {
        accessor: 'nodes',
        Header: getString('ce.nodeRecommendation.nodeCount'),
        width: '12%',
        Cell: ValueWithBreakdown,
        disableSortBy: true
      },
      {
        accessor: 'cpu',
        Header: getString('ce.common.cpu'),
        width: '12%',
        Cell: CPUValueWithBreakdown,
        disableSortBy: true
      },
      {
        accessor: 'memory',
        Header: getString('ce.computeGroups.table.headers.memory'),
        width: '12%',
        Cell: MemoryValueWithBreakdown,
        disableSortBy: true
      },
      {
        accessor: 'spend',
        Header: getString('ce.computeGroups.clusterSpend'),
        width: '12%',
        Cell: (tableProps: any) => (
          <Text font={{ variation: FontVariation.LEAD }}>
            {formatCost(get(tableProps, 'row.original.cost.spend', 0), { decimalPoints: 2 })}
          </Text>
        ),
        disableSortBy: true
      },
      {
        accessor: 'opt_enabled',
        width: '17%',
        Cell: StatusCell,
        disableSortBy: true
      },
      {
        accessor: 'name',
        width: '5%',
        Cell: RowMenu,
        disableSortBy: true
      }
    ],
    []
  )

  if (loading) {
    return (
      <Layout.Vertical flex padding={{ top: 'large' }}>
        <Icon name="spinner" size={30} />
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical padding={{ top: 'large' }}>
      <TableV2
        columns={columns}
        data={get(data, 'response.clusters', [])}
        onRowClick={({ id, cloud_account_id }) =>
          history.push(routes.toClusterDetailsPage({ accountId, id, cloudId: cloud_account_id }))
        }
      />
    </Layout.Vertical>
  )
}

export default ClusterTable
