/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Utils } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'
import type { FormikErrors, FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import type { CustomHealthSourceLogSpec } from 'services/cv'
import { CustomHealthLogFieldNames, DEFAULT_CUSTOM_LOG_SETUP_SOURCE } from './CustomHealthLogSource.constants'
import type {
  SelectedAndMappedQueries,
  UpdateSelectedQueryMap,
  CustomHealthLogSetupSource
} from './CustomHealthLogSource.types'
import { validateMappingInfo } from '../CustomHealthSource/CustomHealthSource.utils'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { getConnectorRef } from '../../common/utils/HealthSource.utils'

export function validateSetupSource(
  data: CustomHealthLogSetupSource,
  getString: UseStringsReturn['getString'],
  createdQueryNames: string[],
  selectedIndex: number
): FormikErrors<CustomHealthLogSetupSource> {
  const errors: FormikErrors<CustomHealthLogSetupSource> = {}
  const existingQueryNames = new Set(createdQueryNames.filter((_, idx) => idx !== selectedIndex))

  validateMappingInfo(data, errors, getString)
  if (!data?.queryName) {
    errors.queryName = getString('cv.customHealthSource.Querymapping.validation.queryName')
  }

  if (data?.queryName && existingQueryNames.has(data?.queryName)) {
    errors.queryName = getString('cv.monitoringSources.gcoLogs.validation.queryNameUnique')
  }

  if (!data?.serviceInstanceJsonPath) {
    errors.serviceInstanceJsonPath = getString('cv.monitoringSources.prometheus.validation.serviceInstanceIdentifier')
  }

  if (!data?.queryValueJsonPath) {
    errors.queryValueJsonPath = getString('cv.customHealthSource.Querymapping.validation.logMessageJsonPath')
  }

  if (!data?.timestampJsonPath) {
    errors.timestampJsonPath = getString('cv.customHealthSource.Querymapping.validation.timestampJsonPath')
  }

  return errors
}

export function initializeSelectedQueryMap(data: any): SelectedAndMappedQueries {
  const healthSource: UpdatedHealthSource = data?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.name === data.healthSourceName
  )

  const customLogSpec: CustomHealthSourceLogSpec = healthSource?.spec

  if (!customLogSpec?.logDefinitions?.length) {
    const selectedQuery = `Custom Log Query_${Utils.randomId()}`
    return {
      selectedQuery: selectedQuery,
      mappedQueries: new Map([
        [selectedQuery, { ...cloneDeep(DEFAULT_CUSTOM_LOG_SETUP_SOURCE), queryName: selectedQuery }]
      ])
    }
  }

  const setupSource: SelectedAndMappedQueries = { selectedQuery: '', mappedQueries: new Map() }

  for (const logDefinition of customLogSpec.logDefinitions) {
    if (logDefinition.queryName) {
      setupSource.mappedQueries.set(logDefinition.queryName, {
        queryName: logDefinition.queryName,
        query: logDefinition.requestDefinition?.requestBody,
        requestMethod: logDefinition.requestDefinition?.method,
        queryValueJsonPath: logDefinition.logMessageJsonPath || '',
        serviceInstanceJsonPath: logDefinition.serviceInstanceJsonPath,
        timestampJsonPath: logDefinition.timestampJsonPath || '',
        startTime: logDefinition.requestDefinition?.startTimeInfo || {},
        endTime: logDefinition.requestDefinition?.endTimeInfo || {},
        pathURL: logDefinition.requestDefinition?.urlPath || ''
      })
    }
  }

  setupSource.selectedQuery = Array.from(setupSource.mappedQueries.keys())[0]
  return setupSource
}

export function updateSelectedMetricsMap({
  updatedQueryName,
  oldQueryName,
  mappedQuery,
  formikProps
}: UpdateSelectedQueryMap): SelectedAndMappedQueries {
  const updatedMap = new Map(mappedQuery)

  // in the case where user updates metric name, update the key for current value
  if (oldQueryName !== formikProps.values?.queryName) {
    updatedMap.delete(oldQueryName)
  }

  // if newly created metric create form object
  if (!updatedMap.has(updatedQueryName)) {
    updatedMap.set(updatedQueryName, { ...cloneDeep(DEFAULT_CUSTOM_LOG_SETUP_SOURCE), queryName: updatedQueryName })
  }

  // update map with current form data
  if (formikProps.values?.queryName) {
    updatedMap.set(formikProps.values.queryName, formikProps.values)
  }
  return { selectedQuery: updatedQueryName, mappedQueries: updatedMap }
}

export function transformSetupSourceToHealthSource(
  sources: CustomHealthLogSetupSource[],
  connectorRef: string | { value: string },
  healthSourceName: string,
  healthSourceIdentifier: string
): UpdatedHealthSource {
  const spec: CustomHealthSourceLogSpec = {
    connectorRef: getConnectorRef(connectorRef),
    logDefinitions: []
  }

  const sourceSpec: UpdatedHealthSource = {
    type: 'CustomHealthLog',
    identifier: healthSourceIdentifier,
    name: healthSourceName,
    spec
  }

  for (const source of sources) {
    spec.logDefinitions?.push({
      requestDefinition: {
        endTimeInfo: source.endTime,
        method: source.requestMethod,
        requestBody: source.query,
        startTimeInfo: source.startTime,
        urlPath: source.pathURL
      },
      queryName: source.queryName,
      logMessageJsonPath: source.queryValueJsonPath,
      serviceInstanceJsonPath: source.serviceInstanceJsonPath,
      timestampJsonPath: source.timestampJsonPath
    })
  }

  return sourceSpec
}

export async function submitForm({
  formikProps,
  onSubmit,
  sourceData,
  mappedQueries,
  getString,
  selectedIndex,
  createdQueries
}: {
  formikProps: FormikProps<CustomHealthLogSetupSource>
  onSubmit: (formdata: CustomHealthLogSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
  sourceData: CustomHealthLogSetupSource
  mappedQueries: SelectedAndMappedQueries['mappedQueries']
  getString: UseStringsReturn['getString']
  selectedIndex: number
  createdQueries: string[]
}): Promise<void> {
  formikProps.setTouched({
    ...formikProps.touched,
    [CustomHealthLogFieldNames.PATH]: true,
    [CustomHealthLogFieldNames.QUERY]: true,
    [CustomHealthLogFieldNames.QUERY_NAME]: true,
    [CustomHealthLogFieldNames.QUERY_VALUE_JSON_PATH]: true,
    [CustomHealthLogFieldNames.REQUEST_METHOD]: true,
    [CustomHealthLogFieldNames.TIMESTAMP_JSON_PATH]: true,
    [CustomHealthLogFieldNames.SERVICE_INSTANCE_JSON_PATH]: true,
    startTime: { placeholder: true, timestampFormat: true },
    endTime: { placeholder: true, timestampFormat: true }
  })

  const errors = validateSetupSource(formikProps.values, getString, createdQueries, selectedIndex)
  if (Object.keys(errors || {}).length > 0) {
    formikProps.validateForm()
    return
  }

  const updatedMetric = formikProps.values
  if (updatedMetric) {
    mappedQueries.set(formikProps.values.queryName, updatedMetric)
  }
  await onSubmit(
    sourceData,
    transformSetupSourceToHealthSource(
      Array.from(mappedQueries.values()),
      (sourceData as any).connectorRef,
      (sourceData as any).healthSourceName,
      (sourceData as any).healthSourceIdentifier
    )
  )
}
