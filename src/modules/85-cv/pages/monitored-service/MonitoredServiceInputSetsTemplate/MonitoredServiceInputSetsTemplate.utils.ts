/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, defaultTo, get, set, isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { AWSDataSourceType } from '@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.constant'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { CustomHealthMetric } from '@cv/pages/health-source/HealthSourceDrawer/component/customiseHealthSource/CustomiseHealthSource.constant'
import type { MonitoredServiceDTO } from 'services/cv'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { getValidationLabelByNameForTemplateInputs } from '../CVMonitoredService/MonitoredServiceInputSetsTemplate.utils'
import type { MonitoredServiceInputSetInterface } from './MonitoredServiceInputSetsTemplate.types'
import { GcoQueryKey } from './MonitoredServiceInputSetsTemplate.constants'

export const getLabelByName = (name: string, getString: UseStringsReturn['getString']): string => {
  switch (name) {
    case 'applicationName':
      return getString('pipeline.applicationName')
    case 'tierName':
      return getString('cv.monitoringSources.appD.tierName')
    case 'completeMetricPath':
      return getString('cv.monitoringSources.appD.completeMetricPath')
    case 'serviceInstanceMetricPath':
      return getString('cv.monitoringSources.appD.serviceInstanceMetricPath')
    case 'serviceInstanceFieldName':
    case 'serviceInstanceIdentifier':
    case 'serviceInstanceField':
      return getString('cv.monitoringSources.appD.serviceInstanceFieldName')
    case 'connectorRef':
      return getString('connector')
    case 'query':
    case 'nrql':
    case 'jsonMetricDefinition':
    case 'jsonMetricDefinitionString':
      return getString('cv.query')
    case 'category':
      return `Category for ${getString('cv.monitoringSources.riskCategoryLabel')}`
    case 'metricType':
      return `Metric type for ${getString('cv.monitoringSources.riskCategoryLabel')}`
    case 'indexes':
    case 'index':
      return getString('cv.monitoringSources.datadogLogs.logIndexesLabel')
    case 'messageIdentifier':
      return getString('cv.monitoringSources.gcoLogs.messageIdentifierTitle')
    case 'metricValueJsonPath':
      return getString('cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.label')
    case 'timestampJsonPath':
    case 'timeStampIdentifier':
      return getString('cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.label')
    default:
      return name
  }
}

export const getNestedByCondition = (
  spec: any,
  list: { name: string; path: string }[],
  basePath: string,
  isValid: (value?: string) => boolean
): { name: string; path: string }[] => {
  let clonedList = cloneDeep(list)
  Object.entries(defaultTo(spec, {})).forEach(item => {
    if (isValid(item[1] as string)) {
      clonedList.push({ name: item[0], path: `${basePath}.${item[0]}` })
    } else if (typeof item[1] === 'object') {
      if (Array.isArray(item[1])) {
        item[1].forEach((metric, index) => {
          clonedList = getNestedByCondition(metric, clonedList, `${basePath}.${item[0]}.${index}`, isValid)
        })
      } else {
        clonedList = getNestedByCondition(spec[item[0]], clonedList, `${basePath}.${item[0]}`, isValid)
      }
    }
  })
  return clonedList
}

export const getPathForKey = (
  spec: { [key: string]: any },
  list: { name: string; path: string }[],
  basePath: string,
  key: string
): { name: string; path: string }[] => {
  let clonedList = cloneDeep(list)
  Object.entries(defaultTo(spec, {})).forEach(item => {
    if (item[0] === key) {
      clonedList.push({ name: item[0], path: `${basePath}.${item[0]}` })
    } else if (typeof item[1] === 'object') {
      if (Array.isArray(item[1])) {
        item[1].forEach((metric, index) => {
          clonedList = getPathForKey(
            metric,
            clonedList,
            basePath ? `${basePath}.${item[0]}.${index}` : `${item[0]}.${index}`,
            key
          )
        })
      } else {
        clonedList = getPathForKey(spec[item[0]], clonedList, basePath ? `${basePath}.${item[0]}` : `${item[0]}`, key)
      }
    }
  })
  return clonedList
}

