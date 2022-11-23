/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  QlceViewAggregateOperation,
  QlceViewEntityStatsDataPoint,
  QlceViewFieldInputInput,
  QlceViewFilterOperator,
  QlceViewFilterWrapperInput,
  QlceViewGroupByInput,
  useFetchperspectiveGridQuery,
  ViewFieldIdentifier
} from 'services/ce/services'
import { getGMTEndDateTime, getGMTStartDateTime } from '@ce/utils/momentUtils'
import type { TimeRange } from '@ce/pages/overview/OverviewPage'
import routes from '@common/RouteDefinitions'
import { getTimeFilters } from '@ce/utils/perspectiveUtils'
import { CE_COLOR_CONST } from '../CEChart/CEChartOptions'
import {
  FlexList,
  HorizontalLayout,
  LEGEND_LIMIT,
  ListType,
  Loader,
  Stats,
  TableList,
  VerticalLayout
} from './OverviewPageLayout'
import css from './OverviewPage.module.scss'

export enum OverviewLayout {
  'HORIZONTAL',
  'VERTICAL'
}

interface CloudCostProps {
  timeRange: TimeRange
  providers: Record<string, string | null>
  layout: OverviewLayout
}

const cloudProviderMap: Record<string, Omit<QlceViewFieldInputInput, 'identifierName'>> = {
  defaultAzurePerspectiveId: {
    fieldId: 'azureServiceName',
    fieldName: 'Service Name',
    identifier: ViewFieldIdentifier.Azure
  },
  defaultAwsPerspectiveId: {
    fieldId: 'awsUsageAccountId',
    fieldName: 'Account',
    identifier: ViewFieldIdentifier.Aws
  },
  defaultGcpPerspectiveId: {
    fieldId: 'gcpProjectId',
    fieldName: 'Project',
    identifier: ViewFieldIdentifier.Gcp
  }
}

const getFiltersForCloudCost = (provider?: string) => {
  if (!provider) {
    return {
      idFilter: {
        field: { fieldId: 'cloudProvider', fieldName: 'Cloud Provider', identifier: ViewFieldIdentifier.Common },
        operator: QlceViewFilterOperator.NotIn,
        values: ['CLUSTER']
      }
    }
  }

  return {
    idFilter: {
      field: { fieldId: 'cloudProvider', fieldName: 'Cloud Provider', identifier: ViewFieldIdentifier.Common },
      operator: QlceViewFilterOperator.In,
      values: [cloudProviderMap[provider].identifier]
    }
  }
}

const getGroupByForCloudCost = (provider?: string) => {
  if (!provider) {
    return {
      entityGroupBy: {
        fieldId: 'cloudProvider',
        fieldName: 'Cloud Provider',
        identifier: ViewFieldIdentifier.Common,
        identifierName: ViewFieldIdentifier.Common
      }
    } as QlceViewGroupByInput
  }

  const { fieldId, fieldName, identifier } = cloudProviderMap[provider]
  return {
    entityGroupBy: {
      fieldId,
      fieldName,
      identifier
    }
  } as QlceViewGroupByInput
}

const map: Record<string, string> = {
  AZURE: 'defaultAzurePerspectiveId',
  AWS: 'defaultAwsPerspectiveId',
  GCP: 'defaultGcpPerspectiveId'
}

const transformCloudCost = (
  data: QlceViewEntityStatsDataPoint[] = [],
  providers: Record<string, string | null>
): Stats[] => {
  return data.map((d, idx) => {
    return {
      label: d.name as string,
      value: d.cost,
      trend: d.costTrend,
      legendColor: CE_COLOR_CONST[idx % CE_COLOR_CONST.length],
      linkId: providers[map[d.name as string]]
    }
  })
}

const OverviewCloudCost = (props: CloudCostProps) => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()
  const { timeRange, providers, layout } = props
  const availableProviders = Object.keys(providers).filter(ap => providers[ap])

  const providerToTitle: Record<string, string> = useMemo(
    () => ({
      defaultAzurePerspectiveId: getString('ce.overview.cardtitles.azure'),
      defaultAwsPerspectiveId: getString('ce.overview.cardtitles.aws'),
      defaultGcpPerspectiveId: getString('ce.overview.cardtitles.gcp')
    }),
    []
  )

  let title = getString('ce.overview.cardtitles.multipleCloud')
  let filters = getFiltersForCloudCost()
  let groupBy = getGroupByForCloudCost()
  let seeAll = undefined

  // Make a drill down query
  if (availableProviders.length === 1) {
    const provider = availableProviders[0]
    title = providerToTitle[provider]
    filters = getFiltersForCloudCost(provider)
    groupBy = getGroupByForCloudCost(provider)
    seeAll = (
      <Link
        to={routes.toPerspectiveDetails({
          accountId: accountId,
          perspectiveId: providers[provider]!,
          perspectiveName: providers[provider]!
        })}
      >
        <Text inline color="primary7">
          {getString('ce.overview.seeAll')}
        </Text>
      </Link>
    )
  }

  const [gridResults] = useFetchperspectiveGridQuery({
    variables: {
      aggregateFunction: [{ operationType: QlceViewAggregateOperation.Sum, columnName: 'cost' }],
      filters: [
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        filters as QlceViewFilterWrapperInput
      ],
      isClusterOnly: false,
      limit: 10,
      offset: 0,
      groupBy: [groupBy]
    }
  })

  const { data: gridData, fetching: gridFetching } = gridResults
  const data = (gridData?.perspectiveGrid?.data || []) as QlceViewEntityStatsDataPoint[]
  const chartData = useMemo(() => transformCloudCost(data, providers), [data])

  const totalCost = useMemo(() => {
    return chartData.reduce((acc, cur) => acc + cur.value, 0)
  }, [chartData])

  if (gridFetching) {
    return <Loader />
  }

  return (
    <div className={css.cloudCost}>
      {layout === OverviewLayout.VERTICAL ? (
        <VerticalLayout
          title={title}
          seeAll={seeAll}
          chartData={chartData}
          totalCost={{ label: getString('ce.overview.totalCost'), value: totalCost, trend: 0, legendColor: '' }}
          footer={
            <div style={{ overflowX: 'auto' }}>
              <FlexList data={chartData.slice(0, LEGEND_LIMIT)} type={ListType.KEY_ONLY} classNames={css.legendList} />
            </div>
          }
        />
      ) : (
        <HorizontalLayout
          title={title}
          seeAll={seeAll}
          chartData={chartData}
          showTrendInChart={false}
          totalCost={{ label: getString('ce.overview.totalCost'), value: totalCost, trend: 0, legendColor: '' }}
          sideBar={
            <TableList data={chartData.slice(0, LEGEND_LIMIT)} type={ListType.KEY_VALUE} classNames={css.rowGap8} />
          }
        />
      )}
    </div>
  )
}

export default OverviewCloudCost
