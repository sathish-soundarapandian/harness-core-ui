/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import moment from 'moment'
import { Container, Layout, Text } from '@wings-software/uicore'
import type { TimeRange } from '@ce/pages/overview/OverviewPage'
import { CCM_CHART_TYPES } from '@ce/constants'
import { getTimeFilters } from '@ce/utils/perspectiveUtils'
import {
  QlceViewAggregateOperation,
  QlceViewGroupByInput,
  TimeSeriesDataPoints,
  useFetchOverviewTimeSeriesQuery
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import { getGMTEndDateTime, getGMTStartDateTime } from '@ce/utils/momentUtils'
import { ChartConfigType, transformTimeSeriesData } from '../CloudCostInsightChart/chartUtils'
import CEChart from '../CEChart/CEChart'
import { ChartTypes, Loader } from './OverviewPageLayout'
import css from './OverviewPage.module.scss'

interface CostByProvidersProps {
  timeRange: TimeRange
  clusterDataPresent: boolean
}

const OverviewCostByProviders = (props: CostByProvidersProps) => {
  const { getString } = useStrings()
  const [chartObj, setChartObj] = useState<Highcharts.Chart | null>(null)
  const { timeRange, clusterDataPresent } = props
  const [chartType, setChartType] = useState(CCM_CHART_TYPES.COLUMN)

  const [result] = useFetchOverviewTimeSeriesQuery({
    variables: {
      aggregateFunction: [{ operationType: QlceViewAggregateOperation.Sum, columnName: 'cost' }],
      filters: [...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to))],
      groupBy: [{ timeTruncGroupBy: { resolution: 'DAY' } } as QlceViewGroupByInput]
    }
  })

  const { data, fetching } = result
  const dataPoints = data?.overviewTimeSeriesStats?.data
  const chartListData = useMemo(() => {
    const points = (dataPoints as TimeSeriesDataPoints[]) || null
    const transformedPoints = points && transformTimeSeriesData(points, [])
    return [transformedPoints]
  }, [dataPoints])

  if (fetching) {
    return <Loader />
  }

  return (
    <div className={css.costByProviders}>
      <Layout.Vertical spacing="medium">
        <Text
          color="grey800"
          font={{ weight: 'semi-bold', size: 'medium' }}
          tooltipProps={{ dataTooltipId: 'overviewCostByProvider' }}
        >
          {getString('ce.overview.cardtitles.costByProviders')}
        </Text>
        <Layout.Horizontal style={{ justifyContent: 'space-between' }} spacing="medium">
          <Legends chartRef={chartObj as unknown as Highcharts.Chart} />
          <ChartTypes chartType={chartType} setChartType={setChartType} />
        </Layout.Horizontal>
        <Container>
          {chartListData.map((chart, idx: number) => {
            const options = getColumnChartConfig({
              data: chart,
              chartType,
              chartHeight: !clusterDataPresent ? 380 : 400,
              setChartObj
            })
            return chart ? <CEChart key={idx} options={options as any} /> : null
          })}
        </Container>
      </Layout.Vertical>
    </div>
  )
}

const Legends = ({ chartRef }: { chartRef: Highcharts.Chart }) => {
  if (!chartRef) {
    return null
  }

  return (
    <Container className={css.legendContainer}>
      {chartRef.series?.map(chart => {
        const chartColor: string = (chart as any).color
        return (
          <Layout.Horizontal key={chart.userOptions.name} spacing="small" style={{ alignItems: 'center' }}>
            <div
              className={css.colorBoxContainer}
              style={{
                backgroundColor: chartColor
              }}
            />
            <Text font="small" lineClamp={1}>
              {chart.userOptions.name}
            </Text>
          </Layout.Horizontal>
        )
      })}
    </Container>
  )
}

interface ColumnChartConfig {
  data: ChartConfigType[]
  chartType: CCM_CHART_TYPES
  chartHeight: number
  setChartObj: (value: React.SetStateAction<Highcharts.Chart | null>) => void
}

function getColumnChartConfig({ data, chartType, chartHeight, setChartObj }: ColumnChartConfig) {
  return {
    chart: {
      type: chartType,
      height: chartHeight,
      events: {
        load() {
          setChartObj(this as any)
        }
      }
    },
    xAxis: {
      gridLineColor: '#fff',
      type: 'datetime',
      ordinal: true,
      min: null,
      lineWidth: 0,
      // tickInterval: 24 * 3600 * 1000,
      labels: {
        formatter: function () {
          return moment(this.value).utc().format('MMM DD')
        }
      }
    } as Highcharts.XAxisOptions,
    yAxis: {
      gridLineColor: '#fff',
      type: 'logarithmic',
      tickInterval: 1,
      title: {
        text: ''
      },
      labels: {
        formatter: function () {
          return `$${this.value}`
        }
      }
    } as Highcharts.YAxisOptions,
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>${point.y:.1f}</b></td></tr>',
      footerFormat: '</table>',
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        borderRadius: 2
      },
      legend: {
        enabled: true,
        align: 'top',
        verticalAlign: 'middle',
        layout: 'vertical'
      },
      area: {
        fillOpacity: 0.1,
        marker: {
          enabled: false
        }
      }
    },
    series: data,
    colors: ['#0278d5', '#3dc7f6']
  }
}

export default OverviewCostByProviders
