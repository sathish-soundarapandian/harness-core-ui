/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { cloneDeep, isEmpty, isEqual } from 'lodash-es'
import type { GroupedCreatedMetrics } from '@cv/components/CommonMultiItemsSideNav/components/CommonSelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type { AppDMetricDefinitions, AppDynamicsHealthSourceSpec } from 'services/cv'
import type { StringsMap } from 'stringTypes'
import {
  getFilteredCVDisabledMetricThresholds,
  getFilteredMetricThresholdValues,
  getMetricPacksForPayload
} from '../../common/MetricThresholds/MetricThresholds.utils'
import { createPayloadForAssignComponentV2 } from '../../common/utils/HealthSource.utils'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'
import type { NonCustomFeildsInterface } from '../AppDynamics/AppDHealthSource.types'
import { convertMetricPackToMetricData, deriveBaseAndMetricPath } from '../AppDynamics/AppDHealthSource.utils'
import { PATHTYPE } from '../AppDynamics/Components/AppDCustomMetricForm/AppDCustomMetricForm.constants'
import { initCustomForm, ThresholdTypes } from './CommonHealthSource.constants'
import type {
  HealthSourceInitialData,
  HealthSourceSetupSource,
  CommonHealthSourceFormikInterface,
  PersistMappedMetricsType
} from './CommonHealthSource.types'

// TODO - these functions has to be made in a generic way.
export const createHealthSourceData = (sourceData: any): HealthSourceInitialData => {
  const payload: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )

  const { applicationName = '', tierName = '', metricPacks } = (payload?.spec as AppDynamicsHealthSourceSpec) || {}

  const appdData = {
    name: sourceData?.healthSourceName,
    identifier: sourceData?.healthSourceIdentifier,
    connectorRef: sourceData?.connectorRef,
    isEdit: sourceData?.isEdit,
    product: sourceData?.product,
    type: HealthSourceTypes.AppDynamics,
    applicationName,
    tierName,
    metricPacks,
    mappedServicesAndEnvs: new Map()
  }

  for (const metricDefinition of (payload?.spec as AppDynamicsHealthSourceSpec)?.metricDefinitions || []) {
    if (metricDefinition?.metricName) {
      const { metricPathObj, basePathObj } = deriveBaseAndMetricPath(metricDefinition?.completeMetricPath, tierName)

      appdData.mappedServicesAndEnvs.set(metricDefinition.metricName, {
        metricPath: metricPathObj,
        basePath: basePathObj,
        completeMetricPath: metricDefinition.completeMetricPath,
        metricName: metricDefinition.metricName,
        metricIdentifier: metricDefinition.identifier,
        riskCategory: metricDefinition?.analysis?.riskProfile?.riskCategory,
        lowerBaselineDeviation:
          metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
        higherBaselineDeviation:
          metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,
        groupName: { label: metricDefinition.groupName || '', value: metricDefinition.groupName || '' },
        continuousVerification: metricDefinition?.analysis?.deploymentVerification?.enabled,
        healthScore: metricDefinition?.analysis?.liveMonitoring?.enabled,
        sli: metricDefinition.sli?.enabled,
        serviceInstanceMetricPath: metricDefinition.completeServiceInstanceMetricPath
      })
    }
  }

  return appdData
}

