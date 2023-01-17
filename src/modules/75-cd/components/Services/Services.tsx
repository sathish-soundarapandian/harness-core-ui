/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useGetCommunity } from '@common/utils/utils'
import { startOfDay, TimeRangeSelectorProps } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { useLocalStorage } from '@common/hooks'
import { convertStringToDateTimeRange } from '@cd/pages/dashboard/dashboardUtils'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import EndOfLifeBanner from '@pipeline/components/PipelineStudio/PipelineCanvas/EndOfLifeBanner'
import { DeploymentsTimeRangeContext, ServiceStoreContext, useServiceStore } from './common'

import { ServicesListPage } from './ServicesListPage/ServicesListPage'
import { ServiceTab } from './ServiceTabs/ServiceTabs'

export const Services: React.FC<{ showServicesDashboard?: boolean }> = ({ showServicesDashboard }) => {
  const { view, setView, fetchDeploymentList } = useServiceStore()
  const { getString } = useStrings()
  const isCommunity = useGetCommunity()

  const [timeRange, setTimeRange] = useLocalStorage<TimeRangeSelectorProps>(
    'serviceTimeRange',
    {
      range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
      label: getString('common.duration.month')
    },
    window.sessionStorage
  )

  const resultTimeFilterRange = convertStringToDateTimeRange(timeRange)
  const { module, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  const showBanner = !isEmpty(projectIdentifier) && module === 'cd'

  return (
    <ServiceStoreContext.Provider
      value={{
        view,
        setView,
        fetchDeploymentList
      }}
    >
      {showBanner && <EndOfLifeBanner isSvcOrEnv />}
      <Page.Header title={getString('services')} breadcrumbs={<NGBreadcrumbs />} />
      {isCommunity || !showServicesDashboard ? (
        <ServicesListPage />
      ) : (
        <DeploymentsTimeRangeContext.Provider value={{ timeRange: resultTimeFilterRange, setTimeRange }}>
          <ServiceTab setTimeRange={setTimeRange} timeRange={resultTimeFilterRange} />
        </DeploymentsTimeRangeContext.Provider>
      )}
    </ServiceStoreContext.Provider>
  )
}
