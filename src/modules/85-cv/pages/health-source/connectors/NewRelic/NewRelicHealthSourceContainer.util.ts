/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'
import type { NewRelicHealthSourceSpec, NewRelicMetricDefinition } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'
import type { NewRelicData } from './NewRelicHealthSource.types'
import { getMetricPacksForPayload } from '../../common/MetricThresholds/MetricThresholds.utils'
import { createPayloadForAssignComponent } from '../../common/utils/HealthSource.utils'

export const createNewRelicPayload = (formData: any, isMetricThresholdEnabled: boolean): UpdatedHealthSource | null => {
  const specPayload = {
    applicationName: formData?.newRelicApplication?.label || formData?.newRelicApplication,
    applicationId: formData?.newRelicApplication?.value || formData?.newRelicApplication,
    metricData: formData?.metricData,
    newRelicMetricDefinitions: [] as NewRelicMetricDefinition[]
  }

  if (formData.showCustomMetric) {
    for (const entry of formData.mappedServicesAndEnvs.entries()) {
      const {
        metricName,
        metricIdentifier,
        groupName,
        query,
        metricValue,
        timestamp,
        timestampFormat,
        serviceInstanceIdentifier,
        sli,
        continuousVerification,
        healthScore,
        riskCategory,
        lowerBaselineDeviation,
        higherBaselineDeviation
      } = entry[1]

      const assignComponentPayload = createPayloadForAssignComponent({
        sli,
        riskCategory,
        healthScore,
        continuousVerification,
        lowerBaselineDeviation,
        higherBaselineDeviation
      })

      specPayload?.newRelicMetricDefinitions?.push({
        identifier: metricIdentifier || uuid(),
        metricName,
        groupName: groupName?.value as string,
        nrql: query,
        responseMapping: {
          metricValueJsonPath: metricValue,
          serviceInstanceJsonPath: serviceInstanceIdentifier,
          timestampFormat: timestampFormat,
          timestampJsonPath: timestamp
        },
        ...assignComponentPayload
      })
    }
  }

  return {
    name: formData.name || (formData.healthSourceName as string),
    identifier: formData.identifier || (formData.healthSourceIdentifier as string),
    type: formData.type,
    spec: {
      ...specPayload,
      feature: formData.product?.value as string,
      connectorRef:
        formData?.connectorRef.value ||
        (formData?.connectorRef?.connector?.identifier as string) ||
        (formData.connectorRef as string),
      metricPacks: getMetricPacksForPayload(formData, isMetricThresholdEnabled)
    }
  }
}

export const createNewRelicData = (sourceData: any): NewRelicData => {
  const payload: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )

  const {
    applicationName = '',
    applicationId = '',
    metricPacks = []
  } = (payload?.spec as NewRelicHealthSourceSpec) || {}

  const newRelicData = {
    name: sourceData?.healthSourceName,
    identifier: sourceData?.healthSourceIdentifier,
    connectorRef: sourceData?.connectorRef,
    isEdit: sourceData?.isEdit,
    product: sourceData?.product,
    type: HealthSourceTypes.NewRelic,
    applicationName,
    applicationId,
    metricPacks,
    mappedServicesAndEnvs: new Map()
  }

  for (const metricDefinition of (payload?.spec as NewRelicHealthSourceSpec)?.newRelicMetricDefinitions || []) {
    if (metricDefinition?.metricName) {
      newRelicData.mappedServicesAndEnvs.set(metricDefinition.metricName, {
        metricName: metricDefinition.metricName,
        metricIdentifier: metricDefinition.identifier,
        groupName: { label: metricDefinition.groupName || '', value: metricDefinition.groupName || '' },

        query: metricDefinition?.nrql,

        metricValue: metricDefinition?.responseMapping?.metricValueJsonPath,
        timestampFormat: metricDefinition?.responseMapping?.timestampFormat,
        timestamp: metricDefinition?.responseMapping?.timestampJsonPath,

        sli: metricDefinition?.sli?.enabled,
        continuousVerification: metricDefinition?.analysis?.deploymentVerification?.enabled,
        healthScore: metricDefinition?.analysis?.liveMonitoring?.enabled,
        riskCategory:
          metricDefinition?.analysis?.riskProfile?.category && metricDefinition?.analysis?.riskProfile?.metricType
            ? `${metricDefinition?.analysis?.riskProfile?.category}/${metricDefinition?.analysis?.riskProfile?.metricType}`
            : '',
        lowerBaselineDeviation:
          metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
        higherBaselineDeviation:
          metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false
      })
    }
  }

  return newRelicData
}
