/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Tabs } from '@harness/uicore'
import moment from 'moment'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useGetCommunity } from '@common/utils/utils'
import {
  startOfDay,
  TimeRangeSelector,
  TimeRangeSelectorProps
} from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { useLocalStorage } from '@common/hooks'
import { convertStringToDateTimeRange } from '@cd/pages/dashboard/dashboardUtils'
import { BannerEOL } from '@pipeline/components/BannerEOL/BannerEOL'
import { DeploymentsTimeRangeContext, ServiceStoreContext, useServiceStore } from './common'

import { ServicesListPage } from './ServicesListPage/ServicesListPage'
import { ServicesDashboardPage } from './ServicesDashboardPage/ServicesDashboardPage'

import css from './Services.module.scss'

export const Services: React.FC<{ showServicesDashboard?: boolean }> = ({ showServicesDashboard }) => {
  const { view, setView, fetchDeploymentList } = useServiceStore()
  const { getString } = useStrings()
  const isCommunity = useGetCommunity()
  const [showBanner, setShowBanner] = React.useState<boolean>(false)

  const [timeRange, setTimeRange] = useLocalStorage<TimeRangeSelectorProps>(
    'serviceTimeRange',
    {
      range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
      label: getString('common.duration.month')
    },
    window.sessionStorage
  )

  const resultTimeFilterRange = convertStringToDateTimeRange(timeRange)

  return (
    <ServiceStoreContext.Provider
      value={{
        view,
        setView,
        fetchDeploymentList
      }}
    >
      <BannerEOL isVisible={showBanner} />
      <Page.Header
        title={getString('services')}
        breadcrumbs={<NGBreadcrumbs />}
        toolbar={
          showServicesDashboard && (
            <TimeRangeSelector timeRange={resultTimeFilterRange?.range} setTimeRange={setTimeRange} minimal />
          )
        }
      />
      {isCommunity || !showServicesDashboard ? (
        <ServicesListPage
          setShowBanner={status => {
            setShowBanner(status)
          }}
        />
      ) : (
        <DeploymentsTimeRangeContext.Provider value={{ timeRange: resultTimeFilterRange, setTimeRange }}>
          <div className={css.tabs}>
            <Tabs
              id={'serviceLandingPageTabs'}
              defaultSelectedTabId={'dashboard'}
              tabList={[
                {
                  id: 'dashboard',
                  title: getString('dashboardLabel'),
                  panel: <ServicesDashboardPage />
                },
                {
                  id: 'manageServices',
                  title: getString('cd.serviceDashboard.manageServiceLabel'),
                  panel: (
                    <ServicesListPage
                      setShowBanner={status => {
                        setShowBanner(status)
                      }}
                    />
                  )
                }
              ]}
            />
          </div>
        </DeploymentsTimeRangeContext.Provider>
      )}
    </ServiceStoreContext.Provider>
  )
}
