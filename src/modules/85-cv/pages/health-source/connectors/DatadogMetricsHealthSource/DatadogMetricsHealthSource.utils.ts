/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isEmpty, isEqual } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'

import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import type {
  DatadogDashboardDetail,
  DatadogDashboardDTO,
  DatadogMetricHealthDefinition,
  DatadogMetricHealthSourceSpec,
  PrometheusHealthSourceSpec
} from 'services/cv'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import { OVERALL } from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/GCOMetricsHealthSource.constants'
import type {
  MetricDashboardItem,
  MetricWidget
} from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'
import type { SelectedWidgetMetricData } from '@cv/components/CloudMetricsHealthSource/CloudMetricsHealthSource.type'
import { MANUAL_INPUT_QUERY } from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/components/ManualInputQueryModal/ManualInputQueryModal'
import {
  DatadogMetricsQueryBuilder,
  DatadogMetricsQueryExtractor
} from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/components/DatadogMetricsDetailsContent/DatadogMetricsDetailsContent.utils'
import {
  DatadogMetricsHealthSourceFieldNames,
  defaultServiceInstaceValue,
  QUERY_CONTAINS_VALIDATION_PARAM
} from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.constants'
import type {
  DatadogAggregationType,
  DatadogMetricInfo,
  DatadogMetricSetupSource,
  PersistMappedMetricsType
} from './DatadogMetricsHealthSource.type'
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
import { createPayloadForAssignComponent } from '../../common/utils/HealthSource.utils'

export const DatadogProduct = {
  CLOUD_METRICS: 'Datadog Cloud Metrics',
  CLOUD_LOGS: 'Datadog Cloud Logs'
}

export function mapDatadogMetricHealthSourceToDatadogMetricSetupSource(
  sourceData: any,
  isMetricThresholdEnabled: boolean
): DatadogMetricSetupSource {
  const healthSource: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )

  const setupSource: DatadogMetricSetupSource = {
    selectedDashboards: sourceData.selectedDashboards || [],
    metricDefinition: sourceData.metricDefinition || new Map(),
    isEdit: sourceData.isEdit,
    healthSourceName: sourceData.healthSourceName,
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    connectorRef: sourceData.connectorRef?.value || sourceData.connectorRef,
    product: sourceData.product,
    ignoreThresholds: [],
    failFastThresholds: []
  }

  if (!healthSource) {
    return setupSource
  }

  const datadogMetricSpec: DatadogMetricHealthSourceSpec = (healthSource.spec as DatadogMetricHealthSourceSpec) || {}

  for (const metricDefinition of datadogMetricSpec.metricDefinitions || []) {
    if (
      !metricDefinition?.metricName ||
      ((!metricDefinition.dashboardName || !metricDefinition.dashboardId) && !metricDefinition.isCustomCreatedMetric)
    ) {
      continue
    }

    if (!sourceData.selectedDashboards?.length) {
      setupSource.selectedDashboards.push({
        name: metricDefinition.dashboardName,
        id: metricDefinition.dashboardId
      })
    }
    setupSource.metricDefinition.set(metricDefinition.metricPath || '', {
      identifier: metricDefinition.identifier?.split(' ').join('_'),
      dashboardId: metricDefinition.dashboardId,
      metricPath: metricDefinition.metricPath,
      metricName: metricDefinition.metricName,
      aggregator: metricDefinition.aggregation as DatadogAggregationType,
      metric: metricDefinition.metric,
      groupName: metricDefinition.dashboardName
        ? {
            label: metricDefinition.dashboardName,
            value: metricDefinition.dashboardName
          }
        : undefined,
      metricTags: metricDefinition.metricTags?.map(metricTag => {
        return { label: metricTag, value: metricTag }
      }),
      isManualQuery: metricDefinition?.isManualQuery,
      isCustomCreatedMetric: metricDefinition.isCustomCreatedMetric,
      riskCategory:
        metricDefinition?.analysis?.riskProfile?.category && metricDefinition?.analysis?.riskProfile?.metricType
          ? `${metricDefinition?.analysis?.riskProfile?.category}/${metricDefinition?.analysis?.riskProfile?.metricType}`
          : '',
      higherBaselineDeviation: Boolean(
        metricDefinition.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER')
      ),
      lowerBaselineDeviation: Boolean(
        metricDefinition.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER')
      ),
      query: metricDefinition.query,
      groupingQuery: metricDefinition.groupingQuery,
      serviceInstanceIdentifierTag: metricDefinition?.analysis?.deploymentVerification?.serviceInstanceFieldName,
      serviceInstance: metricDefinition.serviceInstanceIdentifierTag,
      continuousVerification: metricDefinition?.analysis?.deploymentVerification?.enabled,
      healthScore: Boolean(metricDefinition?.analysis?.liveMonitoring?.enabled),
      sli: Boolean(metricDefinition.sli?.enabled),
      // Update spec type from swagger
      ignoreThresholds: [],
      failFastThresholds: []
    })
  }

  if (isMetricThresholdEnabled) {
    setupSource.ignoreThresholds = getFilteredMetricThresholdValues(
      MetricThresholdTypes.IgnoreThreshold,
      (healthSource.spec as PrometheusHealthSourceSpec)?.metricPacks
    )

    setupSource.failFastThresholds = getFilteredMetricThresholdValues(
      MetricThresholdTypes.FailImmediately,
      (healthSource.spec as PrometheusHealthSourceSpec)?.metricPacks
    )
  }

  return setupSource
}

