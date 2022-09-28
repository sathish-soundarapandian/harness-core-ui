/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import { initialFormData, MapSplunkToServiceFieldNames } from './constants'
import type { GetSplunkMappedMetricInterface, MapSplunkQueryToService } from './types'

type UpdateSelectedQueriesMap = {
  updatedMetric: string
  oldMetric: string
  mappedMetrics: Map<string, MapSplunkQueryToService>
  formikProps: FormikProps<MapSplunkQueryToService | undefined>
}

export function updateSelectedMetricsMap({
  updatedMetric,
  oldMetric,
  mappedMetrics,
  formikProps
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
    updatedMap.set(formikProps.values.metricName, formikProps.values as MapSplunkQueryToService)
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function validateMappings(
  getString: UseStringsReturn['getString'],
  createdMetrics: string[],
  selectedMetricIndex: number,
  values?: MapSplunkQueryToService
): { [fieldName: string]: string } {
  const requiredFieldErrors = {
    ...(!values?.metricName && {
      [MapSplunkToServiceFieldNames.METRIC_NAME]: getString('cv.monitoringSources.queryNameValidation')
    }),
    ...(!values?.query && {
      [MapSplunkToServiceFieldNames.QUERY]: getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query')
    }),
    ...(!values?.serviceInstance && {
      [MapSplunkToServiceFieldNames.SERVICE_INSTANCE]: getString(
        'cv.monitoringSources.gcoLogs.validation.serviceInstance'
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
    requiredFieldErrors[MapSplunkToServiceFieldNames.METRIC_NAME] = getString(
      'cv.monitoringSources.gcoLogs.validation.queryNameUnique'
    )
  }

  return requiredFieldErrors
}

export const getSplunkMappedMetric = ({
  sourceData,
  isConnectorRuntimeOrExpression,
  getString
}: GetSplunkMappedMetricInterface): {
  selectedMetric: string
  mappedMetrics: Map<string, MapSplunkQueryToService>
} => {
  return {
    selectedMetric:
      (Array.from(sourceData?.mappedServicesAndEnvs?.keys() || [])?.[0] as string) ||
      getString('cv.monitoringSources.splunk.splunkLogsQuery'),
    mappedMetrics:
      sourceData?.mappedServicesAndEnvs?.size > 0
        ? sourceData?.mappedServicesAndEnvs
        : new Map<string, MapSplunkQueryToService>([
            [
              getString('cv.monitoringSources.splunk.splunkLogsQuery'),
              {
                ...initialFormData,
                serviceInstance: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : initialFormData.serviceInstance
              }
            ]
          ])
  }
}
