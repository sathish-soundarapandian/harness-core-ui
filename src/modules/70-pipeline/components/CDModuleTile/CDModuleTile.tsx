import React, { useMemo } from 'react'
import { Container, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import type { ModuleTileDetailsBaseProps } from '@projects-orgs/pages/OverviewDashboardPage/ModuleTile/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetDeploymentStatsOverview,
  TimeBasedStats,
  GetDeploymentStatsOverviewQueryParams
} from 'services/dashboard-service'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import { getGroupByFromTimeRange } from '@projects-orgs/utils/utils'
import ModuleColumnChart from '@common/components/ModuleColumnChart/ModuleColumnChart'

export default function CDModuleTile(props: ModuleTileDetailsBaseProps): React.ReactElement {
  const { selectedRange } = props
  const { isExpanded } = props
  const { accountId } = useParams<AccountPathProps>()

  const { data, loading } = useGetDeploymentStatsOverview({
    queryParams: {
      accountIdentifier: accountId,
      startTime: getGMTStartDateTime(selectedRange?.from),
      endTime: getGMTEndDateTime(selectedRange?.to),
      groupBy: getGroupByFromTimeRange(selectedRange) as GetDeploymentStatsOverviewQueryParams['groupBy'],
      sortBy: 'DEPLOYMENTS'
    }
  })

  const response = data?.data?.response

  const deploymentStatsData = useMemo(() => {
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

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }}>
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  return (
    <>
      <ModuleColumnChart
        detailedView={isExpanded}
        data={deploymentStatsData || []}
        groupBy="DAY"
        count={10}
        countChangeInfo={{
          countChange: response?.deploymentsStatsSummary?.deploymentRateAndChangeRate?.rate,
          countChangeRate: response?.deploymentsStatsSummary?.deploymentRateAndChangeRate?.rateChangeRate
        }}
      />
    </>
  )
}