export const getServiceInstanceByValueType = (metricInfo: {
  serviceInstanceIdentifierTag?: string | SelectOption
}): string => {
  return typeof metricInfo.serviceInstanceIdentifierTag === 'string'
    ? metricInfo.serviceInstanceIdentifierTag || ''
    : (metricInfo.serviceInstanceIdentifierTag?.value as string) || ''
}

export function mapDatadogMetricSetupSourceToDatadogHealthSource(
  setupSource: DatadogMetricSetupSource,
  isMetricThresholdEnabled: boolean
): UpdatedHealthSource {
  const healthSource: UpdatedHealthSource = {
    type: HealthSourceTypes.DatadogMetrics as UpdatedHealthSource['type'],
    identifier: setupSource.healthSourceIdentifier,
    name: setupSource.healthSourceName,
    spec: {
      connectorRef:
        typeof setupSource.connectorRef === 'string' ? setupSource.connectorRef : setupSource.connectorRef?.value,
      feature: DatadogProduct.CLOUD_METRICS,
      metricDefinitions: [],
      metricPacks: []
    }
  }
  for (const selectedMetricInfo of setupSource.metricDefinition) {
    const [selectedMetric, metricInfo] = selectedMetricInfo
    if (!selectedMetric || !metricInfo) {
      continue
    }

    const { sli, riskCategory, healthScore, continuousVerification, lowerBaselineDeviation, higherBaselineDeviation } =
      metricInfo

    const assignComponentPayload = createPayloadForAssignComponent({
      sli,
      riskCategory,
      healthScore,
      continuousVerification,
      lowerBaselineDeviation,
      higherBaselineDeviation
    })

    const spec: DatadogMetricHealthSourceSpec = (healthSource.spec as DatadogMetricHealthSourceSpec) || {}
    spec.metricDefinitions?.push({
      identifier: metricInfo.identifier?.split(' ').join('_'),
      dashboardName: metricInfo.groupName?.value as string,
      dashboardId: metricInfo.dashboardId,
      metricPath: metricInfo.metricPath,
      metricName: metricInfo.metricName as string,
      metric: metricInfo.metric,
      metricTags: metricInfo.metricTags?.map(metricTag => metricTag.value as string),
      aggregation: metricInfo.aggregator,
      isManualQuery: metricInfo.isManualQuery,
      isCustomCreatedMetric: metricInfo.isCustomCreatedMetric,
      groupingQuery: metricInfo.groupingQuery,
      query: metricInfo.query,
      ...assignComponentPayload,
      analysis: {
        ...assignComponentPayload.analysis,
        deploymentVerification: {
          ...assignComponentPayload.analysis?.deploymentVerification,
          serviceInstanceFieldName: getServiceInstanceByValueType(metricInfo)
        }
      }
    } as DatadogMetricHealthDefinition)
  }

  if (isMetricThresholdEnabled) {
    // Needs to be updated with Datadog's spec once the swagger is ready
    ;(healthSource.spec as PrometheusHealthSourceSpec)?.metricPacks?.push({
      identifier: MetricTypeValues.Custom,
      metricThresholds: [...setupSource.ignoreThresholds, ...setupSource.failFastThresholds]
    })
  }

  return healthSource
}

export function getIsAllIDsUnique(
  selectedMetrics: Map<string, DatadogMetricInfo>,
  currentMetric: DatadogMetricInfo
): boolean {
  // to prevent error during submit
  if (!selectedMetrics) {
    return false
  }

  return ![...selectedMetrics.values()].find(
    metricData =>
      currentMetric.identifier?.trim() === metricData.identifier?.trim() &&
      currentMetric.metricPath !== metricData.metricPath
  )
}

