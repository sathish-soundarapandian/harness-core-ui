/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import { MapGCPLogsToServiceFieldNames } from './constants'
import type { InitialFormDataInterface, MapGCOLogsQueryToService } from './types'

type UpdateSelectedQueriesMap = {
  updatedMetric: string
  oldMetric: string
  mappedMetrics: Map<string, MapGCOLogsQueryToService>
  formikProps: FormikProps<MapGCOLogsQueryToService | undefined>
  initialFormData: InitialFormDataInterface
}

export function updateSelectedMetricsMap({
  updatedMetric,
  oldMetric,
  mappedMetrics,
  formikProps,
  initialFormData
}: UpdateSelectedQueriesMap): any {
  const updatedMap = new Map(mappedMetrics)

  // in the case where user updates query name, update the key for current value
  if (oldMetric !== formikProps.values?.metricName) {
    updatedMap.delete(oldMetric)
  }

  // if newly created query create form object
  if (!updatedMap.has(updatedMetric)) {
    updatedMap.set(updatedMetric, { ...initialFormData, metricName: updatedMetric })
  }

  // update map with current form data
  if (formikProps.values?.metricName) {
    updatedMap.set(formikProps.values.metricName, formikProps.values as MapGCOLogsQueryToService)
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function validateMappings(
  getString: UseStringsReturn['getString'],
  createdMetrics: string[],
  selectedMetricIndex: number,
  values?: MapGCOLogsQueryToService
): { [fieldName: string]: string } {
  const requiredFieldErrors = {
    ...(!values?.metricName && {
      [MapGCPLogsToServiceFieldNames.METRIC_NAME]: getString('cv.monitoringSources.queryNameValidation')
    }),
    ...(!values?.query && {
      [MapGCPLogsToServiceFieldNames.QUERY]: getString(
        'cv.monitoringSources.gco.manualInputQueryModal.validation.query'
      )
    }),
    ...(!values?.serviceInstance && {
      [MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE]: getString(
        'cv.monitoringSources.gcoLogs.validation.serviceInstance'
      )
    }),
    ...(!values?.messageIdentifier && {
      [MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER]: getString(
        'cv.monitoringSources.gcoLogs.validation.messageIdentifier'
      )
    })
  }

  const duplicateNames = createdMetrics?.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values?.metricName
  })

  if (values?.metricName && duplicateNames.length) {
    requiredFieldErrors[MapGCPLogsToServiceFieldNames.METRIC_NAME] = getString(
      'cv.monitoringSources.gcoLogs.validation.queryNameUnique'
    )
  }

  return requiredFieldErrors
}
