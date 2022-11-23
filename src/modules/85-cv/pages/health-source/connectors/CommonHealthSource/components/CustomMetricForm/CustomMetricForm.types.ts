/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { Dispatch, SetStateAction } from 'react'
import type { GroupedCreatedMetrics } from '@cv/components/CommonMultiItemsSideNav/components/CommonSelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type {
  CreatedMetricsWithSelectedIndex,
  CustomSelectedAndMappedMetrics
} from '@cv/pages/health-source/common/CommonCustomMetric/CommonCustomMetric.types'
import type { NonCustomFeildsInterface } from '../../../AppDynamics/AppDHealthSource.types'
import type { HealthSourceConfig, HealthSourceInitialData } from '../../CommonHealthSource.types'

export interface AddMetricForm {
  identifier: string
  metricName: string
  groupName: SelectOption | string
}

export interface CustomMetricFormContainerProps {
  connectorIdentifier: string
  isMetricThresholdEnabled: boolean
  mappedMetrics: CustomSelectedAndMappedMetrics['mappedMetrics']
  selectedMetric: CustomSelectedAndMappedMetrics['selectedMetric']
  setMappedMetrics: Dispatch<SetStateAction<CustomSelectedAndMappedMetrics>>
  createdMetrics: CreatedMetricsWithSelectedIndex['createdMetrics']
  groupedCreatedMetrics: GroupedCreatedMetrics
  setCreatedMetrics: Dispatch<SetStateAction<CreatedMetricsWithSelectedIndex>>
  setGroupedCreatedMetrics: Dispatch<SetStateAction<GroupedCreatedMetrics>>
  nonCustomFeilds: NonCustomFeildsInterface
  setNonCustomFeilds: Dispatch<SetStateAction<NonCustomFeildsInterface>>
  isTemplate?: boolean
  expressions?: string[]
  healthSourceConfig: HealthSourceConfig
  healthSourceData: HealthSourceInitialData
}