export function validateFormMappings(
  values: DatadogMetricInfo,
  selectedMetrics: Map<string, DatadogMetricInfo>,
  getString: (key: StringKeys, vars?: Record<string, any> | undefined) => string
): Record<string, any> {
  const errors: any = {}

  if (!values?.query?.length) {
    errors.query = getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query')
  } else if (
    getMultiTypeFromValue(values?.query) === MultiTypeInputType.FIXED &&
    !values?.query?.includes(QUERY_CONTAINS_VALIDATION_PARAM)
  ) {
    errors.query = `${getString(
      'cv.monitoringSources.datadog.validation.queryContains'
    )}${QUERY_CONTAINS_VALIDATION_PARAM}`
  }

  if (![values.sli, values.continuousVerification, values.healthScore].some(i => i)) {
    errors[DatadogMetricsHealthSourceFieldNames.SLI] = getString(
      'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline'
    )
  }

  if (values.continuousVerification || values.healthScore) {
    if (!values.riskCategory) {
      errors[DatadogMetricsHealthSourceFieldNames.RISK_CATEGORY] = getString(
        'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory'
      )
    }
    if (!(values.higherBaselineDeviation || values.lowerBaselineDeviation)) {
      errors[DatadogMetricsHealthSourceFieldNames.HIGHER_BASELINE_DEVIATION] = getString(
        'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline'
      )
    }
    if (values.continuousVerification && !values.serviceInstance) {
      errors[DatadogMetricsHealthSourceFieldNames.SERVICE_INSTANCE] = getString(
        'cv.monitoringSources.gcoLogs.validation.serviceInstance'
      )
    }
  }

  if (!values.identifier?.trim()) {
    errors[DatadogMetricsHealthSourceFieldNames.METRIC_IDENTIFIER] = getString('validation.identifierRequired')
  } else {
    const isAllIDsUnique = getIsAllIDsUnique(selectedMetrics, values)

    if (!isAllIDsUnique) {
      errors[DatadogMetricsHealthSourceFieldNames.METRIC_IDENTIFIER] = getString(
        'cv.monitoringSources.uniqueIdentifierValidation',
        {
          idName: values.identifier.trim()
        }
      )
    }
  }

  if (!values.metricName?.length) {
    errors[DatadogMetricsHealthSourceFieldNames.METRIC_NAME] = getString('cv.monitoringSources.metricNameValidation')
  }
  if (!values.metric?.length && getMultiTypeFromValue(values.query) === MultiTypeInputType.FIXED) {
    errors[DatadogMetricsHealthSourceFieldNames.METRIC] = getString('cv.monitoringSources.metricValidation')
  }
  if (!values.groupName?.label?.length) {
    errors[DatadogMetricsHealthSourceFieldNames.GROUP_NAME] = getString(
      'cv.monitoringSources.prometheus.validation.groupName'
    )
  }

  return errors
}

const validateMetricThresholds = (
  errors: Record<string, string>,
  values: DatadogMetricInfo,
  getString: UseStringsReturn['getString']
): void => {
  // ignoreThresholds Validation
  validateCommonFieldsForMetricThreshold(
    MetricThresholdPropertyName.IgnoreThreshold,
    errors,
    values[MetricThresholdPropertyName.IgnoreThreshold] as MetricThresholdType[],
    getString,
    false
  )

  // failFastThresholds Validation
  validateCommonFieldsForMetricThreshold(
    MetricThresholdPropertyName.FailFastThresholds,
    errors,
    values[MetricThresholdPropertyName.FailFastThresholds] as MetricThresholdType[],
    getString,
    false
  )
}

export function validate(
  values: DatadogMetricInfo,
  selectedMetrics: Map<string, DatadogMetricInfo>,
  getString: (key: StringKeys) => string,
  isMetricThresholdEnabled: boolean
): { [key: string]: string } | undefined {
  const errors = validateFormMappings(values, selectedMetrics, getString)

  if (isMetricThresholdEnabled) {
    validateMetricThresholds(errors, values, getString)
  }

  if (selectedMetrics.size === 1) {
    return errors
  }

  for (const entry of selectedMetrics) {
    const [, metricInfo] = entry
    if (metricInfo.metricName === values.metricName) {
      continue
    }
    if (isEmpty(validateFormMappings(metricInfo, selectedMetrics, getString))) {
      return errors
    }
  }

  if (!isEmpty(errors)) {
    errors[OVERALL] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.mainSetupValidation')
  }

  return errors
}

export function getSelectedDashboards(data: any): MetricDashboardItem[] {
  return (
    data?.selectedDashboards
      ?.filter((dashboard: DatadogDashboardDTO) => dashboard.id)
      ?.map((dashboard: DatadogDashboardDTO) => {
        return {
          title: dashboard.name,
          itemId: dashboard.id
        }
      }) || []
  )
}

