/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors, FormikProps } from 'formik'
import { cloneDeep, set } from 'lodash-es'
import { RUNTIME_INPUT_VALUE, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { HealthSource, NextGenHealthSourceSpec, QueryRecordsRequest } from 'services/cv'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { V2 } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/components/MonitoredServiceInputTemplatesHealthSources/MonitoredServiceInputTemplatesHealthSources.constants'
import { initializeSelectedMetricsMap } from '../../common/CommonCustomMetric/CommonCustomMetric.utils'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import {
  initCustomForm,
  ProviderTypes,
  FIELD_ENUM,
  DEFAULT_HEALTH_SOURCE_QUERY,
  CustomMetricFormFieldNames
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

  const valuesToUpdate: Partial<CommonCustomMetricFormikInterface> = {}

  for (const field of fieldMappings) {
    if (canSetDefaultValue({ field, isTemplate, values, multiTypeRecord })) {
      ;(valuesToUpdate[field.identifier] as string) = field.defaultValue
    } else if (canSetRuntimeInputValue({ field, isTemplate, values, multiTypeRecord })) {
      ;(valuesToUpdate[field.identifier] as string) = RUNTIME_INPUT_VALUE
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

// 🚨 TODO: Type it correctly
export function getProviderType(sourceData: any): QueryRecordsRequest['providerType'] | null {
  if (!sourceData) {
    return null
  }

  const { product } = sourceData
  const { value } = product || {}

  return ProviderTypes[value]
}

export function getRequestBodyForSampleLogs(
  providerType: QueryRecordsRequest['providerType'],
  otherValues: {
    query: string
    connectorIdentifier: string | { connector: { identifier: string } }
    serviceInstance: string
  }
): QueryRecordsRequest | null {
  switch (providerType) {
    case ProviderTypes.SUMOLOGIC_LOG: {
      const currentTime = new Date()

      const startTime = currentTime.setHours(currentTime.getHours() - 2)

      const { connectorIdentifier, query, serviceInstance } = otherValues

      return {
        startTime,
        endTime: Date.now(),
        providerType,
        query,
        connectorIdentifier:
          typeof connectorIdentifier === 'string' ? connectorIdentifier : connectorIdentifier?.connector?.identifier,
        healthSourceQueryParams: {
          serviceInstanceField: serviceInstance
        }
      }
    }
    default: {
      return null
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
      errors[field.identifier] = getString('cv.monitoringSources.commonHealthSource.logsTable.validationMessage')
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
  let errors: FormikErrors<CommonCustomMetricFormikInterface> = {}
  const { query = '' } = formData

  if (!query) {
    set(errors, CustomMetricFormFieldNames.QUERY, getString('fieldRequired', { field: 'Query' }))
  }

  if (isAssignComponentEnabled) {
    validateAssignComponent(formData, getString, errors)
  }

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
    serviceInstance
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
    const isCVEnabledWithEmptyServiceInstace = continuousVerification && !serviceInstance
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
  isTemplate,
  getString
}: {
  formValues: CommonHealthSourceConfigurations
  getString: UseStringsReturn['getString']
  healthSourceConfig?: HealthSourceConfig
  isTemplate?: boolean
}): FormikErrors<CommonHealthSourceConfigurations> => {
  const errors: FormikErrors<CommonHealthSourceConfigurations> = {}

  const isMetricThresholdsGroupEnabled = healthSourceConfig?.metricPacks?.enabled
  const isMetricThresholdEnabled = !isTemplate

  if (isMetricThresholdEnabled) {
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
  }

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
    sourceType: string
    healthSourceIdentifier: string
    healthSourceName: string
    connectorRef: string
  },
  configureHealthSourceData: CommonHealthSourceConfigurations,
  isTemplate?: boolean
): UpdatedHealthSource => {
  const isMetricThresholdEnabled = !isTemplate
  const { product, healthSourceName, healthSourceIdentifier, connectorRef } = defineHealthSourcedata
  const productValue = (product?.value ?? product) as string
  const { queryMetricsMap = new Map(), ignoreThresholds, failFastThresholds } = configureHealthSourceData

  const healthSourcePayload = {
    type: productValue as UpdatedHealthSource['type'],
    identifier: healthSourceIdentifier,
    name: healthSourceName,
    version: V2 as HealthSource['version'],
    spec: {
      connectorRef: connectorRef as string,
      queryDefinitions: [] as NextGenHealthSourceSpec['queryDefinitions']
    }
  }

  for (const entry of queryMetricsMap.entries()) {
    const {
      identifier,
      metricName,
      groupName,
      query,
      sli,
      continuousVerification,
      healthScore,
      riskCategory,
      serviceInstance,
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
          ...(serviceInstance && { serviceInstanceField: serviceInstance as string })
        },
        liveMonitoringEnabled: Boolean(healthScore),
        continuousVerificationEnabled: Boolean(continuousVerification),
        sliEnabled: Boolean(sli),
        metricThresholds:
          Array.isArray(ignoreThresholds) && Array.isArray(failFastThresholds)
            ? getMetricThresholdsForCustomMetric({
                metricName,
                isMetricThresholdEnabled,
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

export function createHealthSourceConfigurationsData(
  sourceData: any,
  isTemplate?: boolean
): CommonHealthSourceConfigurations {
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

  if (isEdit && queryMetricsMap.size === 0) {
    const currentHealthSource = healthSourceList.find(
      (healthSource: { identifier: string }) => healthSource?.identifier === healthSourceIdentifier
    )
    const { queryDefinitions = [] } = currentHealthSource?.spec || {}
    queryMetricsMapData = cloneDeep(getUpdatedCustomMetrics(queryDefinitions))

    if (!isTemplate) {
      ignoreThresholds = getFilteredMetricThresholdValuesV2(MetricThresholdTypes.IgnoreThreshold, [], queryDefinitions)
      failFastThresholds = getFilteredMetricThresholdValuesV2(
        MetricThresholdTypes.FailImmediately,
        [],
        queryDefinitions
      )
    }
  }

  return {
    queryMetricsMap: queryMetricsMapData,
    selectedMetric: getSelectedMetric(selectedMetric, queryMetricsMapData),

    // metric thresholds section can be updated here.
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
          riskCategory: queryDefinition?.riskProfile?.riskCategory,
          serviceInstance: queryDefinition?.queryParams?.serviceInstanceField,
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
