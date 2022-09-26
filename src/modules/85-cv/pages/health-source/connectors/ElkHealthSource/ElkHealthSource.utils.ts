/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { HealthSourceTypes } from '../../types'
import type { ElkHealthSourcePayload, MapElkQueryToService } from './components/MapQueriesToHarnessService/types'
import type { ElkHealthSourceInfo } from './ElkHealthSource.types'

export function createElkHealthSourcePayload(setupSource: ElkHealthSourceInfo): ElkHealthSourcePayload {
  const ElkHealthSourcePayload: ElkHealthSourcePayload = {
    type: HealthSourceTypes.Elk,
    identifier: setupSource?.identifier as string,
    name: setupSource?.name as string,
    spec: {
      connectorRef: (typeof setupSource.connectorRef === 'string'
        ? setupSource.connectorRef
        : setupSource.connectorRef?.value) as string,
      feature: 'ELK Logs',
      queries: []
    }
  }

  for (const entry of setupSource?.mappedServicesAndEnvs?.entries() || []) {
    const {
      metricName,
      query,
      serviceInstance,
      messageIdentifier,
      logIndexes,
      timeStampFormat,
      identify_timestamp
    }: MapElkQueryToService = entry[1]
    ElkHealthSourcePayload.spec.queries.push({
      name: metricName,
      index: logIndexes,
      messageIdentifier: messageIdentifier,
      query: query,
      serviceInstanceIdentifier: serviceInstance,
      timeStampFormat: timeStampFormat,
      timeStampIdentifier: identify_timestamp
    })
  }
  return ElkHealthSourcePayload
}

export function buildElkHealthSourceInfo(params: ProjectPathProps, data: any): ElkHealthSourceInfo & ProjectPathProps {
  return {
    ...params,
    name: data?.healthSourceName,
    identifier: data?.healthSourceIdentifier,
    connectorRef: data?.connectorRef,
    isEdit: data?.isEdit,
    product: data?.product?.value,
    type: HealthSourceTypes.Elk,
    mappedServicesAndEnvs: getMappedServicesAndEnvs(data)
  }
}

const getMappedServicesAndEnvs = (data: any): Map<string, MapElkQueryToService> => {
  const currentHealthSource = data?.healthSourceList?.find((el: any) => el?.identifier === data?.healthSourceIdentifier)
  const mappedQueries = currentHealthSource?.spec?.queries
  if (currentHealthSource && !isEmpty(mappedQueries)) {
    const mappedServicesAndEnvs = new Map<string, MapElkQueryToService>()
    for (const query of mappedQueries) {
      mappedServicesAndEnvs.set(query?.name, {
        metricName: query?.name,
        serviceInstance: query?.serviceInstanceIdentifier,
        query: query?.query,
        timeStampFormat: query?.timeStampFormat,
        logIndexes: query?.index,
        identify_timestamp: query?.timeStampIdentifier,
        messageIdentifier: query?.messageIdentifier
      })
    }
    return mappedServicesAndEnvs
  } else {
    return new Map<string, MapElkQueryToService>()
  }
}
