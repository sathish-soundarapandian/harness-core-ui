/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { INDEXES } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/components/MonitoredServiceInputTemplatesHealthSources/MonitoredServiceInputTemplatesHealthSources.constants'

export const getNestedRuntimeInputs = (
  spec: any,
  list: any[],
  basePath: string
): { name: string; path: string; value: string }[] => {
  let clonedList = cloneDeep(list)
  Object.entries(spec).forEach(item => {
    if (getMultiTypeFromValue(item[1] as string) === MultiTypeInputType.RUNTIME) {
      clonedList.push({ name: item[0], path: `${basePath}.${item[0]}`, value: item[1] })
    } else if (typeof item[1] === 'object') {
      if (Array.isArray(item[1])) {
        item[1].forEach((metric, index) => {
          clonedList = getNestedRuntimeInputs(metric, clonedList, `${basePath}.${item[0]}.${index}`)
        })
      } else {
        clonedList = getNestedRuntimeInputs(spec[item[0]], clonedList, `${basePath}.${item[0]}`)
      }
    }
  })
  return clonedList
}

export const getNestedFields = (
  spec: any,
  list: any[],
  basePath: string
): { name: string; path: string; value: string }[] => {
  let clonedList = cloneDeep(list)

  Object.entries(spec).forEach(item => {
    if (item[0] === INDEXES && Array.isArray(item[1])) {
      clonedList.push({ name: item[0], path: `${basePath}.${item[0]}`, value: item[1]?.join('') })
    } else if (typeof item[1] === 'object') {
      if (Array.isArray(item[1])) {
        item[1].forEach((metric, index) => {
          clonedList = getNestedFields(metric, clonedList, `${basePath}.${item[0]}.${index}`)
        })
      } else {
        clonedList = getNestedFields(spec[item[0]], clonedList, `${basePath}.${item[0]}`)
      }
    } else {
      clonedList.push({ name: item[0], path: `${basePath}.${item[0]}`, value: item[1] })
    }
  })
  return clonedList
}

export const getLabelByName = (name: string, getString: UseStringsReturn['getString']): string => {
  switch (name) {
    case 'applicationName':
      return getString('cv.healthSource.connectors.AppDynamics.applicationLabel')
    case 'tierName':
      return getString('cv.healthSource.connectors.AppDynamics.trierLabel')
    case 'completeMetricPath':
      return getString('cv.healthSource.connectors.AppDynamics.metricPathType.text')
    case 'serviceInstanceMetricPath':
      return getString('cv.healthSource.connectors.AppDynamics.serviceInstance')
    case 'serviceInstanceFieldName':
      return getString('cv.monitoringSources.serviceInstanceIdentifier')
    case 'connectorRef':
      return getString('connectors.selectConnector')
    case 'query':
      return getString('cv.query')
    case 'category':
      return `Category for ${getString('cv.monitoringSources.riskCategoryLabel')}`
    case 'metricType':
      return `Metric type for ${getString('cv.monitoringSources.riskCategoryLabel')}`
    default:
      return name
  }
}

export const getValidationLabelByNameForTemplateInputs = (
  name: string,
  getString: UseStringsReturn['getString']
): string => {
  switch (name) {
    case 'applicationName':
      return getString('connectors.cdng.validations.applicationNameValidation')
    case 'serviceRef':
      return getString('cv.monitoringSources.serviceValidation')
    case 'environmentRef':
      return getString('cv.monitoringSources.envValidation')
    case 'tierName':
      return getString('connectors.cdng.validations.tierNameValidation')
    case 'completeMetricPath':
      return getString('connectors.cdng.validations.completeMetricPathValidation')
    case 'serviceInstanceMetricPath':
      return getString('connectors.cdng.validations.serviceInstanceMetricPathValidation')
    case 'serviceInstanceFieldName':
    case 'serviceInstanceField':
      return getString('connectors.cdng.validations.serviceInstanceFieldNameValidation')
    case 'connectorRef':
      return getString('connectors.validation.connectorIsRequired')
    case 'query':
      return getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query')
    case 'category':
      return `Category for ${getString('cv.monitoringSources.riskCategoryLabel')}`
    case 'metricType':
      return `Metric type for ${getString('cv.monitoringSources.riskCategoryLabel')}`
    case 'serviceInstanceIdentifier':
      return getString('cv.monitoringSources.prometheus.validation.serviceInstanceIdentifier')
    case 'indexes':
    case 'index':
      return `${getString('cv.monitoringSources.datadogLogs.logIndexesLabel')} is required`
    case 'timestampJsonPath':
    case 'timeStampIdentifier':
      return `${getString('cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.label')} is required`
    case 'messageIdentifier':
      return `${getString('cv.monitoringSources.gcoLogs.messageIdentifierTitle')} is required`
    default:
      return `${name} is required`
  }
}
