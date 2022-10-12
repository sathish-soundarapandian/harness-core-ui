import { groupBy, isEmpty } from 'lodash-es'
import type { IOptionProps } from '@blueprintjs/core'
import type { SelectOption } from '@harness/uicore'
import type { AnalysisDTO, MetricPackDTO, RiskProfile } from 'services/cv'
import { getIsValidPrimitive } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { CommonCustomMetricsType, GroupedCreatedMetrics, GroupedMetric } from './CustomMetric.types'
import { DefaultCustomMetricGroupName, ExceptionGroupName } from './CustomMetricV2.constants'
import { getCategoryAndMetricType, getThresholdTypes } from '../utils/HealthSource.utils'

export function isAssignSectionValid(customMetric: CommonCustomMetricsType): boolean {
  if (!customMetric) {
    return false
  }

  const { sli, analysis } = customMetric

  return Boolean(sli?.enabled || analysis?.deploymentVerification?.enabled || analysis?.liveMonitoring?.enabled)
}

const areValidInputs = (customMetrics: CommonCustomMetricsType[], defaultString: string): boolean => {
  return Boolean(defaultString) && Array.isArray(customMetrics)
}

export function getNewMetricIdentifier(
  customMetrics: CommonCustomMetricsType[],
  newMetricDefaultIdentifierString: string
): string {
  if (!areValidInputs(customMetrics, newMetricDefaultIdentifierString)) {
    return ''
  }

  return `${newMetricDefaultIdentifierString}_${customMetrics.length + 1}`
}

export function getNewMetricName(customMetrics: CommonCustomMetricsType[], newMetricDefaultNameString: string): string {
  if (!areValidInputs(customMetrics, newMetricDefaultNameString)) {
    return ''
  }

  return `${newMetricDefaultNameString} ${customMetrics.length + 1}`
}

export const defaultGroupedMetric = (getString: UseStringsReturn['getString']): SelectOption => {
  const createdMetricLabel = getString('cv.addGroupName')
  return { label: createdMetricLabel, value: createdMetricLabel }
}

const getCustomMetricIsValid = (
  customMetrics?: CommonCustomMetricsType[]
): customMetrics is Array<CommonCustomMetricsType> => {
  return Array.isArray(customMetrics)
}

export const getGroupedCustomMetrics = (
  customMetrics: CommonCustomMetricsType[],
  getString: UseStringsReturn['getString']
): GroupedCreatedMetrics =>
  groupBy(getGroupAndMetric(customMetrics, getString), function (item) {
    return (item?.groupName as SelectOption)?.label
  })

export const getGroupAndMetric = (
  mappedMetrics: CommonCustomMetricsType[],
  getString: UseStringsReturn['getString']
): GroupedMetric[] => {
  return mappedMetrics.map(item => {
    return {
      groupName: (item.groupName || defaultGroupedMetric(getString)) as SelectOption,
      metricName: item.metricName
    }
  })
}

export function getIsCustomMetricPresent(customMetrics?: CommonCustomMetricsType[]): boolean {
  if (getCustomMetricIsValid(customMetrics)) {
    return Boolean(customMetrics.length)
  }

  return false
}

export function getIsGivenMetricPresent(customMetrics: CommonCustomMetricsType[], selectedMetricName: string): boolean {
  if (getCustomMetricIsValid(customMetrics) && selectedMetricName) {
    return customMetrics.some(customMetric => customMetric.metricName === selectedMetricName)
  }

  return false
}

const getSelectedCustomMetricIsValid = (customMetrics: CommonCustomMetricsType[], selectedIndex: number): boolean => {
  return (
    getCustomMetricIsValid(customMetrics) &&
    getIsValidPrimitive<number>(selectedIndex) &&
    Boolean(customMetrics[selectedIndex])
  )
}

export const getCurrentSelectedMetricName = (
  customMetrics: CommonCustomMetricsType[],
  selectedIndex: number
): string => {
  if (getSelectedCustomMetricIsValid(customMetrics, selectedIndex)) {
    return customMetrics[selectedIndex].metricName
  }

  return ''
}

export const getCustomMetricGroupOptions = (groupedCreatedMetrics: GroupedCreatedMetrics): SelectOption[] => {
  if (groupedCreatedMetrics) {
    const groupNames = Object.keys(groupedCreatedMetrics)

    const filteredGroupNames = groupNames.filter(
      name => name !== DefaultCustomMetricGroupName && name !== ExceptionGroupName
    )

    return filteredGroupNames.map(groupName => {
      return {
        label: groupName,
        value: groupName
      }
    })
  }

  return []
}

export function getUpdatedSelectedMetricIndex(currentSelectedIndex: number): number {
  if (currentSelectedIndex > 0) {
    return currentSelectedIndex - 1
  }

  return currentSelectedIndex
}

// ⭐️ Risk Profile utils ⭐️

function checkIsAnalysisAvailable(
  customMetrics: CommonCustomMetricsType[],
  selectedCustomMetricIndex: number
): boolean {
  return Boolean(
    getCustomMetricIsValid(customMetrics) &&
      customMetrics[selectedCustomMetricIndex] &&
      customMetrics[selectedCustomMetricIndex].analysis
  )
}

export function canShowRiskProfile(
  customMetrics: CommonCustomMetricsType[],
  selectedCustomMetricIndex: number
): boolean {
  if (!checkIsAnalysisAvailable(customMetrics, selectedCustomMetricIndex)) {
    return false
  }

  const { analysis } = customMetrics[selectedCustomMetricIndex]

  if (!analysis) {
    return false
  }

  const { deploymentVerification, liveMonitoring } = analysis

  return Boolean(deploymentVerification?.enabled) || Boolean(liveMonitoring?.enabled)
}

