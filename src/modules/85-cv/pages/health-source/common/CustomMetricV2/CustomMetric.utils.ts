import { groupBy } from 'lodash-es'
import type { IOptionProps } from '@blueprintjs/core'
import type { SelectOption } from '@harness/uicore'
import type { MetricPackDTO } from 'services/cv'
import { getIsValidPrimitive } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { CommonCustomMetricsType, GroupedCreatedMetrics, GroupedMetric } from './CustomMetric.types'
import { DefaultCustomMetricGroupName, ExceptionGroupName, RiskProfileBaslineValues } from './CustomMetricV2.constants'

export function getNewMetricIdentifier(
  customMetrics: CommonCustomMetricsType[],
  newMetricDefaultNameString: string
): string {
  if (!newMetricDefaultNameString || !Array.isArray(customMetrics)) {
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
      groupName: item.groupName || defaultGroupedMetric(getString),
      metricName: item.metricName
      // continuousVerification: item.continuousVerification
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

// ⭐️ Risk Profile

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

export const getThresholdTypeOptions = (getString: UseStringsReturn['getString']): IOptionProps[] => {
  return [
    {
      label: getString('cv.monitoringSources.higherCounts'),
      value: RiskProfileBaslineValues.ACT_WHEN_HIGHER
    },
    {
      label: getString('cv.monitoringSources.lowerCounts'),
      value: RiskProfileBaslineValues.ACT_WHEN_LOWER
    }
  ]
}

// ⭐️ Validation utils

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

export const updateGroupNameInSpecForPayload = (
  customMetrics: CommonCustomMetricsType[]
): CommonCustomMetricsType[] => {
  if (!getIsCustomMetricPresent(customMetrics)) {
    return []
  }

  return customMetrics.map(customMetric => {
    return {
      ...customMetric,
      groupName: (customMetric.groupName as SelectOption)?.value as string
    }
  })
}

const getGroupOption = (groupName?: string): SelectOption | undefined => {
  if (groupName) {
    return {
      label: groupName,
      value: groupName
    }
  }

  return undefined
}

export const updateGroupNameInSpecForFormik = (
  customMetrics?: CommonCustomMetricsType[]
): CommonCustomMetricsType[] => {
  if (!customMetrics || !getIsCustomMetricPresent(customMetrics)) {
    return []
  }

  return customMetrics.map(customMetric => {
    return {
      ...customMetric,
      // From payload it comes as string, hence converting to Select option
      groupName: getGroupOption(customMetric.groupName)
    }
  })
}
