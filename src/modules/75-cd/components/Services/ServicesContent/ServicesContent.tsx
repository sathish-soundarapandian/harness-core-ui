/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Card, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { GetServiceDetailsQueryParams, useGetServiceDetails } from 'services/cd-ng'
import { DeploymentsTimeRangeContext, useServiceStore, Views } from '@cd/components/Services/common'
import {
  ServiceInstancesWidget,
  ServiceInstanceWidgetProps
} from '@cd/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { MostActiveServicesWidget } from '@cd/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import { startOfDay, TimeRangeSelectorProps } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import { ServicesList, ServicesListProps } from '@cd/components/Services/ServicesList/ServicesList'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { useLocalStorage } from '@common/hooks'
import { validTimeFormat } from '@common/factories/LandingDashboardContext'
import css from '@cd/components/Services/ServicesContent/ServicesContent.module.scss'

export const ServicesContent: React.FC = () => {
  const { view, fetchDeploymentList } = useServiceStore()
  const { getString } = useStrings()

  const [timeFilterRange, setTimeFilterRange] = useLocalStorage<TimeRangeSelectorProps>(
    'timeRangeServiceDashboard',
    {
      range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
      label: getString('common.duration.month')
    },
    window.sessionStorage
  )

  const resultTimeFilterRange = validTimeFormat(timeFilterRange)
  timeFilterRange.range[0] = resultTimeFilterRange.range[0]
  timeFilterRange.range[1] = resultTimeFilterRange.range[1]

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()

  const queryParams: GetServiceDetailsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    startTime: timeFilterRange?.range[0]?.getTime() || 0,
    endTime: timeFilterRange?.range[1]?.getTime() || 0
  }

  useDocumentTitle([getString('services')])

  const {
    loading,
    data: serviceDetails,
    error,
    refetch
  } = useGetServiceDetails({
    queryParams
  })

  useEffect(() => {
    fetchDeploymentList.current = refetch
  }, [fetchDeploymentList, refetch])

  const serviceDeploymentDetailsList = serviceDetails?.data?.serviceDeploymentDetailsList || []

  const serviceDetailsProps: ServicesListProps = {
    loading,
    error: !!error,
    data: serviceDeploymentDetailsList,
    refetch
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
        <DeploymentsTimeRangeContext.Provider value={{ timeRange: timeFilterRange, setTimeRange: setTimeFilterRange }}>
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