export const getNestedRuntimeInputs = (
  spec: any,
  list: { name: string; path: string }[],
  basePath: string
): { name: string; path: string }[] => {
  return getNestedByCondition(
    spec,
    list,
    basePath,
    value => getMultiTypeFromValue(value as string) === MultiTypeInputType.RUNTIME
  )
}

export const getNestedEmptyFieldsWithPath = (
  spec: MonitoredServiceInputSetInterface,
  list: { name: string; path: string }[],
  basePath: string
): { name: string; path: string }[] => {
  return getNestedByCondition(spec, list, basePath, value => isEmpty(value as string))
}

export const healthSourceTypeMapping = (type: HealthSourceTypes): ConnectorInfoDTO['type'] => {
  switch (type) {
    case HealthSourceTypes.DatadogLog as ConnectorInfoDTO['type']:
    case HealthSourceTypes.DatadogMetrics as ConnectorInfoDTO['type']:
      return HealthSourceTypes.Datadog
    case HealthSourceTypes.StackdriverLog as ConnectorInfoDTO['type']:
    case HealthSourceTypes.StackdriverMetrics as ConnectorInfoDTO['type']:
      return Connectors.GCP
    case HealthSourceTypes.Elk as ConnectorInfoDTO['type']:
      return Connectors.ELK
    case HealthSourceTypes.CloudWatchMetrics as ConnectorInfoDTO['type']:
      return Connectors.AWS
    case HealthSourceTypes.SumologicLogs:
    case HealthSourceTypes.SumologicMetrics:
      return Connectors.SUMOLOGIC
    case HealthSourceTypes.SignalFX:
    case HealthSourceTypes.SplunkSignalFXMetrics:
      return Connectors.SignalFX
    case HealthSourceTypes.GrafanaLoki as ConnectorInfoDTO['type']:
    case HealthSourceTypes.GrafanaLokiLogs as ConnectorInfoDTO['type']:
    case HealthSourceTypes.CustomHealth as ConnectorInfoDTO['type']:
    case CustomHealthMetric.Metric as ConnectorInfoDTO['type']:
    case CustomHealthMetric.Log as ConnectorInfoDTO['type']:
      return Connectors.CUSTOM
    default:
      return type as ConnectorInfoDTO['type']
  }
}

export const healthSourceTypeMappingForReferenceField = (
  type: ConnectorInfoDTO['type'],
  dataSourceType?: string
): ConnectorInfoDTO['type'] => {
  if (dataSourceType === AWSDataSourceType) {
    return Connectors.AWS
  }

  switch (type) {
    case HealthSourceTypes.Elk as ConnectorInfoDTO['type']:
      return Connectors.ELK
    case HealthSourceTypes.GrafanaLoki as ConnectorInfoDTO['type']:
      return Connectors.CUSTOM
    default:
      return type
  }
}

export const validateInputSet = (
  value: MonitoredServiceInputSetInterface,
  getString: UseStringsReturn['getString']
): { [key: string]: string } => {
  const datawithpath = getNestedEmptyFieldsWithPath(value, [], '')
  const errors: { [key: string]: string } = {}
  datawithpath.forEach(item => {
    errors[item.path.slice(1)] = getValidationLabelByNameForTemplateInputs(item.name, getString)
  })
  return errors
}

export const getPopulateSource = (
  value: MonitoredServiceInputSetInterface
): { sources?: MonitoredServiceDTO['sources'] } => {
  const clonedSource = cloneDeep(value.sources)
  const populateSource = clonedSource ? { sources: clonedSource } : {}
  const valueList = getPathForKey(populateSource, [], '', GcoQueryKey)

  if (valueList.length) {
    valueList.forEach(item => {
      const stringToObjectValue = get(populateSource, item.path)
      set(populateSource, item.path, stringToObjectValue)
    })
  }
  return populateSource
}
