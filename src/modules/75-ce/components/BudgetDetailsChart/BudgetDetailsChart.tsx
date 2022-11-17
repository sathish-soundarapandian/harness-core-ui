/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SeriesColumnOptions, SeriesLineOptions } from 'highcharts/highcharts'
import { Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { CCM_CHART_TYPES } from '@ce/constants'
import type { BudgetData, BudgetCostData, BudgetPeriod } from 'services/ce/services'
import CEChart from '../CEChart/CEChart'
import { computeCategories } from './budgetCategoryUtil'

const getChartSeriesData: (
  chartData: BudgetCostData[],
  forecastedCost: number,
  chartLabels: Record<string, string>
) => (SeriesColumnOptions | SeriesLineOptions)[] = (
  chartData: BudgetCostData[],
  forecastedCost: number,
  chartLabels
) => {
  const columnChartData = chartData.map(item => [item.actualCost])
  const lineChartData = chartData.map(item => [item.budgeted])

  const lastChartEntry = chartData[chartData.length - 1] as any

  const lastMonthBudget = chartData.map((_, idx) => {
    if (idx === chartData.length - 1) {
      return [forecastedCost]
    }
    return 0
  })

  const lastMonthActual = chartData.map((_, idx) => {
    if (idx === chartData.length - 1) {
      return [lastChartEntry.actualCost]
    }
    return 0
  })

  const lastMonthBudgetChartSeries: SeriesColumnOptions = {
    name: chartLabels.FORECAST_COST,
    type: CCM_CHART_TYPES.COLUMN,
    data: lastMonthBudget,
    color: 'var(--teal-50)'
  }
  const lastMonthActualChartSeries: SeriesColumnOptions = {
    name: chartLabels.CURRENT_MONTH_COST,
    type: CCM_CHART_TYPES.COLUMN,
    data: lastMonthActual,
    color: 'var(--teal-400)'
  }

  // remove last element because its handeled in lastMonthChartData
  columnChartData.pop()
  const columnChartSeries: SeriesColumnOptions = {
    name: chartLabels.ACTUAL_COST,
    type: CCM_CHART_TYPES.COLUMN,
    data: columnChartData,
    color: 'var(--primary-8)'
  }

  const lineChartSeries: SeriesLineOptions = {
    name: chartLabels.BUDGETED_COST,
    type: CCM_CHART_TYPES.LINE,
    data: lineChartData,
    color: 'var(--yellow-900)'
  }

  return [lastMonthBudgetChartSeries, lastMonthActualChartSeries, columnChartSeries, lineChartSeries]
}

interface BudgetDetailsChartProps {
  chartData: BudgetData
  budgetPeriod: BudgetPeriod
}

const BudgetDetailsChart: (props: BudgetDetailsChartProps) => JSX.Element | null = ({ chartData, budgetPeriod }) => {
  const { getString } = useStrings()

  if (!chartData?.costData?.length) {
    return null
  }

  const chartLabels: Record<string, string> = {
    ACTUAL_COST: getString('ce.budgets.detailsPage.chartNames.actualCost'),
    BUDGETED_COST: getString('ce.budgets.detailsPage.chartNames.budgetedCost'),
    FORECAST_COST: getString('ce.budgets.detailsPage.chartNames.forecastCost'),
    CURRENT_MONTH_COST: getString('ce.budgets.detailsPage.chartNames.currentMonthCost')
  }

  const filteredData = chartData.costData.filter(e => e?.time) as BudgetCostData[]

  const chartSeriesData = getChartSeriesData(filteredData, chartData.forecastCost, chartLabels)

  return (
    <Container>
      <CEChart
        options={{
          series: chartSeriesData,
          plotOptions: {
            column: {
              borderColor: undefined,
              groupPadding: 0.2,
              grouping: false
            }
          },
          yAxis: {
            tickAmount: 3,
            title: {
              text: ''
            },
            labels: {
              step: 2,
              formatter: function () {
                return `$ ${this['value']}`
              }
            }
          },
          xAxis: {
            categories: computeCategories(filteredData, budgetPeriod),
            ordinal: true,
            labels: {
              formatter: function () {
                return `${this.value}`
              }
            }
          },
          legend: {
            align: 'right',
            layout: 'horizontal'
          }
        }}
      />
    </Container>
  )
}

export default BudgetDetailsChart
