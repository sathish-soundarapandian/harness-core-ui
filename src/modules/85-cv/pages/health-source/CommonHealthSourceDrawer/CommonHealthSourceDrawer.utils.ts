/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Connectors } from '@connectors/constants'
import type { MonitoredServiceRef } from '@cv/pages/monitored-service/components/Configurations/components/Service/Service.types'
import type { ChangeSourceDTO, HealthSource } from 'services/cv'
import { GCOProduct } from '../connectors/GCOMetricsHealthSource/GCOMetricsHealthSource.utils'
import type { RowData, SourceDataInterface, UpdatedHealthSource } from './CommonHealthSourceDrawer.types'

export function addProductFieldToStackdriverMetrics(healthSources?: UpdatedHealthSource[]): void {
  for (const healthSource of healthSources || []) {
    if (healthSource?.type !== 'Stackdriver') {
      continue
    }
    ;(healthSource.spec as any).feature = GCOProduct.CLOUD_METRICS
    ;(healthSource.spec as any).product = {
      label: GCOProduct.CLOUD_METRICS,
      value: GCOProduct.CLOUD_METRICS
    }
    return
  }
}

function getSourceType(sourceType?: HealthSource['type']): string | undefined {
  switch (sourceType) {
    case 'CustomHealthLog':
    case 'CustomHealthMetric':
      return Connectors.CUSTOM_HEALTH
    default:
      return sourceType
  }
}

export const createHealthSourceDrawerFormData = ({
  isEdit,
  monitoredServiceRef,
  serviceRef,
  environmentRef,
  tableData,
  rowData,
  changeSources,
  existingMetricDetails
}: {
  isEdit: boolean
  monitoredServiceRef: MonitoredServiceRef
  serviceRef: string
  environmentRef: string
  tableData: Array<RowData>
  rowData?: RowData | null
  changeSources: ChangeSourceDTO[]
  existingMetricDetails: HealthSource | null
}): SourceDataInterface => {
  let sourceData: SourceDataInterface = {
    isEdit,
    healthSourceList: tableData,
    serviceRef,
    environmentRef,
    monitoredServiceRef,
    changeSources,
    existingMetricDetails
  }

  // when user is adding healthsource in create mode
  // we will have rowData but isEdit is false
  if (isEdit || rowData) {
    if (!rowData) return sourceData
    addProductFieldToStackdriverMetrics(sourceData.healthSourceList)
    sourceData = {
      ...sourceData,
      isEdit: !!rowData,
      healthSourceName: rowData?.name,
      healthSourceIdentifier: rowData?.identifier,
      sourceType: getSourceType(rowData?.type),
      connectorRef: rowData?.spec?.connectorRef,
      existingMetricDetails
    }
  }

  return sourceData
}
