/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Container, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { BuildExecutionInfo, GetBuildExecutionQueryParams, useGetBuildExecution } from 'services/ci'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import { getDateLabelToDisplayText } from '@common/components/TimeRangePicker/TimeRangePicker'
import type { TimeBasedStats } from 'services/dashboard-service'
import { getGroupByFromTimeRange } from '@projects-orgs/utils/utils'
import { numberFormatter } from '@common/utils/utils'
import routes from '@common/RouteDefinitions'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from '../EmptyState/EmptyStateExpandedView'
import EmptyStateCollapsedView from '../EmptyState/EmptyStateCollapsedView'
import DefaultFooter from '../EmptyState/DefaultFooter'
import ModuleColumnChart from '../../ModuleColumnChart/ModuleColumnChart'
import ErrorCard from '../../ErrorCard/ErrorCard'

const CIModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded, timeRange, isEmptyState }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const { data, loading, error, refetch } = useGetBuildExecution({
    queryParams: {
      accountIdentifier: accountId,
      startTime: getGMTStartDateTime(timeRange?.from),
      endTime: getGMTEndDateTime(timeRange?.to),
      groupBy: getGroupByFromTimeRange(timeRange) as GetBuildExecutionQueryParams['groupBy']
    }
  })

  const deploymentStatsData = useMemo(() => {
    const successData: number[] = []
    const failureData: number[] = []
    const custom: TimeBasedStats[] = []
    const buildInfoList = data?.data?.buildExecutionInfoList
    if (buildInfoList?.length) {
      buildInfoList.forEach(build => {
        successData.push(defaultTo(build.builds?.success, 0))
        failureData.push(defaultTo(build.builds?.failed, 0))
        custom.push(build)
      })
    }
    const successCount = successData.reduce((sum, i) => sum + i, 0)
    const failureCount = failureData.reduce((sum, i) => sum + i, 0)
    const successArr = {
      name: getString('common.successCount', { count: successCount }),
      data: successData,
      color: '#5FB34E',
      custom
    }
    const failureArr = {
      name: getString('common.failedCount', { count: failureCount }),
      data: failureData,
      color: '#EE5F54',
      custom
    }
    return [successArr, failureArr]
  }, [data?.data?.buildExecutionInfoList])

  if (isEmptyState) {
    if (isExpanded) {
      return (
        <EmptyStateExpandedView
          title={'common.moduleDetails.ci.expanded.title'}
          description={[
            'common.moduleDetails.ci.expanded.list.one',
            'common.moduleDetails.ci.expanded.list.two',
            'common.moduleDetails.ci.expanded.list.three'
          ]}
          footer={
            <DefaultFooter
              learnMoreLink="https://docs.harness.io/category/zgffarnh1m-ci-category"
              getStartedLink={routes.toCI({ accountId })}
            />
          }
        />
      )
    }

    return <EmptyStateCollapsedView description={'common.moduleDetails.ci.collapsed.title'} />
  }

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  if (error) {
    return (
      <ErrorCard
        onRetry={() => {
          refetch()
        }}
      />
    )
  }

  const totalCount = data?.data?.buildExecutionInfoList
    ?.map((build: BuildExecutionInfo) => build.builds?.total)
    .reduce((total = 0, value = 0) => total + value, 0)

  return (
    <>
      <ModuleColumnChart
        isExpanded={isExpanded}
        data={deploymentStatsData || []}
        count={numberFormatter(totalCount) || '0'}
        countChangeInfo={{ countChange: data?.data?.buildRate, countChangeRate: data?.data?.buildRateChangeRate }}
        timeRange={data?.data?.buildExecutionInfoList?.map(build => build.time || 0)}
        timeRangeLabel={
          timeRange.type
            ? getString('common.buildsIn', {
                value: getDateLabelToDisplayText(getString)[timeRange.type]
              }).toUpperCase()
            : undefined
        }
        yAxisLabel={getString('executionsText')}
      />
    </>
  )
}

export default CIModuleOverview
