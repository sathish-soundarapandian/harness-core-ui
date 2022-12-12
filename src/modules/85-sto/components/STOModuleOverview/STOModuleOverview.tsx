import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Container, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { ModuleOverviewBaseProps } from '@projects-orgs/pages/LandingDashboardPageV2/ModuleOverview/Grid/ModuleOverviewGrid'
import ModuleColumnChart from '@projects-orgs/pages/LandingDashboardPageV2/ModuleColumnChart/ModuleColumnChart'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetDeploymentStatsOverview,
  GetDeploymentStatsOverviewQueryParams,
  TimeBasedStats
} from 'services/dashboard-service'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import { getGroupByFromTimeRange } from '@projects-orgs/utils/utils'
import responseMock from './notificationMock.json'
import css from './STOModuleOverview.module.scss'

const STOModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded, timeRange }) => {
  const { accountId } = useParams<AccountPathProps>()

  const { data, loading } = useGetDeploymentStatsOverview({
    queryParams: {
      accountIdentifier: accountId,
      startTime: getGMTStartDateTime(timeRange?.from),
      endTime: getGMTEndDateTime(timeRange?.to),
      groupBy: getGroupByFromTimeRange(timeRange) as GetDeploymentStatsOverviewQueryParams['groupBy'],
      sortBy: 'DEPLOYMENTS'
    },
    mock: { data: responseMock }
  })

  const response = data?.data?.response

  const deploymentStatsData = useMemo(() => {
    const successData: number[] = []
    const failureData: number[] = []
    const custom: TimeBasedStats[] = []
    if (response?.deploymentsStatsSummary?.deploymentStats?.length) {
      response.deploymentsStatsSummary.deploymentStats.forEach(val => {
        successData.push(defaultTo(val.countWithSuccessFailureDetails?.successCount || 0 + 10, 0))
        failureData.push(defaultTo(val.countWithSuccessFailureDetails?.failureCount || 0 + 5, 0))
        custom.push(val)
      })
    }
    const successCount = successData.reduce((sum, i) => sum + i, 0)
    const failureCount = failureData.reduce((sum, i) => sum + i, 0)
    const successArr = {
      name: `Medium (${successCount})`,
      data: successData,
      color: '#FCC026',
      custom
    }
    const failureArr = {
      name: `Critical (${failureCount})`,
      data: failureData,
      color: '#EE5F54',
      custom
    }
    return [successArr, failureArr]
  }, [response?.deploymentsStatsSummary?.deploymentStats])

  if (false) {
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
        count={500}
        className={css.container}
        countChangeInfo={{
          countChange: 50,
          countChangeRate: 10
        }}
      />
    </>
  )
}

export default STOModuleOverview