export const createHealthSourceFormData = (
  healthSourceData: HealthSourceInitialData,
  mappedMetrics: Map<string, CommonHealthSourceFormikInterface>,
  selectedMetric: string,
  nonCustomFeilds: NonCustomFeildsInterface,
  showCustomMetric: boolean
  // isTemplate = false
): CommonHealthSourceFormikInterface => {
  const mappedMetricsData = mappedMetrics.get(selectedMetric) as CommonHealthSourceFormikInterface
  const metricIdentifier = mappedMetricsData?.identifier || selectedMetric?.split(' ').join('_')
  // if (
  //   isTemplate &&
  //   serviceInstanceMetricPath === '' &&
  //   mappedMetricsData &&
  //   mappedMetricsData?.continuousVerification
  // ) {
  //   mappedMetricsData.serviceInstanceMetricPath = RUNTIME_INPUT_VALUE
  // } else if (!mappedMetricsData?.continuousVerification && !isEmpty(mappedMetricsData?.serviceInstanceMetricPath)) {
  //   mappedMetricsData.serviceInstanceMetricPath = ''
  // }

  // const isTierRuntimeOrExpression = getMultiTypeFromValue(nonCustomFeilds?.appDTier) !== MultiTypeInputType.FIXED
  // const isApplicationRuntimeOrExpression =
  //   getMultiTypeFromValue(nonCustomFeilds.appdApplication) !== MultiTypeInputType.FIXED
  // const isConnectorRuntimeOrExpression =
  //   getMultiTypeFromValue(healthSourceData?.connectorRef?.value) !== MultiTypeInputType.FIXED

  // const completeMetricPathForTemplates =
  //   (isTierRuntimeOrExpression || isApplicationRuntimeOrExpression || isConnectorRuntimeOrExpression) &&
  //   getMultiTypeFromValue(completeMetricPath) === MultiTypeInputType.FIXED
  //     ? RUNTIME_INPUT_VALUE
  //     : completeMetricPath

  const data = {
    name: healthSourceData.name,
    // identifier: healthSourceData.identifier,
    connectorRef: healthSourceData.connectorRef,
    isEdit: healthSourceData.isEdit,
    product: healthSourceData.product,
    type: healthSourceData.type,
    // pathType: isTemplate || completeMetricPath ? PATHTYPE.CompleteMetricPath : PATHTYPE.DropdownPath,
    mappedServicesAndEnvs: healthSourceData.mappedServicesAndEnvs,
    ...nonCustomFeilds,
    ...(mappedMetrics.get(selectedMetric) as CommonHealthSourceFormikInterface),
    // completeMetricPath: isTemplate ? completeMetricPathForTemplates : completeMetricPath,
    metricName: selectedMetric,
    showCustomMetric,
    metricIdentifier
  }

  return data
}

// TODO - these functions has to be made in a generic way.
export const createHealthSourcePayload = (
  formData: any,
  isMetricThresholdEnabled: boolean
): UpdatedHealthSource | null => {
  const specPayload = {
    applicationName: (formData?.appdApplication?.label as string) || (formData.appdApplication as string),
    tierName: (formData?.appDTier?.label as string) || (formData.appDTier as string),
    metricData: formData.metricData,
    metricDefinitions: [] as AppDMetricDefinitions[]
  }

  if (formData.showCustomMetric) {
    for (const entry of formData.mappedServicesAndEnvs.entries()) {
      const {
        metricName,
        groupName,
        riskCategory,
        lowerBaselineDeviation,
        higherBaselineDeviation,
        sli,
        continuousVerification,
        healthScore,
        metricIdentifier,
        basePath,
        metricPath,
        serviceInstanceMetricPath,
        completeMetricPath
      } = entry[1]

      let derivedCompleteMetricPath = completeMetricPath
      if (formData.pathType === PATHTYPE.DropdownPath) {
        derivedCompleteMetricPath = `${basePath[Object.keys(basePath)[Object.keys(basePath).length - 1]]?.path}|${
          formData.appDTier
        }|${metricPath[Object.keys(metricPath)[Object.keys(metricPath).length - 1]]?.path}`
      }

      const assignComponentPayload = createPayloadForAssignComponentV2({
        sli,
        riskCategory,
        healthScore,
        continuousVerification,
        lowerBaselineDeviation,
        higherBaselineDeviation
      })

      let serviceInstanceMetricPathData = {}
      if (assignComponentPayload.analysis?.deploymentVerification?.enabled) {
        serviceInstanceMetricPathData = {
          completeServiceInstanceMetricPath: serviceInstanceMetricPath
        }
      }

      specPayload?.metricDefinitions?.push({
        identifier: metricIdentifier,
        metricName,
        completeMetricPath: derivedCompleteMetricPath,
        groupName: groupName?.value as string,
        ...serviceInstanceMetricPathData,
        ...assignComponentPayload
      })
    }
  }

  return {
    name: formData.name || (formData.healthSourceName as string),
    identifier: formData.identifier || (formData.healthSourceIdentifier as string),
    type: 'AppDynamics' as any,
    spec: {
      ...specPayload,
      feature: 'Application Monitoring' as string,
      connectorRef: (formData?.connectorRef?.value as string) || (formData.connectorRef as string),
      metricPacks: getMetricPacksForPayload(formData, isMetricThresholdEnabled)
    }
  }
}

