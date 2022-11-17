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
import { GetServiceDetailsQueryParams, useGetServiceDetails } from 'services/cd-ng'
import { DeploymentsTimeRangeContext, useServiceStore, Views } from '@cd/components/Services/common'
import {
  ServiceInstancesWidget,
  ServiceInstanceWidgetProps
} from '@cd/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { MostActiveServicesWidget } from '@cd/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
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

  const queryParams: GetServiceDetailsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    startTime,
    endTime,
    sort
  }

  useDocumentTitle([getString('services')])

  const {
    loading,
    data: serviceDetails,
    error,
    refetch
  } = useGetServiceDetails({
    queryParams,
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  useEffect(() => {
    fetchDeploymentList.current = refetch
  }, [fetchDeploymentList, refetch])

  const serviceDeploymentDetailsList = serviceDetails?.data?.serviceDeploymentDetailsList || []

  const serviceDetailsProps: ServicesListProps = {
    loading,
    error: !!error,
    data: serviceDeploymentDetailsList,
    refetch,
    setSavedSortOption,
    setSort,
    sort
  }

  const serviceInstanceProps: ServiceInstanceWidgetProps = {
    serviceCount: serviceDeploymentDetailsList.length,
    ...serviceDeploymentDetailsList.reduce(
      (count, item) => {
        count['serviceInstancesCount'] += item.instanceCountDetails?.totalInstances || 0
        count['prodCount'] += item.instanceCountDetails?.prodInstances || 0
        count['nonProdCount'] += item.instanceCountDetails?.nonProdInstances || 0
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
