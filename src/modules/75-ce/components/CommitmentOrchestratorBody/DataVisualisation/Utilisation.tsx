/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { defaultTo } from 'lodash-es'
import { Container } from '@harness/uicore'
import {
  Column as GridColumn,
  RenderCostCell,
  RenderNameCell,
  RenderPercentageCell
} from '@ce/components/PerspectiveGrid/Columns'
import { getStaticSchedulePeriodTime } from '@ce/utils/momentUtils'
import { CCM_CHART_TYPES } from '@ce/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetCommitmentUtilisation } from 'services/lw-co'
import GridWithChartVisualiser from './GridWithChartVisualiser'
import { getFilterBody, useFilterContext } from '../FilterContext'

export const DEFAULT_COLS: GridColumn[] = [
  {
    Header: 'Name',
    accessor: 'name',
    className: 'name',
    width: 250,
    hideable: false,
    Cell: RenderNameCell
  },
  {
    Header: 'Compute spend',
    accessor: 'compute_spend',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  },
  {
    Header: 'Utilisation',
    accessor: 'utilization',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  },
  {
    Header: 'Utilisation (%)',
    accessor: 'percentage',
    width: 200,
    hideable: false,
    Cell: RenderPercentageCell
  }
]

interface UtilisationGridData {
  compute_spend: number
  utilization: number
  percentage: number
  name: string
}

interface ChartSeriesData {
  name: string
  data: UtilisationGridData[]
  keys: string[]
}

const Utilisation: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { timeRange, ...restFilterOpts } = useFilterContext()
  const [cols] = useState(DEFAULT_COLS)
  const [data, setData] = useState<UtilisationGridData[]>([])
  const [chart, setChart] = useState<ChartSeriesData[]>()

  const { mutate: fetchUtilisation, loading } = useGetCommitmentUtilisation({
    accountId,
    queryParams: {
      accountIdentifier: accountId,
      start_date: timeRange.from,
      end_date: timeRange.to
    }
  })

  useEffect(() => {
    fetchUtilisation(getFilterBody(restFilterOpts)).then((res: Record<string, any>) => {
      const columnsData: UtilisationGridData[] = []
      const chartData: ChartSeriesData[] = []
      Object.entries(res.response).forEach(([key, value]) => {
        columnsData.push({
          name: key,
          ...(value as any).table,
          percentage: (value as any).table.percentage.toFixed(2)
        })
        const colsData = (value as any).chart
          .sort((a: any, b: any) => getStaticSchedulePeriodTime(a.date) - getStaticSchedulePeriodTime(b.date))
          .map((col: any) => [
            getStaticSchedulePeriodTime(col.date),
            Number(defaultTo(col.utilization_percentage, 0).toFixed(2))
          ])
        chartData.push({
          name: key,
          data: colsData,
          keys: ['x', 'y']
        })
      })
      setChart(chartData)
      setData(columnsData)
    })
  }, [timeRange.from, timeRange.to, restFilterOpts.account, restFilterOpts.instanceFamily, restFilterOpts.region])

  return (
    <Container>
      <GridWithChartVisualiser<UtilisationGridData>
        columns={cols as Column<UtilisationGridData>[]}
        data={data}
        chartData={chart}
        chartLoading={loading}
        dataLoading={loading}
        chartType={CCM_CHART_TYPES.SPLINE}
        chartOptions={{
          plotOptions: {
            spline: {
              lineWidth: 4,
              states: {
                hover: {
                  lineWidth: 5
                }
              },
              marker: {
                enabled: false
              }
              // pointInterval: 3600000, // one hour
              // pointStart: Date.UTC(2018, 1, 13, 0, 0, 0)
            }
          },
          yAxis: {
            endOnTick: true,
            min: 0,
            max: null,
            tickAmount: 3,
            title: {
              text: ''
            },
            labels: {
              formatter: function () {
                return `${this.value}%`
              }
            }
          } as Highcharts.YAxisOptions
        }}
      />
    </Container>
  )
}

export default Utilisation
