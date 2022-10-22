/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isEmpty, isEqual } from 'lodash-es'
import { RUNTIME_INPUT_VALUE, SelectOption, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type {
  RowData,
  SourceDataInterface,
  UpdatedHealthSource
} from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { DynatraceHealthSourceSpec, DynatraceServiceDTO } from 'services/cv'
import type {
  DynatraceFormDataInterface,
  DynatraceMetricData,
  DynatraceMetricInfo,
  InitDynatraceCustomMetricInterface,
  PersistCustomMetricInterface,
  PersistFuntionNotEqualHelperProps
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
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
import {
  getFilteredMetricThresholdValues,
  getMetricPacksForPayload,
  validateCommonFieldsForMetricThreshold
} from '../../common/MetricThresholds/MetricThresholds.utils'
import {
  MetricThresholdPropertyName,
  MetricThresholdTypes
} from '../../common/MetricThresholds/MetricThresholds.constants'
import type { CustomSelectedAndMappedMetrics } from '../../common/CustomMetric/CustomMetric.types'

export const mapDynatraceMetricDataToHealthSource = (
  dynatraceMetricData: DynatraceMetricData,
  isMetricThresholdEnabled: boolean
): UpdatedHealthSource => {
  const dynatraceMetricDataSelectedServiceValue =
    typeof dynatraceMetricData.selectedService !== 'string'
      ? dynatraceMetricData?.selectedService?.value
      : dynatraceMetricData.selectedService
  const dynatraceMetricDataSelectedServiceLabel =
    typeof dynatraceMetricData.selectedService !== 'string'
      ? dynatraceMetricData.selectedService.label
      : dynatraceMetricData.selectedService
  const specPayload: DynatraceHealthSourceSpec = {
    connectorRef:
      typeof dynatraceMetricData?.connectorRef === 'string'
        ? dynatraceMetricData?.connectorRef
        : dynatraceMetricData?.connectorRef?.value,
    serviceId: dynatraceMetricDataSelectedServiceValue as string,
    serviceName: dynatraceMetricDataSelectedServiceLabel as string,
    feature: DynatraceProductNames.APM,
    metricPacks: getMetricPacksForPayload(dynatraceMetricData, isMetricThresholdEnabled),
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
export const mapHealthSourceToDynatraceMetricData = (
  sourceData: SourceDataInterface,
  isMetricThresholdEnabled: boolean
): DynatraceMetricData => {
  const healthSource: UpdatedHealthSource = (sourceData.healthSourceList as RowData[]).find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  ) as UpdatedHealthSource
  const dynatraceHealthSourceSpec = (healthSource?.spec as DynatraceHealthSourceSpec) || {}
  const { serviceName = '', serviceId = '', serviceMethodIds, metricPacks } = dynatraceHealthSourceSpec
  const isServiceNameFixed = getMultiTypeFromValue(serviceName) === MultiTypeInputType.FIXED
  const metricDefinitions = dynatraceHealthSourceSpec.metricDefinitions || []
  const dynatraceMetricData: DynatraceMetricData = {
    product: sourceData.product as SelectOption,
    healthSourceName: sourceData.healthSourceName as string,
    healthSourceIdentifier: sourceData.healthSourceIdentifier as string,
    connectorRef: sourceData.connectorRef as string | { value?: string | undefined },
    isEdit: sourceData.isEdit,
    selectedService: isServiceNameFixed ? { label: serviceName, value: serviceId } : serviceName,
    metricPacks,
    metricData: convertMetricPackToMetricData(metricPacks),
    serviceMethods: serviceMethodIds,
    customMetrics: new Map(),
    ignoreThresholds: isMetricThresholdEnabled
      ? getFilteredMetricThresholdValues(MetricThresholdTypes.IgnoreThreshold, metricPacks)
      : [],
    failFastThresholds: isMetricThresholdEnabled
      ? getFilteredMetricThresholdValues(MetricThresholdTypes.FailImmediately, metricPacks)
      : []
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
  const currentMetricValue = mappedMetrics.get(selectedMetric)
  const metricIdentifier = !currentMetricValue?.identifier
    ? selectedMetric?.split(' ')?.join('_')
    : currentMetricValue?.identifier
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

const validateMetricThresholds = (
  errors: Record<string, string>,
  values: any,
  getString: UseStringsReturn['getString']
): void => {
  // ignoreThresholds Validation
  validateCommonFieldsForMetricThreshold(
    MetricThresholdPropertyName.IgnoreThreshold,
    errors,
    values[MetricThresholdPropertyName.IgnoreThreshold],
    getString,
    true
  )

  // failFastThresholds Validation
  validateCommonFieldsForMetricThreshold(
    MetricThresholdPropertyName.FailFastThresholds,
    errors,
    values[MetricThresholdPropertyName.FailFastThresholds],
    getString,
    true
  )
}

export const validateMapping = (
  dynatraceMetricData: DynatraceFormDataInterface,
  createdMetrics: string[],
  selectedMetricIndex: number,
  getString: (key: StringKeys) => string,
  mappedMetrics: Map<string, DynatraceMetricInfo>,
  isMetricThresholdEnabled: boolean
): ((key: string) => string) => {
  let errors = {} as any

  if (!dynatraceMetricData.showCustomMetric) {
    errors = validateMetricPackData(dynatraceMetricData.metricData, getString, errors)
  }
  const metricDataSelectedService =
    typeof dynatraceMetricData.selectedService !== 'string'
      ? dynatraceMetricData?.selectedService?.value
      : dynatraceMetricData.selectedService
  if (!metricDataSelectedService || metricDataSelectedService === 'loading') {
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

  if (isMetricThresholdEnabled) {
    validateMetricThresholds(errors, dynatraceMetricData, getString)
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
  const isMetricSelectorFixed = getMultiTypeFromValue(values.metricSelector) === MultiTypeInputType.FIXED
  if (!values.metricSelector && isMetricSelectorFixed) {
    if (values.isManualQuery) {
      errorsToReturn[DynatraceHealthSourceFieldNames.METRIC_SELECTOR] = getString(
        'cv.monitoringSources.gco.manualInputQueryModal.validation.query'
      )
    } else {
      errorsToReturn[DynatraceHealthSourceFieldNames.ACTIVE_METRIC_SELECTOR] = getString(
        'cv.monitoringSources.metricValidation'
      )
    }
  } else if (isMetricSelectorFixed && !values?.metricSelector?.includes(QUERY_CONTAINS_SERVICE_VALIDATION_PARAM)) {
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
  onSubmit: (healthSourcePayload: DynatraceMetricData) => void
): void => {
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

export const setApplicationIfConnectorIsInput = (
  isConnectorRuntimeOrExpression: boolean,
  dynatraceMetricFormData: any,
  setDynatraceMetricData: (data: any) => void,
  setMappedMetrics: React.Dispatch<React.SetStateAction<CustomSelectedAndMappedMetrics>>
): void => {
  if (isConnectorRuntimeOrExpression) {
    let selectedService = dynatraceMetricFormData?.selectedService
    let metricSelector = dynatraceMetricFormData?.metricSelector
    if (
      dynatraceMetricFormData.selectedService === undefined ||
      getMultiTypeFromValue(dynatraceMetricFormData.selectedService) === MultiTypeInputType.FIXED
    ) {
      selectedService = RUNTIME_INPUT_VALUE
    }
    if (
      dynatraceMetricFormData.selectedService === undefined ||
      getMultiTypeFromValue(dynatraceMetricFormData.selectedService) === MultiTypeInputType.FIXED
    ) {
      dynatraceMetricFormData.customMetrics.set(dynatraceMetricFormData.metricName, {
        ...dynatraceMetricFormData.customMetrics.get(dynatraceMetricFormData.metricName),
        metricSelector: RUNTIME_INPUT_VALUE
      })
      metricSelector = RUNTIME_INPUT_VALUE
    }
    setDynatraceMetricData({
      ...dynatraceMetricFormData,
      selectedService,
      metricSelector,
      serviceMethods: []
    })
    setMappedMetrics({
      selectedMetric: dynatraceMetricFormData.metricName,
      mappedMetrics: dynatraceMetricFormData.customMetrics
    })
  }
}

function getIsStateAndFormValuesAreNotEqual({
  areAllFilled,
  selectedMetric,
  metricName,
  nonCustomMetricValuesFromState,
  nonCustomValuesFromSelectedMetric
}: PersistFuntionNotEqualHelperProps): boolean {
  return (
    areAllFilled &&
    selectedMetric === metricName &&
    !isEqual(nonCustomMetricValuesFromState, nonCustomValuesFromSelectedMetric)
  )
}

// Temproary fix to persist data
export const persistCustomMetric = ({
  mappedMetrics,
  selectedMetric,
  dynatraceMetricData,
  formikValues,
  setMappedMetrics
}: PersistCustomMetricInterface): void => {
  const mapValue = mappedMetrics.get(selectedMetric) as unknown as DynatraceMetricData
  if (!isEmpty(mapValue)) {
    const { selectedService, metricPacks, metricData, ignoreThresholds, failFastThresholds } = mapValue
    const nonCustomValuesFromSelectedMetric = {
      selectedService,
      metricPacks,
      metricData,
      ignoreThresholds,
      failFastThresholds
    }

    const nonCustomMetricValuesFromState = {
      selectedService: dynatraceMetricData?.selectedService,
      metricPacks: dynatraceMetricData?.metricPacks,
      metricData: dynatraceMetricData?.metricData,
      ignoreThresholds: dynatraceMetricData?.ignoreThresholds,
      failFastThresholds: dynatraceMetricData?.failFastThresholds
    }

    const areAllFilled = Boolean(
      nonCustomValuesFromSelectedMetric.selectedService && nonCustomValuesFromSelectedMetric.metricData
    )
    if (
      getIsStateAndFormValuesAreNotEqual({
        areAllFilled,
        selectedMetric,
        metricName: formikValues?.metricName,
        nonCustomMetricValuesFromState,
        nonCustomValuesFromSelectedMetric
      })
    ) {
      const clonedMappedMetrics = cloneDeep(mappedMetrics)
      clonedMappedMetrics.forEach((data, key) => {
        if (selectedMetric === data.metricName) {
          clonedMappedMetrics.set(selectedMetric, { ...formikValues, ...nonCustomMetricValuesFromState })
        } else {
          clonedMappedMetrics.set(key, { ...data, ...nonCustomMetricValuesFromState })
        }
      })
      setMappedMetrics({ selectedMetric: selectedMetric, mappedMetrics: clonedMappedMetrics })
    }
  }
}
