/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react'
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
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { TableCell } from '@ce/components/COGatewayConfig/steps/ManageResources/common'
import formatCost from '@ce/utils/formatCost'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './ComputeGroupsBody.module.scss'

interface ClusterRow {
  name: string
  id: string
  region: string
  nodeCount: number
  cpu: number
  memory: number
  spend: number
  managedBy: string[]
  status: string
}

// const clusterData = {
//   name: 'myK8sCluster',
//   id: 'ID',
//   region: 'us-east-1',
//   nodeCount: 7,
//   cpu: 11.82,
//   memory: 6.37,
//   spend: 27.83,
//   managedBy: [],
//   status: 'enabled'
// }

// const data = [clusterData, clusterData, clusterData]

const NameIdCell = (tableProps: CellProps<any>) => {
  return (
    <Container>
      <Text>{tableProps.row.original.name}</Text>
      <Text>{tableProps.row.original.id}</Text>
    </Container>
  )
}

const ValueWithBreakdown = (tableProps: CellProps<any>) => {
  const { getString } = useStrings()
  const data = tableProps.row.original
  const nodes = data.nodes.committed + data.nodes.fallback + data.nodes['on-demand'] + data.nodes.spot
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
            <Text>{data.nodes['on-demand']}</Text>
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
            <Text>{data.cpu.utilized}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.idle')}</Text>
            <Text>{0}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.businessMapping.tableHeadings.unallocated')}</Text>
            <Text>{data.cpu.un_allocated}</Text>
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
            <Text>{data.memory.total}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.utilized')}</Text>
            <Text>{data.memory.utilized}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.computeGroups.idle')}</Text>
            <Text>{0}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing={'xlarge'}>
            <Text>{getString('ce.businessMapping.tableHeadings.unallocated')}</Text>
            <Text>{data.memory.un_allocated}</Text>
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
  const { getString } = useStrings()
  if (tableProps.value === 'enabled') {
    return (
      <Container className={css.enableCell}>
        <Text font={{ variation: FontVariation.LEAD }} iconProps={{ size: 14 }} icon="command-artifact-check">
          {getString('enabledLabel')}
        </Text>
      </Container>
    )
  }
  return <Button variation={ButtonVariation.SECONDARY} icon="plus" text={getString('enable')} />
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
  const [data, setData] = useState<any[]>([]) // TODO: change to correct type
  const [loading, setLoading] = useState(true)
  const columns: Column<ClusterRow>[] = useMemo(
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
        accessor: 'nodeCount',
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
        Header: getString('ce.commitmentOrchestration.computeSpend'),
        width: '12%',
        Cell: tableProps => (
          <Text font={{ variation: FontVariation.LEAD }}>
            {formatCost(tableProps.row.original.spend, { decimalPoints: 2 })}
          </Text>
        ),
        disableSortBy: true
      },
      {
        accessor: 'status',
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

  useEffect(() => {
    setData([
      {
        account_id: 'accID',
        cloud_account_id: 'cloudAccID',
        cpu: {
          total: 10,
          un_allocated: 4,
          utilized: 6
        },
        create_time: '0001-01-01T00:00:00Z',
        created_at: '0001-01-01T00:00:00Z',
        id: 'cloudAccID',
        memory: {
          total: 10,
          un_allocated: 4,
          utilized: 6
        },
        name: 'shalinlk-dashboard-RnD',
        nodes: {
          committed: 0,
          cpu: {
            total: 10,
            un_allocated: 4,
            utilized: 6
          },
          fallback: 0,
          harness_mgd: 0,
          memory: {
            total: 10,
            un_allocated: 4,
            utilized: 6
          },
          'on-demand': 1,
          spot: 0
        },
        region: 'us-west-2',
        resource_version: 0,
        cluster_orch_id: 'co-asejfh234kasf',
        spend: 27.83,
        status: 'enabled'
      }
    ])
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Layout.Vertical flex>
        <Icon name="spinner" size={30} />
      </Layout.Vertical>
    )
  }

  return (
    <Container margin={{ top: 'huge' }}>
      <TableV2
        columns={columns}
        data={data}
        onRowClick={({ id }) => history.push(routes.toClusterDetailsPage({ accountId, id }))}
      />
    </Container>
  )
}

export default ClusterTable
