import React, { useEffect, useMemo, useState } from 'react'
import { Color, Container, Icon } from '@harness/uicore'
import { useParams } from 'react-router'
import { defaultTo } from 'lodash-es'
import type { ModuleTileDetailsBaseProps } from '@projects-orgs/pages/OverviewDashboardPage/ModuleTile/types'
import { StackedColumnChart } from '@common/components/StackedColumnChart/StackedColumnChart'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  DeploymentsOverview,
  useGetDeploymentStatsOverview,
  GetDeploymentStatsOverviewQueryParams,
  PipelineExecutionInfo,
  TimeBasedStats
} from 'services/dashboard-service'
import { TimeRangeToDays, useLandingDashboardContext } from '@common/factories/LandingDashboardContext'

// response.deploymentsStatsSummary.deploymentStats.forEach(val => {
//   successData.push(defaultTo(val.countWithSuccessFailureDetails?.successCount, 0))
//   failureData.push(defaultTo(val.countWithSuccessFailureDetails?.failureCount, 0))
//   custom.push(val)
// })

export enum TimeRangeGroupByMapping {
  '30Days' = 'DAY',
  '60Days' = 'WEEK',
  '90Days' = 'WEEK',
  '1Year' = 'MONTH'
}

export default function CDModuleTile(props: ModuleTileDetailsBaseProps): React.ReactElement {
  const { selectedTimeRange } = useLandingDashboardContext()

  const [range, setRange] = useState([0, 0])
  const [sortByValue, setSortByValue] = useState<GetDeploymentStatsOverviewQueryParams['sortBy']>('DEPLOYMENTS')
  const [groupByValue, setGroupByValues] = useState(TimeRangeGroupByMapping[selectedTimeRange])
  const { isExpanded } = props
  const { accountId } = useParams<AccountPathProps>()

  const { data, error, refetch, loading } = useGetDeploymentStatsOverview({
    queryParams: {
      accountIdentifier: accountId,
      startTime: range[0],
      endTime: range[1],
      groupBy: groupByValue,
      sortBy: sortByValue
    },
    lazy: true
  })

  const response = data?.data?.response

  let deploymentStatsData = useMemo(() => {
    const successData: number[] = []
    const failureData: number[] = []
    const custom: TimeBasedStats[] = []
    if (response?.deploymentsStatsSummary?.deploymentStats?.length) {
      response.deploymentsStatsSummary.deploymentStats.forEach(val => {
        successData.push(defaultTo(val.countWithSuccessFailureDetails?.successCount, 0))
        failureData.push(defaultTo(val.countWithSuccessFailureDetails?.failureCount, 0))
        custom.push(val)
      })
    }
    const successCount = successData.reduce((sum, i) => sum + i, 0)
    const failureCount = failureData.reduce((sum, i) => sum + i, 0)
    const successArr = {
      name: `Success (${successCount})`,
      data: successData,
      color: '#5FB34E',
      custom
    }
    const failureArr = {
      name: `Failed (${failureCount})`,
      data: failureData,
      color: '#EE5F54',
      custom
    }
    return [successArr, failureArr]
  }, [response?.deploymentsStatsSummary?.deploymentStats])

  deploymentStatsData = deploymentStatsData.slice(0, 9)

  useEffect(() => {
    setRange([Date.now() - TimeRangeToDays[selectedTimeRange] * 24 * 60 * 70000, Date.now()])
    setGroupByValues(TimeRangeGroupByMapping[selectedTimeRange])
  }, [selectedTimeRange])

  useEffect(() => {
    if (!range[0]) {
      return
    }
    refetch()
  }, [refetch, range, groupByValue, sortByValue])

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }}>
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />{' '}
      </Container>
    )
  }

  return (
    <>
      <StackedColumnChart
        data={deploymentStatsData.slice(0, 8) || []}
        options={{
          xAxis: { visible: false },
          chart: { type: 'column', spacing: [1, 1, 1, 1] },
          yAxis: { visible: false },
          legend: { enabled: false }
        }}
      />
    </>
  )
}
