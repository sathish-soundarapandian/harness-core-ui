import type { SelectOption } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type {
  CloudWatchMetricDefinition,
  CloudWatchMetricsHealthSourceSpec,
  HealthSource,
  ResponseListString
} from 'services/cv'
import {
  isDuplicateMetricIdentifier,
  isDuplicateMetricName,
  updateResponseForFormik,
  updateFormikValuesForPayload,
  isAssignSectionValid
} from '../../common/CustomMetricV2/CustomMetric.utils'
import { getCurrentHealthSourceData } from '../../common/utils/HealthSource.utils'
import { HealthSourceTypes } from '../../types'
import type {
  CloudWatchFormCustomMetricType,
  CloudWatchFormType,
  CloudWatchSetupSource,
  CreatePayloadUtilParams,
  HealthSourceListData
} from './CloudWatch.types'
import {
  cloudWatchInitialValues,
  CloudWatchProductNames,
  CloudWatchProperties,
  newCloudWatchCustomMetricValues
} from './CloudWatchConstants'

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

export const getFormikInitialValue = (data: CloudWatchSetupSource): CloudWatchFormType => {
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
    selectedCustomMetricIndex: 0
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

const getCloudWatchSpec = (params: CreatePayloadUtilParams): CloudWatchMetricsHealthSourceSpec => {
  const { formikValues, setupSourceData } = params
  const { customMetrics, region } = formikValues
  return {
    region,
    connectorRef: setupSourceData.connectorRef,
    feature: CloudWatchProductNames.METRICS,
    metricDefinitions: updateFormikValuesForPayload(customMetrics)
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

export const validateForm = (
  formValues: CloudWatchFormType,
  getString: UseStringsReturn['getString']
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!formValues) {
    return {}
  }

  const { customMetrics, region } = formValues

  if (!region) {
    errors[CloudWatchProperties.region] = getString('cd.cloudFormation.errors.region')
  }

  if (Array.isArray(customMetrics)) {
    customMetrics.forEach((customMetric, index) => {
      const { identifier, metricName, groupName, expression, analysis } = customMetric

      if (!metricName) {
        errors[`customMetrics.${index}.metricName`] = getString('cv.monitoringSources.metricNameValidation')
      }

      if (!identifier) {
        errors[`customMetrics.${index}.identifier`] = getString('cv.monitoringSources.metricIdentifierValidation')
      }

      if (!groupName) {
        errors[`customMetrics.${index}.groupName`] = getString('cv.monitoringSources.prometheus.validation.groupName')
      }

      if (!expression) {
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
        errors[`HealthSourceServicesV2-${index}`] = getString(
          'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline'
        )
      } else {
        if (analysis?.deploymentVerification?.enabled || analysis?.liveMonitoring?.enabled) {
          if (!analysis.riskProfile?.thresholdTypes?.length) {
            errors[`baselineDeviation-${index}`] = getString('cv.monitoringSources.prometheus.validation.deviation')
          }

          if (!analysis.riskProfile?.category) {
            errors[`customMetrics.${index}.analysis.riskProfile.category`] = getString(
              'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory'
            )
          }

          if (analysis?.deploymentVerification?.enabled && !customMetric.responseMapping?.serviceInstanceJsonPath) {
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