// function generateMultiSelectOptionListFromPrometheusFilter(filters?: PrometheusFilter[]): MultiSelectOption[] {
//   if (!filters?.length) {
//     return []
//   }

//   const options: MultiSelectOption[] = []
//   for (const filter of filters) {
//     if (filter?.labelName && filter.labelValue) {
//       options.push({ label: `${filter.labelName}:${filter.labelValue}`, value: filter.labelName })
//     }
//   }

//   return options
// }

export function transformCommonHealthSourceToSetupSource(
  sourceData: any,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  isTemplate?: boolean
  // isMetricThresholdEnabled?: boolean
): HealthSourceSetupSource {
  // const healthSource: UpdatedHealthSource = sourceData?.healthSourceList?.find(
  //   (source: UpdatedHealthSource) => source.name === sourceData.healthSourceName
  // )
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(sourceData.connectorRef) !== MultiTypeInputType.FIXED

  // transformation for create scenario
  // if (!healthSource) {
  return {
    isEdit: false,
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    mappedServicesAndEnvs: new Map([
      [
        getString('cv.monitoringSources.commonHealthSource.metric'),
        {
          metricName: '',
          identifier: '',
          groupName: '',
          isManualQuery: Boolean(isTemplate),
          query: isConnectorRuntimeOrExpression ? RUNTIME_INPUT_VALUE : ''
        }
      ]
    ]) as Map<string, CommonHealthSourceFormikInterface>,
    healthSourceName: sourceData.healthSourceName,
    connectorRef: sourceData.connectorRef,
    product: sourceData.product,
    ignoreThresholds: [],
    failFastThresholds: []
  }
  // }

  // const setupSource: PrometheusSetupSource = {
  //   isEdit: sourceData.isEdit,
  //   mappedServicesAndEnvs: new Map(),
  //   healthSourceIdentifier: sourceData.healthSourceIdentifier,
  //   healthSourceName: sourceData.healthSourceName,
  //   product: sourceData.product,
  //   connectorRef: sourceData.connectorRef
  //   // TODO - see later on
  //   // ignoreThresholds: isMetricThresholdEnabled
  //   //   ? getFilteredMetricThresholdValues(
  //   //       MetricThresholdTypes.IgnoreThreshold,
  //   //       (healthSource.spec as PrometheusHealthSourceSpec)?.metricPacks || []
  //   //     )
  //   //   : [],
  //   // failFastThresholds: isMetricThresholdEnabled
  //   //   ? getFilteredMetricThresholdValues(
  //   //       MetricThresholdTypes.FailImmediately,
  //   //       (healthSource.spec as PrometheusHealthSourceSpec)?.metricPacks || []
  //   //     )
  //   //   : []
  // }

  // for (const metricDefinition of (healthSource?.spec as PrometheusHealthSourceSpec)?.metricDefinitions || []) {
  //   if (metricDefinition?.metricName) {
  //     setupSource.mappedServicesAndEnvs.set(metricDefinition.metricName, {
  //       identifier: metricDefinition.identifier,
  //       metricName: metricDefinition.metricName,
  //       prometheusMetric: metricDefinition.prometheusMetric,
  //       query: metricDefinition.query || '',
  //       isManualQuery: metricDefinition.isManualQuery || false,
  //       // TODO - see later on
  //       // serviceFilter: generateMultiSelectOptionListFromPrometheusFilter(metricDefinition.serviceFilter),
  //       // envFilter: generateMultiSelectOptionListFromPrometheusFilter(metricDefinition.envFilter),
  //       // additionalFilter: generateMultiSelectOptionListFromPrometheusFilter(metricDefinition.additionalFilters),
  //       aggregator: metricDefinition.aggregation,
  //       riskCategory: metricDefinition?.analysis?.riskProfile?.riskCategory,
  //       serviceInstance:
  //         isTemplate && !isConnectorRuntimeOrExpression
  //           ? {
  //               label: defaultTo(metricDefinition?.analysis?.deploymentVerification?.serviceInstanceFieldName, ''),
  //               value: defaultTo(metricDefinition?.analysis?.deploymentVerification?.serviceInstanceFieldName, '')
  //             }
  //           : metricDefinition?.analysis?.deploymentVerification?.serviceInstanceFieldName,
  //       lowerBaselineDeviation:
  //         metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
  //       higherBaselineDeviation:
  //         metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,
  //       groupName: { label: metricDefinition.groupName || '', value: metricDefinition.groupName || '' },
  //       continuousVerification: metricDefinition?.analysis?.deploymentVerification?.enabled,
  //       healthScore: metricDefinition?.analysis?.liveMonitoring?.enabled,
  //       sli: metricDefinition.sli?.enabled
  //     } as MapPrometheusQueryToService)
  //   }
  // }

  // return setupSource
}

