/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep } from 'lodash-es'
import type { StringKeys } from 'framework/strings'
import { HealthSourceFieldNames } from '@cv/pages/health-source/common/utils/HealthSource.constants'
import type { MetricPackDTO, RiskProfile } from 'services/cv'
import type {
  AssignComponentPayload,
  BaseHealthSourceMetricDefinition,
  BaseHealthSourceMetricInfo,
  CommonSetupHealthSourceListType,
  RiskThresholdTypes
} from '@cv/pages/health-source/common/utils/HealthSource.types'

export const convertMetricPackToMetricData = (value?: MetricPackDTO[]): { [key: string]: boolean } => {
  const dataObject: { [key: string]: boolean } = {}
  const metricList: MetricPackDTO[] = value || []
  metricList.forEach((i: MetricPackDTO) => (dataObject[i.identifier as string] = true))
  return dataObject
}

export const validateMetricPackData = (
  metricData: { [key: string]: boolean },
  getString: (key: StringKeys) => string,
  errors: any
) => {
  const errorsToReturn = cloneDeep(errors)
  const metricValueList = Object.values(metricData).filter(val => val)
  if (!metricValueList.length) {
    errorsToReturn[HealthSourceFieldNames.METRIC_DATA] = getString(
      'cv.monitoringSources.appD.validations.selectMetricPack'
    )
  }
  return errorsToReturn
}

export const validateAssignComponent = (
  isAssignComponentValid: boolean,
  errors: any,
  getString: (key: StringKeys) => string,
  values: any,
  isRiskCategoryValid: boolean
): ((key: string | boolean | string[]) => string) => {
  const assignErrors = cloneDeep(errors)
  if (!isAssignComponentValid) {
    assignErrors['sli'] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
  } else {
    if (values.continuousVerification || values.healthScore) {
      if (!values.lowerBaselineDeviation && !values.higherBaselineDeviation) {
        assignErrors['lowerBaselineDeviation'] = getString('cv.monitoringSources.prometheus.validation.deviation')
      }
      if (!isRiskCategoryValid) {
        assignErrors['riskCategory'] = getString(
          'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory'
        )
      }
    }
  }
  return assignErrors
}

export function validateIdentifier<T extends BaseHealthSourceMetricInfo>(
  values: BaseHealthSourceMetricInfo,
  createdMetrics: string[],
  selectedMetricIndex: number,
  errors: any,
  getString: (key: StringKeys) => string,
  mappedMetrics?: Map<string, T>
): (key: string) => string {
  const errorsWithIdentifier = cloneDeep(errors)
  const identifiers = createdMetrics.map(metricName => mappedMetrics?.get(metricName)?.identifier)

  const duplicateIdentifier =
    identifiers.length < 2
      ? []
      : identifiers?.filter((identifier, index) => {
          if (index === selectedMetricIndex) {
            return false
          }
          return identifier === values.identifier
        })

  if (values.identifier && duplicateIdentifier.length) {
    errorsWithIdentifier[HealthSourceFieldNames.IDENTIFIER] = getString(
      'cv.monitoringSources.prometheus.validation.metricIdentifierUnique'
    )
  }
  return errorsWithIdentifier
}

export const getThresholdTypes = (thresholds: RiskThresholdTypes): RiskProfile['thresholdTypes'] => {
  const thresholdTypes: RiskProfile['thresholdTypes'] = []

  if (!thresholds) {
    return thresholdTypes
  }

  if (thresholds.lowerBaselineDeviation) {
    thresholdTypes.push('ACT_WHEN_LOWER')
  }
  if (thresholds.higherBaselineDeviation) {
    thresholdTypes.push('ACT_WHEN_HIGHER')
  }

  return thresholdTypes
}

export const getCategoryAndMetricType = (riskCategory?: string): Pick<RiskProfile, 'category' | 'metricType'> => {
  if (!riskCategory && typeof riskCategory !== 'string') {
    return {}
  }

  const [category, metricType] = riskCategory?.split('/') || []

  return {
    category: category as RiskProfile['category'],
    metricType: metricType as RiskProfile['metricType']
  }
}

