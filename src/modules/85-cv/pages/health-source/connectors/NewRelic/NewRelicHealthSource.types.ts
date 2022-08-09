/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { MetricPackDTO } from 'services/cv'
import type { HealthSourceTypes } from '../../types'

export type MapNewRelicMetric = {
  metricName: string
  metricIdentifier?: string
  groupName: SelectOption
  query: string
  metricValue: string
  timestamp: string
  timestampFormat: string
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  riskCategory?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
}

export type SelectedAndMappedMetrics = {
  selectedMetric: string
  mappedMetrics: Map<string, MapNewRelicMetric>
}

export type CreatedMetricsWithSelectedIndex = {
  createdMetrics: string[]
  selectedMetricIndex: number
}

export interface NewRelicData {
  name: string
  identifier: string
  connectorRef: { connector: { identifier: string } }
  isEdit: boolean
  product: string
  type: HealthSourceTypes
  applicationName: string
  applicationId: string
  metricPacks?: MetricPackDTO[]
  mappedServicesAndEnvs: Map<string, MapNewRelicMetric>
}
export interface InitNewRelicCustomFormInterface {
  sli: boolean
  groupName: {
    label: string
    value: string
  }
  query: string
  metricValue: string
  timestamp: string
  serviceInstanceIdentifier: string
  healthScore: boolean
  continuousVerification: boolean
  serviceInstanceMetricPath?: string
  riskCategory?: string
  metricIdentifier?: string
}
