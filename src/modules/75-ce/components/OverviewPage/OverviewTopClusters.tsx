/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import { getTimeFilters } from '@ce/utils/perspectiveUtils'
import type { TimeRange } from '@ce/pages/overview/OverviewPage'
import {
  QlceViewAggregateOperation,
  QlceViewEntityStatsDataPoint,
  QlceViewFilterOperator,
  QlceViewFilterWrapperInput,
  QlceViewGroupByInput,
  useFetchperspectiveGridQuery,
  ViewFieldIdentifier
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import { CE_COLOR_CONST } from '../CEChart/CEChartOptions'
import { HorizontalLayout, LEGEND_LIMIT, ListType, Loader, Stats, TableList } from './OverviewPageLayout'
import css from './OverviewPage.module.scss'

interface TopClusterProps {
  timeRange: TimeRange
}

const transformTopCluster = (data: QlceViewEntityStatsDataPoint[] = []): Stats[] => {
  return data.map((d, idx) => {
    return {
      label: d.name as string,
      value: d.cost,
      trend: d.costTrend,
      legendColor: CE_COLOR_CONST[idx % CE_COLOR_CONST.length]
    }
  })
}

const OverviewTopCluster = (props: TopClusterProps) => {
  const { getString } = useStrings()

  const { timeRange } = props
  const [gridResults] = useFetchperspectiveGridQuery({
    variables: {
      aggregateFunction: [{ operationType: QlceViewAggregateOperation.Sum, columnName: 'cost' }],
      filters: [
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        {
          idFilter: {
            field: { fieldId: 'cloudProvider', fieldName: 'Cloud Provider', identifier: ViewFieldIdentifier.Common },
            operator: QlceViewFilterOperator.In,
            values: ['CLUSTER']
          }
        } as QlceViewFilterWrapperInput
      ],
      isClusterOnly: false,
      limit: 10,
      offset: 0,
      groupBy: [
        {
          entityGroupBy: { fieldId: 'clusterName', fieldName: 'Cluster Name', identifier: ViewFieldIdentifier.Cluster }
        } as QlceViewGroupByInput
      ]
    }
  })

  const { data: gridData, fetching: gridFetching } = gridResults
  const data = useMemo(() => (gridData?.perspectiveGrid?.data || []) as QlceViewEntityStatsDataPoint[], [gridData])
  const chartData = useMemo(() => transformTopCluster(data), [data])
  const totalCost = useMemo(() => {
    return chartData.reduce((acc, cur) => acc + cur.value, 0)
  }, [chartData])

  if (gridFetching) {
    return <Loader />
  }

  return (
    <div className={css.topCluster}>
      <HorizontalLayout
        title={getString('ce.overview.cardtitles.topClusters')}
        chartData={chartData}
        showTrendInChart={false}
        totalCost={{
          label: getString('ce.overview.totalCost'),
          value: totalCost,
          trend: 0,
          legendColor: CE_COLOR_CONST[7]
        }}
        sideBar={
          <TableList data={chartData.slice(0, LEGEND_LIMIT)} type={ListType.KEY_VALUE} classNames={css.rowGap8} />
        }
      />
    </div>
  )
}

export default OverviewTopCluster
