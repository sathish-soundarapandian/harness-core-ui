/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors } from 'formik'
import { set } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { CreatedMetricsWithSelectedIndex } from '@cv/pages/health-source/common/CommonCustomMetric/CommonCustomMetric.types'
import type { AddMetricForm } from './CustomMetricForm.types'
import { CommonHealthSourceFieldNames } from '../../CommonHealthSource.constants'
import type { CommonCustomMetricFormikInterface, HealthSourceConfig } from '../../CommonHealthSource.types'
import { defaultEmptyGroupName, defaultLogsGroupName, initCustomForm } from './CustomMetricForm.constants'

export const validateAddMetricForm = (
  formData: AddMetricForm,
  getString: UseStringsReturn['getString'],
  createdMetrics: CreatedMetricsWithSelectedIndex['createdMetrics']
): FormikErrors<AddMetricForm> => {
  const errors: FormikErrors<AddMetricForm> = {}
  const { identifier = '', metricName = '', groupName } = formData

  if (!identifier) {
    set(errors, CommonHealthSourceFieldNames.METRIC_IDENTIFIER, getString('fieldRequired', { field: 'Identifier' }))
  }
  if (!metricName) {
    set(errors, CommonHealthSourceFieldNames.METRIC_NAME, getString('fieldRequired', { field: 'Metric name' }))
  }
  if (typeof groupName === 'string' && !groupName) {
    set(errors, CommonHealthSourceFieldNames.GROUP_NAME, getString('fieldRequired', { field: 'Group name' }))
  }
  if (typeof groupName === 'object' && !groupName?.value) {
    set(errors, CommonHealthSourceFieldNames.GROUP_NAME, getString('fieldRequired', { field: 'Group name' }))
  }

  if (createdMetrics?.filter((name: string) => name === metricName).length) {
    errors.metricName = getString('cv.monitoringSources.prometheus.validation.uniqueName', {
      existingName: metricName
    })
  }
  return errors
}

export function getHealthSourceConfigDetails(healthSourceConfig: HealthSourceConfig) {
  const enabledDefaultGroupName = !!healthSourceConfig?.addQuery?.enableDefaultGroupName
  const enabledRecordsAndQuery = !!healthSourceConfig?.customMetrics?.queryAndRecords?.enabled
  const customMetricsConfig = healthSourceConfig?.customMetrics
  const fieldLabel = healthSourceConfig?.addQuery?.label
  const shouldBeAbleToDeleteLastMetric = healthSourceConfig?.sideNav?.shouldBeAbleToDeleteLastMetric
  return {
    enabledDefaultGroupName,
    fieldLabel,
    shouldBeAbleToDeleteLastMetric,
    enabledRecordsAndQuery,
    customMetricsConfig
  }
}

export function getAddMetricInitialValues(
  formValues: CommonCustomMetricFormikInterface,
  enabledDefaultGroupName: boolean
): AddMetricForm {
  return {
    identifier: formValues?.identifier ?? '',
    metricName: formValues?.metricName ?? '',
    groupName: enabledDefaultGroupName ? defaultLogsGroupName : formValues?.groupName ?? ''
  }
}

export const initHealthSourceCustomFormValue = () => {
  return {
    ...initCustomForm,
    groupName: defaultEmptyGroupName
  }
}
