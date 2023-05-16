/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Container, Layout } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import moment from 'moment'
import { Page } from '@common/exports'
import type {
  GetServiceDetailsV2QueryParams,
  GetServicesGrowthTrendQueryParams,
  ServiceDetailsDTO,
  ServiceDetailsDTOV2} from 'services/cd-ng';
import {
  useGetServiceDetailsV2,
  useGetServicesGrowthTrend
} from 'services/cd-ng'
import { DeploymentsTimeRangeContext, useServiceStore, Views } from '@cd/components/Services/common'
import type {
  ServiceInstanceWidgetProps
} from '@cd/components/Services/ServiceInstancesWidget/ServiceInstancesWidget';
import {
  ServiceInstancesWidget
} from '@cd/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import type {
  MostActiveServicesRef} from '@cd/components/Services/MostActiveServicesWidget/MostActiveServicesWidget';
import {
  MostActiveServicesWidgetRef
} from '@cd/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import type { ServicesListProps } from '@cd/components/Services/ServicesList/ServicesList';
import { ServicesList } from '@cd/components/Services/ServicesList/ServicesList'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { Sort, SortFields } from '@common/utils/listUtils'
import { convertStringToDateTimeRange, getFormattedTimeRange } from '@cd/pages/dashboard/dashboardUtils'
import { startOfDay, TimeRangeSelector } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import css from '@cd/components/Services/ServicesContent/ServicesContent.module.scss'

export const ServicesContent: React.FC = () => {
  const { view, fetchDeploymentList, refetchServiceDashboard, setIsPageLoading } = useServiceStore()
  const { getString } = useStrings()

  const { timeRange, setTimeRange } = useContext(DeploymentsTimeRangeContext)
  const { preference: savedSortOption, setPreference: setSavedSortOption } = usePreferenceStore<
    [SortFields, Sort] | undefined
  >(PreferenceScope.USER, 'sortOptionServiceDash')
  const [sort, setSort] = useState<[SortFields, Sort]>(savedSortOption || [SortFields.LastModifiedAt, Sort.DESC])

  const resultTimeFilterRange = convertStringToDateTimeRange(
    defaultTo(timeRange, {
      range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
      label: getString('common.duration.month')
    })
  )

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()

  const [startTime, endTime] = getFormattedTimeRange(timeRange)

  const queryParams: GetServiceDetailsV2QueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    startTime,
    endTime,
    sort
  }

  useDocumentTitle([getString('services')])

  const {
    loading: serviceDetailsLoading,
    data: serviceDetails,
    error: serviceDetailsError,
    refetch: serviceDetailsRefetch
  } = useGetServiceDetailsV2({
    queryParams,
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  //Service Growth Trend properties
  const servicesGrowthTrendQueryParams: GetServicesGrowthTrendQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      startTime: moment().utc().startOf('day').subtract(6, 'months').toDate().getTime(),
      endTime: moment().utc().endOf('day').toDate().getTime(),
      timeGroupByType: 'DAY'
    }),
    [accountId, orgIdentifier, projectIdentifier]
  )
  const {
    data: servicesGrowthTrendData,
    refetch: refetchGetServicesGrowthTrend,
    loading: servicesGrowthTrendLoading
  } = useGetServicesGrowthTrend({
    queryParams: servicesGrowthTrendQueryParams
  })

  useEffect(() => {
    fetchDeploymentList.current = serviceDetailsRefetch
  }, [fetchDeploymentList, serviceDetailsRefetch])

  const serviceDeploymentDetailsList = serviceDetails?.data?.serviceDeploymentDetailsList || []

  const instanceWidgetData = [
    ...serviceDeploymentDetailsList.map((val: ServiceDetailsDTOV2 | ServiceDetailsDTO) => val.instanceCountDetails)
  ]

  const serviceDetailsProps: ServicesListProps = {
    loading: serviceDetailsLoading,
    error: !!serviceDetailsError,
    data: serviceDeploymentDetailsList,
    refetch: serviceDetailsRefetch,
    setSavedSortOption,
    setSort,
    sort
  }

  const serviceInstanceProps: ServiceInstanceWidgetProps = {
    serviceCount: serviceDeploymentDetailsList.length,
    serviceGrowthTrendData: servicesGrowthTrendData,
    ...instanceWidgetData.reduce(
      (count, item) => {
        count['serviceInstancesCount'] += item?.totalInstances || 0
        count['prodCount'] += item?.prodInstances || 0
        count['nonProdCount'] += item?.nonProdInstances || 0
        return count
      },
      { serviceInstancesCount: 0, prodCount: 0, nonProdCount: 0 }
    )
  }
  const refetchMostActiveServicesRef = useRef<MostActiveServicesRef>(null)
  const refreshServices = React.useCallback(() => {
    serviceDetailsRefetch()
    refetchGetServicesGrowthTrend()
    refetchMostActiveServicesRef.current?.refetchData()
  }, [refetchGetServicesGrowthTrend, serviceDetailsRefetch])

  useEffect(() => {
    refetchServiceDashboard.current = refreshServices
    setIsPageLoading?.(serviceDetailsLoading || servicesGrowthTrendLoading)
  }, [refetchServiceDashboard, refreshServices, serviceDetailsLoading, servicesGrowthTrendLoading, setIsPageLoading])

  return (
    <Page.Body className={css.pageBody}>
      <DeploymentsTimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
        <Layout.Vertical className={css.container}>
          {view === Views.INSIGHT && (
            <Card className={css.card}>
              <Container flex margin={{ bottom: 'large' }} className={css.timeSelectorClass}>
                <TimeRangeSelector timeRange={resultTimeFilterRange?.range} setTimeRange={setTimeRange} minimal />
              </Container>
              <Layout.Horizontal>
                <ServiceInstancesWidget {...serviceInstanceProps} />
                <div className={css.separator} />
                <MostActiveServicesWidgetRef
                  title={getString('common.mostActiveServices')}
                  ref={refetchMostActiveServicesRef}
                />
                <div className={css.separator} />
                <DeploymentsWidget />
              </Layout.Horizontal>
            </Card>
          )}
        </Layout.Vertical>
        <ServicesList {...serviceDetailsProps} />
      </DeploymentsTimeRangeContext.Provider>
    </Page.Body>
  )
}
