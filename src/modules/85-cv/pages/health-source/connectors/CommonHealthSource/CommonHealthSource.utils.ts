/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors, FormikProps } from 'formik'
import { cloneDeep, isNumber, set } from 'lodash-es'
import { RUNTIME_INPUT_VALUE, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { HealthSource, NextGenHealthSourceSpec, QueryRecordsRequest } from 'services/cv'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { V2 } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/components/MonitoredServiceInputTemplatesHealthSources/MonitoredServiceInputTemplatesHealthSources.constants'
import { initializeSelectedMetricsMap } from '../../common/CommonCustomMetric/CommonCustomMetric.utils'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import {
  initCustomForm,
  FIELD_ENUM,
  DEFAULT_HEALTH_SOURCE_QUERY,
  CustomMetricFormFieldNames,
  PRODUCT_MAP
} from './CommonHealthSource.constants'
import type {
  HealthSourcePayload,
  HealthSourceConfig,
  CommonCustomMetricFormikInterface,
  FieldMapping,
  CommonHealthSourceConfigurations
} from './CommonHealthSource.types'
import { DEFAULT_LOGS_GROUP_NAME } from './components/CustomMetricForm/CustomMetricForm.constants'
import { getThresholdTypes } from '../../common/utils/HealthSource.utils'
import {
  getFilteredMetricThresholdValuesV2,
  getMetricThresholdsForCustomMetric,
  validateMetricThresholds
} from '../../common/MetricThresholds/MetricThresholds.utils'
import {
  MetricThresholdTypes,
  MetricThresholdPropertyName
} from '../../common/MetricThresholds/MetricThresholds.constants'
import type { MetricThresholdType } from '../../common/MetricThresholds/MetricThresholds.types'
import type { LogFieldsMultiTypeState } from './components/CustomMetricForm/CustomMetricForm.types'
import { HealthSourceTypes } from '../../types'

export const initHealthSourceCustomForm = () => {
  return {
    ...initCustomForm,
    groupName: { label: '', value: '' }
  }
}

export const resetShowCustomMetric = (
  selectedMetric: string,
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>,
  setShowCustomMetric: (value: React.SetStateAction<boolean | undefined>) => void
): void => {
  if (!selectedMetric && !mappedMetrics.size) {
    setShowCustomMetric(false)
  }
}

/**
 * Common health source config relates helper functions
 *
 */

/**
 *
 * @param healthSourceConfig
 * @returns boolean
 *
 * It returns true if
 * custom metrics is enabled (AND)
 * Has fieldMappings in the configs (AND)
 * Atleast one field in fieldMappings contains component type as JsonSelector.
 */
export function getIsLogsTableVisible(healthSourceConfig: HealthSourceConfig): boolean {
  const { customMetrics } = healthSourceConfig || {}

  if (!customMetrics?.enabled || !customMetrics?.logsTable?.enabled || !customMetrics?.fieldMappings) {
    return false
  }

  return customMetrics?.fieldMappings.some(field => field.type === FIELD_ENUM.JSON_SELECTOR)
}

const canSetDefaultValue = ({
  isTemplate,
  multiTypeRecord,
  field,
  values
}: {
  isTemplate?: boolean
  multiTypeRecord: LogFieldsMultiTypeState | null
  field: FieldMapping
  values: CommonCustomMetricFormikInterface
}): boolean => {
  return Boolean(
    (!isTemplate || (isTemplate && multiTypeRecord?.[field.identifier] === MultiTypeInputType.FIXED)) &&
      !values[field.identifier] &&
      field.defaultValue
  )
}

const canSetRuntimeInputValue = ({
  isTemplate,
  multiTypeRecord,
  field,
  values
}: {
  isTemplate?: boolean
  multiTypeRecord: LogFieldsMultiTypeState | null
  field: FieldMapping
  values: CommonCustomMetricFormikInterface
}): boolean => {
  return Boolean(
    isTemplate &&
      isMultiTypeRuntime(multiTypeRecord?.[field.identifier] as MultiTypeInputType) &&
      !values[field.identifier]
  )
}

export function getFieldsDefaultValuesFromConfig({
  values,
  multiTypeRecord,
  fieldMappings,
  isTemplate
}: {
  values: CommonCustomMetricFormikInterface
  multiTypeRecord: LogFieldsMultiTypeState | null
  fieldMappings?: FieldMapping[]
  isTemplate?: boolean
}): Partial<CommonCustomMetricFormikInterface> {
  if (!Array.isArray(fieldMappings) || !values) {
    return {}
  }

  const valuesToUpdate: { [x: string]: string | undefined } = {}

  for (const field of fieldMappings) {
    if (canSetDefaultValue({ field, isTemplate, values, multiTypeRecord })) {
      valuesToUpdate[field?.identifier] = field.defaultValue
    } else if (canSetRuntimeInputValue({ field, isTemplate, values, multiTypeRecord })) {
      valuesToUpdate[field.identifier] = RUNTIME_INPUT_VALUE
    }
  }

  return valuesToUpdate
}

export function getTemplateValuesForConfigFields(
  values: CommonCustomMetricFormikInterface,
  logsTableConfig?: FieldMapping[]
): Partial<CommonCustomMetricFormikInterface> {
  if (!Array.isArray(logsTableConfig) || !values) {
    return {}
  }

  const valuesToUpdate: Partial<CommonCustomMetricFormikInterface> = {}

  for (const field of logsTableConfig) {
    const isCurrentValueIsExpression = getMultiTypeFromValue(values[field.identifier]) === MultiTypeInputType.EXPRESSION
    if (!isCurrentValueIsExpression) {
      ;(valuesToUpdate[field.identifier] as string) = RUNTIME_INPUT_VALUE
    }
  }

  return valuesToUpdate
}

export function getRequestBodyForSampleLogs(
  healthSourceType: QueryRecordsRequest['healthSourceType'],
  otherValues: {
    query: string
    connectorIdentifier: string | { connector: { identifier: string } }
    fieldMappings?: FieldMapping[]
    queryField?: FieldMapping
    formValues: CommonCustomMetricFormikInterface
  }
): QueryRecordsRequest | null {
  const { connectorIdentifier, query, fieldMappings, queryField, formValues } = otherValues
  const currentTime = new Date()
  const startTime = currentTime.setHours(currentTime.getHours() - 2)
  const healthSourceQueryParams: { [x: string]: string } = {}

  if (Array.isArray(fieldMappings) && fieldMappings.length) {
    for (const field of fieldMappings) {
      const { identifier } = field || {}
      const fieldValue = formValues[identifier]
      healthSourceQueryParams[identifier] = fieldValue as string
    }
  }

  return {
    startTime,
    endTime: Date.now(),
    healthSourceType,
    query,
    connectorIdentifier:
      typeof connectorIdentifier === 'string' ? connectorIdentifier : connectorIdentifier?.connector?.identifier,
    healthSourceQueryParams: {
      ...healthSourceQueryParams,
      ...(queryField && { [queryField?.identifier]: formValues[queryField?.identifier] })
    }
  }
}

export const getIsConnectorRuntimeOrExpression = (
  connectorRef?: HealthSourcePayload['spec']['connectorRef']
): boolean => {
  if (!connectorRef) {
    return false
  }

  const connectorValue = ((connectorRef as unknown as SelectOption)?.value || connectorRef) as string
  return getMultiTypeFromValue(connectorValue) !== MultiTypeInputType.FIXED
}

const validateLogFields = ({
  formData,
  getString,
  errors,
  customMetricsConfig
}: {
  formData: CommonCustomMetricFormikInterface
  getString: UseStringsReturn['getString']
  customMetricsConfig: HealthSourceConfig['customMetrics']
  errors: FormikErrors<CommonCustomMetricFormikInterface>
}): FormikErrors<CommonCustomMetricFormikInterface> => {
  const fieldMappings = customMetricsConfig?.fieldMappings

  if (!Array.isArray(fieldMappings)) {
    return errors
  }

  fieldMappings.forEach(field => {
    if (!formData[field.identifier]) {
      set(errors, field.identifier, getString('fieldRequired', { field: getFieldName(field.identifier, getString) }))
    }
  })

  return errors
}

// Validation functions
export const handleValidateCustomMetricForm = ({
  formData,
  getString,
  customMetricsConfig
}: {
  formData: CommonCustomMetricFormikInterface
  getString: UseStringsReturn['getString']
  customMetricsConfig: HealthSourceConfig['customMetrics']
}): FormikErrors<CommonCustomMetricFormikInterface> => {
  const isAssignComponentEnabled = customMetricsConfig?.assign?.enabled
  const isLogsTableEnabled = customMetricsConfig?.logsTable?.enabled
  const queryFieldIdentifier = customMetricsConfig?.queryAndRecords?.queryField?.identifier
  let errors: FormikErrors<CommonCustomMetricFormikInterface> = {}
  const { query = '', recordCount } = formData

  // Validate query section
  if (!query) {
    set(errors, CustomMetricFormFieldNames.QUERY, getString('fieldRequired', { field: 'Query' }))
  }

  // validate query section when multiple records are returned
  if (query && isNumber(recordCount) && recordCount > 1) {
    set(errors, CustomMetricFormFieldNames.QUERY, getString('cv.monitoringSources.prometheus.validation.recordCount'))
  }

  if (queryFieldIdentifier && !formData[queryFieldIdentifier as keyof CommonCustomMetricFormikInterface]) {
    set(
      errors,
      queryFieldIdentifier,
      getString('fieldRequired', { field: getFieldName(queryFieldIdentifier, getString) })
    )
  }

  // Validate Assign section
  if (isAssignComponentEnabled) {
    validateAssignComponent(formData, getString, errors)
  }

  // validate Logs mapping section
  if (isLogsTableEnabled) {
    errors = validateLogFields({
      formData,
      getString,
      errors,
      customMetricsConfig
    })
  }

  return errors
}

export const validateAssignComponent = (
  formData: CommonCustomMetricFormikInterface,
  getString: UseStringsReturn['getString'],
  errors: FormikErrors<CommonCustomMetricFormikInterface>
): void => {
  const {
    sli,
    continuousVerification,
    healthScore,
    riskCategory,
    lowerBaselineDeviation,
    higherBaselineDeviation,
    serviceInstanceField
  } = formData
  const isAssignComponentValid = [sli, continuousVerification, healthScore].find(checked => checked)
  const isRiskCategoryValid = !!riskCategory

  if (!isAssignComponentValid) {
    set(
      errors,
      CustomMetricFormFieldNames.SLI,
      getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
    )
  } else if (isAssignComponentValid) {
    const eitherCVorHeathScoreEnabled = continuousVerification || healthScore
    const areAllDeviationsFalse = !(lowerBaselineDeviation || higherBaselineDeviation)
    const isCVEnabledWithEmptyServiceInstace = continuousVerification && !serviceInstanceField
    if (eitherCVorHeathScoreEnabled) {
      if (areAllDeviationsFalse) {
        set(
          errors,
          CustomMetricFormFieldNames.LOWER_BASELINE_DEVIATION,
          getString('cv.monitoringSources.prometheus.validation.deviation')
        )
      }
      if (isCVEnabledWithEmptyServiceInstace) {
        set(
          errors,
          CustomMetricFormFieldNames.SERVICE_INSTANCE,
          getString('cv.healthSource.connectors.AppDynamics.validation.missingServiceInstanceMetricPath')
        )
      }
      if (!isRiskCategoryValid) {
        set(
          errors,
          CustomMetricFormFieldNames.RISK_CATEGORY,
          getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory')
        )
      }
    }
  }
}

export const handleValidateHealthSourceConfigurationsForm = ({
  formValues,
  healthSourceConfig,
  getString
}: {
  formValues: CommonHealthSourceConfigurations
  getString: UseStringsReturn['getString']
  healthSourceConfig?: HealthSourceConfig
}): FormikErrors<CommonHealthSourceConfigurations> => {
  const errors: FormikErrors<CommonHealthSourceConfigurations> = {}

  const isMetricThresholdsGroupEnabled = healthSourceConfig?.metricPacks?.enabled

  // ignoreThresholds Validation
  validateMetricThresholds({
    thresholdName: MetricThresholdPropertyName.IgnoreThreshold,
    errors: errors as Record<string, string>,
    thresholdValues: formValues[MetricThresholdPropertyName.IgnoreThreshold],
    getString,
    isValidateGroup: Boolean(isMetricThresholdsGroupEnabled)
  })

  // failFastThresholds Validation
  validateMetricThresholds({
    thresholdName: MetricThresholdPropertyName.FailFastThresholds,
    errors: errors as Record<string, string>,
    thresholdValues: formValues[MetricThresholdPropertyName.FailFastThresholds],
    getString,
    isValidateGroup: Boolean(isMetricThresholdsGroupEnabled)
  })

  return errors
}

export function checkIfCurrentCustomMetricFormIsValid(
  customMetricFormRef: React.MutableRefObject<FormikProps<CommonCustomMetricFormikInterface> | undefined>
): boolean {
  return Boolean(customMetricFormRef?.current && customMetricFormRef?.current.isValid)
}

export const createHealthSourcePayload = (
  defineHealthSourcedata: {
    product: SelectOption
    sourceType?: string
    healthSourceIdentifier: string
    healthSourceName: string
    connectorRef: string
  },
  configureHealthSourceData: CommonHealthSourceConfigurations
): UpdatedHealthSource => {
  const { product, healthSourceName, healthSourceIdentifier, connectorRef, sourceType } = defineHealthSourcedata
  const productValue = ((product?.value ?? product) || getSelectedProductInfo(sourceType as string)) as string
  const healthSourceType = getHealthSourceType(productValue)
  const { queryMetricsMap = new Map(), ignoreThresholds, failFastThresholds } = configureHealthSourceData

  const healthSourcePayload = {
    type: healthSourceType as UpdatedHealthSource['type'],
    identifier: healthSourceIdentifier,
    name: healthSourceName,
    version: V2 as HealthSource['version'],
    spec: {
      connectorRef,
      queryDefinitions: [] as NextGenHealthSourceSpec['queryDefinitions']
    }
  }

  for (const entry of queryMetricsMap.entries()) {
    const {
      identifier,
      metricName,
      groupName,
      index,
      query,
      sli,
      continuousVerification,
      healthScore,
      riskCategory,
      serviceInstanceField,
      timeStampIdentifier,
      timeStampFormat,
      messageIdentifier,
      lowerBaselineDeviation,
      higherBaselineDeviation
    }: CommonCustomMetricFormikInterface = entry[1]
    const groupNameValue = ((groupName as SelectOption)?.value ?? groupName) as string

    healthSourcePayload?.spec?.queryDefinitions &&
      healthSourcePayload?.spec?.queryDefinitions.push({
        identifier,
        name: metricName,
        groupName: groupNameValue,
        query,
        queryParams: {
          ...(serviceInstanceField && { serviceInstanceField: serviceInstanceField as string }),
          ...(timeStampIdentifier && { timeStampIdentifier: timeStampIdentifier as string }),
          ...(timeStampFormat && { timeStampFormat: timeStampFormat as string }),
          ...(messageIdentifier && { messageIdentifier: messageIdentifier as string }),
          ...(index && { index: index as string })
        },
        liveMonitoringEnabled: Boolean(healthScore),
        continuousVerificationEnabled: Boolean(continuousVerification),
        sliEnabled: Boolean(sli),
        metricThresholds:
          Array.isArray(ignoreThresholds) && Array.isArray(failFastThresholds)
            ? getMetricThresholdsForCustomMetric({
                metricName,
                metricThresholds: [...ignoreThresholds, ...failFastThresholds]
              })
            : [],

        riskProfile: {
          riskCategory: riskCategory,
          thresholdTypes: getThresholdTypes({ lowerBaselineDeviation, higherBaselineDeviation })
        }
      })
  }

  return healthSourcePayload
}

export const getHealthSourceType = (productValue: string): UpdatedHealthSource['type'] => {
  switch (productValue) {
    case HealthSourceTypes.ElasticSearch_Logs:
      return HealthSourceTypes.Elk
    default:
      return productValue as UpdatedHealthSource['type']
  }
}

export function createHealthSourceConfigurationsData(sourceData: any): CommonHealthSourceConfigurations {
  const {
    healthSourceList = [],
    isEdit = false,
    healthSourceIdentifier = '',
    queryMetricsMap = new Map(),
    selectedMetric = ''
  } = sourceData
  let queryMetricsMapData = cloneDeep(queryMetricsMap)
  let ignoreThresholds: MetricThresholdType[] = []
  let failFastThresholds: MetricThresholdType[] = []

  if (isEdit) {
    const currentHealthSource = healthSourceList.find(
      (healthSource: { identifier: string }) => healthSource?.identifier === healthSourceIdentifier
    )
    const { queryDefinitions = [] } = currentHealthSource?.spec || {}

    if (queryMetricsMap.size === 0) {
      queryMetricsMapData = cloneDeep(getUpdatedCustomMetrics(queryDefinitions))
    }

    if (!sourceData?.ignoreThresholds?.length && !sourceData?.failFastThresholds?.length) {
      ignoreThresholds = getFilteredMetricThresholdValuesV2(MetricThresholdTypes.IgnoreThreshold, [], queryDefinitions)
      failFastThresholds = getFilteredMetricThresholdValuesV2(
        MetricThresholdTypes.FailImmediately,
        [],
        queryDefinitions
      )
    } else {
      ignoreThresholds = sourceData?.ignoreThresholds || []
      failFastThresholds = sourceData?.failFastThresholds || []
    }
  }

  return {
    queryMetricsMap: queryMetricsMapData,
    selectedMetric: getSelectedMetric(selectedMetric, queryMetricsMapData),
    ignoreThresholds,
    failFastThresholds
  }
}

function getUpdatedCustomMetrics(
  queryDefinitions: NextGenHealthSourceSpec['queryDefinitions']
): CommonHealthSourceConfigurations['queryMetricsMap'] {
  const updatedCustomMetricsMap = new Map()
  if (queryDefinitions?.length) {
    for (const queryDefinition of queryDefinitions) {
      if (queryDefinition?.name) {
        updatedCustomMetricsMap.set(queryDefinition.name, {
          identifier: queryDefinition.identifier,
          metricName: queryDefinition.name,
          query: queryDefinition.query || '',
          ...(queryDefinition?.queryParams && { ...queryDefinition.queryParams }),
          riskCategory: queryDefinition?.riskProfile?.riskCategory,
          lowerBaselineDeviation: queryDefinition?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
          higherBaselineDeviation: queryDefinition?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,
          groupName: queryDefinition?.groupName
            ? { label: queryDefinition?.groupName, value: queryDefinition?.groupName }
            : DEFAULT_LOGS_GROUP_NAME,
          continuousVerification: queryDefinition?.continuousVerificationEnabled,
          healthScore: queryDefinition?.liveMonitoringEnabled,
          sli: queryDefinition?.sliEnabled
        } as CommonCustomMetricFormikInterface)
      }
    }
  }

  return updatedCustomMetricsMap
}

export function getSelectedMetric(
  selectedMetric: string,
  queryMetricsMapData: CommonHealthSourceConfigurations['queryMetricsMap']
): string {
  let selectedMetricData = ''
  if (selectedMetric) {
    selectedMetricData = selectedMetric
  } else {
    if (queryMetricsMapData?.size > 0) {
      selectedMetricData = queryMetricsMapData.entries().next().value[0]
    }
  }
  return selectedMetricData
}

export function getInitialValuesForHealthSourceConfigurations(
  configurationsPageData: CommonHealthSourceConfigurations
): CommonHealthSourceConfigurations {
  const { selectedMetric, mappedMetrics } = initializeSelectedMetricsMap(
    DEFAULT_HEALTH_SOURCE_QUERY,
    initHealthSourceCustomForm(),
    configurationsPageData?.queryMetricsMap || new Map(),
    configurationsPageData?.selectedMetric
  )

  const healthSourceConfigurationsInitialValues = getHealthSourceConfigurations(
    configurationsPageData,
    mappedMetrics,
    selectedMetric
  )
  return healthSourceConfigurationsInitialValues
}

export function getHealthSourceConfigurations(
  configurationsPageData: CommonHealthSourceConfigurations,
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>,
  selectedMetric: string
): CommonHealthSourceConfigurations {
  const { ignoreThresholds = [], failFastThresholds = [] } = configurationsPageData

  return {
    // Custom metric fields
    queryMetricsMap: mappedMetrics,
    selectedMetric,

    // metric threshold section
    ignoreThresholds,
    failFastThresholds
  }
}

export function getCurrentQueryData(
  queryMetricsMap: Map<string, CommonCustomMetricFormikInterface>,
  currentSelectedMetric: string
): CommonCustomMetricFormikInterface {
  return (
    currentSelectedMetric && queryMetricsMap.has(currentSelectedMetric)
      ? queryMetricsMap?.get(currentSelectedMetric)
      : {}
  ) as CommonCustomMetricFormikInterface
}

export function getFieldName(
  fieldIdentifier: keyof CommonCustomMetricFormikInterface,
  getString: UseStringsReturn['getString']
): string {
  switch (fieldIdentifier) {
    case CustomMetricFormFieldNames.QUERY:
      return getString('cv.query')
    case CustomMetricFormFieldNames.INDEX:
      return getString('cv.monitoringSources.elk.logIndexesInputLabel')
    case CustomMetricFormFieldNames.TIMESTAMP_FORMAT:
      return getString('cv.monitoringSources.commonHealthSource.fields.timestampFormat')
    case CustomMetricFormFieldNames.TIMESTAMP_IDENTIFIER:
      return getString('cv.monitoringSources.commonHealthSource.fields.timestampIdentifier')
    case CustomMetricFormFieldNames.SERVICE_INSTANCE:
      return getString('cv.monitoringSources.commonHealthSource.fields.serviceInstance')
    case CustomMetricFormFieldNames.MESSAGE_IDENTIFIER:
      return getString('cv.monitoringSources.commonHealthSource.fields.messageIdentifier')
    default:
      return ''
  }
}

export const getSelectedProductInfo = (selectedProduct: string): string => {
  return PRODUCT_MAP[selectedProduct] || selectedProduct
}
