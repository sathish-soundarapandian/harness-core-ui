import type { SelectOption } from '@harness/uicore'
import type { SeriesLineOptions } from 'highcharts'
import { cloneDeep } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type {
  CloudWatchMetricDefinition,
  CloudWatchMetricsHealthSourceSpec,
  HealthSource,
  ResponseListString,
  TimeSeriesMetricPackDTO
} from 'services/cv'
import {
  isDuplicateMetricIdentifier,
  isDuplicateMetricName,
  updateResponseForFormik,
  updateFormikValuesForPayload,
  isAssignSectionValid
} from '../../common/CustomMetricV2/CustomMetric.utils'
import { getConnectorRef, getCurrentHealthSourceData } from '../../common/utils/HealthSource.utils'
import { HealthSourceTypes } from '../../types'
import type {
  CloudWatchFormCustomMetricType,
  CloudWatchFormType,
  CloudWatchSetupSource,
  CreatePayloadUtilParams,
  HealthSourceListData,
  IsMultiRecordDataErrorParameters,
  MetricSamplePointsData,
  MetricThresholdsForFormParams
} from './CloudWatch.types'
import {
  cloudWatchInitialValues,
  CloudWatchProductNames,
  CloudWatchProperties,
  CustomMetricsValidationName,
  newCloudWatchCustomMetricValues
} from './CloudWatchConstants'
import {
  getFilteredMetricThresholdValues,
  validateCommonFieldsForMetricThreshold
} from '../../common/MetricThresholds/MetricThresholds.utils'
import {
  MetricThresholdPropertyName,
  MetricThresholdTypes,
  MetricTypeValues
} from '../../common/MetricThresholds/MetricThresholds.constants'
import type { MetricThresholdType } from '../../common/MetricThresholds/MetricThresholds.types'

export function getRegionsDropdownOptions(regions: ResponseListString['data']): SelectOption[] {
  const regionOptions: SelectOption[] = []

  if (regions) {
    regions.forEach(region => {
      if (region) {
        regionOptions.push({
          value: region,
          label: region
        })
      }
    })
  }

  return regionOptions
}

const getMetricThresholdsForForm = ({
  metricThresholds,
  thresholdType,
  isMetricThresholdEnabled
}: MetricThresholdsForFormParams): MetricThresholdType[] => {
  if (!isMetricThresholdEnabled || !Array.isArray(metricThresholds) || !thresholdType) {
    return []
  }

  return getFilteredMetricThresholdValues(thresholdType, metricThresholds)
}

export const getFormikInitialValue = (
  data: CloudWatchSetupSource,
  isMetricThresholdEnabled: boolean
): CloudWatchFormType => {
  if (!data || !data?.isEdit) {
    return cloudWatchInitialValues
  }

  const currentHealthSourceData = getCurrentHealthSourceData(
    data.healthSourceList,
    data.healthSourceIdentifier
  ) as HealthSourceListData

  if (!currentHealthSourceData) {
    return cloudWatchInitialValues
  }

  const { spec } = currentHealthSourceData

  return {
    region: spec?.region,
    customMetrics: updateResponseForFormik(spec?.metricDefinitions) as CloudWatchFormType['customMetrics'],
    selectedCustomMetricIndex: 0,
    failFastThresholds: getMetricThresholdsForForm({
      metricThresholds: spec?.metricPacks,
      thresholdType: MetricThresholdTypes.FailImmediately,
      isMetricThresholdEnabled
    }),
    ignoreThresholds: getMetricThresholdsForForm({
      metricThresholds: spec?.metricPacks,
      thresholdType: MetricThresholdTypes.IgnoreThreshold,
      isMetricThresholdEnabled
    })
  }
}

export function getSelectedGroupItem(
  customMetrics: CloudWatchFormCustomMetricType[],
  selectedCustomMetricIndex: number
): SelectOption | undefined {
  if (
    typeof selectedCustomMetricIndex !== undefined &&
    Array.isArray(customMetrics) &&
    customMetrics[selectedCustomMetricIndex]
  ) {
    return customMetrics[selectedCustomMetricIndex].groupName as SelectOption
  }

  return undefined
}