export function canShowServiceInstance(
  customMetrics: CommonCustomMetricsType[],
  selectedCustomMetricIndex: number
): boolean {
  if (!checkIsAnalysisAvailable(customMetrics, selectedCustomMetricIndex)) {
    return false
  }

  const { analysis } = customMetrics[selectedCustomMetricIndex]

  return Boolean(analysis?.deploymentVerification?.enabled)
}

export function getRiskCategoryOptions(metricPacks?: MetricPackDTO[]): IOptionProps[] {
  if (!Array.isArray(metricPacks) || !metricPacks.length) {
    return []
  }

  const riskCategoryOptions: IOptionProps[] = []
  for (const metricPack of metricPacks) {
    if (metricPack?.identifier && metricPack.metrics?.length) {
      for (const metric of metricPack.metrics) {
        if (!metric?.name) {
          continue
        }

        riskCategoryOptions.push({
          label: metricPack.category !== metric.name ? `${metricPack.category}/${metric.name}` : metricPack.category,
          value: `${metricPack.category}/${metric.type}`
        })
      }
    }
  }

  return riskCategoryOptions
}

// ⭐️ Validation utils ⭐️

export function isDuplicateMetricName(
  customMetrics: CommonCustomMetricsType[],
  selectedMetricName: string,
  currentIndex: number
): boolean {
  if (Array.isArray(customMetrics) && selectedMetricName) {
    return customMetrics.some(
      (customMetric, index) => index !== currentIndex && customMetric.metricName === selectedMetricName
    )
  }

  return false
}

export function isDuplicateMetricIdentifier(
  customMetrics: CommonCustomMetricsType[],
  selectedMetricIdentifier: string,
  currentIndex: number
): boolean {
  if (Array.isArray(customMetrics) && selectedMetricIdentifier) {
    return customMetrics.some(
      (customMetric, index) => index !== currentIndex && customMetric.identifier === selectedMetricIdentifier
    )
  }

  return false
}

// ⭐️ Payload utils ⭐️

export const isRiskProfileAndCategoryPresent = (analysis: AnalysisDTO): boolean => {
  if (!analysis || isEmpty(analysis)) {
    return false
  }

  const { deploymentVerification, liveMonitoring, riskProfile } = analysis

  return Boolean(
    // For SLI alone scenario
    (deploymentVerification?.enabled || liveMonitoring?.enabled) &&
      riskProfile &&
      !isEmpty(riskProfile) &&
      riskProfile?.category
  )
}

export const isRiskProfileAndCategoryPresentForFormik = (analysis: AnalysisDTO): boolean => {
  return Boolean(isRiskProfileAndCategoryPresent(analysis) && analysis?.riskProfile?.metricType)
}

export const getGroupOption = (groupName?: string): SelectOption | undefined => {
  if (groupName) {
    return {
      label: groupName,
      value: groupName
    }
  }

  return undefined
}

// ⭐️ Formik to Payload ⭐️

const getRiskProfileForPayload = (analysis?: CommonCustomMetricsType['analysis']): AnalysisDTO['riskProfile'] => {
  if (!analysis || !isRiskProfileAndCategoryPresent(analysis)) {
    return {}
  }

  const { riskProfile, higherBaselineDeviation, lowerBaselineDeviation } = analysis

  const categoryAndMetricValues = getCategoryAndMetricType(riskProfile?.category)

  const thresholdsValues = getThresholdTypes({ higherBaselineDeviation, lowerBaselineDeviation })

  return {
    ...categoryAndMetricValues,
    thresholdTypes: thresholdsValues
  }
}

const getAnalysisForPayload = (analysis?: AnalysisDTO): AnalysisDTO => {
  if (!analysis || isEmpty(analysis)) {
    return {}
  }

  return {
    ...analysis,
    riskProfile: getRiskProfileForPayload(analysis)
  }
}

export const updateFormikValuesForPayload = (customMetrics: CommonCustomMetricsType[]): CommonCustomMetricsType[] => {
  if (!getIsCustomMetricPresent(customMetrics)) {
    return []
  }

  return customMetrics.map(customMetric => {
    return {
      ...customMetric,
      groupName: (customMetric.groupName as SelectOption)?.value as string,
      analysis: getAnalysisForPayload(customMetric.analysis),
      sli: { enabled: Boolean(customMetric?.sli?.enabled) },
      riskProfile: getRiskProfileForPayload(customMetric.analysis)
    }
  })
}

// ⭐️ Response to Formik ⭐️

const getRiskProfileForFormik = (analysis: AnalysisDTO): AnalysisDTO['riskProfile'] => {
  if (!isRiskProfileAndCategoryPresentForFormik(analysis)) {
    return {}
  }

  const { riskProfile } = analysis

  return {
    category: `${riskProfile?.category}/${riskProfile?.metricType}` as RiskProfile['category']
  }
}

export const getAnalysisForFormik = (analysis?: AnalysisDTO): CommonCustomMetricsType['analysis'] => {
  if (!analysis || isEmpty(analysis)) {
    return {}
  }

  return {
    ...analysis,
    riskProfile: getRiskProfileForFormik(analysis),
    lowerBaselineDeviation: analysis.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
    higherBaselineDeviation: analysis.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false
  }
}

export const updateResponseForFormik = (customMetrics?: CommonCustomMetricsType[]): CommonCustomMetricsType[] => {
  if (!customMetrics || !getIsCustomMetricPresent(customMetrics)) {
    return []
  }

  return customMetrics.map(customMetric => {
    return {
      ...customMetric,
      // From payload it comes as string, hence converting to Select option
      groupName: getGroupOption(customMetric.groupName) as unknown as string,
      analysis: getAnalysisForFormik(customMetric.analysis)
    }
  })
}
