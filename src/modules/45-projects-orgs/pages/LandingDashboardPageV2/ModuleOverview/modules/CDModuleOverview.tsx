/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Icon } from '@harness/uicore'
import React, { useMemo } from 'react'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  useGetDeploymentStatsOverview,
  GetDeploymentStatsOverviewQueryParams,
  TimeBasedStats
} from 'services/dashboard-service'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import { getGroupByFromTimeRange } from '@projects-orgs/utils/utils'
import { getDateLabelToDisplayText } from '@common/components/TimeRangePicker/TimeRangePicker'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from '../EmptyState/EmptyStateExpandedView'
import EmptyStateCollapsedView from '../EmptyState/EmptyStateCollapsedView'
import ModuleColumnChart from '../../ModuleColumnChart/ModuleColumnChart'
import DefaultFooter from '../EmptyState/DefaultFooter'

const CDModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded, timeRange, isEmptyState }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  // This will be removed, data will come from the parent component.
  const { data, loading } = useGetDeploymentStatsOverview({
    queryParams: {
      accountIdentifier: accountId,
      startTime: getGMTStartDateTime(timeRange?.from),
      endTime: getGMTEndDateTime(timeRange?.to),
      groupBy: getGroupByFromTimeRange(timeRange) as GetDeploymentStatsOverviewQueryParams['groupBy'],
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

  if (isEmptyState) {
    if (isExpanded) {
      return (
        <EmptyStateExpandedView
          title={'common.moduleDetails.cd.expanded.title'}
          description={[
            'common.moduleDetails.cd.expanded.list.one',
            'common.moduleDetails.cd.expanded.list.two',
            'common.moduleDetails.cd.expanded.list.three',
            'common.moduleDetails.cd.expanded.list.four'
          ]}
          footer={<DefaultFooter learnMoreLink="https://docs.harness.io/category/pfzgb4tg05-howto-cd" />}
        />
      )
    }

    return <EmptyStateCollapsedView description="common.moduleDetails.cd.collapsed.title" />
  }

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  return (
    <>
      <ModuleColumnChart
        isExpanded={isExpanded}
        data={deploymentStatsData || []}
        count={response?.deploymentsStatsSummary?.countAndChangeRate?.count || 0}
        countChangeInfo={{
          countChange: response?.deploymentsStatsSummary?.deploymentRateAndChangeRate?.rate,
          countChangeRate: response?.deploymentsStatsSummary?.deploymentRateAndChangeRate?.rateChangeRate
        }}
        timeRangeLabel={
          timeRange.type
            ? getString('common.deploymentsIn', {
                value: getDateLabelToDisplayText(getString)[timeRange.type]
              }).toUpperCase()
            : undefined
        }
      />
    </>
  )
}

export default CDModuleOverview
