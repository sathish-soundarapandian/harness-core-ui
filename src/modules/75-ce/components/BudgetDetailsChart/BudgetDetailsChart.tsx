import React from 'react'
import Highcharts, { SeriesColumnOptions, SeriesLineOptions } from 'highcharts/highcharts'
import { Container } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { CCM_CHART_TYPES } from '@ce/constants'
import type { BudgetData, BudgetCostData } from 'services/ce/services'
import CEChart from '../CEChart/CEChart'

const getChartSeriesData: (
  chartData: BudgetCostData[],
  forecastedCost: number,
  chartLabels: Record<string, string>
) => (SeriesColumnOptions | SeriesLineOptions)[] = (
  chartData: BudgetCostData[],
  forecastedCost: number,
  chartLabels
) => {
  const columnChartData = chartData.map(item => [item.time, item.actualCost])
  const lineChartData = chartData.map(item => [item.time, item.budgeted])

  const lastChartEntry = chartData.find(el => el.time === columnChartData[columnChartData.length - 1][0]) as any

  const lastMonthBudget = [lastChartEntry.time, forecastedCost]
  const lastMonthActual = [lastChartEntry.time, lastChartEntry.actualCost]

  const lastMonthBudgetChartSeries: SeriesColumnOptions = {
    name: chartLabels.FORECAST_COST,
    type: CCM_CHART_TYPES.COLUMN,
    data: [lastMonthBudget],
    color: 'var(--teal-50)'
  }
  const lastMonthActualChartSeries: SeriesColumnOptions = {
    name: chartLabels.CURRENT_MONTH_COST,
    type: CCM_CHART_TYPES.COLUMN,
    data: [lastMonthActual],
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
}

const BudgetDetailsChart: (props: BudgetDetailsChartProps) => JSX.Element | null = ({ chartData }) => {
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
            type: 'datetime',
            ordinal: true,
            labels: {
              formatter: function () {
                return Highcharts.dateFormat('%b %Y', Number(this.value))
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
