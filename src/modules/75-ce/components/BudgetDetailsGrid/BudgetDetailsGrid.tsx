/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text } from '@harness/uicore'
import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import moment from 'moment'
import type { CellProps, Renderer } from 'react-table'
import type { BudgetData, BudgetCostData, BudgetPeriod } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import Grid from '@ce/components/PerspectiveGrid/Grid'
import formatCost from '@ce/utils/formatCost'
import { getTimeRangeExpression } from '../BudgetDetailsChart/budgetCategoryUtil'

interface BudgetDetailsGridProps {
  gridData: BudgetData
  budgetPeriod: BudgetPeriod
}

const BudgetDetailsGrid: (props: BudgetDetailsGridProps) => JSX.Element | null = ({ gridData, budgetPeriod }) => {
  const { getString } = useStrings()

  if (!gridData) {
    return null
  }

  /* istanbul ignore next */
  const costData = gridData.costData || []

  const CostCell: Renderer<CellProps<BudgetCostData>> = ({ cell }) => {
    return <Text font={{ variation: FontVariation.BODY }}>{formatCost(cell.value)}</Text>
  }

  const BudgetVarianceCell: Renderer<CellProps<BudgetCostData>> = ({ cell }) => {
    return (
      <Text
        rightIcon={cell.value > 0 ? 'caret-up' : 'caret-down'}
        rightIconProps={{
          color: cell.value > 0 ? Color.RED_600 : Color.GREEN_600
        }}
        font={{ variation: FontVariation.BODY }}
        color={cell.value > 0 ? Color.RED_600 : Color.GREEN_600}
      >
        {formatCost(cell.value)}
      </Text>
    )
  }

  const BudgetVariancePercentageCell: Renderer<CellProps<BudgetCostData>> = ({ cell }) => {
    return (
      <Text
        rightIcon={cell.value > 0 ? 'caret-up' : 'caret-down'}
        rightIconProps={{
          color: cell.value > 0 ? Color.RED_600 : Color.GREEN_600
        }}
        font={{ variation: FontVariation.BODY }}
        color={cell.value > 0 ? Color.RED_600 : Color.GREEN_600}
      >
        {`${cell.value}%`}
      </Text>
    )
  }

  const TimeCell: Renderer<CellProps<BudgetCostData>> = ({ cell }) => {
    const rowData = cell.row.original
    const startTime = moment.utc(rowData.time)
    const endTime = moment.utc(rowData.endTime)
    const rangeText = getTimeRangeExpression(budgetPeriod, startTime, endTime)
    return <Text font={{ variation: FontVariation.BODY }}>{rangeText}</Text>
  }

  /* istanbul ignore next */
  const formattedData = costData.filter(e => e?.time).sort((a, b) => b?.time - a?.time) as BudgetCostData[]

  return (
    <Container>
      <Grid<BudgetCostData>
        columns={[
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.budgetPeriod'),
            accessor: 'time',
            Cell: TimeCell
          },
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.actualCost'),
            accessor: 'actualCost',
            Cell: CostCell
          },
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.budgetCost'),
            accessor: 'budgeted',
            Cell: CostCell
          },
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.budgetVariance'),
            accessor: 'budgetVariance',
            Cell: BudgetVarianceCell
          },
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.budgetVariancePercentage'),
            accessor: 'budgetVariancePercentage',
            Cell: BudgetVariancePercentageCell
          }
        ]}
        data={formattedData}
      />
    </Container>
  )
}

export default BudgetDetailsGrid
