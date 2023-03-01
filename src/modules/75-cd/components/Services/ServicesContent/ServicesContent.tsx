/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Layout } from '@harness/uicore'
import moment from 'moment'
import { Page } from '@common/exports'
import {
  GetServiceDetailsV2QueryParams,
  GetServicesGrowthTrendQueryParams,
  ServiceDetailsDTO,
  ServiceDetailsDTOV2,
  useGetServiceDetailsV2,
  useGetServicesGrowthTrend
} from 'services/cd-ng'
import { DeploymentsTimeRangeContext, useServiceStore, Views } from '@cd/components/Services/common'
import {
  ServiceInstancesWidget,
  ServiceInstanceWidgetProps
} from '@cd/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import {
  MostActiveServicesRef,
  MostActiveServicesWidgetRef
} from '@cd/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import { ServicesList, ServicesListProps } from '@cd/components/Services/ServicesList/ServicesList'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { Sort, SortFields } from '@common/utils/listUtils'
import { getFormattedTimeRange } from '@cd/pages/dashboard/dashboardUtils'
import css from '@cd/components/Services/ServicesContent/ServicesContent.module.scss'

export const ServicesContent: React.FC = () => {
  const { view, fetchDeploymentList } = useServiceStore()
  const { getString } = useStrings()

  const { timeRange, setTimeRange } = useContext(DeploymentsTimeRangeContext)
  const { preference: savedSortOption, setPreference: setSavedSortOption } = usePreferenceStore<string[] | undefined>(
    PreferenceScope.USER,
    'sortOptionServiceDash'
  )
  const [sort, setSort] = useState<string[]>(savedSortOption || [SortFields.LastModifiedAt, Sort.DESC])

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
  const refreshServices = () => {
    serviceDetailsRefetch()
    refetchGetServicesGrowthTrend()
    refetchMostActiveServicesRef.current?.refetchData()
  }
  return (
    <Page.Body className={css.pageBody}>
      <Layout.Vertical className={css.container}>
        <Layout.Horizontal className={css.refreshButton}>
          <Button
            intent="primary"
            icon="refresh"
            onClick={refreshServices}
            minimal
            tooltipProps={{ isDark: true }}
            tooltip={getString('common.refresh')}
            disabled={serviceDetailsLoading || servicesGrowthTrendLoading}
          />
        </Layout.Horizontal>
        <DeploymentsTimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
          {view === Views.INSIGHT && (
            <Layout.Horizontal margin={{ bottom: 'large' }}>
              <ServiceInstancesWidget {...serviceInstanceProps} />
              <Card className={css.card}>
                <MostActiveServicesWidgetRef
                  title={getString('common.mostActiveServices')}
                  ref={refetchMostActiveServicesRef}
                />
                <div className={css.separator} />
                <DeploymentsWidget />
              </Card>
            </Layout.Horizontal>
          )}
          <ServicesList {...serviceDetailsProps} />
        </DeploymentsTimeRangeContext.Provider>
      </Layout.Vertical>
    </Page.Body>
  )
}
