/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { GetCCMOverviewQueryParams, useGetCCMOverview } from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import { getGroupByFromTimeRange } from '@projects-orgs/utils/utils'
import { getDateLabelToDisplayText } from '@common/components/TimeRangePicker/TimeRangePicker'
import { useStrings } from 'framework/strings'
import { numberFormatter } from '@common/utils/utils'
import routes from '@common/RouteDefinitions'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from '../EmptyState/EmptyStateExpandedView'
import EmptyStateCollapsedView from '../EmptyState/EmptyStateCollapsedView'
import DefaultFooter from '../EmptyState/DefaultFooter'
import ModuleColumnChart from '../../ModuleColumnChart/ModuleColumnChart'
import ErrorCard from '../../ErrorCard/ErrorCard'

const CEModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded, isEmptyState, timeRange }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const {
    data: ccmData,
    loading,
    error,
    refetch
  } = useGetCCMOverview({
    queryParams: {
      accountIdentifier: accountId,
      startTime: getGMTStartDateTime(timeRange?.from),
      endTime: getGMTEndDateTime(timeRange?.to),
      groupBy: getGroupByFromTimeRange(timeRange) as GetCCMOverviewQueryParams['groupBy']
    }
  })

  if (isEmptyState) {
    if (isExpanded) {
      return (
        <EmptyStateExpandedView
          title={'common.moduleDetails.ce.expanded.title'}
          footer={
            <DefaultFooter
              learnMoreLink="https://docs.harness.io/category/exgoemqhji-ccm"
              getStartedLink={routes.toCE({ accountId })}
            />
          }
        />
      )
    }
    return <EmptyStateCollapsedView description={'common.moduleDetails.ce.collapsed.title'} />
  }

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  const dataPoints = ccmData?.data?.costPerDay?.map(cost => {
    return cost?.values?.reduce((total, c) => Number(c.value) + total, 0) || 0
  })

  const data = [
    {
      name: 'Cloud Spend',
      data: dataPoints,
      color: '#01C9CC'
    }
  ]

  if (error) {
    return (
      <ErrorCard
        onRetry={() => {
          refetch()
        }}
      />
    )
  }

  return (
    <ModuleColumnChart
      count={ccmData?.data?.totalCost ? `$${numberFormatter(ccmData?.data?.totalCost)}` : '$0'}
      countChangeInfo={{
        countChange: ccmData?.data?.totalCost,
        countChangeRate: ccmData?.data?.totalCostTrend
      }}
      timeRange={ccmData?.data?.costPerDay?.map(cost => cost.time || 0)}
      data={data}
      isExpanded={isExpanded}
      timeRangeLabel={
        timeRange.type
          ? getString('common.cloudSpendsIn', {
              value: getDateLabelToDisplayText(getString)[timeRange.type]
            }).toUpperCase()
          : undefined
      }
      yAxisLabel={getString('common.cloudSpends')}
    />
  )
}

export default CEModuleOverview
