/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isEmpty, isEqual } from 'lodash-es'
import type {
  CustomHealthSourceMetricSpec,
  RiskProfile,
  MetricPackDTO,
  useGetMetricPacks,
  PrometheusHealthSourceSpec,
  TimeSeriesMetricPackDTO
} from 'services/cv'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type {
  MapCustomHealthToService,
  CustomHealthSourceSetupSource,
  onSubmitCustomHealthSourceInterface,
  PersistMappedMetricsType
} from './CustomHealthSource.types'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { defaultMetricName, INITFORMDATA } from './CustomHealthSource.constants'
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

const validateMetricThresholds = (
  errors: Record<string, string>,
  values: MapCustomHealthToService,
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

export function validateMappings(
  getString: UseStringsReturn['getString'],
  createdMetrics: string[],
  selectedMetricIndex: number,
  values: MapCustomHealthToService,
  isMetricThresholdEnabled?: boolean
): { [fieldName: string]: string } {
  let errors = {}

  errors = validateCustomMetricFields(values, createdMetrics, selectedMetricIndex, {}, getString)

  if (isMetricThresholdEnabled) {
    validateMetricThresholds(errors, values, getString)
  }

  return errors
}

const validateCustomMetricFields = (
  values: any,
  createdMetrics: string[],
  selectedMetricIndex: number,
  errors: any,
  getString: (key: StringKeys) => string
): ((key: string | boolean | string[]) => string) => {
  let completErrors = cloneDeep(errors)

  const isAssignComponentValid = [values?.sli, values?.continuousVerification, values?.healthScore].find(i => i)
  const isRiskCategoryValid = !!values?.riskCategory

  const duplicateNames = createdMetrics?.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values.metricName
  })

  const formValues = values || {}

  if (!formValues.groupName || !formValues.groupName?.value) {
    completErrors['groupName'] = getString('cv.monitoringSources.prometheus.validation.groupName')
  }

  if (!formValues.metricName) {
    completErrors['metricName'] = getString('cv.monitoringSources.metricNameValidation')
  }

  if (!formValues.queryType) {
    completErrors['queryType'] = getString('cv.customHealthSource.Querymapping.validation.queryType')
  }

  validateMappingInfo(formValues, completErrors, getString)

  if (formValues.requestMethod === 'POST' && !formValues.query) {
    completErrors['query'] = getString('cv.customHealthSource.Querymapping.validation.body')
  }

  if (!formValues.metricValue) {
    completErrors['metricValue'] = getString('cv.healthSource.connectors.NewRelic.validations.metricValue')
  }

  if (!formValues.timestamp) {
    completErrors['timestamp'] = getString('cv.healthSource.connectors.NewRelic.validations.timestamp')
  }

  if (formValues.metricName && duplicateNames.length) {
    completErrors['metricName'] = getString('cv.monitoringSources.prometheus.validation.metricNameUnique')
  }

  completErrors = validateAssignComponent(isAssignComponentValid, completErrors, getString, values, isRiskCategoryValid)
  return completErrors
}

export function validateMappingInfo(
  formValues: any,
  completErrors: any,
  getString: UseStringsReturn['getString']
): void {
  if (!formValues.pathURL) {
    completErrors['pathURL'] = getString('cv.customHealthSource.Querymapping.validation.path')
  }

  if (!formValues.startTime?.timestampFormat) {
    completErrors['startTime.timestampFormat'] = getString(
      'cv.customHealthSource.Querymapping.validation.startTime.timestamp'
    )
  }

  if (!formValues.requestMethod) {
    completErrors['requestMethod'] = getString('connectors.customHealth.requestMethod')
  }

  if (!formValues.startTime?.placeholder) {
    completErrors['startTime.placeholder'] = getString(
      'cv.customHealthSource.Querymapping.validation.startTime.placeholder'
    )
  }

  if (!formValues.endTime?.timestampFormat) {
    completErrors['endTime.timestampFormat'] = getString(
      'cv.customHealthSource.Querymapping.validation.endTime.timestamp'
    )
  }

  if (!formValues.endTime?.placeholder) {
    completErrors['endTime.placeholder'] = getString(
      'cv.customHealthSource.Querymapping.validation.endTime.placeholder'
    )
  }

  if (formValues.endTime?.placeholder && formValues.startTime?.placeholder) {
    if (formValues.startTime.placeholder === formValues.endTime.placeholder) {
      completErrors['startTime.placeholder'] = getString(
        'cv.customHealthSource.Querymapping.validation.startAndEndTime'
      )
    }
    if (
      (!formValues.pathURL?.includes(formValues.startTime.placeholder) ||
        !formValues.pathURL?.includes(formValues.endTime.placeholder)) &&
      (!formValues.query?.includes(formValues.startTime.placeholder) ||
        !formValues.query.includes(formValues.endTime.placeholder))
    ) {
      completErrors['pathURL'] = getString('cv.customHealthSource.Querymapping.validation.pathWithoutPlaceholder')
    }
  }
}

