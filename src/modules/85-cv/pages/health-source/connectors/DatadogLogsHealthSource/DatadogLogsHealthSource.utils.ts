/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import type {
  DatadogLogsHealthSpec,
  DatadogLogsInfo,
  DatadogLogsQueryDefinition,
  DatadogLogsSetupSource,
  SelectedAndMappedMetrics,
  UpdateSelectedMetricsMap
} from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/DatadogLogsHealthSource.type'
import type {
  SourceDataInterface,
  UpdatedHealthSource
} from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { DatadogProduct } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'
import type { UseStringsReturn } from 'framework/strings'
import { MapDatadogLogsFieldNames } from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/components/DatadogLogsMapToService.constants'

export function initializeSelectedMetricsMap(
  defaultSelectedMetricName: string,
  logsDefinitions?: Map<string, DatadogLogsInfo>,
  isConnectorRuntimeOrExpression = false
): SelectedAndMappedMetrics {
  return {
    selectedMetric: Array.from(logsDefinitions?.keys() || [])?.[0] || defaultSelectedMetricName,
    mappedMetrics:
      logsDefinitions ||
      new Map([
        [
          defaultSelectedMetricName,
          {
            metricName: defaultSelectedMetricName,
            query: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : '',
            indexes: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : [],
            serviceInstanceIdentifierTag: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : ''
          }
        ]
      ])
  }
}

export function updateSelectedMetricsMap({
  updatedMetric,
  oldMetric,
  mappedMetrics,
  formikProps,
  isConnectorRuntimeOrExpression = false
}: UpdateSelectedMetricsMap): SelectedAndMappedMetrics {
  const updatedMap = new Map(mappedMetrics)

  // in the case where user updates metric name, update the key for current value
  if (oldMetric !== formikProps.values?.metricName) {
    updatedMap.delete(oldMetric)
  }

  // if newly created metric create form object
  if (!updatedMap.has(updatedMetric)) {
    updatedMap.set(updatedMetric, {
      metricName: updatedMetric,
      query: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : '',
      indexes: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : [],
      serviceInstanceIdentifierTag: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : ''
    })
  }

  // update map with current form data
  if (formikProps.values?.metricName) {
    updatedMap.set(formikProps.values.metricName, formikProps.values as DatadogLogsInfo)
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function transformDatadogHealthSourceToDatadogLogsSetupSource(
  sourceData: SourceDataInterface & DatadogLogsSetupSource,
  isTemplate?: boolean
): DatadogLogsSetupSource {
  const existingHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.name === sourceData.healthSourceName
  )

  if (!existingHealthSource) {
    return {
      isEdit: false,
      healthSourceIdentifier: sourceData.healthSourceIdentifier,
      logsDefinitions: new Map<string, DatadogLogsInfo>(),
      healthSourceName: sourceData.healthSourceName,
      connectorRef:
        typeof sourceData.connectorRef === 'string' ? sourceData.connectorRef : sourceData.connectorRef?.value,
      product: { label: DatadogProduct.CLOUD_LOGS, value: DatadogProduct.CLOUD_LOGS }
    }
  }

  const setupSource: DatadogLogsSetupSource = {
    isEdit: sourceData.isEdit,
    logsDefinitions: new Map(),
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    healthSourceName: sourceData.healthSourceName,
    product: sourceData.product,
    connectorRef: sourceData.connectorRef
  }

  for (const logQueryDefinition of (existingHealthSource?.spec as DatadogLogsHealthSpec)?.queries || []) {
    if (logQueryDefinition?.name) {
      setupSource.logsDefinitions.set(logQueryDefinition.name, {
        metricName: logQueryDefinition.name,
        query: logQueryDefinition.query || '',
        serviceInstanceIdentifierTag: getServiceInstanceTag(logQueryDefinition, isTemplate),
        indexes:
          getMultiTypeFromValue(logQueryDefinition?.indexes) !== MultiTypeInputType.FIXED
            ? (logQueryDefinition?.indexes as unknown as SelectOption[])
            : Array.isArray(logQueryDefinition.indexes)
            ? logQueryDefinition.indexes?.map(logIndex => {
                return { value: logIndex, label: logIndex }
              }) || []
            : []
      })
    }
  }

  return setupSource
}

const getServiceInstanceTag = (
  logQueryDefinition: DatadogLogsQueryDefinition,
  isTemplate?: boolean
): string | SelectOption | undefined => {
  const { serviceInstanceIdentifier } = logQueryDefinition
  if (!isTemplate) {
    return serviceInstanceIdentifier
  } else if (isTemplate && typeof serviceInstanceIdentifier === 'string') {
    if (getMultiTypeFromValue(serviceInstanceIdentifier) === MultiTypeInputType.FIXED) {
      return {
        label: serviceInstanceIdentifier,
        value: serviceInstanceIdentifier
      }
    }
  }
  return serviceInstanceIdentifier
}

export function transformDatadogLogsSetupSourceToHealthSource(
  setupSource: DatadogLogsSetupSource
): UpdatedHealthSource {
  const dsConfig: UpdatedHealthSource = {
    type: HealthSourceTypes.DatadogLog as UpdatedHealthSource['type'],
    identifier: setupSource.healthSourceIdentifier,
    name: setupSource.healthSourceName,
    spec: {
      connectorRef:
        typeof setupSource?.connectorRef === 'string' ? setupSource?.connectorRef : setupSource?.connectorRef?.value,
      feature: DatadogProduct.CLOUD_LOGS,
      queries: []
    }
  }

  for (const entry of setupSource.logsDefinitions.entries()) {
    const { metricName, query, serviceInstanceIdentifierTag, indexes }: DatadogLogsInfo = entry[1]

    if (!metricName || !query) {
      continue
    }

    const logsHealthSpec = dsConfig.spec as DatadogLogsHealthSpec
    logsHealthSpec.queries.push({
      query,
      name: metricName,
      identifier: metricName.split(' ').join('_'),
      serviceInstanceIdentifier:
        typeof serviceInstanceIdentifierTag === 'string'
          ? serviceInstanceIdentifierTag
          : (serviceInstanceIdentifierTag?.value as string),
      indexes:
        typeof indexes === 'string' ? indexes : indexes?.map(logIndexOption => logIndexOption.value as string) || []
    })
  }
  return dsConfig
}

export function validateMappings(
  getString: UseStringsReturn['getString'],
  createdMetrics: string[],
  selectedMetricIndex: number,
  values?: DatadogLogsInfo
): { [fieldName: string]: string } {
  const requiredFieldErrors = {
    ...(!values?.metricName && {
      [MapDatadogLogsFieldNames.METRIC_NAME]: getString('cv.monitoringSources.queryNameValidation')
    }),
    ...(!values?.query && {
      [MapDatadogLogsFieldNames.QUERY]: getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query')
    }),
    ...(!values?.serviceInstanceIdentifierTag && {
      [MapDatadogLogsFieldNames.SERVICE_INSTANCE_IDENTIFIER_TAG]: getString(
        'cv.monitoringSources.gcoLogs.validation.serviceInstance'
      )
    })
  }

  const duplicateNames = createdMetrics?.filter((name, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return name === values?.metricName
  })

  if (values?.metricName && duplicateNames.length) {
    requiredFieldErrors[MapDatadogLogsFieldNames.METRIC_NAME] = getString(
      'cv.monitoringSources.gcoLogs.validation.queryNameUnique'
    )
  }
  return requiredFieldErrors
}
