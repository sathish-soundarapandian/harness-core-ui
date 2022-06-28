import React, { useMemo } from 'react'
import { Color, Container, Table, Text, CodeBlock, Icon } from '@harness/uicore'
import formatCost from '@ce/utils/formatCost'

const BigQueryTable = ({ gridData }) => {
  const QueryCell = ({ cell }) => {
    return <Text lineClamp={1}>{cell.value}</Text>
  }

  const CostCell = ({ cell }) => {
    return <Text>{formatCost(cell.value)}</Text>
  }
  const columns = useMemo(
    () => [
      { Header: 'UserId', accessor: 'userID', width: '20%' },
      { Header: 'Query', accessor: 'query', width: '50%', Cell: QueryCell },
      { Header: 'Runtime', accessor: 'runtime', width: '15%' },
      { Header: 'Cost', accessor: 'cost', width: '15%', Cell: CostCell }
    ],
    []
  )
  const tableData = gridData?.data
  if (!tableData) {
    return <Icon name="spinner" />
  }
  return (
    <Container background={Color.WHITE}>
      <Table columns={columns} bpTableProps={{ condensed: true, striped: true }} data={tableData} />
    </Container>
  )
}

export default BigQueryTable