const validateAssignComponent = (
  isAssignComponentValid: boolean,
  errors: any,
  getString: (key: StringKeys) => string,
  values: any,
  isRiskCategoryValid: boolean
): ((key: string | boolean | string[]) => string) => {
  const _error = cloneDeep(errors)
  if (!isAssignComponentValid) {
    _error['sli'] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
  } else if (isAssignComponentValid) {
    if (values.continuousVerification || values.healthScore) {
      if (values.lowerBaselineDeviation !== true && values.higherBaselineDeviation !== true) {
        _error['lowerBaselineDeviation'] = getString('cv.monitoringSources.prometheus.validation.deviation')
      }
      if (!isRiskCategoryValid) {
        _error['riskCategory'] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory')
      }
    }
  }
  return _error
}

export function transformCustomHealthSourceToSetupSource(
  sourceData: any,
  isMetricThresholdEnabled: boolean
): CustomHealthSourceSetupSource {
  const healthSource: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )

  if (!healthSource) {
    return {
      isEdit: false,
      healthSourceIdentifier: sourceData.healthSourceIdentifier,
      mappedServicesAndEnvs: new Map([
        [
          defaultMetricName,
          {
            metricName: defaultMetricName,
            identifier: '',
            query: '',
            queryType: undefined,
            requestMethod: undefined,
            metricIdentifier: defaultMetricName.split(' ').join('_'),
            baseURL: '',
            pathURL: '',
            metricValue: '',
            timestamp: '',
            timestampFormat: '',
            serviceInstancePath: '',
            startTime: {
              placeholder: '',
              timestampFormat: 'SECONDS',
              customTimestampFormat: ''
            },
            endTime: {
              placeholder: '',
              timestampFormat: 'SECONDS',
              customTimestampFormat: ''
            },
            ignoreThresholds: [],
            failFastThresholds: []
          }
        ]
      ]),
      healthSourceName: sourceData.healthSourceName,
      connectorRef: sourceData.connectorRef,
      ignoreThresholds: [],
      failFastThresholds: []
    }
  }

  const setupSource: CustomHealthSourceSetupSource = {
    isEdit: sourceData.isEdit,
    mappedServicesAndEnvs: new Map(),
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    healthSourceName: sourceData.healthSourceName,
    connectorRef: sourceData.connectorRef,
    ignoreThresholds: [],
    failFastThresholds: []
  }

  for (const metricDefinition of (healthSource?.spec as CustomHealthSourceMetricSpec)?.metricDefinitions || []) {
    if (metricDefinition?.metricName) {
      setupSource.mappedServicesAndEnvs.set(metricDefinition.metricName, {
        metricName: metricDefinition.metricName,
        metricIdentifier: metricDefinition.identifier,
        groupName: { label: metricDefinition.groupName || '', value: metricDefinition.groupName || '' },

        // assign section
        continuousVerification: Boolean(metricDefinition?.analysis?.deploymentVerification?.enabled),
        healthScore: Boolean(metricDefinition.analysis?.liveMonitoring?.enabled),
        sli: Boolean(metricDefinition.sli?.enabled),
        riskCategory:
          metricDefinition.analysis?.riskProfile?.category && metricDefinition.analysis.riskProfile.metricType
            ? `${metricDefinition.analysis.riskProfile.category}/${metricDefinition.analysis.riskProfile.metricType}`
            : '',
        serviceInstanceIdentifier: metricDefinition.metricResponseMapping?.serviceInstanceJsonPath || '',
        lowerBaselineDeviation:
          metricDefinition.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
        higherBaselineDeviation:
          metricDefinition.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,

        //
        queryType: metricDefinition.queryType,
        requestMethod: metricDefinition.requestDefinition?.method,
        query: metricDefinition.requestDefinition?.requestBody || '',
        baseURL: '', // get this from connector API
        pathURL: metricDefinition.requestDefinition?.urlPath || '',
        metricValue: metricDefinition.metricResponseMapping?.metricValueJsonPath || '',
        timestamp: metricDefinition.metricResponseMapping?.timestampJsonPath || '',
        timestampFormat: metricDefinition.metricResponseMapping?.timestampFormat || '',
        serviceInstancePath: metricDefinition.metricResponseMapping?.serviceInstanceJsonPath || '',
        startTime: {
          placeholder: metricDefinition.requestDefinition?.startTimeInfo?.placeholder,
          timestampFormat: metricDefinition.requestDefinition?.startTimeInfo?.timestampFormat,
          customTimestampFormat: metricDefinition.requestDefinition?.startTimeInfo?.customTimestampFormat
        },
        endTime: {
          placeholder: metricDefinition.requestDefinition?.endTimeInfo?.placeholder,
          timestampFormat: metricDefinition.requestDefinition?.endTimeInfo?.timestampFormat,
          customTimestampFormat: metricDefinition.requestDefinition?.endTimeInfo?.customTimestampFormat
        },
        ignoreThresholds: [],
        failFastThresholds: []
      })
    }
  }

  // Update PrometheusHealthSourceSpec to CustomHealthSpec once after updating the swagger
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

