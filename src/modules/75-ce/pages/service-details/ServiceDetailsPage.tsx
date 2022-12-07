/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Container, Text, FlexExpander, Layout, HarnessDocTooltip } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { noop } from 'lodash-es'
import cx from 'classnames'
import {
  useFetchServiceTimeSeriesQuery,
  useFetchServiceGridQuery,
  useFetchServiceSummaryQuery,
  QlceViewFilterOperator,
  ViewFieldIdentifier,
  QlceViewFilterWrapperInput,
  QlceViewTimeGroupType,
  ClusterData,
  K8sRecommendationFilterDtoInput
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { getViewFilterForId, getTimeFilters, getTimeRangeFilter, GROUP_BY_TASK_ID } from '@ce/utils/perspectiveUtils'
import CloudCostInsightChart from '@ce/components/CloudCostInsightChart/CloudCostInsightChart'
import { CCM_CHART_TYPES } from '@ce/constants'
import TimeRangePicker from '@common/components/TimeRangePicker/TimeRangePicker'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import {
  CE_DATE_FORMAT_INTERNAL,
  DATE_RANGE_SHORTCUTS,
  DEFAULT_TIME_RANGE,
  getGMTEndDateTime,
  getGMTStartDateTime
} from '@common/utils/momentUtils'
import { CCM_PAGE_TYPE, TimeRangeFilterType } from '@ce/types'
import PerspectiveGrid from '@ce/components/PerspectiveGrid/PerspectiveGrid'
import { Page } from '@common/exports'
import WorkloadSummary from '@ce/components/WorkloadSummary/WorkloadSummary'
import EmptyView from '@ce/images/empty-state.svg'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { Aggregation, AggregationFunctionMapping } from '@ce/pages/workload-details/constants'

import css from '@ce/pages/workload-details/WorkloadDetailsPage.module.scss'

const ServiceDetailsPage: () => JSX.Element = () => {
  const { clusterName, serviceName, perspectiveId, perspectiveName, recommendation, accountId, recommendationName } =
    useParams<{
      clusterName: string
      serviceName: string
      perspectiveId: string
      perspectiveName: string
      recommendation: string
      accountId: string
      recommendationName: string
    }>()
  const { getString } = useStrings()

  const breadcrumbs = useMemo(
    () =>
      recommendation
        ? [
            {
              url: routes.toCERecommendations({ accountId }),
              label: getString('ce.recommendation.sideNavText')
            },
            {
              url: routes.toCEECSRecommendationDetails({ accountId, recommendation, recommendationName }),
              label: serviceName
            }
          ]
        : [
            {
              url: routes.toCEPerspectives({ accountId }),
              label: getString('ce.perspectives.sideNavText')
            },
            {
              url: routes.toPerspectiveDetails({ accountId, perspectiveId, perspectiveName }),
              label: perspectiveName
            }
          ],
    []
  )

  const [timeRange, setTimeRange] = useQueryParamsState<TimeRangeFilterType>('timeRange', DEFAULT_TIME_RANGE)
  const [chartDataAggregation, setChartDataAggregation] = useState<Aggregation>(Aggregation.TimeWeighted)

  useDocumentTitle([getString('ce.serviceDetails.title'), serviceName])

  const isDateRangeInLast7Days = useMemo(() => {
    const last7DaysRange = DATE_RANGE_SHORTCUTS['LAST_7_DAYS']
    return (
      getGMTStartDateTime(timeRange.from) >= getGMTStartDateTime(last7DaysRange[0].format(CE_DATE_FORMAT_INTERNAL)) &&
      getGMTEndDateTime(timeRange.to) <= getGMTEndDateTime(last7DaysRange[1].format(CE_DATE_FORMAT_INTERNAL))
    )
  }, [timeRange])

  const filters = useMemo(() => {
    const commonFilters = [
      ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
      {
        idFilter: {
          values: [clusterName],
          operator: QlceViewFilterOperator.In,
          field: {
            fieldId: 'clusterName',
            fieldName: 'Cluster Name',
            identifierName: ViewFieldIdentifier.Cluster,
            identifier: ViewFieldIdentifier.Cluster
          }
        }
      },
      {
        idFilter: {
          values: [serviceName],
          operator: QlceViewFilterOperator.In,
          field: {
            fieldId: 'cloudservicename',
            fieldName: 'Service Name',
            identifierName: ViewFieldIdentifier.Cluster,
            identifier: ViewFieldIdentifier.Cluster
          }
        }
      }
    ] as QlceViewFilterWrapperInput[]
    if (perspectiveId) {
      return [getViewFilterForId(perspectiveId), ...commonFilters]
    }
    return commonFilters
  }, [timeRange.to, timeRange.from, perspectiveId, serviceName, clusterName])

  const isClusterQuery = !perspectiveId

  const [gridResult] = useFetchServiceGridQuery({
    variables: {
      filters: filters,
      isClusterQuery
    }
  })

  const [chartResult] = useFetchServiceTimeSeriesQuery({
    variables: {
      filters: filters,
      groupBy: [
        getTimeRangeFilter(isDateRangeInLast7Days ? QlceViewTimeGroupType.Hour : QlceViewTimeGroupType.Day),
        {
          entityGroupBy: {
            fieldId: 'cloudservicename',
            fieldName: 'Service Name',
            identifier: ViewFieldIdentifier.Cluster
          }
        } as any,
        {
          entityGroupBy: { fieldId: 'clusterName', fieldName: 'Cluster Name', identifier: ViewFieldIdentifier.Cluster }
        } as any
      ],
      isClusterQuery,
      aggregateFunction: AggregationFunctionMapping[chartDataAggregation]
    }
  })

  const [summaryResult] = useFetchServiceSummaryQuery({
    variables: {
      isClusterQuery,
      filters: filters
    }
  })

  const recommendationsFilters = useMemo(
    () =>
      ({
        clusterNames: [clusterName],
        names: [serviceName]
      } as K8sRecommendationFilterDtoInput),
    [clusterName, serviceName]
  )

  const { data: gridData, fetching: gridFetching } = gridResult
  const { data: chartData, fetching: chartFetching } = chartResult
  const { data: summaryData, fetching: summaryFetching } = summaryResult

  const isChartGridEmpty =
    chartData?.perspectiveTimeSeriesStats?.cpuRequest?.length === 0 &&
    gridData?.perspectiveGrid?.data?.length === 0 &&
    !chartFetching &&
    !gridFetching

  const infoData = summaryData?.perspectiveGrid?.data?.length
    ? (summaryData.perspectiveGrid.data[0]?.clusterData as ClusterData)
    : ({} as ClusterData)

  return (
    <>
      <Page.Header title={serviceName} breadcrumbs={<NGBreadcrumbs links={breadcrumbs} />} />
      <Page.Body className={css.pageCtn}>
        <Container flex background={Color.WHITE} padding="small">
          <FlexExpander />
          <TimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
        </Container>
        <Container padding="large">
          <WorkloadSummary
            pageType={CCM_PAGE_TYPE.Service}
            summaryData={summaryData?.perspectiveTrendStats as any}
            fetching={summaryFetching}
            infoData={infoData}
            showRecommendations={!recommendation}
            recommendationFilters={recommendationsFilters}
          />
        </Container>
        {!isChartGridEmpty && (
          <Container background={Color.WHITE}>
            <Container padding="large">
              <Container margin={{ bottom: 'medium' }}>
                <Layout.Horizontal spacing="small">
                  <Text className={css.aggregationText} padding="xsmall" font="small">
                    {getString('ce.perspectives.workloadDetails.aggregation.text')}
                  </Text>
                  <div
                    className={cx(css.aggregationTags, {
                      [css.active]: chartDataAggregation === Aggregation.TimeWeighted
                    })}
                    onClick={
                      /* istanbul ignore next */ () => {
                        setChartDataAggregation(Aggregation.TimeWeighted)
                      }
                    }
                  >
                    <span data-tooltip-id="workloadRecommendationTimeWeighted">
                      {getString('ce.perspectives.workloadDetails.aggregation.timeWeighted')}
                    </span>
                    <HarnessDocTooltip tooltipId="workloadRecommendationTimeWeighted" useStandAlone={true} />
                  </div>
                  <div
                    className={cx(css.aggregationTags, {
                      [css.active]: chartDataAggregation === Aggregation.Absolute
                    })}
                    onClick={() => {
                      setChartDataAggregation(Aggregation.Absolute)
                    }}
                  >
                    <span data-tooltip-id="workloadRecommendationAbsolute">
                      {getString('ce.perspectives.workloadDetails.aggregation.absolute')}
                    </span>
                    <HarnessDocTooltip tooltipId="workloadRecommendationAbsolute" useStandAlone={true} />
                  </div>
                </Layout.Horizontal>
              </Container>
              <CloudCostInsightChart
                showLegends={false}
                pageType={CCM_PAGE_TYPE.Workload}
                chartType={CCM_CHART_TYPES.LINE}
                columnSequence={[]}
                fetching={chartFetching}
                data={chartData?.perspectiveTimeSeriesStats as any}
                aggregation={isDateRangeInLast7Days ? QlceViewTimeGroupType.Hour : QlceViewTimeGroupType.Day}
                xAxisPointCount={DAYS_FOR_TICK_INTERVAL + 1}
              />
            </Container>
            <Container>
              <PerspectiveGrid
                isClusterOnly={true}
                gridData={gridData?.perspectiveGrid?.data as any}
                gridFetching={gridFetching}
                columnSequence={[]}
                setColumnSequence={noop}
                groupBy={GROUP_BY_TASK_ID}
              />
            </Container>
          </Container>
        )}
        {isChartGridEmpty && (
          <Container className={css.emptyContainer} background={Color.WHITE}>
            <img src={EmptyView} />
            <Text
              margin={{
                top: 'large',
                bottom: 'xsmall'
              }}
              font="small"
              style={{
                fontWeight: 600
              }}
              color={Color.GREY_500}
            >
              {getString('ce.pageErrorMsg.noDataMsg')}
            </Text>
            <Text font="small">{getString('ce.pageErrorMsg.perspectiveNoData')}</Text>
          </Container>
        )}
      </Page.Body>
    </>
  )
}

export default ServiceDetailsPage
