/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import cronstrue from 'cronstrue'
import qs from 'qs'
import cx from 'classnames'
import { Button, Container, Text, PageHeader, PageBody, Icon, useToaster } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Popover, PopoverInteractionKind, Position, Switch } from '@blueprintjs/core'
import { union } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import {
  PerspectiveAnomalyData,
  QLCEViewFilterWrapper,
  QLCEViewGroupBy,
  useGetBusinessMappingList,
  useGetPerspective,
  useGetReportSetting,
  useListPerspectiveAnomalies
} from 'services/ce/'
import {
  useFetchPerspectiveTimeSeriesQuery,
  QlceViewTimeGroupType,
  useFetchPerspectiveDetailsSummaryWithBudgetQuery,
  QlceViewFilterInput,
  QlceViewFilterOperator,
  QlceViewFieldInputInput,
  useFetchperspectiveGridQuery,
  ViewChartType,
  ViewType,
  QlceViewAggregateOperation,
  QlceViewPreferencesInput,
  QlceViewFilterWrapperInput,
  ViewFieldIdentifier
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import PerspectiveGrid from '@ce/components/PerspectiveGrid/PerspectiveGrid'
import CloudCostInsightChart from '@ce/components/CloudCostInsightChart/CloudCostInsightChart'
import PerspectiveExplorerGroupBy from '@ce/components/PerspectiveExplorerGroupBy/PerspectiveExplorerGroupBy'
import PersepectiveExplorerFilters from '@ce/components/PersepectiveExplorerFilters/PerspectiveExplorerFilters'
import PerspectiveSummary from '@ce/components/PerspectiveSummary/PerspectiveSummary'
import {
  getViewFilterForId,
  getTimeFilters,
  getGroupByFilter,
  getTimeRangeFilter,
  getFilters,
  DEFAULT_GROUP_BY,
  highlightNode,
  resetNodeState,
  clusterInfoUtil,
  getQueryFiltersFromPerspectiveResponse,
  UnallocatedCostClusterFields,
  getBmDataSources
} from '@ce/utils/perspectiveUtils'
import { AGGREGATE_FUNCTION, getGridColumnsByGroupBy } from '@ce/components/PerspectiveGrid/Columns'
import { getGMTStartDateTime, getGMTEndDateTime, DEFAULT_TIME_RANGE } from '@ce/utils/momentUtils'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import EmptyView from '@ce/images/empty-state.svg'
import { CCM_CHART_TYPES } from '@ce/constants'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { PAGE_NAMES } from '@ce/TrackingEventsConstants'
import { useDownloadPerspectiveGridAsCsv } from '@ce/components/PerspectiveGrid/useDownloadPerspectiveGridAsCsv'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useDeepCompareEffect, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { PerspectiveQueryParams, TimeRangeFilterType } from '@ce/types'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { getToolTip } from '@ce/components/PerspectiveViews/PerspectiveMenuItems'
import css from './PerspectiveDetailsPage.module.scss'

const PAGE_SIZE = 15
interface PerspectiveParams {
  perspectiveId: string
  perspectiveName: string
  accountId: string
}

const PerspectiveHeader: React.FC<{ title: string; viewType: string }> = ({ title, viewType }) => {
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const history = useHistory()
  const { getString } = useStrings()
  const isDefaultPerspective = viewType === ViewType.Default

  const { data, loading } = useGetReportSetting({
    accountIdentifier: accountId,
    queryParams: { perspectiveId }
  })

  const reports = data?.data || []

  const goToEditPerspective: () => void = () => {
    history.push(
      routes.toCECreatePerspective({
        perspectiveId,
        accountId
      })
    )
  }

  const breadcrumbsLinks = useMemo(
    () => [
      {
        url: routes.toCEPerspectives({ accountId }),
        label: getString('ce.perspectives.sideNavText')
      }
    ],
    []
  )

  const [canEdit] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CCM_PERSPECTIVE
      },
      permissions: [PermissionIdentifier.EDIT_CCM_PERSPECTIVE]
    },
    []
  )

  const getHeaderContent = () => {
    return (
      <Container
        className={css.headerContentSection}
        padding={{
          top: 'xlarge',
          left: 'xsmall'
        }}
      >
        {loading ? <Icon name="spinner" color={Color.BLUE_500} /> : null}

        {reports.length ? (
          <Container className={css.headerContent}>
            <Icon name="notification" size={14} color={Color.PRIMARY_7} />
            <Text
              margin={{
                left: 'xsmall'
              }}
              color={Color.GREY_500}
              font={{ variation: FontVariation.SMALL }}
            >
              {getString('ce.perspectives.perspectiveReportsTxt', {
                reportInfo: cronstrue.toString(reports[0].userCron || '')
              })}
            </Text>
            {reports.length > 1 ? (
              <Text
                margin={{
                  left: 'xsmall'
                }}
                color={Color.GREY_500}
                font={{ variation: FontVariation.SMALL }}
              >
                {getString('ce.perspectives.perspectiveReportsMoreTxt', {
                  count: reports.length - 1
                })}
              </Text>
            ) : null}
          </Container>
        ) : null}
      </Container>
    )
  }

  return (
    <PageHeader
      title={title}
      breadcrumbs={<NGBreadcrumbs links={breadcrumbsLinks} />}
      content={getHeaderContent()}
      toolbar={
        <Button
          disabled={isDefaultPerspective || !canEdit}
          tooltip={getToolTip(
            canEdit,
            PermissionIdentifier.EDIT_CCM_PERSPECTIVE,
            ResourceType.CCM_PERSPECTIVE,
            isDefaultPerspective,
            getString('ce.perspectives.editDefaultPerspective')
          )}
          text={getString('edit')}
          icon="edit"
          intent="primary"
          onClick={goToEditPerspective}
        />
      }
    />
  )
}

