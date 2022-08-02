/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import type { NewRelicHealthSourceSpec, NewRelicMetricDefinition, RiskProfile } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'
import type { NewRelicData } from './NewRelicHealthSource.types'

export const createNewRelicPayload = (formData: any): UpdatedHealthSource | null => {
  const specPayload = {
    applicationName: formData?.newRelicApplication?.label,
    applicationId: formData?.newRelicApplication?.value,
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

      const [category, metricType] = riskCategory?.split('/') || []
      const thresholdTypes: RiskProfile['thresholdTypes'] = []

      if (lowerBaselineDeviation) {
        thresholdTypes.push('ACT_WHEN_LOWER')
      }
      if (higherBaselineDeviation) {
        thresholdTypes.push('ACT_WHEN_HIGHER')
      }

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
        sli: { enabled: Boolean(sli) },
        analysis: {
          riskProfile: {
            category,
            metricType,
            thresholdTypes
          },
          liveMonitoring: { enabled: Boolean(healthScore) },
          deploymentVerification: { enabled: Boolean(continuousVerification) }
        }
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
      connectorRef: (formData?.connectorRef?.connector?.identifier as string) || (formData.connectorRef as string),
      metricPacks: Object.entries(formData?.metricData)
        .map(item => {
          return item[1]
            ? {
                identifier: item[0]
              }
            : {}
        })
        .filter(item => !isEmpty(item))
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