export function transformCustomSetupSourceToHealthSource(
  setupSource: CustomHealthSourceSetupSource,
  isMetricThresholdEnabled: boolean
): UpdatedHealthSource {
  const spec: CustomHealthSourceMetricSpec & { metricPacks: TimeSeriesMetricPackDTO[] } = {
    connectorRef: setupSource?.connectorRef,
    metricDefinitions: [],
    metricPacks: []
  }

  const dsConfig: UpdatedHealthSource = {
    type: 'CustomHealthMetric',
    identifier: setupSource.healthSourceIdentifier,
    name: setupSource.healthSourceName,
    spec
  }

  for (const entry of setupSource.mappedServicesAndEnvs.entries()) {
    const {
      metricName,
      metricIdentifier,
      groupName,
      queryType,
      requestMethod,
      query,
      riskCategory,
      lowerBaselineDeviation,
      higherBaselineDeviation,
      sli,
      continuousVerification,
      serviceInstanceIdentifier,
      healthScore,
      pathURL,
      startTime,
      endTime,
      metricValue,
      timestamp,
      timestampFormat
    }: MapCustomHealthToService = entry[1]

    if (!groupName || !metricName) {
      continue
    }

    const [category, metricType] = riskCategory?.split('/') || []
    const thresholdTypes: RiskProfile['thresholdTypes'] = []
    if (lowerBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_LOWER')
    }
    if (higherBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_HIGHER')
    }

    spec.metricDefinitions?.push({
      identifier: metricIdentifier,
      requestDefinition: {
        urlPath: pathURL,
        method: requestMethod,
        requestBody: query,
        startTimeInfo: startTime,
        endTimeInfo: endTime
      },
      queryType,
      metricName,
      groupName: groupName.value as string,
      metricResponseMapping: {
        metricValueJsonPath: metricValue,
        timestampJsonPath: timestamp,
        serviceInstanceJsonPath: serviceInstanceIdentifier,
        timestampFormat: timestampFormat
      },
      sli: { enabled: Boolean(sli) },
      analysis: {
        riskProfile: {
          category: category as RiskProfile['category'],
          metricType: metricType as RiskProfile['metricType'],
          thresholdTypes
        },
        liveMonitoring: { enabled: Boolean(healthScore) },
        deploymentVerification: {
          enabled: Boolean(continuousVerification),
          serviceInstanceMetricPath: serviceInstanceIdentifier
        }
      }
    })
  }

  if (
    isMetricThresholdEnabled &&
    Array.isArray(setupSource?.ignoreThresholds) &&
    Array.isArray(setupSource?.failFastThresholds)
  ) {
    // Needs to be updated with CustomHealth's spec once the swagger is ready
    ;(dsConfig.spec as PrometheusHealthSourceSpec)?.metricPacks?.push({
      identifier: MetricTypeValues.Custom,
      metricThresholds: [...setupSource.ignoreThresholds, ...setupSource.failFastThresholds]
    })
  }

  return dsConfig
}

