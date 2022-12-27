/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'
import { groupBy } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type {
  GroupedCreatedMetrics,
  GroupedMetric
} from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type {
  CustomSelectedAndMappedMetrics,
  CommonUpdateSelectedMetricsMapInterface,
  CreatedMetricsWithSelectedIndex,
  InitCustomFormData,
  InitHealthSourceCustomFormInterface
} from './CommonCustomMetric.types'
import type { CommonCustomMetricFormikInterface } from '../../connectors/CommonHealthSource/CommonHealthSource.types'

export function updateSelectedMetricsMap({
  updatedMetric,
  oldMetric,
  mappedMetrics,
  formikValues,
  initCustomForm,
  isPrimaryMetric
}: CommonUpdateSelectedMetricsMapInterface): {
  selectedMetric: string
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>
} {
  const emptyName = formikValues?.metricName?.length
  if (!emptyName) {
    return { selectedMetric: updatedMetric, mappedMetrics: mappedMetrics }
  }

  const commonUpdatedMap = new Map(mappedMetrics)

  const duplicateName =
    Array.from(mappedMetrics?.keys()).indexOf(formikValues.metricName) > -1 && oldMetric !== formikValues?.metricName
  if (duplicateName) {
    return { selectedMetric: updatedMetric, mappedMetrics: commonUpdatedMap }
  }

  // in the case where user updates metric name, update the key for current value
  if (oldMetric !== formikValues?.metricName) {
    commonUpdatedMap.delete(oldMetric)
  }

  // if newly created metric create form object
  if (!commonUpdatedMap.has(updatedMetric)) {
    const metricIdentifier = updatedMetric.split(' ').join('_')
    const identifierObject = isPrimaryMetric
      ? {
          metricIdentifier,
          identifier: metricIdentifier
        }
      : { metricIdentifier }
    commonUpdatedMap.set(updatedMetric, {
      ...{
        _id: uuid(),
        metricName: updatedMetric,
        ...identifierObject,
        ...initCustomForm
      }
    } as any)
  }

  // update map with current form data
  commonUpdatedMap.set(formikValues.metricName, {
    ...formikValues
  })

  return { selectedMetric: updatedMetric, mappedMetrics: commonUpdatedMap }
}

export const defaultGroupedMetric = (getString: UseStringsReturn['getString']): SelectOption => {
  const createdMetricLabel = getString('cv.addGroupName')
  return { label: createdMetricLabel, value: createdMetricLabel }
}

export const initGroupedCreatedMetrics = (
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>,
  getString: UseStringsReturn['getString']
): GroupedCreatedMetrics =>
  groupBy(getGroupAndMetric(mappedMetrics, getString), function (item) {
    return (item?.groupName as SelectOption)?.label
  })

export const getGroupAndMetric = (
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>,
  getString: UseStringsReturn['getString']
): GroupedMetric[] => {
  return Array.from(mappedMetrics?.values()).map(item => {
    return {
      groupName: item.groupName || defaultGroupedMetric(getString),
      metricName: item.metricName,
      continuousVerification: item.continuousVerification
    }
  })
}

export const getGroupedCreatedMetrics = (
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>,
  getString: UseStringsReturn['getString']
): GroupedCreatedMetrics => {
  const filteredList = Array.from(mappedMetrics?.values()).map((item, index) => {
    return {
      index,
      groupName: item.groupName || defaultGroupedMetric(getString),
      metricName: item.metricName,
      continuousVerification: item.continuousVerification
    }
  })
  return groupBy(filteredList.reverse(), function (item) {
    return (item?.groupName as SelectOption)?.label
  })
}

export function initializeCreatedMetrics(
  defaultSelectedMetricName: string,
  selectedMetric: string,
  mappedMetrics: CustomSelectedAndMappedMetrics['mappedMetrics']
): CreatedMetricsWithSelectedIndex {
  return {
    createdMetrics: Array.from(mappedMetrics.keys()) || [defaultSelectedMetricName],
    selectedMetricIndex: Array.from(mappedMetrics.keys()).findIndex(metric => metric === selectedMetric)
  }
}

export function initializeSelectedMetricsMap(
  defaultSelectedMetricName: string,
  initCustomFormData: InitCustomFormData,
  mappedServicesAndEnvs?: Map<string, CommonCustomMetricFormikInterface>,
  selectedMetricData?: string
): CustomSelectedAndMappedMetrics {
  return {
    selectedMetric:
      selectedMetricData ??
      ((Array.from(mappedServicesAndEnvs?.keys() || [])?.[0] as string) || defaultSelectedMetricName),
    mappedMetrics: (mappedServicesAndEnvs ||
      new Map([[defaultSelectedMetricName, initCustomFormData as InitHealthSourceCustomFormInterface]])) as Map<
      string,
      CommonCustomMetricFormikInterface
    >
  }
}
