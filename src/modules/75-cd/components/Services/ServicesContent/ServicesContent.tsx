/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Layout } from '@harness/uicore'
import { Page } from '@common/exports'
import {
  GetServiceDetailsV2QueryParams,
  ServiceDetailsDTO,
  ServiceDetailsDTOV2,
  useGetServiceDetails,
  useGetServiceDetailsV2
} from 'services/cd-ng'
import { DeploymentsTimeRangeContext, useServiceStore, Views } from '@cd/components/Services/common'
import {
  ServiceInstancesWidget,
  ServiceInstanceWidgetProps
} from '@cd/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { MostActiveServicesWidget } from '@cd/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
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
  const { CDC_DASHBOARD_ENHANCEMENT_NG } = useFeatureFlags()

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

  const { loading, data, error, refetch } = useGetServiceDetails({
    queryParams,
    queryParamStringifyOptions: { arrayFormat: 'comma' },
    lazy: CDC_DASHBOARD_ENHANCEMENT_NG
  })

  const {
    loading: loadingV2,
    data: dataV2,
    error: errorV2,
    refetch: refetchV2
  } = useGetServiceDetailsV2({
    queryParams,
    queryParamStringifyOptions: { arrayFormat: 'comma' },
    lazy: !CDC_DASHBOARD_ENHANCEMENT_NG
  })

  const [serviceDetailsLoading, serviceDetails, serviceDetailsError, serviceDetailsRefetch] =
    CDC_DASHBOARD_ENHANCEMENT_NG ? [loadingV2, dataV2, errorV2, refetchV2] : [loading, data, error, refetch]

  useEffect(() => {
    fetchDeploymentList.current = refetch
  }, [fetchDeploymentList, refetch])

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

  return (
    <Page.Body className={css.pageBody}>
      <Layout.Vertical className={css.container}>
        <DeploymentsTimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
          {view === Views.INSIGHT && (
            <Layout.Horizontal margin={{ bottom: 'large' }}>
              <ServiceInstancesWidget {...serviceInstanceProps} />
              <Card className={css.card}>
                <MostActiveServicesWidget title={getString('common.mostActiveServices')} />
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
