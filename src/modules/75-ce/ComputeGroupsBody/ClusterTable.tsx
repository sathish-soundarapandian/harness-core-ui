/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react'
import type { CellProps, Column } from 'react-table'
import { useHistory, useParams } from 'react-router'
import { Button, Color, Container, Popover, TableV2, Text } from '@harness/uicore'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { TableCell } from '@ce/components/COGatewayConfig/steps/ManageResources/common'
import formatCost from '@ce/utils/formatCost'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

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

const clusterData = {
  name: 'myK8sCluster',
  id: 'ID',
  region: 'us-east-1',
  nodeCount: 7,
  cpu: 11.82,
  memory: 6.37,
  spend: 27.83,
  managedBy: [],
  status: 'enabled'
}

const data = [clusterData, clusterData, clusterData]

const NameIdCell = (tableProps: CellProps<ClusterRow>) => {
  return (
    <Container>
      <Text>{tableProps.row.original.name}</Text>
      <Text>{tableProps.row.original.id}</Text>
    </Container>
  )
}

const ValueWithBreakdown = (tableProps: CellProps<ClusterRow>) => {
  return (
    <Popover position={Position.RIGHT} interactionKind={PopoverInteractionKind.HOVER}>
      <Text>{tableProps.value}</Text>
    </Popover>
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
        data-testid={`menu-${data}`}
      />
    </Popover>
  )
}

const ClusterTable: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  const columns: Column<ClusterRow>[] = useMemo(
    () => [
      {
        accessor: 'id',
        Header: getString('ce.computeGroups.table.headers.name'),
        width: '15%',
        Cell: NameIdCell,
        disableSortBy: true
      },
      {
        accessor: 'region',
        Header: getString('regionLabel'),
        width: '10%',
        Cell: TableCell,
        disableSortBy: true
      },
      {
        accessor: 'nodeCount',
        Header: getString('ce.nodeRecommendation.nodeCount'),
        width: '10%',
        Cell: ValueWithBreakdown,
        disableSortBy: true
      },
      {
        accessor: 'cpu',
        Header: getString('ce.common.cpu'),
        width: '10%',
        Cell: ValueWithBreakdown,
        disableSortBy: true
      },
      {
        accessor: 'memory',
        Header: getString('ce.computeGroups.table.headers.memory'),
        width: '10%',
        Cell: ValueWithBreakdown,
        disableSortBy: true
      },
      {
        accessor: 'spend',
        Header: getString('ce.commitmentOrchestration.computeSpend'),
        width: '10%',
        Cell: tableProps => <Text>{formatCost(tableProps.row.original.spend, { decimalPoints: 2 })}</Text>,
        disableSortBy: true
      },
      {
        accessor: 'managedBy',
        Header: getString('ce.computeGroups.table.headers.managedBy'),
        width: '15%',
        Cell: ValueWithBreakdown,
        disableSortBy: true
      },
      {
        accessor: 'status',
        width: '15%',
        Cell: ValueWithBreakdown,
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
  return (
    <Container>
      <TableV2
        columns={columns}
        data={data}
        onRowClick={({ id }) => history.push(routes.toClusterDetailsPage({ accountId, id }))}
      />
    </Container>
  )
}

export default ClusterTable
