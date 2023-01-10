/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors } from 'formik'
import { cloneDeep, set } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { CreatedMetricsWithSelectedIndex } from '@cv/pages/health-source/common/CommonCustomMetric/CommonCustomMetric.types'
import type { AddMetricForm } from './CustomMetricForm.types'
import { CommonConfigurationsFormFieldNames, CustomMetricFormFieldNames } from '../../CommonHealthSource.constants'
import type {
  CommonCustomMetricFormikInterface,
  CommonHealthSourceConfigurations,
  GroupedCreatedMetrics,
  HealthSourceConfig
} from '../../CommonHealthSource.types'
import { DEFAULT_EMPTY_GROUP_NAME, DEFAULT_LOGS_GROUP_NAME, initCustomForm } from './CustomMetricForm.constants'

export const validateAddMetricForm = (
  formData: AddMetricForm,
  getString: UseStringsReturn['getString'],
  createdMetrics: CreatedMetricsWithSelectedIndex['createdMetrics'],
  groupedCreatedMetrics: GroupedCreatedMetrics
): FormikErrors<AddMetricForm> => {
  const errors: FormikErrors<AddMetricForm> = {}
  const { identifier = '', metricName = '', groupName } = formData

  if (!identifier) {
    set(errors, CustomMetricFormFieldNames.METRIC_IDENTIFIER, getString('fieldRequired', { field: 'Identifier' }))
  }
  if (!metricName) {
    set(errors, CustomMetricFormFieldNames.METRIC_NAME, getString('fieldRequired', { field: 'Metric name' }))
  }
  if (typeof groupName === 'string' && !groupName) {
    set(errors, CustomMetricFormFieldNames.GROUP_NAME, getString('fieldRequired', { field: 'Group name' }))
  }
  if (typeof groupName === 'object' && !groupName?.value) {
    set(errors, CustomMetricFormFieldNames.GROUP_NAME, getString('fieldRequired', { field: 'Group name' }))
  }

  validateDuplicateMetricName({ createdMetrics, metricName, groupedCreatedMetrics, groupName, errors, getString })

  return errors
}

function validateDuplicateMetricName({
  createdMetrics,
  metricName,
  groupedCreatedMetrics,
  groupName,
  errors,
  getString
}: {
  createdMetrics: string[]
  metricName: string
  groupedCreatedMetrics: GroupedCreatedMetrics
  groupName: string | SelectOption
  errors: FormikErrors<AddMetricForm>
  getString: UseStringsReturn['getString']
}): void {
  if (createdMetrics?.filter((name: string) => name === metricName).length) {
    let oldGroupName = ''
    Object.entries(groupedCreatedMetrics).map(groupedMetricData => {
      const groupedMetrics = groupedMetricData[1]?.map(el => el.metricName)
      if (groupedMetrics?.includes(metricName)) {
        oldGroupName = groupedMetricData[0]
      }
    })

    if (oldGroupName === ((groupName as SelectOption)?.value ?? groupName)) {
      errors.metricName = getString('cv.monitoringSources.prometheus.validation.uniqueName', {
        existingName: metricName
      })
    }
  }
}

export function getHealthSourceConfigDetails(healthSourceConfig: HealthSourceConfig) {
  const enabledDefaultGroupName = !!healthSourceConfig?.addQuery?.enableDefaultGroupName
  const enabledRecordsAndQuery = !!healthSourceConfig?.customMetrics?.queryAndRecords?.enabled
  const customMetricsConfig = healthSourceConfig?.customMetrics
  const fieldLabel = healthSourceConfig?.addQuery?.label
  const shouldBeAbleToDeleteLastMetric = healthSourceConfig?.sideNav?.shouldBeAbleToDeleteLastMetric
  const isAssignComponentEnabled = healthSourceConfig?.customMetrics?.assign?.enabled
  return {
    enabledDefaultGroupName,
    fieldLabel,
    shouldBeAbleToDeleteLastMetric,
    enabledRecordsAndQuery,
    customMetricsConfig,
    isAssignComponentEnabled
  }
}

export function getAddMetricInitialValues(
  formValues: CommonCustomMetricFormikInterface,
  enabledDefaultGroupName: boolean
): AddMetricForm {
  return {
    identifier: formValues?.identifier ?? '',
    metricName: formValues?.metricName ?? '',
    groupName: enabledDefaultGroupName ? DEFAULT_LOGS_GROUP_NAME : formValues?.groupName ?? ''
  }
}

export const initHealthSourceCustomFormValue = () => {
  return {
    ...initCustomForm,
    groupName: DEFAULT_EMPTY_GROUP_NAME
  }
}

export function cleanUpMappedMetrics(mappedMetricsData: Map<string, CommonCustomMetricFormikInterface>): void {
  const hasEmptySet = mappedMetricsData.has('')
  if (hasEmptySet) {
    mappedMetricsData.delete('')
  }
}

export function getUpdatedMappedMetricsData(
  mappedMetricsData: Map<string, CommonCustomMetricFormikInterface>,
  selectedMetricName: string,
  formValuesData: CommonCustomMetricFormikInterface
): CommonHealthSourceConfigurations['queryMetricsMap'] {
  const updatedMappedMetricsData = cloneDeep(mappedMetricsData)
  updatedMappedMetricsData.set(selectedMetricName, formValuesData)
  cleanUpMappedMetrics(updatedMappedMetricsData)
  return updatedMappedMetricsData
}

export function updateParentFormikWithLatestData(
  updateParentFormik: (field: string, value: any, shouldValidate?: boolean | undefined) => void,
  updatedMappedMetricsData: Map<string, CommonCustomMetricFormikInterface>,
  selectedMetricName: string
): void {
  updateParentFormik(CommonConfigurationsFormFieldNames.CUSTOM_METRICS_MAP, updatedMappedMetricsData)
  updateParentFormik(CommonConfigurationsFormFieldNames.SELECTED_METRIC, selectedMetricName)
}
