/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isEmpty } from 'lodash-es'
import type { SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { DynatraceHealthSourceSpec, DynatraceServiceDTO } from 'services/cv'
import type {
  DynatraceFormDataInterface,
  DynatraceMetricData,
  DynatraceMetricInfo,
  InitDynatraceCustomMetricInterface
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import type { StringKeys } from 'framework/strings'
import { DynatraceProductNames } from '@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.constant'
import {
  DynatraceHealthSourceFieldNames,
  QUERY_CONTAINS_SERVICE_VALIDATION_PARAM
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.constants'
import {
  convertMetricPackToMetricData,
  mapCommonMetricInfoToCommonMetricDefinition,
  mapCommonMetricDefinitionToCommonMetricInfo,
  validateMetricPackData
} from '@cv/pages/health-source/common/utils/HealthSource.utils'
import { validateCommonCustomMetricFields } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.utils'

export const mapDynatraceMetricDataToHealthSource = (dynatraceMetricData: DynatraceMetricData): UpdatedHealthSource => {
  const specPayload: DynatraceHealthSourceSpec = {
    connectorRef: dynatraceMetricData.connectorRef,
    serviceId: dynatraceMetricData.selectedService.value as string,
    serviceName: dynatraceMetricData.selectedService.label as string,
    feature: DynatraceProductNames.APM,
    metricPacks: Object.entries(dynatraceMetricData.metricData)
      .map(item => {
        return item[1]
          ? {
              identifier: item[0]
            }
          : {}
      })
      .filter(item => !isEmpty(item)),
    metricDefinitions: [],
    serviceMethodIds: dynatraceMetricData.serviceMethods
  }

  for (const entry of dynatraceMetricData.customMetrics.entries()) {
    const { metricSelector } = entry[1]
    specPayload.metricDefinitions?.push({ ...mapCommonMetricInfoToCommonMetricDefinition(entry[1]), metricSelector })
  }
  return {
    type: 'Dynatrace',
    identifier: dynatraceMetricData.healthSourceIdentifier,
    name: dynatraceMetricData.healthSourceName,
    spec: specPayload
  }
}
export const mapHealthSourceToDynatraceMetricData = (sourceData: any): DynatraceMetricData => {
  const healthSource: UpdatedHealthSource = sourceData.healthSourceList.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )
  const dynatraceHealthSourceSpec = (healthSource?.spec as DynatraceHealthSourceSpec) || {}
  const { serviceName = '', serviceId = '', serviceMethodIds, metricPacks } = dynatraceHealthSourceSpec

  const metricDefinitions = dynatraceHealthSourceSpec.metricDefinitions || []
  const dynatraceMetricData: DynatraceMetricData = {
    product: sourceData.product,
    healthSourceName: sourceData.healthSourceName,
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    connectorRef: sourceData.connectorRef,
    isEdit: sourceData.isEdit,
    selectedService: { label: serviceName, value: serviceId },
    metricPacks,
    metricData: convertMetricPackToMetricData(metricPacks),
    serviceMethods: serviceMethodIds,
    customMetrics: new Map()
  }

  for (const metricDefinition of metricDefinitions) {
    if (metricDefinition.metricName) {
      dynatraceMetricData.customMetrics.set(metricDefinition.metricName, {
        metricSelector: metricDefinition.metricSelector,
        ...mapCommonMetricDefinitionToCommonMetricInfo(metricDefinition)
      })
    }
  }
  return dynatraceMetricData
}

export const mapDynatraceDataToDynatraceForm = (
  dynatraceMetricData: DynatraceFormDataInterface,
  mappedMetrics: Map<string, DynatraceMetricInfo>,
  selectedMetric: string,
  showCustomMetric: boolean
): DynatraceFormDataInterface => {
  const metricIdentifier = selectedMetric.split(' ').join('_')
  return {
    ...dynatraceMetricData,
    ...mappedMetrics.get(selectedMetric),
    metricData: dynatraceMetricData.metricData,
    metricName: selectedMetric,
    showCustomMetric,
    identifier: metricIdentifier
  }
}

export function mapServiceListToOptions(services: DynatraceServiceDTO[]): SelectOption[] {
  return services.map(service => {
    return {
      label: service.displayName || '',
      value: service.entityId || ''
    }
  })
}

export const validateMapping = (
  dynatraceMetricData: DynatraceFormDataInterface,
  createdMetrics: string[],
  selectedMetricIndex: number,
  getString: (key: StringKeys) => string,
  mappedMetrics: Map<string, DynatraceMetricInfo>
): ((key: string) => string) => {
  let errors = {} as any

  if (!dynatraceMetricData.showCustomMetric) {
    errors = validateMetricPackData(dynatraceMetricData.metricData, getString, errors)
  }
  if (!dynatraceMetricData.selectedService.value || dynatraceMetricData.selectedService.value === 'loading') {
    errors[DynatraceHealthSourceFieldNames.DYNATRACE_SELECTED_SERVICE] = getString(
      'cv.healthSource.connectors.Dynatrace.validations.selectedService'
    )
  }
  // if custom metrics are present then validate custom metrics form
  if (dynatraceMetricData.showCustomMetric) {
    errors = validateDynatraceCustomMetricFields(
      dynatraceMetricData,
      createdMetrics,
      selectedMetricIndex,
      errors,
      getString,
      mappedMetrics
    )
  }
  return errors
}

export const validateDynatraceCustomMetricFields = (
  values: DynatraceMetricInfo,
  createdMetrics: string[],
  selectedMetricIndex: number,
  errors: any,
  getString: (key: StringKeys) => string,
  mappedMetrics?: Map<string, DynatraceMetricInfo>
): ((key: string) => string) => {
  const errorsToReturn = cloneDeep(errors)

  if (!values.metricSelector) {
    if (values.isManualQuery) {
      errorsToReturn[DynatraceHealthSourceFieldNames.METRIC_SELECTOR] = getString(
        'cv.monitoringSources.gco.manualInputQueryModal.validation.query'
      )
    } else {
      errorsToReturn[DynatraceHealthSourceFieldNames.ACTIVE_METRIC_SELECTOR] = getString(
        'cv.monitoringSources.metricValidation'
      )
    }
  } else if (!values.metricSelector.includes(QUERY_CONTAINS_SERVICE_VALIDATION_PARAM)) {
    errorsToReturn[DynatraceHealthSourceFieldNames.METRIC_SELECTOR] = `${getString(
      'cv.monitoringSources.datadog.validation.queryContains'
    )}${QUERY_CONTAINS_SERVICE_VALIDATION_PARAM}`
  }

  return validateCommonCustomMetricFields(
    values,
    createdMetrics,
    selectedMetricIndex,
    errorsToReturn,
    getString,
    mappedMetrics
  )
}

export const onSubmitDynatraceData = (
  formik: FormikProps<DynatraceFormDataInterface>,
  mappedMetrics: Map<string, DynatraceMetricInfo>,
  selectedMetric: string,
  selectedMetricIndex: number,
  createdMetrics: string[],
  getString: (key: StringKeys) => string,
  onSubmit: (healthSourcePayload: DynatraceMetricData) => void
): void => {
  formik.setTouched({
    ...formik.touched,
    [DynatraceHealthSourceFieldNames.DYNATRACE_SELECTED_SERVICE]: true,
    [DynatraceHealthSourceFieldNames.METRIC_DATA]: { Performance: true },
    [DynatraceHealthSourceFieldNames.METRIC_NAME]: true,
    [DynatraceHealthSourceFieldNames.IDENTIFIER]: true,
    [DynatraceHealthSourceFieldNames.METRIC_SELECTOR]: true,
    [DynatraceHealthSourceFieldNames.ACTIVE_METRIC_SELECTOR]: true,
    [DynatraceHealthSourceFieldNames.GROUP_NAME]: true,
    [DynatraceHealthSourceFieldNames.SLI]: true,
    [DynatraceHealthSourceFieldNames.CONTINUOUS_VERIFICATION]: true,
    [DynatraceHealthSourceFieldNames.LOWER_BASELINE_DEVIATION]: true,
    [DynatraceHealthSourceFieldNames.RISK_CATEGORY]: true
  })
  const errors = validateMapping(formik.values, createdMetrics, selectedMetricIndex, getString, mappedMetrics)
  if (Object.keys(errors).length > 0) {
    formik.validateForm()
    return
  }
  const updatedMetric = formik.values
  if (updatedMetric.metricName) {
    mappedMetrics.set(selectedMetric, updatedMetric)
  }
  const updatedValues = { ...formik.values, customMetrics: updatedMetric.showCustomMetric ? mappedMetrics : new Map() }
  onSubmit(updatedValues)
}

export const defaultDynatraceCustomMetric = (
  getString: (key: StringKeys) => string
): InitDynatraceCustomMetricInterface => {
  return {
    metricSelector: '',
    sli: false,
    healthScore: false,
    continuousVerification: false,
    identifier: getString('cv.healthSource.connectors.Dynatrace.defaultMetricName').split(' ').join('_'),
    metricName: getString('cv.healthSource.connectors.Dynatrace.defaultMetricName'),
    isNew: true,
    groupName: { label: '', value: '' }
  }
}