export function mapDatadogDashboardDetailToMetricWidget(
  dashboardId: string,
  datadogDashboardDetail: DatadogDashboardDetail
): MetricWidget {
  const widgetName =
    datadogDashboardDetail.widgetName ||
    (datadogDashboardDetail?.dataSets?.length
      ? datadogDashboardDetail?.dataSets
          ?.map(dataSet => dataSet.query)
          ?.reduce((previous, next) => {
            return `${previous}, ${next}`
          })
      : '')
  return {
    widgetName: widgetName || '',
    dataSets:
      datadogDashboardDetail.dataSets?.map(dataSet => {
        const metricPath = generateMetricPath(dashboardId, datadogDashboardDetail, dataSet.name || '')
        return {
          id: metricPath,
          name: `${dataSet.query}_${datadogDashboardDetail.widgetName}_${dashboardId}`,
          query: dataSet.query || ''
        }
      }) || []
  }
}

function generateMetricPath(dashboardId: string, dashboardDetail: DatadogDashboardDetail, metricName: string): string {
  return `${dashboardId}_${dashboardDetail.widgetName}_${metricName}`
}

export function mapSelectedWidgetDataToDatadogMetricInfo(
  selectedWidgetMetricData: SelectedWidgetMetricData,
  query: string,
  activeMetrics: string[],
  isTemplate = false
): DatadogMetricInfo {
  const queryExtractor = DatadogMetricsQueryExtractor(query, activeMetrics || [])
  const queryBuilder = DatadogMetricsQueryBuilder(
    queryExtractor.activeMetric || '',
    queryExtractor.aggregation,
    queryExtractor.metricTags.map(option => option.value as string),
    queryExtractor.groupingTags
  )
  return {
    metricName: selectedWidgetMetricData.metricName,
    identifier: selectedWidgetMetricData.metricName.split(' ').join('_'),
    dashboardId: selectedWidgetMetricData.dashboardId,
    metric: queryExtractor.activeMetric,
    aggregator: queryExtractor.aggregation,
    metricTags: queryExtractor.metricTags,
    query: queryBuilder.query || query,
    isManualQuery: isTemplate,
    isCustomCreatedMetric: selectedWidgetMetricData.query === MANUAL_INPUT_QUERY,
    groupName: selectedWidgetMetricData?.dashboardTitle
      ? {
          label: selectedWidgetMetricData.dashboardTitle,
          value: selectedWidgetMetricData.dashboardTitle
        }
      : undefined,
    metricPath: selectedWidgetMetricData.id,
    isNew: true,
    ignoreThresholds: [],
    failFastThresholds: []
  }
}

export function getCustomCreatedMetrics(selectedMetrics: Map<string, DatadogMetricInfo>): string[] {
  if (!selectedMetrics?.size) {
    return []
  }
  const manualQueries: string[] = []
  for (const entry of selectedMetrics) {
    const [metricPath, metricInfo] = entry
    if (metricPath && metricInfo?.isCustomCreatedMetric) {
      manualQueries.push(metricPath)
    }
  }
  return manualQueries
}

export const getServiceIntance = (tagKeys?: string[]): string[] => {
  let serviceInstanceList = tagKeys
  if (serviceInstanceList) {
    serviceInstanceList?.unshift(defaultServiceInstaceValue)
  } else {
    serviceInstanceList = [defaultServiceInstaceValue]
  }
  return serviceInstanceList
}

export const persistCustomMetric = ({
  mappedMetrics,
  selectedMetricId,
  metricThresholds,
  formikValues,
  setMappedMetrics
}: PersistMappedMetricsType): void => {
  const mapValue = mappedMetrics.get(selectedMetricId || '') as DatadogMetricInfo
  if (!isEmpty(mapValue)) {
    const nonCustomValuesFromSelectedMetric = {
      ignoreThresholds: mapValue?.ignoreThresholds,
      failFastThresholds: mapValue?.failFastThresholds
    }

    if (
      selectedMetricId === formikValues?.metricPath &&
      !isEqual(metricThresholds, nonCustomValuesFromSelectedMetric)
    ) {
      const clonedMappedMetrics = cloneDeep(mappedMetrics)
      clonedMappedMetrics.forEach((data, key) => {
        if (selectedMetricId === data.metricPath) {
          clonedMappedMetrics.set(selectedMetricId as string, { ...formikValues, ...metricThresholds })
        } else {
          clonedMappedMetrics.set(key, { ...data, ...metricThresholds })
        }
      })
      setMappedMetrics(clonedMappedMetrics)
    }
  }
}
