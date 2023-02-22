/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Card, Container, Layout } from '@harness/uicore'
import { ActiveServiceInstancesV2 } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesV2'
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
import { convertStringToDateTimeRange } from '@cd/pages/dashboard/dashboardUtils'
import css from '@cd/components/ServiceDetails/ServiceDetailsContent/ServicesDetailsContent.module.scss'

const ServiceDetailsSummary: React.FC = () => {
  const { serviceId } = useParams<ServicePathProps>()
  const { getString } = useStrings()

  const [serviceTimeRange, setServiceTimeRange] = useLocalStorage<TimeRangeSelectorProps>(
    'timeRangeServiceDetails',
    {
      range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
      label: getString('common.duration.month')
    },
    window.sessionStorage
  )

  const timeServiceDetail = convertStringToDateTimeRange(serviceTimeRange)
  return (
    <div>
      <Container flex className={css.timeRangeContainer}>
        <TimeRangeSelector timeRange={timeServiceDetail?.range} setTimeRange={setServiceTimeRange} />
      </Container>
      <Layout.Horizontal margin={{ top: 'large', bottom: 'large' }}>
        <DeploymentsTimeRangeContext.Provider
          value={{ timeRange: timeServiceDetail, setTimeRange: setServiceTimeRange }}
        >
          <Layout.Vertical margin={{ right: 'xlarge' }}>
            <Layout.Horizontal margin={{ bottom: 'medium' }}>
              <ActiveServiceInstancesV2 />
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
    </div>
  )
}

export default ServiceDetailsSummary
