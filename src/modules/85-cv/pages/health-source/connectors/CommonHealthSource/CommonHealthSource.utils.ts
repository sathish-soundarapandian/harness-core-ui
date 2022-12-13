/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { StringsMap } from 'stringTypes'
import { initCustomForm } from './CommonHealthSource.constants'
import type {
  HealthSourceInitialData,
  HealthSourceSetupSource,
  CommonCustomMetricFormikInterface
} from './CommonHealthSource.types'

export const createHealthSourceData = (sourceData: any): HealthSourceInitialData => {
  const healthSourceData = {
    name: sourceData?.healthSourceName,
    identifier: sourceData?.healthSourceIdentifier,
    connectorRef: sourceData?.connectorRef,
    isEdit: sourceData?.isEdit,
    product: sourceData?.product,
    type: sourceData?.sourceType,

    // Configurations page

    //Custom metric section
    customMetricsMap: sourceData?.customMetricsMap || new Map(),
    selectedMetric: sourceData?.selectedMetric,

    // metric threshold section
    ignoreThresholds: sourceData?.ignoreThresholds,
    failFastThresholds: sourceData?.failFastThresholds
  }

  return healthSourceData
}

export function transformCommonHealthSourceToSetupSource(
  sourceData: any,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): HealthSourceSetupSource {
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(sourceData.connectorRef) !== MultiTypeInputType.FIXED

  return {
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    healthSourceName: sourceData.healthSourceName,
    connectorRef: sourceData.connectorRef,
    product: sourceData.product,

    customMetricsMap:
      sourceData?.customMetricsMap ||
      (new Map([
        [
          getString('cv.monitoringSources.commonHealthSource.metric'),
          {
            metricName: '',
            identifier: '',
            groupName: '',
            query: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : ''
          }
        ]
      ]) as Map<string, CommonCustomMetricFormikInterface>),
    selectedMetric: sourceData?.selectedMetric,
    ignoreThresholds: sourceData?.ignoreThresholds,
    failFastThresholds: sourceData?.failFastThresholds
  }
}

export const initHealthSourceCustomForm = () => {
  return {
    ...initCustomForm,
    groupName: { label: '', value: '' }
  }
}

export const resetShowCustomMetric = (
  selectedMetric: string,
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>,
  setShowCustomMetric: (value: React.SetStateAction<boolean | undefined>) => void
): void => {
  if (!selectedMetric && !mappedMetrics.size) {
    setShowCustomMetric(false)
  }
}