const isMetricThresholdsPresent = (formValues: CloudWatchFormType): boolean => {
  const { failFastThresholds, ignoreThresholds } = formValues || {}

  return (
    Array.isArray(ignoreThresholds) &&
    Array.isArray(failFastThresholds) &&
    Boolean(ignoreThresholds.length || failFastThresholds.length)
  )
}

const getCloudWatchMetricThresholds = (
  formValues: CloudWatchFormType,
  isMetricThresholdEnabled?: boolean
): TimeSeriesMetricPackDTO[] => {
  const { failFastThresholds, ignoreThresholds } = formValues || {}

  if (!isMetricThresholdsPresent(formValues) || !isMetricThresholdEnabled) {
    return [
      {
        identifier: MetricTypeValues.Custom,
        metricThresholds: []
      }
    ]
  }

  return [
    {
      identifier: MetricTypeValues.Custom,
      metricThresholds: [...ignoreThresholds, ...failFastThresholds]
    }
  ]
}

const getCloudWatchSpec = (params: CreatePayloadUtilParams): CloudWatchMetricsHealthSourceSpec => {
  const { formikValues, setupSourceData, isMetricThresholdEnabled } = params
  const { customMetrics, region } = formikValues
  return {
    region,
    connectorRef: getConnectorRef(setupSourceData.connectorRef),
    feature: CloudWatchProductNames.METRICS,
    metricDefinitions: updateFormikValuesForPayload(customMetrics) as CloudWatchMetricDefinition[],
    metricPacks: getCloudWatchMetricThresholds(formikValues, isMetricThresholdEnabled)
  }
}

export const createPayloadForCloudWatch = (params: CreatePayloadUtilParams): HealthSource => {
  const { setupSourceData } = params

  const { healthSourceIdentifier, healthSourceName } = setupSourceData

  const cloudWatchSpec = getCloudWatchSpec(params)

  return {
    type: HealthSourceTypes.CloudWatchMetrics,
    name: healthSourceName,
    identifier: healthSourceIdentifier,
    spec: cloudWatchSpec
  }
}

const isIdentifierValid = (identifierText: string): boolean => {
  const testRegex = new RegExp('^[a-z][a-zA-Z0-9_]*$')

  return Boolean(identifierText && testRegex.test(identifierText))
}

const validateMetricThresholds = (
  errors: Record<string, string>,
  values: CloudWatchFormType,
  getString: UseStringsReturn['getString']
): void => {
  // ignoreThresholds Validation
  validateCommonFieldsForMetricThreshold(
    MetricThresholdPropertyName.IgnoreThreshold,
    errors,
    values[MetricThresholdPropertyName.IgnoreThreshold],
    getString,
    false
  )

  // failFastThresholds Validation
  validateCommonFieldsForMetricThreshold(
    MetricThresholdPropertyName.FailFastThresholds,
    errors,
    values[MetricThresholdPropertyName.FailFastThresholds],
    getString,
    false
  )
}

