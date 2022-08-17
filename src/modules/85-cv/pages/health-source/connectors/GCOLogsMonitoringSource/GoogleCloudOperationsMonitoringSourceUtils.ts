/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { MapGCOLogsQueryToService } from './components/MapQueriesToHarnessService/types'
import { HealthSourceTypes } from '../../types'

export const GCOProduct = {
  CLOUD_METRICS: 'Cloud Metrics',
  CLOUD_LOGS: 'Cloud Logs'
}
export interface GCOMonitoringSourceInfo {
  name?: string
  identifier?: string
  connectorRef?: string | { value?: string }
  isEdit?: boolean
  product: string
  type: string
  mappedServicesAndEnvs: Map<string, MapGCOLogsQueryToService>
}

export function buildGCOMonitoringSourceInfo(
  params: ProjectPathProps,
  data: any
): GCOMonitoringSourceInfo & ProjectPathProps {
  return {
    ...params,
    name: data?.healthSourceName,
    identifier: data?.healthSourceIdentifier,
    connectorRef: typeof data?.connectorRef === 'string' ? data?.connectorRef : data?.connectorRef?.value,
    isEdit: data?.isEdit,
    product: data?.product,
    type: HealthSourceTypes.StackdriverLog,
    mappedServicesAndEnvs: getMappedServicesAndEnvs(data)
  }
}

const getMappedServicesAndEnvs = (data: any): Map<string, MapGCOLogsQueryToService> => {
  const currentHealthSource = data?.healthSourceList?.find((el: any) => el?.identifier === data?.healthSourceIdentifier)
  const mappedQueries = currentHealthSource?.spec?.queries
  if (currentHealthSource && !isEmpty(mappedQueries)) {
    const mappedServicesAndEnvs = new Map<string, MapGCOLogsQueryToService>()
    for (const query of mappedQueries) {
      mappedServicesAndEnvs.set(query?.name, {
        metricName: query?.name,
        serviceInstance: query?.serviceInstanceIdentifier,
        messageIdentifier: query?.messageIdentifier,
        query: query?.query
      })
    }
    return mappedServicesAndEnvs
  } else {
    return new Map<string, MapGCOLogsQueryToService>()
  }
}
