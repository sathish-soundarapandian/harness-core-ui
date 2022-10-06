/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import type { Column as TableColumn } from 'react-table'
import { Container } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import {
  Column,
  getFixedDecimalData,
  RenderCostCell,
  RenderNameCell,
  RenderPercentageCell,
  RenderTextCell
} from '@ce/components/PerspectiveGrid/Columns'
import { getStaticSchedulePeriodTime } from '@ce/utils/momentUtils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFetchComputeCoverage } from 'services/lw-co'
import GridWithChartVisualiser from './GridWithChartVisualiser'
import { getFilterBody, useFilterContext } from '../FilterContext'

export const COMMITMENT_TYPE_COLS: Column[] = [
  {
    Header: 'Name',
    accessor: 'name',
    className: 'name',
    width: 250,
    hideable: false,
    Cell: RenderNameCell
  },
  {
    Header: 'Total cost',
    accessor: 'total_cost',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  }
]

export const INSTANCE_FAMILY_COLS: Column[] = [
  {
    Header: 'Instance Family',
    accessor: 'name',
    className: 'name',
    width: 250,
    hideable: false,
    Cell: RenderNameCell
  },
  {
    Header: 'Machine Type',
    accessor: 'total',
    width: 200,
    hideable: false,
    Cell: RenderTextCell
  },
  {
    Header: 'Coverage',
    accessor: 'coverage',
    width: 200,
    hideable: false,
    Cell: RenderPercentageCell
  },
  {
    Header: 'RI Coverage (hrs)',
    accessor: 'ri_coverage_hours',
    width: 200,
    hideable: false,
    Cell: RenderTextCell
  },
  {
    Header: 'On demand (hrs)',
    accessor: 'on_demand_hours',
    width: 200,
    hideable: false,
    Cell: RenderTextCell
  },
  {
    Header: 'Total running (hrs)',
    accessor: 'total_hours',
    width: 200,
    hideable: false,
    Cell: RenderTextCell
  },
  {
    Header: 'On Demand Cost',
    accessor: 'on_demand_cost',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  }
]

export const REGIONS_COLS: Column[] = [
  {
    Header: 'Region',
    accessor: 'name',
    className: 'name',
    width: 200,
    hideable: false,
    sticky: 'left',
    Cell: RenderNameCell
  },
  {
    Header: 'Coverage',
    accessor: 'coverage',
    width: 200,
    hideable: false,
    Cell: RenderPercentageCell
  },
  {
    Header: 'RI Coverage (hrs)',
    accessor: 'ri_coverage_hours',
    width: 200,
    hideable: false,
    Cell: RenderTextCell
  },
  {
    Header: 'On demand (hrs)',
    accessor: 'on_demand_hours',
    width: 200,
    hideable: false,
    Cell: RenderTextCell
  },
  {
    Header: 'Total running (hrs)',
    accessor: 'total_hours',
    width: 200,
    hideable: false,
    Cell: RenderTextCell
  },
  {
    Header: 'Total Cost',
    accessor: 'total_cost',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  },
  {
    Header: 'On Demand Cost',
    accessor: 'on_demand_cost',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  },
  {
    Header: 'Reservation Cost',
    accessor: 'reservation_cost',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  }
]

interface SavingsData extends Record<string, number | string> {
  name: string
}

interface ChartSeriesData {
  name: string
  data: SavingsData[]
  keys: string[]
}

enum GROUP_BY {
  COMMITMENT_TYPE = 'Commitment Type',
  INSTANCE_FAMILY = 'Instance Family',
  REGIONS = 'Regions'
}

const groupByColsMap = {
  [GROUP_BY.COMMITMENT_TYPE]: COMMITMENT_TYPE_COLS,
  [GROUP_BY.INSTANCE_FAMILY]: INSTANCE_FAMILY_COLS,
  [GROUP_BY.REGIONS]: REGIONS_COLS
}

const ComputeCoverage: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { timeRange, ...restFilterOpts } = useFilterContext()
  const [data, setData] = useState<SavingsData[]>([])
  const [groupBy, setGroupBy] = useState<GROUP_BY>(GROUP_BY.COMMITMENT_TYPE)
  const [cols, setCols] = useState(groupByColsMap[groupBy])
  const [chart, setChart] = useState<ChartSeriesData[]>()
  // const [loading, setLoading] = useState(true)

  const { mutate: fetchComputeCoverage, loading } = useFetchComputeCoverage({
    accountId,
    queryParams: {
      accountIdentifier: accountId,
      start_date: timeRange.from,
      end_date: timeRange.to
    }
  })

  useEffect(() => {
    fetchComputeCoverage(getFilterBody(restFilterOpts, groupBy)).then((res: Record<string, any>) => {
      const columnsData: SavingsData[] = []
      const chartData: ChartSeriesData[] = []
      Object.entries(res.response).forEach(([key, value]) => {
        columnsData.push({
          name: key,
          ...getFixedDecimalData((value as any).table)
        })
        const colsData = (value as any).chart
          .sort((a: any, b: any) => getStaticSchedulePeriodTime(a.date) - getStaticSchedulePeriodTime(b.date))
          .map((col: any) => [getStaticSchedulePeriodTime(col.date), Number(col.coverage_cost.toFixed(2))])
        chartData.push({
          name: key,
          data: colsData,
          keys: ['x', 'y']
        })
      })
      setChart(chartData)
      setData(columnsData)
    })
  }, [
    groupBy,
    timeRange.from,
    timeRange.to,
    restFilterOpts.region,
    restFilterOpts.instanceFamily,
    restFilterOpts.account
  ])

  return (
    <Container>
      <GridWithChartVisualiser
        columns={cols as TableColumn<SavingsData>[]}
        data={data}
        chartData={chart}
        chartLoading={loading}
        dataLoading={loading}
        groupByProps={{
          options: [GROUP_BY.COMMITMENT_TYPE, GROUP_BY.INSTANCE_FAMILY, GROUP_BY.REGIONS],
          selectedOption: groupBy,
          onOptionClick: option => {
            setGroupBy(option as GROUP_BY)
            setCols(groupByColsMap[option as GROUP_BY])
          }
        }}
      />
    </Container>
  )
}

export default ComputeCoverage
