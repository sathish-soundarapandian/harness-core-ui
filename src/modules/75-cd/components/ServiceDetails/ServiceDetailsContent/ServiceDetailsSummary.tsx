/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Card, Container, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { ActiveServiceInstances } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances'
import {
  startOfDay,
  TimeRangeSelector,
  TimeRangeSelectorProps
} from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { useStrings } from 'framework/strings'
import { DeploymentsTimeRangeContext } from '@cd/components/Services/common'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import type { ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { InstanceCountHistory } from '@cd/components/ServiceDetails/InstanceCountHistory/InstanceCountHistory'
import { PipelineExecutions } from '@cd/components/ServiceDetails/PipelineExecutions/PipelineExecutions'
import { useLocalStorage } from '@common/hooks/useLocalStorage'
import { validTimeFormat } from '@common/factories/LandingDashboardContext'
import css from '@cd/components/ServiceDetails/ServiceDetailsContent/ServicesDetailsContent.module.scss'

const ServiceDetailsSummary: React.FC = () => {
  const { serviceId } = useParams<ServicePathProps>()
  const { getString } = useStrings()

  const [timeRangeService, setTimeRangeService] = useLocalStorage<TimeRangeSelectorProps>(
    'timeRangeServiceDetails',
    {
      range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
      label: getString('common.duration.month')
    },
    window.sessionStorage
  )

  const timeServiceDetail = validTimeFormat(timeRangeService)
  timeRangeService.range[0] = timeServiceDetail.range[0]
  timeRangeService.range[1] = timeServiceDetail.range[1]
  return (
    <Page.Body>
      <Container flex className={css.timeRangeContainer}>
        <TimeRangeSelector timeRange={timeRangeService?.range} setTimeRange={setTimeRangeService} />
      </Container>
      <Layout.Horizontal margin={{ top: 'large', bottom: 'large' }}>
        <DeploymentsTimeRangeContext.Provider
          value={{ timeRange: timeRangeService, setTimeRange: setTimeRangeService }}
        >
          <Layout.Vertical margin={{ right: 'xlarge' }}>
            <Layout.Horizontal margin={{ bottom: 'medium' }}>
              <ActiveServiceInstances />
            </Layout.Horizontal>
            <InstanceCountHistory />
          </Layout.Vertical>
          <Layout.Vertical className={css.fullWidth}>
            <Card className={css.card}>
              <DeploymentsWidget serviceIdentifier={serviceId} />
            </Card>
            <PipelineExecutions />
          </Layout.Vertical>
        </DeploymentsTimeRangeContext.Provider>
      </Layout.Horizontal>
    </Page.Body>
  )
}

export default ServiceDetailsSummary
