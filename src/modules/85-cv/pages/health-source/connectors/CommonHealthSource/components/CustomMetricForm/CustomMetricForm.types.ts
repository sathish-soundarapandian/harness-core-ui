/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { GroupedCreatedMetrics } from '@cv/components/CommonMultiItemsSideNav/components/CommonSelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type {
  CreatedMetricsWithSelectedIndex,
  CustomSelectedAndMappedMetrics
} from '@cv/pages/health-source/common/CommonCustomMetric/CommonCustomMetric.types'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping,
  HealthSourceConfig,
  HealthSourceInitialData
} from '../../CommonHealthSource.types'

export interface AddMetricForm {
  identifier: string
  metricName: string
  groupName: SelectOption | string
}

export interface GetMultiTypeRecordInitialValueParams {
  filteredFieldsMapping?: FieldMapping[]
  isTemplate?: boolean
  formValues: CommonCustomMetricFormikInterface
}

export interface CustomMetricFormContainerProps {
  connectorIdentifier: string
  isMetricThresholdEnabled: boolean
  mappedMetrics: CustomSelectedAndMappedMetrics['mappedMetrics']
  selectedMetric: CustomSelectedAndMappedMetrics['selectedMetric']
  createdMetrics: CreatedMetricsWithSelectedIndex['createdMetrics']
  groupedCreatedMetrics: GroupedCreatedMetrics
  isTemplate?: boolean
  expressions?: string[]
  healthSourceConfig: HealthSourceConfig
  healthSourceData: HealthSourceInitialData
  setConfigurationsFormikFieldValue: (key: string, data: any) => void
}

export type LogFieldsMultiTypeState = Record<Partial<keyof CommonCustomMetricFormikInterface>, MultiTypeInputType>
