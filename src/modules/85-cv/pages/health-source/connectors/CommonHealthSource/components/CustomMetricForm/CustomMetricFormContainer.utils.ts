/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors } from 'formik'
import { set } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { CommonHealthSourceFieldNames, CommonCustomMetricFormikInterface } from '../../CommonHealthSource.types'
import type { AddMetricForm } from './CustomMetricForm.types'

export const validateAddMetricForm = (
  formData: AddMetricForm,
  getString: UseStringsReturn['getString']
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
  return errors
}

export function getAddMetricInitialValues(
  formValues: CommonCustomMetricFormikInterface,
  enabledDefaultGroupName: boolean
): AddMetricForm {
  return {
    identifier: formValues?.identifier ?? '',
    metricName: formValues?.metricName ?? '',
    groupName: enabledDefaultGroupName ? { label: 'Logs Group', value: 'logsGroup' } : formValues?.groupName ?? ''
  }
}

export const initHealthSourceCustomFormValue = () => {
  return {
    ...initCustomForm,
    groupName: { label: '', value: '' }
  }
}

export const initCustomForm = {
  sli: false,
  healthScore: false,
  continuousVerification: false,
  serviceInstanceMetricPath: ''
}
