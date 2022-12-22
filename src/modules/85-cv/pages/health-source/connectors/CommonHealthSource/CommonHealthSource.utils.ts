/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { QueryRecordsRequest } from 'services/cv'
import type { StringsMap } from 'stringTypes'
import { initCustomForm, ProviderTypes, FIELD_ENUM } from './CommonHealthSource.constants'
import type {
  HealthSourceInitialData,
  HealthSourceSetupSource,
  HealthSourceConfig,
  CommonCustomMetricFormikInterface,
  FieldMapping
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

/**
 * Common health source config relates helper functions
 *
 */

/**
 *
 * @param healthSourceConfig
 * @returns boolean
 *
 * It returns true if
 * custom metrics is enabled (AND)
 * Has fieldMappings in the configs (AND)
 * Atleast one field in fieldMappings contains component type as JsonSelector.
 */
export function getIsLogsTableVisible(healthSourceConfig: HealthSourceConfig): boolean {
  const { customMetrics } = healthSourceConfig || {}

  if (!customMetrics?.enabled || !customMetrics?.logsTable?.enabled || !customMetrics?.fieldMappings) {
    return false
  }

  return customMetrics?.fieldMappings.some(field => field.type === FIELD_ENUM.JSON_SELECTOR)
}

export function getFieldsDefaultValuesFromConfig(
  values: CommonCustomMetricFormikInterface,
  logsTableConfig?: FieldMapping[]
): Partial<CommonCustomMetricFormikInterface> {
  if (!Array.isArray(logsTableConfig) || !values) {
    return {}
  }

  const valuesToUpdate: Partial<CommonCustomMetricFormikInterface> = {}

  for (const field of logsTableConfig) {
    if (!values[field.identifier] && field.defaultValue) {
      ;(valuesToUpdate[field.identifier] as string) = field.defaultValue
    }
  }

  return valuesToUpdate
}

export function getTemplateValuesForConfigFields(
  values: CommonCustomMetricFormikInterface,
  logsTableConfig?: FieldMapping[]
): Partial<CommonCustomMetricFormikInterface> {
  if (!Array.isArray(logsTableConfig) || !values) {
    return {}
  }

  const valuesToUpdate: Partial<CommonCustomMetricFormikInterface> = {}

  for (const field of logsTableConfig) {
    const isCurrentValueIsExpression = getMultiTypeFromValue(values[field.identifier]) === MultiTypeInputType.EXPRESSION
    if (!isCurrentValueIsExpression) {
      ;(valuesToUpdate[field.identifier] as string) = RUNTIME_INPUT_VALUE
    }
  }

  return valuesToUpdate
}

// 🚨 TODO: Type it correctly
export function getProviderType(sourceData: any): QueryRecordsRequest['providerType'] | null {
  if (!sourceData) {
    return null
  }

  const { sourceType, product } = sourceData
  const { value } = product || {}

  return ProviderTypes[`${sourceType}_${value}`]
}

export function getRequestBodyForSampleLogs(
  providerType: QueryRecordsRequest['providerType'],
  otherValues: {
    query: string
    connectorIdentifier: string
    serviceInstance: string
  }
): QueryRecordsRequest | null {
  switch (providerType) {
    case ProviderTypes.SumoLogic_LOGS: {
      const currentTime = new Date()
      const startTime = currentTime.setHours(currentTime.getHours() - 2)

      const { connectorIdentifier, query, serviceInstance } = otherValues

      return {
        startTime,
        endTime: Date.now(),
        providerType,
        query,
        connectorIdentifier,
        healthSourceQueryParams: {
          serviceInstanceField: serviceInstance
        }
      }
    }
    default: {
      return null
    }
  }
}

export const getIsConnectorRuntimeOrExpression = (connectorRef?: HealthSourceInitialData['connectorRef']): boolean => {
  if (!connectorRef) {
    return false
  }

  const connectorValue = (connectorRef?.value || connectorRef) as string
  return getMultiTypeFromValue(connectorValue) !== MultiTypeInputType.FIXED
}

export const getIsQueryRuntimeOrExpression = (query?: string): boolean => {
  if (!query) {
    return false
  }

  return getMultiTypeFromValue(query) !== MultiTypeInputType.FIXED
}
