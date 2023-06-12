/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GroupedMetric } from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type {
  CommonCustomMetricFormikInterface,
  HealthSourceConfig
} from '../../connectors/CommonHealthSource/CommonHealthSource.types'

export type InitCustomFormData = InitHealthSourceCustomFormInterface

export interface InitHealthSourceCustomFormInterface {
  groupName: {
    label: string
    value: string
  }
  sli: boolean
  healthScore: boolean
  continuousVerification: boolean
  serviceInstanceMetricPath: string
}
export interface GroupedCreatedMetrics {
  [Key: string]: GroupedMetric[]
}

export type CreatedMetricsWithSelectedIndex = {
  createdMetrics: string[]
  selectedMetricIndex: number
}

export type CustomSelectedAndMappedMetrics = {
  selectedMetric: string
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>
}

export interface CommonCustomMetricInterface {
  children: JSX.Element
  selectedMetric: string
  defaultMetricName: string
  tooptipMessage: string
  addFieldLabel: string
  createdMetrics: string[]
  formikValues: CommonCustomMetricFormikInterface
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>
  initCustomForm: InitCustomFormData
  groupedCreatedMetrics?: GroupedCreatedMetrics
  shouldBeAbleToDeleteLastMetric?: boolean
  isPrimaryMetric?: boolean
  filterRemovedMetricNameThresholds?: (metricName: string) => void
  openEditMetricModal: () => void
  defaultServiceInstance?: string
  healthSourceConfig: HealthSourceConfig
}

export interface CommonUpdateSelectedMetricsMapInterface {
  updatedMetric: string
  oldMetric: string
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>
  formikValues: any
  initCustomForm: InitCustomFormData
  isPrimaryMetric?: boolean
}