export function createPayloadForAssignComponent(baseMetricInfo: BaseHealthSourceMetricInfo): AssignComponentPayload {
  const { riskCategory, lowerBaselineDeviation, higherBaselineDeviation, sli, continuousVerification, healthScore } =
    baseMetricInfo

  const categoryAndMetricType = getCategoryAndMetricType(riskCategory)

  const thresholdTypes: RiskProfile['thresholdTypes'] = getThresholdTypes({
    lowerBaselineDeviation,
    higherBaselineDeviation
  })

  const ifOnlySliIsSelected = Boolean(sli) && !(Boolean(healthScore) || Boolean(continuousVerification))

  const riskProfile = {
    ...categoryAndMetricType,
    thresholdTypes
  }

  return {
    sli: { enabled: Boolean(sli) },
    analysis: {
      riskProfile: ifOnlySliIsSelected ? {} : riskProfile,
      liveMonitoring: { enabled: Boolean(healthScore) },
      deploymentVerification: { enabled: Boolean(continuousVerification) }
    }
  }
}

export function mapCommonMetricInfoToCommonMetricDefinition(
  baseMetricInfo: BaseHealthSourceMetricInfo
): BaseHealthSourceMetricDefinition {
  const {
    identifier = '',
    metricName = '',
    groupName,
    riskCategory,
    lowerBaselineDeviation,
    higherBaselineDeviation,
    sli,
    continuousVerification,
    healthScore,
    isManualQuery
  } = baseMetricInfo
  const [category, metricType] = riskCategory?.split('/') || []
  const categoryData = category ? { category } : {}
  const thresholdTypes: RiskProfile['thresholdTypes'] = []

  if (lowerBaselineDeviation) {
    thresholdTypes.push('ACT_WHEN_LOWER')
  }
  if (higherBaselineDeviation) {
    thresholdTypes.push('ACT_WHEN_HIGHER')
  }

  const ifOnlySliIsSelected = Boolean(sli) && !(Boolean(healthScore) || Boolean(continuousVerification))

  const riskProfile: any = {
    ...categoryData,
    metricType: metricType,
    thresholdTypes
  }

  return {
    identifier: identifier,
    metricName,
    groupName: groupName?.value as string,
    sli: { enabled: Boolean(sli) },
    analysis: {
      riskProfile: ifOnlySliIsSelected ? {} : riskProfile,
      liveMonitoring: { enabled: Boolean(healthScore) },
      deploymentVerification: { enabled: Boolean(continuousVerification) }
    },
    isManualQuery: isManualQuery
  }
}

export function mapCommonMetricDefinitionToCommonMetricInfo(
  metricDefinition: BaseHealthSourceMetricDefinition
): BaseHealthSourceMetricInfo {
  return {
    identifier: metricDefinition.identifier,
    metricName: metricDefinition.metricName,
    riskCategory:
      metricDefinition.analysis?.riskProfile?.category && metricDefinition.analysis?.riskProfile?.metricType
        ? `${metricDefinition.analysis?.riskProfile?.category}/${metricDefinition.analysis?.riskProfile?.metricType}`
        : '',
    lowerBaselineDeviation: metricDefinition.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
    higherBaselineDeviation:
      metricDefinition.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,
    groupName: metricDefinition.groupName
      ? { label: metricDefinition.groupName, value: metricDefinition.groupName }
      : undefined,
    continuousVerification: metricDefinition.analysis?.deploymentVerification?.enabled,
    healthScore: metricDefinition.analysis?.liveMonitoring?.enabled,
    sli: metricDefinition.sli?.enabled,
    isManualQuery: metricDefinition.isManualQuery
  }
}

// ⭐️ V2 utils ⭐️
export const getCurrentHealthSourceData = (
  healthSourceList: CommonSetupHealthSourceListType[],
  selectedHealthSourceIdentifier: string
): CommonSetupHealthSourceListType | null => {
  if (!healthSourceList || !selectedHealthSourceIdentifier) {
    return null
  }

  const foundHealthSource = healthSourceList.find(
    healthSource => healthSource.identifier === selectedHealthSourceIdentifier
  )

  if (!foundHealthSource) {
    return null
  }

  return foundHealthSource
}
