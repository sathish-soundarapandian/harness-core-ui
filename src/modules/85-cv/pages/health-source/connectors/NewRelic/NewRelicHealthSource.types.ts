/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { GroupedMetric } from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type { TimeSeriesMetricPackDTO } from 'services/cv'
import type { CustomMappedMetric, CustomSelectedAndMappedMetrics } from '../../common/CustomMetric/CustomMetric.types'
import type { MetricThresholdType } from '../../common/MetricThresholds/MetricThresholds.types'
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
  metricPacks?: TimeSeriesMetricPackDTO[]
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

export interface NonCustomMetricFields {
  newRelicApplication:
    | string
    | {
        label: string
        value: string
      }
  metricPacks?: TimeSeriesMetricPackDTO[]
  metricData: { [key: string]: boolean }
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
}

export interface PersistCustomMetricInterface {
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  nonCustomFeilds: NonCustomMetricFields
  formikValues: any
  setMappedMetrics: React.Dispatch<React.SetStateAction<CustomSelectedAndMappedMetrics>>
}

export interface GroupedCreatedMetrics {
  [Key: string]: GroupedMetric[]
}

export interface MetricThresholdCommonProps {
  formikValues: any
  groupedCreatedMetrics: GroupedCreatedMetrics
  metricPacks: TimeSeriesMetricPackDTO[]
  setThresholdState: React.Dispatch<React.SetStateAction<NonCustomMetricFields>>
}

export type NewRelicMetricThresholdContextType = MetricThresholdCommonProps