export const onSubmitCustomHealthSource = ({
  formikProps,
  mappedMetrics,
  selectedMetric,
  onSubmit,
  sourceData,
  transformedSourceData,
  isMetricThresholdEnabled,
  metricThresholds
}: onSubmitCustomHealthSourceInterface): void => {
  const updatedMetric = formikProps.values
  if (updatedMetric) {
    mappedMetrics.set(selectedMetric, updatedMetric)
  }
  onSubmit(
    sourceData,
    transformCustomSetupSourceToHealthSource(
      {
        ...transformedSourceData,
        mappedServicesAndEnvs: mappedMetrics,
        ...metricThresholds
      } as CustomHealthSourceSetupSource,
      isMetricThresholdEnabled
    )
  )
}

function getMetricPackDTO(
  identifier: MetricPackDTO['identifier'],
  category: MetricPackDTO['category'],
  metrics: MetricPackDTO['metrics']
): MetricPackDTO {
  return {
    uuid: '2',
    accountId: '',
    orgIdentifier: '',
    projectIdentifier: '',
    dataSourceType: 'CUSTOM_HEALTH_METRIC',
    identifier,
    category,
    metrics
  }
}

export function generateCustomMetricPack(): ReturnType<typeof useGetMetricPacks> {
  const categories: MetricPackDTO['category'][] = ['Errors', 'Infrastructure', 'Performance']
  const packs: MetricPackDTO[] = []
  for (const category of categories) {
    switch (category) {
      case 'Errors':
        packs.push(
          getMetricPackDTO('Errors', 'Errors' as MetricPackDTO['category'], [
            {
              name: 'Errors',
              type: 'ERROR',
              thresholds: [],
              included: false
            }
          ])
        )
        break
      case 'Infrastructure':
        packs.push(
          getMetricPackDTO('Infrastructure', 'Infrastructure' as MetricPackDTO['category'], [
            {
              name: 'Infrastructure',
              type: 'INFRA',
              thresholds: [],
              included: false
            }
          ])
        )
        break
      case 'Performance':
        packs.push(
          getMetricPackDTO('Performance', 'Performance' as MetricPackDTO['category'], [
            {
              name: 'Throughput',
              type: 'THROUGHPUT',
              thresholds: [],
              included: false
            },
            {
              name: 'Other',
              type: 'ERROR',
              thresholds: [],
              included: false
            },
            {
              name: 'Response Time',
              type: 'RESP_TIME',
              thresholds: [],
              included: false
            }
          ])
        )
    }
  }

  return {
    loading: false,
    error: null,
    data: {
      metaData: {},
      resource: packs
    },
    absolutePath: '',
    cancel: () => undefined,
    refetch: () => Promise.resolve(),
    response: null
  }
}

export const getInitCustomMetricData = (baseURL: string) => {
  return { ...INITFORMDATA, baseURL }
}

export const persistCustomMetric = ({
  mappedMetrics,
  selectedMetric,
  metricThresholds,
  formikValues,
  setMappedMetrics
}: PersistMappedMetricsType): void => {
  const mapValue = mappedMetrics.get(selectedMetric || '') as MapCustomHealthToService
  if (!isEmpty(mapValue)) {
    const nonCustomValuesFromSelectedMetric = {
      ignoreThresholds: mapValue?.ignoreThresholds,
      failFastThresholds: mapValue?.failFastThresholds
    }

    if (selectedMetric === formikValues?.metricName && !isEqual(metricThresholds, nonCustomValuesFromSelectedMetric)) {
      const clonedMappedMetrics = cloneDeep(mappedMetrics)
      clonedMappedMetrics.forEach((data, key) => {
        if (selectedMetric === data.metricName) {
          clonedMappedMetrics.set(selectedMetric as string, { ...formikValues, ...metricThresholds })
        } else {
          clonedMappedMetrics.set(key, { ...data, ...metricThresholds })
        }
      })

      setMappedMetrics({ selectedMetric: selectedMetric, mappedMetrics: clonedMappedMetrics })
    }
  }
}
