/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'
import { cloneDeep, groupBy } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type {
  GroupedCreatedMetrics,
  GroupedMetric
} from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type { BaseHealthSourceMetricInfo } from '@cv/pages/health-source/common/utils/HealthSource.types'
import { HealthSourceFieldNames } from '@cv/pages/health-source/common/utils/HealthSource.constants'
import { validateAssignComponent, validateIdentifier } from '@cv/pages/health-source/common/utils/HealthSource.utils'
import type {
  CommonRemoveMetricInterface,
  CustomSelectedAndMappedMetrics,
  CommonSelectMetricInterface,
  CommonUpdateSelectedMetricsMapInterface,
  CreatedMetricsWithSelectedIndex,
  InitCustomFormData,
  InitHealthSourceCustomFormInterface
} from './CommonCustomMetric.types'
import type { CommonHealthSourceFormikInterface } from '../../connectors/CommonHealthSource/CommonHealthSource.types'

export function updateSelectedMetricsMap({
  updatedMetric,
  oldMetric,
  mappedMetrics,
  formikValues,
  initCustomForm,
  isPrimaryMetric
}: CommonUpdateSelectedMetricsMapInterface): {
  selectedMetric: string
  mappedMetrics: Map<string, CommonHealthSourceFormikInterface>
} {
  const emptyName = formikValues.metricName?.length
  if (!emptyName) {
    return { selectedMetric: updatedMetric, mappedMetrics: mappedMetrics }
  }

  const commonUpdatedMap = new Map(mappedMetrics)

  const duplicateName =
    Array.from(mappedMetrics.keys()).indexOf(formikValues.metricName) > -1 && oldMetric !== formikValues?.metricName
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
  mappedMetrics: Map<string, CommonHealthSourceFormikInterface>,
  getString: UseStringsReturn['getString']
): GroupedCreatedMetrics =>
  groupBy(getGroupAndMetric(mappedMetrics, getString), function (item) {
    return (item?.groupName as SelectOption)?.label
  })

export const getGroupAndMetric = (
  mappedMetrics: Map<string, CommonHealthSourceFormikInterface>,
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
  mappedMetrics: Map<string, CommonHealthSourceFormikInterface>,
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

export const onRemoveMetric = ({
  removedMetric,
  updatedMetric,
  updatedList,
  smIndex,
  setCreatedMetrics,
  setMappedMetrics,
  formikValues
}: CommonRemoveMetricInterface): void => {
  setMappedMetrics(oldState => {
    const { selectedMetric: oldMetric, mappedMetrics: oldMappedMetric } = oldState
    const commonUpdatedMap = new Map(oldMappedMetric)

    if (commonUpdatedMap.has(removedMetric)) {
      commonUpdatedMap.delete(removedMetric)
    } else {
      // handle case where user updates the metric name for current selected metric
      commonUpdatedMap.delete(oldMetric)
    }

    // update map with current values
    if (formikValues?.metricName !== removedMetric && formikValues?.metricName === updatedMetric) {
      commonUpdatedMap.set(updatedMetric, { ...formikValues } || { metricName: updatedMetric })
    }

    setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
    return {
      selectedMetric: updatedMetric,
      mappedMetrics: commonUpdatedMap
    }
  })
}

export const onSelectMetric = ({
  newMetric,
  updatedList,
  smIndex,
  setCreatedMetrics,
  setMappedMetrics,
  formikValues,
  initCustomForm,
  isPrimaryMetric
}: CommonSelectMetricInterface): void => {
  setMappedMetrics(oldState => {
    setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
    return updateSelectedMetricsMap({
      updatedMetric: newMetric,
      oldMetric: oldState.selectedMetric,
      mappedMetrics: oldState.mappedMetrics,
      formikValues,
      initCustomForm,
      isPrimaryMetric
    })
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
  mappedServicesAndEnvs?: Map<string, CommonHealthSourceFormikInterface>
): CustomSelectedAndMappedMetrics {
  return {
    selectedMetric: (Array.from(mappedServicesAndEnvs?.keys() || [])?.[0] as string) || defaultSelectedMetricName,
    mappedMetrics: (mappedServicesAndEnvs ||
      new Map([[defaultSelectedMetricName, initCustomFormData as InitHealthSourceCustomFormInterface]])) as Map<
      string,
      CommonHealthSourceFormikInterface
    >
  }
}

export const validateCommonCustomMetricFields = (
  values: BaseHealthSourceMetricInfo,
  createdMetrics: string[],
  selectedMetricIndex: number,
  errors: any,
  getString: (key: StringKeys) => string,
  mappedMetrics?: Map<string, BaseHealthSourceMetricInfo>
): ((key: string) => string) => {
  let errorsToReturn = cloneDeep(errors)

  const commonIsAssignComponentValid =
    [values.sli, values.continuousVerification, values.healthScore].find(i => i) || false
  const commonisRiskCategoryValid = !!values?.riskCategory

  const duplicateNames = createdMetrics?.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values.metricName
  })

  if (!values.groupName || !values.groupName?.value) {
    errorsToReturn[HealthSourceFieldNames.GROUP_NAME] = getString(
      'cv.monitoringSources.prometheus.validation.groupName'
    )
  }
  if (!values.metricName) {
    errorsToReturn[HealthSourceFieldNames.METRIC_NAME] = getString('cv.monitoringSources.metricNameValidation')
  }

  errorsToReturn = validateIdentifier(
    values,
    createdMetrics,
    selectedMetricIndex,
    errorsToReturn,
    getString,
    mappedMetrics
  )

  if (values.metricName && duplicateNames.length) {
    errorsToReturn[HealthSourceFieldNames.METRIC_NAME] = getString(
      'cv.monitoringSources.prometheus.validation.metricNameUnique'
    )
  }
  return validateAssignComponent(
    commonIsAssignComponentValid,
    errorsToReturn,
    getString,
    values,
    commonisRiskCategoryValid
  )
}
