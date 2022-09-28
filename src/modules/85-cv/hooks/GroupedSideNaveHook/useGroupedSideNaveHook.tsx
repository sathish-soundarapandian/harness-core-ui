/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState } from 'react'
import { flatten } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type {
  CreatedMetricsWithSelectedIndex,
  CustomSelectedAndMappedMetrics,
  GroupedCreatedMetrics
} from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import {
  initializeSelectedMetricsMap,
  initializeCreatedMetrics,
  initGroupedCreatedMetrics
} from '@cv/pages/health-source/common/CustomMetric/CustomMetric.utils'

interface UseGroupedSideNaveHookInterface {
  defaultCustomMetricName: string
  initCustomMetricData: any
  mappedServicesAndEnvs: Map<string, any>
}

export default function useGroupedSideNaveHook(props: UseGroupedSideNaveHookInterface) {
  const { getString } = useStrings()
  const { defaultCustomMetricName, initCustomMetricData, mappedServicesAndEnvs } = props
  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<CustomSelectedAndMappedMetrics>(() =>
    initializeSelectedMetricsMap(defaultCustomMetricName, initCustomMetricData, mappedServicesAndEnvs)
  )

  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState<CreatedMetricsWithSelectedIndex>(() =>
    initializeCreatedMetrics(defaultCustomMetricName, selectedMetric, mappedMetrics)
  )

  const [groupedCreatedMetrics, setGroupedCreatedMetrics] = useState<GroupedCreatedMetrics>(() =>
    initGroupedCreatedMetrics(mappedMetrics, getString)
  )

  const groupedCreatedMetricsList = flatten(Object.values(groupedCreatedMetrics))
    .map(item => item.metricName)
    .filter(item => Boolean(item)) as string[]

  return {
    createdMetrics,
    mappedMetrics,
    selectedMetric,
    selectedMetricIndex,
    groupedCreatedMetrics,
    groupedCreatedMetricsList,
    setMappedMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics
  }
}