export const persistCustomMetric = ({
  mappedMetrics,
  selectedMetric,
  metricThresholds,
  formikValues,
  setMappedMetrics
}: PersistMappedMetricsType): void => {
  const mapValue = mappedMetrics.get(selectedMetric) as CommonHealthSourceFormikInterface
  if (!isEmpty(mapValue)) {
    const nonCustomValuesFromSelectedMetric = {
      ignoreThresholds: mapValue?.ignoreThresholds,
      failFastThresholds: mapValue?.failFastThresholds
    }

    if (selectedMetric === formikValues?.metricName && !isEqual(metricThresholds, nonCustomValuesFromSelectedMetric)) {
      const clonedMappedMetrics = cloneDeep(mappedMetrics)
      clonedMappedMetrics.forEach((data, key) => {
        if (selectedMetric === data.metricName) {
          clonedMappedMetrics.set(selectedMetric, { ...formikValues, ...metricThresholds })
        } else {
          clonedMappedMetrics.set(key, { ...data, ...metricThresholds })
        }
      })
      setMappedMetrics({ selectedMetric: selectedMetric, mappedMetrics: clonedMappedMetrics })
    }
  }
}

export const initHealthSourceCustomForm = () => {
  return {
    ...initCustomForm,
    groupName: { label: '', value: '' }
  }
}

export const resetShowCustomMetric = (
  selectedMetric: string,
  mappedMetrics: Map<string, CommonHealthSourceFormikInterface>,
  setShowCustomMetric: (value: React.SetStateAction<boolean>) => void
): void => {
  if (!selectedMetric && !mappedMetrics.size) {
    setShowCustomMetric(false)
  }
}

export const initializeNonCustomFields = (
  healthSourceData: HealthSourceInitialData,
  isMetricThresholdEnabled: boolean
): NonCustomFeildsInterface => {
  const ignoreThresholds = isMetricThresholdEnabled
    ? getFilteredMetricThresholdValues(ThresholdTypes.IgnoreThreshold, healthSourceData.metricPacks)
    : []

  const failFastThresholds = isMetricThresholdEnabled
    ? getFilteredMetricThresholdValues(ThresholdTypes.FailImmediately, healthSourceData.metricPacks)
    : []

  return {
    appdApplication: healthSourceData?.applicationName || '',
    appDTier: healthSourceData?.tierName || '',
    metricPacks: healthSourceData?.metricPacks || undefined,
    metricData: convertMetricPackToMetricData(healthSourceData?.metricPacks),
    ignoreThresholds,
    failFastThresholds
  }
}

export const submitData = (
  formik: FormikProps<CommonHealthSourceFormikInterface>,
  mappedMetrics: Map<string, CommonHealthSourceFormikInterface>,
  selectedMetric: string,
  onSubmit: (healthSourcePayload: any) => void,
  groupedCreatedMetrics: GroupedCreatedMetrics
): void => {
  const updatedMetric = formik.values
  if (updatedMetric) {
    mappedMetrics.set(selectedMetric, updatedMetric)
  }

  const filteredCVDisabledMetricThresholds = getFilteredCVDisabledMetricThresholds(
    formik.values.ignoreThresholds,
    formik.values.failFastThresholds,
    groupedCreatedMetrics
  )

  const updatedValues = {
    ...formik.values,
    ...filteredCVDisabledMetricThresholds,
    mappedServicesAndEnvs: mappedMetrics
  }
  onSubmit(updatedValues)
}