export const validateForm = (
  formValues: CloudWatchFormType,
  getString: UseStringsReturn['getString'],
  isMetricThresholdEnabled?: boolean
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!formValues) {
    return {}
  }

  if (isMetricThresholdEnabled) {
    validateMetricThresholds(errors, formValues, getString)
  }

  const { customMetrics, region } = formValues

  if (!region) {
    errors[CloudWatchProperties.region] = getString('cd.cloudFormation.errors.region')
  }

  if (Array.isArray(customMetrics)) {
    if (region && !customMetrics.length) {
      return {
        [CustomMetricsValidationName]: getString(
          'cv.healthSource.connectors.CloudWatch.validationMessage.customMetrics'
        )
      }
    }

    customMetrics.forEach((customMetric, index) => {
      const { identifier, metricName, groupName, expression, analysis } = customMetric

      if (!metricName) {
        errors[`customMetrics.${index}.metricName`] = getString('cv.monitoringSources.metricNameValidation')
      }

      if (!identifier) {
        errors[`customMetrics.${index}.identifier`] = getString('cv.monitoringSources.metricIdentifierValidation')
      } else if (!isIdentifierValid(identifier)) {
        errors[`customMetrics.${index}.identifier`] = getString('cv.monitoringSources.metricIdentifierPattern')
      }

      if (!groupName) {
        errors[`customMetrics.${index}.groupName`] = getString('cv.monitoringSources.prometheus.validation.groupName')
      }

      if (!expression || !expression?.trim()?.length) {
        errors[`customMetrics.${index}.expression`] = getString(
          'cv.healthSource.connectors.CloudWatch.validationMessage.expression'
        )
      }

      if (metricName && isDuplicateMetricName(customMetrics, metricName, index)) {
        errors[`customMetrics.${index}.metricName`] = getString(
          'cv.monitoringSources.prometheus.validation.metricNameUnique'
        )
      }

      if (identifier && isDuplicateMetricIdentifier(customMetrics, identifier, index)) {
        errors[`customMetrics.${index}.metricName`] = getString(
          'cv.monitoringSources.prometheus.validation.metricIdentifierUnique'
        )
      }

      if (!isAssignSectionValid(customMetric)) {
        errors[`customMetrics.${index}.analysis.deploymentVerification.enabled`] = getString(
          'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline'
        )
      } else {
        if (analysis?.deploymentVerification?.enabled || analysis?.liveMonitoring?.enabled) {
          if (!analysis.higherBaselineDeviation && !analysis.lowerBaselineDeviation) {
            errors[`customMetrics.${index}.analysis.lowerBaselineDeviation`] = getString(
              'cv.monitoringSources.prometheus.validation.deviation'
            )
          }

          if (!analysis.riskProfile?.riskCategory) {
            errors[`customMetrics.${index}.analysis.riskProfile.riskCategory`] = getString(
              'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory'
            )
          }

          if (
            analysis?.deploymentVerification?.enabled &&
            (!customMetric.responseMapping?.serviceInstanceJsonPath ||
              !customMetric.responseMapping?.serviceInstanceJsonPath?.trim().length)
          ) {
            errors[`customMetrics.${index}.responseMapping.serviceInstanceJsonPath`] = getString(
              'cv.monitoringSources.gcoLogs.validation.serviceInstance'
            )
          }
        }
      }
    })
  }

  return errors
}

export const getDefaultValuesForNewCustomMetric = (): CloudWatchMetricDefinition => {
  return cloneDeep(newCloudWatchCustomMetricValues)
}

export const isRequiredSampleDataPresent = (sampleData: MetricSamplePointsData | null): boolean => {
  return Boolean(
    sampleData &&
      sampleData?.MetricDataResults &&
      Array.isArray(sampleData?.MetricDataResults) &&
      sampleData?.MetricDataResults?.length
  )
}

export const getSampleDataHightchartPoints = (sampleData: MetricSamplePointsData | null): SeriesLineOptions[] => {
  const options: SeriesLineOptions[] = []

  if (!isRequiredSampleDataPresent(sampleData) || !sampleData) {
    return options
  }

  sampleData.MetricDataResults.forEach(pointsData => {
    if (pointsData && pointsData?.Timestamps) {
      const points: SeriesLineOptions['data'] = []
      pointsData?.Timestamps?.forEach((timeStamp, index) => {
        points.push({ x: timeStamp * 1000, y: pointsData?.Values[index] })
      })
      options.push({
        data: points,
        type: 'line',
        name: pointsData.Label
      })
    }
  })

  return options
}

export const isMultiRecordDataError = (params: IsMultiRecordDataErrorParameters): boolean => {
  const { isDataPressent, isMultipleSampleData, isUpdatedExpression, loading, expression, isQueryExectuted } = params

  return Boolean(
    expression && isQueryExectuted && !loading && isDataPressent && isMultipleSampleData && isUpdatedExpression
  )
}