const PerspectiveDetailsPage: React.FC = () => {
  const history = useHistory()
  const { perspectiveId, accountId, perspectiveName } = useParams<PerspectiveParams>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()

  const { updateQueryParams } = useUpdateQueryParams()

  const {
    timeRange: timeQueryParam,
    groupBy: gQueryParam,
    aggregation: aggQueryParam,
    chartType: chartTypeQueryParam
  } = useQueryParams<PerspectiveQueryParams>()

  const [timeRange, setTimeRange] = useQueryParamsState<TimeRangeFilterType>('timeRange', DEFAULT_TIME_RANGE)

  const [groupBy, setGroupBy] = useQueryParamsState<QlceViewFieldInputInput>('groupBy', DEFAULT_GROUP_BY)
  const [aggregation, setAggregation] = useQueryParamsState<QlceViewTimeGroupType>(
    'aggregation',
    QlceViewTimeGroupType.Day
  )
  const [filters, setFilters] = useQueryParamsState<QlceViewFilterInput[]>('filters', [])

  const { trackPage } = useTelemetry()

  const { data: perspectiveRes, loading } = useGetPerspective({
    queryParams: {
      perspectiveId: perspectiveId,
      accountIdentifier: accountId
    }
  })

  const { mutate: getAnomalies } = useListPerspectiveAnomalies({
    perspectiveId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const isBusinessMappingQuery =
    filters.some(filter => filter.field.identifier === ViewFieldIdentifier.BusinessMapping) ||
    groupBy.identifier === ViewFieldIdentifier.BusinessMapping

  const { loading: bmDataLoading, data: bmData } = useGetBusinessMappingList({
    queryParams: { accountIdentifier: accountId },
    lazy: !isBusinessMappingQuery
  })

  const bmDataSources = getBmDataSources(bmData?.resource, filters, groupBy)

  const [anomaliesCountData, setAnomaliesCountData] = useState<PerspectiveAnomalyData[]>([])

  const chartRef = useRef<Highcharts.Chart>()

  const perspectiveData = perspectiveRes?.data

  const isPageReady = !loading && perspectiveData

  const { isClusterOnly, hasClusterAsSource } = clusterInfoUtil(union(perspectiveData?.dataSources, bmDataSources))

  const [gridPageOffset, setGridPageOffset] = useState(0) // This tells us the starting point of next data fetching(used in the api call)
  const [gridPageIndex, setPageIndex] = useState(0) // [Pagination] tells us the current page we are in the grid

  const [chartType, setChartType] = useQueryParamsState<CCM_CHART_TYPES>('chartType', CCM_CHART_TYPES.COLUMN)
  const [columnSequence, setColumnSequence] = useState<string[]>([])

  useEffect(() => {
    trackPage(PAGE_NAMES.PERSPECTIVE_DETAILS_PAGE, {})
  }, [])

  useEffect(() => {
    if (perspectiveData) {
      const cType =
        perspectiveData.viewVisualization?.chartType === ViewChartType.StackedTimeSeries
          ? CCM_CHART_TYPES.COLUMN
          : CCM_CHART_TYPES.AREA
      setChartType(cType)

      const queryParamsToUpdate = getQueryFiltersFromPerspectiveResponse(perspectiveData, {
        timeRange: timeQueryParam,
        groupBy: gQueryParam,
        aggregation: aggQueryParam,
        chartType: chartTypeQueryParam
      })

      updateQueryParams(queryParamsToUpdate, {}, true)
    }
  }, [perspectiveData])

  useDeepCompareEffect(() => {
    const fetchAnomaliesCount = async () => {
      try {
        const response = await getAnomalies({
          filters: [
            ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
            ...getFilters(filters)
          ] as QLCEViewFilterWrapper[],
          groupBy: [getGroupByFilter(groupBy)] as QLCEViewGroupBy[]
        })
        setAnomaliesCountData(response?.data as PerspectiveAnomalyData[])
      } catch (error: any) {
        showError(getRBACErrorMessage(error))
      }
    }
    fetchAnomaliesCount()
  }, [timeRange.from, timeRange.to, filters, groupBy])

  useDeepCompareEffect(() => {
    if (isPageReady) {
      executePerspectiveGridQuery({
        requestPolicy: 'network-only'
      })
      executePerspectiveChartQuery({
        requestPolicy: 'network-only'
      })
    }
  }, [groupBy])

  const setFilterUsingChartClick: (value: string) => void = value => {
    if (value.split('No ')[1] === groupBy.fieldName) {
      setFilters([
        ...filters,
        {
          field: { ...groupBy },
          operator: QlceViewFilterOperator.Null,
          values: [' ']
        }
      ])
    } else {
      setFilters([
        ...filters,
        {
          field: { ...groupBy },
          operator: QlceViewFilterOperator.In,
          values: [value]
        }
      ])
    }
  }

  const queryFilters = useMemo(
    () => [
      getViewFilterForId(perspectiveId),
      ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
      ...getFilters(filters)
    ],
    [perspectiveId, timeRange, filters]
  )
  const [preferences, setPreferences] = useState<QlceViewPreferencesInput>({
    includeOthers: false,
    includeUnallocatedCost: false
  })

  useEffect(() => {
    if (perspectiveData?.viewPreferences) {
      setPreferences({
        includeOthers: Boolean(perspectiveData?.viewPreferences?.includeOthers),
        includeUnallocatedCost: Boolean(perspectiveData?.viewPreferences?.includeUnallocatedCost)
      })
    }
  }, [perspectiveData])

  const [chartResult, executePerspectiveChartQuery] = useFetchPerspectiveTimeSeriesQuery({
    variables: {
      filters: queryFilters,
      limit: 12,
      groupBy: [getTimeRangeFilter(aggregation), getGroupByFilter(groupBy)],
      preferences
    },
    pause: !isPageReady
  })

  const [summaryResult] = useFetchPerspectiveDetailsSummaryWithBudgetQuery({
    variables: {
      isClusterQuery: false,
      aggregateFunction: [
        { operationType: QlceViewAggregateOperation.Sum, columnName: 'cost' },
        { operationType: QlceViewAggregateOperation.Max, columnName: 'startTime' },
        { operationType: QlceViewAggregateOperation.Min, columnName: 'startTime' }
      ],
      filters: queryFilters,
      groupBy: [getGroupByFilter(groupBy)]
    },
    pause: !isPageReady
  })

  const getAggregationFunc = () => {
    if (!isClusterOnly) {
      return AGGREGATE_FUNCTION.DEFAULT
    }

    const af = AGGREGATE_FUNCTION[groupBy.fieldId]
    if (!af) {
      return AGGREGATE_FUNCTION.CLUSTER
    }

    return af
  }

  const [gridSearchParam, setGridSearchParam] = useState('')

  const gridSearchFilter = useMemo(() => {
    if (gridSearchParam) {
      return {
        idFilter: {
          field: groupBy,
          operator: QlceViewFilterOperator.Search,
          values: [gridSearchParam]
        }
      } as QlceViewFilterWrapperInput
    }
    return undefined
  }, [groupBy, gridSearchParam])

  const [gridResults, executePerspectiveGridQuery] = useFetchperspectiveGridQuery({
    variables: {
      aggregateFunction: getAggregationFunc(),
      filters: gridSearchFilter ? [...queryFilters, gridSearchFilter] : queryFilters,
      isClusterOnly: isClusterOnly,
      limit: PAGE_SIZE,
      offset: gridPageOffset,
      groupBy: [getGroupByFilter(groupBy)]
    },
    pause: !isPageReady || bmDataLoading
  })

  const { data: chartData, fetching: chartFetching } = chartResult
  const { data: gridData, fetching: gridFetching } = gridResults

  const { data: summaryData, fetching: summaryFetching } = summaryResult

  const persName = perspectiveData?.name || perspectiveName

  useDocumentTitle([getString('ce.perspectives.sideNavText'), persName], true)

  const [openDownloadCSVModal] = useDownloadPerspectiveGridAsCsv({
    perspectiveName: persName,
    selectedColumnsToDownload: getGridColumnsByGroupBy(groupBy, isClusterOnly),
    variables: {
      aggregateFunction: getAggregationFunc(),
      filters: queryFilters,
      isClusterOnly: isClusterOnly,
      groupBy: [getGroupByFilter(groupBy)]
    }
  })

  const goToWorkloadDetails = (clusterName: string, namespace: string, workloadName: string) => {
    history.push({
      pathname: routes.toCEPerspectiveWorkloadDetails({
        accountId,
        perspectiveId,
        perspectiveName: persName,
        clusterName,
        namespace,
        workloadName
      }),
      search: `?${qs.stringify({ timeRange: JSON.stringify(timeRange) })}`
    })
  }

  const goToNodeDetails = (clusterName: string, nodeId: string) => {
    history.push({
      pathname: routes.toCEPerspectiveNodeDetails({
        accountId,
        perspectiveId,
        perspectiveName: persName,
        clusterName,
        nodeId
      }),
      search: `?${qs.stringify({ timeRange: JSON.stringify(timeRange) })}`
    })
  }

  const goToServiceDetails = (clusterName: string, serviceName: string) => {
    history.push({
      pathname: routes.toCEPerspectiveServiceDetails({
        accountId,
        perspectiveId,
        perspectiveName: persName,
        clusterName,
        serviceName
      }),
      search: `?${qs.stringify({ timeRange: JSON.stringify(timeRange) })}`
    })
  }

  const isChartGridEmpty =
    chartData?.perspectiveTimeSeriesStats?.stats?.length === 0 &&
    gridData?.perspectiveGrid?.data?.length === 0 &&
    !chartFetching &&
    !gridFetching

  const { licenseInformation } = useLicenseStore()
  const isFreeEdition = licenseInformation['CE']?.edition === ModuleLicenseType.FREE

  return (
    <>
      <PerspectiveHeader title={persName} viewType={perspectiveData?.viewType || ViewType.Default} />

      <PageBody loading={loading} className={css.pageCtn}>
        <PersepectiveExplorerFilters
          featureEnabled={!isFreeEdition}
          setFilters={setFilters}
          filters={filters}
          setAggregation={setAggregation}
          aggregation={aggregation}
          setTimeRange={setTimeRange}
          timeRange={timeRange}
          showHourlyAggr={isClusterOnly}
        />
        <PerspectiveSummary
          data={summaryData?.perspectiveTrendStats as any}
          fetching={summaryFetching}
          forecastedCostData={summaryData?.perspectiveForecastCost as any}
          isDefaultPerspective={!!(perspectiveData?.viewType === ViewType.Default)}
          hasClusterAsSource={hasClusterAsSource}
          filters={queryFilters}
        />
        <Container
          margin="xlarge"
          background="white"
          className={cx(css.chartGridContainer, { [css.emptyContainer]: isChartGridEmpty })}
        >
          <Container padding="small">
            <PerspectiveExplorerGroupBy
              chartType={chartType}
              setChartType={setChartType}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              timeFilter={getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to))}
              preferencesDropDown={
                <PreferencesDropDown
                  preferences={preferences}
                  setPreferences={setPreferences}
                  showIncludeUnallocated={
                    isClusterOnly && (Object.values(UnallocatedCostClusterFields) as string[]).includes(groupBy.fieldId)
                  }
                />
              }
            />
            {!isChartGridEmpty && (
              <CloudCostInsightChart
                showLegends={true}
                ref={chartRef as any}
                chartType={chartType}
                columnSequence={columnSequence}
                setFilterUsingChartClick={setFilterUsingChartClick}
                fetching={chartFetching}
                data={chartData?.perspectiveTimeSeriesStats as any}
                aggregation={aggregation}
                xAxisPointCount={chartData?.perspectiveTimeSeriesStats?.stats?.length || DAYS_FOR_TICK_INTERVAL + 1}
                anomaliesCountData={anomaliesCountData}
                groupBy={groupBy}
              />
            )}
          </Container>

          {isChartGridEmpty && (
            <Container className={css.emptyIllustrationContainer}>
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

          <PerspectiveGrid
            goToWorkloadDetails={goToWorkloadDetails}
            goToNodeDetails={goToNodeDetails}
            goToServiceDetails={goToServiceDetails}
            isClusterOnly={isClusterOnly}
            gridData={gridData?.perspectiveGrid?.data as any}
            gridFetching={gridFetching || bmDataLoading}
            columnSequence={columnSequence}
            highlightNode={
              /* istanbul ignore next */
              id => {
                highlightNode(chartRef, id)
              }
            }
            resetNodeState={
              /* istanbul ignore next */
              () => {
                resetNodeState(chartRef)
              }
            }
            setColumnSequence={colSeq => setColumnSequence(colSeq)}
            groupBy={groupBy}
            totalItemCount={gridData?.perspectiveTotalCount || 0}
            gridPageIndex={gridPageIndex}
            pageSize={PAGE_SIZE}
            fetchData={(pageIndex, pageSize) => {
              setPageIndex(pageIndex)
              setGridPageOffset(pageIndex * pageSize)
            }}
            allowExportAsCSV={true}
            openDownloadCSVModal={openDownloadCSVModal}
            setGridSearchParam={text => {
              setPageIndex(0)
              setGridPageOffset(0)
              setGridSearchParam(text)
            }}
            gridSearchParam={gridSearchParam}
            isPerspectiveDetailsPage
          />
        </Container>
      </PageBody>
    </>
  )
}

export default PerspectiveDetailsPage

const PreferencesDropDown: React.FC<{
  preferences: QlceViewPreferencesInput
  setPreferences: React.Dispatch<React.SetStateAction<QlceViewPreferencesInput>>
  showIncludeUnallocated: boolean
}> = ({ preferences, setPreferences, showIncludeUnallocated }) => {
  const { getString } = useStrings()

  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      targetClassName={css.popoverTarget}
      popoverClassName={css.preferencesPopover}
      content={
        <Container className={css.preferenceMenu}>
          <Switch
            large
            checked={Boolean(preferences.includeOthers)}
            labelElement={
              <Text
                font={{ variation: FontVariation.SMALL_SEMI }}
                color={Color.GREY_1000}
                tooltipProps={{ dataTooltipId: 'includeOthers' }}
              >
                {getString('ce.perspectives.createPerspective.preferences.includeOthers')}
              </Text>
            }
            className={css.labelCtn}
            onChange={event => {
              setPreferences(prevPref => ({ ...prevPref, includeOthers: event.currentTarget.checked }))
            }}
          />
          {showIncludeUnallocated ? (
            <>
              <Switch
                large
                checked={Boolean(preferences.includeUnallocatedCost)}
                labelElement={
                  <Text
                    font={{ variation: FontVariation.SMALL_SEMI }}
                    color={Color.GREY_1000}
                    tooltipProps={{ dataTooltipId: 'includeUnallocated' }}
                  >
                    {getString('ce.perspectives.createPerspective.preferences.includeUnallocated')}
                  </Text>
                }
                className={css.labelCtn}
                onChange={event => {
                  setPreferences(prevPref => ({ ...prevPref, includeUnallocatedCost: event.currentTarget.checked }))
                }}
              />
            </>
          ) : null}
        </Container>
      }
      minimal
      position={Position.BOTTOM_RIGHT}
    >
      <Container className={css.preferencesContainer}>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('preferences')}
        </Text>
        <Icon name="chevron-down" />
      </Container>
    </Popover>
  )
}
