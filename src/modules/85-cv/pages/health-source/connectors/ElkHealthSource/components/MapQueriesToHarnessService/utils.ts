/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import { initialFormData, MapElkToServiceFieldNames } from './constants'
import type { GetElkMappedMetricInterface, MapElkQueryToService } from './ElkQueryBuilder.types'

type UpdateSelectedQueriesMap = {
  updatedMetric: string
  oldMetric: string
  mappedMetrics: Map<string, MapElkQueryToService>
  formikProps: FormikProps<MapElkQueryToService | undefined>
}

export function updateSelectedMetricsMap({
  updatedMetric,
  oldMetric,
  mappedMetrics,
  formikProps
}: UpdateSelectedQueriesMap): any {
  const updatedMap = new Map(mappedMetrics)
  const formValues = formikProps.values ?? ({} as MapElkQueryToService)

  // in the case where user updates query name, update the key for current value
  if (oldMetric !== formValues.metricName) {
    updatedMap.delete(oldMetric)
  }

  // if newly created query create form object
  /* istanbul ignore else */ if (!updatedMap.has(updatedMetric)) {
    updatedMap.set(updatedMetric, { ...initialFormData, metricName: updatedMetric })
  }

  // update map with current form data
  /* istanbul ignore else */ if (formValues.metricName) {
    updatedMap.set(formValues.metricName, formValues)
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function validateMappings(
  getString: UseStringsReturn['getString'],
  createdMetrics: string[],
  selectedMetricIndex: number,
  values?: MapElkQueryToService
): { [fieldName: string]: string } {
  const requiredFieldErrors = {
    ...(!values?.metricName && {
      [MapElkToServiceFieldNames.METRIC_NAME]: getString('cv.monitoringSources.queryNameValidation')
    }),
    ...(!values?.query && {
      [MapElkToServiceFieldNames.QUERY]: getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query')
    }),
    ...(!values?.logIndexes && {
      [MapElkToServiceFieldNames.LOG_INDEXES]: getString('cv.monitoringSources.elk.logIndexValidation')
    }),
    ...(!values?.serviceInstance && {
      [MapElkToServiceFieldNames.SERVICE_INSTANCE]: getString('cv.monitoringSources.elk.serviceInstanceValidation')
    }),
    ...(!values?.identify_timestamp && {
      [MapElkToServiceFieldNames.IDENTIFY_TIMESTAMP]: getString('cv.monitoringSources.elk.identifyTimeStampValidation')
    }),
    ...(!values?.timeStampFormat && {
      [MapElkToServiceFieldNames.TIMESTAMP_FORMAT]: getString('cv.monitoringSources.elk.timestampFormatValidation')
    }),
    ...(!values?.messageIdentifier && {
      [MapElkToServiceFieldNames.MESSAGE_IDENTIFIER]: getString('cv.monitoringSources.elk.messageIdentifierValidation')
    })
  }

  const duplicateNames = createdMetrics.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values?.metricName
  })

  if (values?.metricName && duplicateNames.length) {
    requiredFieldErrors[MapElkToServiceFieldNames.METRIC_NAME] = getString(
      'cv.monitoringSources.gcoLogs.validation.queryNameUnique'
    )
  }

  return requiredFieldErrors
}

export const getElkMappedMetric = ({
  sourceData,
  isConnectorRuntimeOrExpression
}: GetElkMappedMetricInterface): {
  selectedMetric: string
  mappedMetrics: Map<string, MapElkQueryToService>
} => {
  return {
    selectedMetric:
      (Array.from(sourceData?.mappedServicesAndEnvs?.keys() || [])?.[0] as string) ||
      `getString('cv.monitoringSources.Elk.ElkLogsQuery')`,
    mappedMetrics:
      sourceData?.mappedServicesAndEnvs?.size > 0
        ? sourceData?.mappedServicesAndEnvs
        : new Map<string, MapElkQueryToService>([
            [
              `getString('cv.monitoringSources.Elk.ElkLogsQuery')`,
              {
                ...initialFormData,
                serviceInstance: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : initialFormData.serviceInstance
              }
            ]
          ])
  }
}
