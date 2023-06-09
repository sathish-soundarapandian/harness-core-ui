/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { MetricPackDTO, MetricThreshold, TimeSeriesMetricPackDTO } from 'services/cv'
import type { GroupedMetric } from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import { isNotAValidNumber } from '@cv/utils/CommonUtils'
import type { GroupedCreatedMetrics } from '../CustomMetric/CustomMetric.types'
import {
  CustomMetricDropdownOption,
  DefaultCustomMetricGroupName,
  ExceptionGroupName,
  FailFastActionValues,
  MetricCriteriaValues,
  MetricThresholdPropertyName,
  MetricTypesForTransactionTextField,
  MetricTypeValues
} from './MetricThresholds.constants'
import type {
  AvailableThresholdTypes,
  HandleCriteriaPercentageUpdateParams,
  MetricThresholdsForCustomMetricProps,
  MetricThresholdsState,
  MetricThresholdType,
  SelectItem,
  ThresholdObject,
  ThresholdsPropertyNames
} from './MetricThresholds.types'

export const getCriterialItems = (getString: UseStringsReturn['getString']): SelectItem[] => {
  return [
    {
      label: getString('cv.monitoringSources.appD.absoluteValue'),
      value: MetricCriteriaValues.Absolute
    },
    {
      label: getString('cv.monitoringSources.appD.percentageDeviation'),
      value: MetricCriteriaValues.Percentage
    }
  ]
}

export const getDefaultValueForMetricType = (
  metricData?: Record<string, boolean>,
  metricPacks?: MetricPackDTO[],
  isOnlyCustomMetricHealthSource?: boolean
): string | undefined => {
  return isOnlyCustomMetricHealthSource
    ? MetricTypeValues.Custom
    : getDefaultMetricTypeValue(metricData as Record<string, boolean>, metricPacks)
}

export function updateThresholdState(
  previousValues: MetricThresholdsState,
  updatedThreshold: ThresholdObject
): MetricThresholdsState {
  return {
    ...previousValues,
    ...updatedThreshold
  }
}

export function getActionItems(getString: UseStringsReturn['getString']): SelectItem[] {
  return [
    {
      label: getString('cv.monitoringSources.appD.failImmediately'),
      value: FailFastActionValues.FailImmediately
    },
    {
      label: getString('cv.monitoringSources.appD.failAfterMultipleOccurrences'),
      value: FailFastActionValues.FailAfterOccurrences
    },
    {
      label: getString('cv.monitoringSources.appD.failAfterConsecutiveOccurrences'),
      value: FailFastActionValues.FailAfterConsecutiveOccurrences
    }
  ]
}

export const isGroupTransationTextField = (selectedMetricType?: string | null): boolean =>
  MetricTypesForTransactionTextField.some(field => field === selectedMetricType)

function getGroupsWithCVEnabled(groupedCreatedMetrics: GroupedCreatedMetrics): string[] {
  const CVEnabledGroups = []

  for (const groupName in groupedCreatedMetrics) {
    const isCVEnabled = groupedCreatedMetrics[groupName].some(metricDetails => metricDetails.continuousVerification)

    if (isCVEnabled) {
      CVEnabledGroups.push(groupName)
    }
  }

  return CVEnabledGroups
}

export function getCustomMetricGroupNames(groupedCreatedMetrics: GroupedCreatedMetrics): string[] {
  if (!groupedCreatedMetrics) {
    return []
  }

  const groupsWithCVEnabled = getGroupsWithCVEnabled(groupedCreatedMetrics)

  return groupsWithCVEnabled.filter(
    groupName => groupName !== '' && groupName !== DefaultCustomMetricGroupName && groupName !== ExceptionGroupName
  )
}

export function getGroupDropdownOptions(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  if (!groupedCreatedMetrics) {
    return []
  }

  const validGroups = getCustomMetricGroupNames(groupedCreatedMetrics)

  return validGroups.map(group => ({
    label: group,
    value: group
  }))
}

function getAreAllRequiredValuesPresent(thresholdValueToCompare: MetricThresholdType): boolean {
  return [
    thresholdValueToCompare.metricType,
    thresholdValueToCompare.metricName,
    thresholdValueToCompare.spec.action,
    thresholdValueToCompare.criteria?.type
  ].every(value => Boolean(value))
}

function getAreAllRequiredValuesPresentWithGroup(thresholdValueToCompare: MetricThresholdType): boolean {
  return getAreAllRequiredValuesPresent(thresholdValueToCompare) && thresholdValueToCompare.groupName !== undefined
}

function checkForDuplicateThresholds(
  thresholdName: string,
  thresholdValueToCompare: MetricThresholdType,
  currentIndex: number,
  slicedThresholdValues: MetricThresholdType[],
  errors: Record<string, string>,
  isValidateGroup: boolean,
  getString: UseStringsReturn['getString']
): boolean {
  const areAllRequiredValuesPresent = isValidateGroup
    ? getAreAllRequiredValuesPresentWithGroup(thresholdValueToCompare)
    : getAreAllRequiredValuesPresent(thresholdValueToCompare)

  if (!areAllRequiredValuesPresent) {
    return false
  }

  const foundDuplicates = slicedThresholdValues.some(slicedThresholdValue => {
    let isDuplicateFound =
      slicedThresholdValue.metricType === thresholdValueToCompare.metricType &&
      slicedThresholdValue.metricName === thresholdValueToCompare.metricName &&
      slicedThresholdValue.spec.action === thresholdValueToCompare.spec.action &&
      slicedThresholdValue.criteria?.type === thresholdValueToCompare.criteria?.type

    if (isValidateGroup) {
      isDuplicateFound = isDuplicateFound && slicedThresholdValue.groupName === thresholdValueToCompare.groupName
    }

    return isDuplicateFound
  })

  if (foundDuplicates) {
    errors[`${thresholdName}.${currentIndex}.metricType`] = getString(
      'cv.metricThresholds.validations.duplicateThreshold'
    )
  }

  return foundDuplicates
}

export function checkDuplicate(
  thresholdName: string,
  thresholdValues: MetricThresholdType[],
  errors: Record<string, string>,
  isValidateGroup: boolean,
  getString: UseStringsReturn['getString']
): void {
  thresholdValues.some((thresholdValue, index) => {
    return checkForDuplicateThresholds(
      thresholdName,
      thresholdValue,
      index,
      thresholdValues.slice(index + 1),
      errors,
      isValidateGroup,
      getString
    )
  })
}

/**
 *  Common validation for thresholds
 *
 *  @param thresholdName determines whether ignoreThreshold or failImmediate
 *  @param errors error obj
 *  @param thresholdValues thresholds values to be validated
 *  @param getString YAML string function
 *  @param isValidateGroup flag which toggles group name validation
 *
 *
 */
export function validateCommonFieldsForMetricThreshold(
  thresholdName: string,
  errors: Record<string, string>,
  thresholdValues: MetricThresholdType[] | null,
  getString: UseStringsReturn['getString'],
  isValidateGroup = false
): void {
  if (Array.isArray(thresholdValues) && thresholdValues.length) {
    thresholdValues.forEach((value: MetricThresholdType, index: number) => {
      if (!value.metricType) {
        errors[`${thresholdName}.${index}.metricType`] = getString('pipeline.required')
      }
      if (!value.metricName) {
        errors[`${thresholdName}.${index}.metricName`] = getString('pipeline.required')
      }

      if (isValidateGroup && !value.groupName) {
        errors[`${thresholdName}.${index}.groupName`] = getString('pipeline.required')
      }

      if (!value.criteria?.type) {
        errors[`${thresholdName}.${index}.criteria.type`] = getString('pipeline.required')
      }

      // For absolute type, greaterThan or lessThan any one of the field is mandatory.
      if (
        value.criteria?.type === MetricCriteriaValues.Absolute &&
        isNotAValidNumber(value?.criteria?.spec?.greaterThan) &&
        isNotAValidNumber(value?.criteria?.spec?.lessThan)
      ) {
        errors[`${thresholdName}.${index}.criteria.spec.lessThan`] = getString('pipeline.required')
        errors[`${thresholdName}.${index}.criteria.spec.greaterThan`] = getString('pipeline.required')
      }

      // Percentage value is required for selected criteria percentage type
      if (
        value.criteria?.type === MetricCriteriaValues.Percentage &&
        value?.criteria?.spec &&
        thresholdName === MetricThresholdPropertyName.FailFastThresholds &&
        isNotAValidNumber(value?.criteria?.spec?.greaterThan)
      ) {
        errors[`${thresholdName}.${index}.criteria.spec.greaterThan`] = getString('pipeline.required')
      }

      if (
        value.criteria?.type === MetricCriteriaValues.Percentage &&
        value?.criteria?.spec &&
        thresholdName === MetricThresholdPropertyName.IgnoreThreshold &&
        isNotAValidNumber(value?.criteria?.spec?.lessThan)
      ) {
        errors[`${thresholdName}.${index}.criteria.spec.lessThan`] = getString('pipeline.required')
      }

      // Percentage value must not be greater than 100
      if (
        value.criteria?.type === MetricCriteriaValues.Percentage &&
        value?.criteria?.spec &&
        thresholdName === MetricThresholdPropertyName.FailFastThresholds &&
        (value?.criteria?.spec?.greaterThan as number) > 100
      ) {
        errors[`${thresholdName}.${index}.criteria.spec.greaterThan`] = getString(
          'cv.metricThresholds.validations.percentageValidation'
        )
      }

      if (
        value.criteria?.type === MetricCriteriaValues.Percentage &&
        value?.criteria?.spec &&
        thresholdName === MetricThresholdPropertyName.IgnoreThreshold &&
        (value?.criteria?.spec?.lessThan as number) > 100
      ) {
        errors[`${thresholdName}.${index}.criteria.spec.lessThan`] = getString(
          'cv.metricThresholds.validations.percentageValidation'
        )
      }

      if (thresholdName === MetricThresholdPropertyName.FailFastThresholds) {
        if (value.spec.action !== FailFastActionValues.FailImmediately && !value.spec.spec?.count) {
          errors[`${thresholdName}.${index}.spec.spec.count`] = getString('pipeline.required')
        }

        if (value.spec.action !== FailFastActionValues.FailImmediately && (value.spec?.spec?.count as number) <= 1) {
          errors[`${thresholdName}.${index}.spec.spec.count`] = getString('cv.metricThresholds.validations.countValue')
        }
      }
    })

    checkDuplicate(thresholdName, thresholdValues, errors, isValidateGroup, getString)
  }
}

export const validateMetricThresholds = ({
  thresholdName,
  errors,
  thresholdValues,
  getString,
  isValidateGroup
}: {
  thresholdName: string
  errors: Record<string, string>
  thresholdValues: MetricThresholdType[] | null
  getString: UseStringsReturn['getString']
  isValidateGroup: boolean
}): void => {
  validateCommonFieldsForMetricThreshold(thresholdName, errors, thresholdValues, getString, isValidateGroup)
}

export const getIsMetricPacksSelected = (metricData: { [key: string]: boolean }): boolean => {
  if (!metricData) return false

  return Object.keys(metricData).some(
    metricPackKey => metricPackKey !== MetricTypeValues.Custom && metricData[metricPackKey]
  )
}

export function getMetricTypeItems(
  groupedCreatedMetrics: GroupedCreatedMetrics,
  metricPacks?: MetricPackDTO[],
  metricData?: Record<string, boolean>,
  isOnlyCustomMetricHealthSource?: boolean,
  alwaysShowCustomMetricType?: boolean
): SelectItem[] {
  // this scenario only for GCO, where GCO doesn't have metric group.
  if (alwaysShowCustomMetricType) {
    return [CustomMetricDropdownOption]
  }

  if ((!metricPacks || !metricPacks.length) && !isOnlyCustomMetricHealthSource) return []

  const options: SelectItem[] = []

  if (!isOnlyCustomMetricHealthSource && metricPacks && metricData) {
    metricPacks.forEach(metricPack => {
      // Adding only the Metric type options which are checked in metric packs
      if (metricData[metricPack.identifier as string]) {
        options.push({
          label: metricPack.identifier as string,
          value: metricPack.identifier as string
        })
      }
    })
  }

  // Adding Custom metric option only if there are any custom metric is present
  const isCustomMetricPresent = Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length)

  if (isCustomMetricPresent) {
    options.push(CustomMetricDropdownOption)
  }

  return options
}

function getMetricsHaveCVEnabled(selectedMetricDetails: GroupedMetric[]): GroupedMetric[] {
  return selectedMetricDetails.filter(metricDetail => metricDetail.continuousVerification)
}

function getMetricsNameOptionsFromGroupName(
  selectedGroup: string,
  groupedCreatedMetrics: GroupedCreatedMetrics
): SelectItem[] {
  const selectedMetricDetails = groupedCreatedMetrics[selectedGroup]

  if (!Array.isArray(selectedMetricDetails) || !selectedMetricDetails.length) {
    return []
  }

  const filteredCVSelectedMetrics = getMetricsHaveCVEnabled(selectedMetricDetails)

  const metricNameOptions: SelectItem[] = []

  filteredCVSelectedMetrics.forEach(selectedMetricDetail => {
    if (selectedMetricDetail.metricName) {
      metricNameOptions.push({
        label: selectedMetricDetail.metricName,
        value: selectedMetricDetail.metricName
      })
    }
  })

  return metricNameOptions
}

export function getMetricItems(
  metricPacks: MetricPackDTO[],
  selectedMetricType?: string,
  selectedGroup?: string,
  groupedCreatedMetrics?: GroupedCreatedMetrics
): SelectItem[] {
  if (selectedMetricType === MetricTypeValues.Custom) {
    if (!selectedGroup || !groupedCreatedMetrics) {
      return []
    }

    return getMetricsNameOptionsFromGroupName(selectedGroup, groupedCreatedMetrics)
  }

  const selectedMetricPackDetails = metricPacks.find(metricPack => metricPack.identifier === selectedMetricType)

  return (
    selectedMetricPackDetails?.metrics?.map(metric => {
      return { label: metric.name as string, value: metric.name as string }
    }) || []
  )
}

export function getDefaultMetricTypeValue(
  metricData: Record<string, boolean>,
  metricPacks?: MetricPackDTO[]
): string | undefined {
  if (!metricData || !metricPacks || !metricPacks.length) {
    return undefined
  }
  if (metricData[MetricTypeValues.Performance]) {
    return MetricTypeValues.Performance
  } else if (metricData[MetricTypeValues.Errors]) {
    return MetricTypeValues.Errors
  } else if (metricData[MetricTypeValues.Infrastructure]) {
    return MetricTypeValues.Infrastructure
  }

  return undefined
}

// Populate initial metric thresholds data for formik
export const getAllMetricThresholds = (metricPacks?: TimeSeriesMetricPackDTO[]): MetricThresholdType[] => {
  const availableMetricPacks: MetricThresholdType[] = []

  metricPacks?.forEach((metricPack: TimeSeriesMetricPackDTO) =>
    availableMetricPacks.push(
      ...(metricPack?.metricThresholds ? (metricPack.metricThresholds as MetricThresholdType[]) : [])
    )
  )

  return availableMetricPacks
}

export const getFilteredMetricThresholdValues = (
  thresholdType: AvailableThresholdTypes,
  metricPacks?: TimeSeriesMetricPackDTO[]
): MetricThresholdType[] => {
  if (!metricPacks?.length || !Array.isArray(metricPacks)) {
    return []
  }

  const metricThresholds = getAllMetricThresholds(metricPacks)

  return metricThresholds.filter(metricThreshold => metricThreshold.type === thresholdType)
}

// Payload utils
const getMetricPacksOfCustomMetrics = (
  ignoreThresholds: MetricThresholdType[],
  failFastThresholds: MetricThresholdType[]
): TimeSeriesMetricPackDTO | null => {
  const metricThresholds = [...ignoreThresholds, ...failFastThresholds]

  const customMetricThresholdTypes = metricThresholds.filter(
    metricThreshold => metricThreshold.metricType === MetricTypeValues.Custom
  )

  if (!customMetricThresholdTypes.length) {
    return null
  }

  return {
    identifier: MetricTypeValues.Custom,
    metricThresholds: customMetricThresholdTypes
  }
}

const getMetricThresholdsForPayload = (
  metricPacksIdentifier: string,
  ignoreThresholds: MetricThresholdType[],
  failFastThresholds: MetricThresholdType[]
): MetricThreshold[] => {
  if (!metricPacksIdentifier || !Array.isArray(ignoreThresholds) || !Array.isArray(failFastThresholds)) {
    return []
  }

  const metricThresholds = [...ignoreThresholds, ...failFastThresholds]

  return metricThresholds.filter(metricThreshold => metricThreshold.metricType === metricPacksIdentifier)
}

export const getMetricPacksForPayload = (formData: any): TimeSeriesMetricPackDTO[] => {
  const { metricData, ignoreThresholds, failFastThresholds } = formData

  const metricPacks = Object.entries(metricData).map(item => {
    return item[1] && item[0] !== MetricTypeValues.Custom
      ? {
          identifier: item[0] as string,
          metricThresholds: getMetricThresholdsForPayload(item[0], ignoreThresholds, failFastThresholds)
        }
      : {}
  })

  const filteredMetricPacks = metricPacks.filter(item => !isEmpty(item)) as TimeSeriesMetricPackDTO[]

  const customMetricThresholds = getMetricPacksOfCustomMetrics(ignoreThresholds, failFastThresholds)

  if (customMetricThresholds) {
    filteredMetricPacks.push(customMetricThresholds)
  }

  return filteredMetricPacks
}

// Utils for only custom metrics health source, like Prometheus, Datadog
function getAllMetricsNameOptions(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  const groups = getGroupsWithCVEnabled(groupedCreatedMetrics)

  if (!Array.isArray(groups) || !groups.length) {
    return []
  }

  const options: SelectItem[] = []

  groups.forEach(group => {
    const cvEnabledMetrics = getMetricsHaveCVEnabled(groupedCreatedMetrics[group])

    cvEnabledMetrics.forEach(metricDetail => {
      if (metricDetail.metricName) {
        options.push({
          label: metricDetail.metricName,
          value: metricDetail.metricName
        })
      }
    })
  })

  return options
}

export function getMetricItemsForOnlyCustomMetrics(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  return getAllMetricsNameOptions(groupedCreatedMetrics)
}

export function getMetricNameItems(
  groupedCreatedMetrics: GroupedCreatedMetrics,
  metricPacks?: TimeSeriesMetricPackDTO[],
  metricType?: string,
  groupName?: string,
  isOnlyCustomMetricHealthSource?: boolean
): SelectItem[] {
  if (!groupedCreatedMetrics) {
    return []
  }

  // Should return all the metric names if it is isOnlyCustomMetricHealthSource
  if (isOnlyCustomMetricHealthSource) {
    return getMetricItemsForOnlyCustomMetrics(groupedCreatedMetrics)
  }

  return getMetricItems(metricPacks as TimeSeriesMetricPackDTO[], metricType, groupName, groupedCreatedMetrics)
}

export const getIsMetricThresholdCanBeShown = (
  metricData?: { [key: string]: boolean },
  groupedCreatedMetrics?: GroupedCreatedMetrics
): boolean => {
  if (!metricData || !groupedCreatedMetrics) {
    return false
  }
  return getIsMetricPacksSelected(metricData) || Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length)
}

export const getMetricsWithCVEnabled = (groupedCreatedMetrics: GroupedCreatedMetrics): string[] => {
  const groupNamesWithCVEnabled = getCustomMetricGroupNames(groupedCreatedMetrics)

  if (!Array.isArray(groupNamesWithCVEnabled) || !groupNamesWithCVEnabled.length) {
    return []
  }

  const metricsWithCVEnabled = [] as string[]

  groupNamesWithCVEnabled.forEach(groupName => {
    const cvEnabledMetrics = getMetricsHaveCVEnabled(groupedCreatedMetrics[groupName])

    if (Array.isArray(cvEnabledMetrics) && cvEnabledMetrics.length) {
      const cvEnabledMetricNames = cvEnabledMetrics.map(cvEnabledMetric => cvEnabledMetric.metricName as string)
      metricsWithCVEnabled.push(...cvEnabledMetricNames)
    }
  })

  return metricsWithCVEnabled
}

const getFilteredCVEnabledCustomThresholds = (
  thresholds: MetricThresholdType[],
  metricsWithCVEnabled: string[]
): MetricThresholdType[] => {
  return thresholds.filter(threshold => {
    return (
      threshold.metricType !== MetricTypeValues.Custom || metricsWithCVEnabled.includes(threshold.metricName as string)
    )
  })
}

const isThresholdPresent = (thresholds: MetricThresholdType[]): boolean => {
  return Array.isArray(thresholds) && Boolean(thresholds.length)
}

export const getFilteredCVDisabledMetricThresholds = (
  ignoreThresholds: MetricThresholdType[],
  failFastThresholds: MetricThresholdType[],
  groupedCreatedMetrics: GroupedCreatedMetrics
): Record<ThresholdsPropertyNames, MetricThresholdType[]> => {
  const metricsWithCVEnabled = getMetricsWithCVEnabled(groupedCreatedMetrics)

  return {
    ignoreThresholds: isThresholdPresent(ignoreThresholds)
      ? getFilteredCVEnabledCustomThresholds(ignoreThresholds, metricsWithCVEnabled)
      : [],
    failFastThresholds: isThresholdPresent(failFastThresholds)
      ? getFilteredCVEnabledCustomThresholds(failFastThresholds, metricsWithCVEnabled)
      : []
  }
}

const isMetricThresholdsPresent = (
  metricThresholds: Record<ThresholdsPropertyNames, MetricThresholdType[]>
): boolean => {
  return (
    metricThresholds &&
    Array.isArray(metricThresholds.ignoreThresholds) &&
    Array.isArray(metricThresholds.failFastThresholds)
  )
}

const getAllAvailableMetricThresholds = (
  metricThresholds: Record<ThresholdsPropertyNames, MetricThresholdType[]>
): MetricThresholdType[] => {
  if (isMetricThresholdsPresent(metricThresholds)) {
    return [...metricThresholds.ignoreThresholds, ...metricThresholds.failFastThresholds]
  }

  return []
}

const isAnyRequiredValueNotPresentForMetricPrompt = (
  metricThresholds: Record<ThresholdsPropertyNames, MetricThresholdType[]>,
  metricPackName: string
): boolean => {
  return Boolean(metricPackName && isMetricThresholdsPresent(metricThresholds))
}

export const isGivenMetricPackContainsThresholds = (
  metricThresholds: Record<ThresholdsPropertyNames, MetricThresholdType[]>,
  metricPackName: string
): boolean => {
  if (isMetricThresholdsPresent(metricThresholds) && metricPackName) {
    const allMetricThresholds = getAllAvailableMetricThresholds(metricThresholds)

    return allMetricThresholds.some(metricThreshold => metricThreshold.metricType === metricPackName)
  }

  return false
}

export const isGivenMetricNameContainsThresholds = (
  metricThresholds: Record<ThresholdsPropertyNames, MetricThresholdType[]>,
  metricName: string
): boolean => {
  if (isMetricThresholdsPresent(metricThresholds)) {
    const allMetricThresholds = getAllAvailableMetricThresholds(metricThresholds)

    return allMetricThresholds.some(metricThreshold => metricThreshold.metricName === metricName)
  }

  return false
}

export const getIsRemovedMetricPackContainsMetricThresholds = (
  metricThresholds: Record<ThresholdsPropertyNames, MetricThresholdType[]>,
  metricPackName: string,
  isMetricPackAdded: boolean
): boolean => {
  if (isMetricPackAdded || !isAnyRequiredValueNotPresentForMetricPrompt(metricThresholds, metricPackName)) {
    return false
  }

  return isGivenMetricPackContainsThresholds(metricThresholds, metricPackName)
}

export const getIsRemovedMetricNameContainsMetricThresholds = (
  metricThresholds: Record<ThresholdsPropertyNames, MetricThresholdType[]>,
  metricName: string
): boolean => {
  if (!isAnyRequiredValueNotPresentForMetricPrompt(metricThresholds, metricName)) {
    return false
  }

  return isGivenMetricNameContainsThresholds(metricThresholds, metricName)
}

export const getMetricThresholdsCustomFiltered = (
  metricThresholds: MetricThresholdType[],
  filterCallbackFunction: (threshold: MetricThresholdType) => boolean
): MetricThresholdType[] => {
  if (Array.isArray(metricThresholds) && metricThresholds.length) {
    return metricThresholds.filter(filterCallbackFunction)
  }

  return []
}

export const handleCriteriaPercentageUpdate = ({
  thresholds,
  index,
  selectedValue,
  isIgnoreThresholdTab,
  isFailFastThresholdTab,
  replaceFn
}: HandleCriteriaPercentageUpdateParams): void => {
  if (!Array.isArray(thresholds) || !replaceFn) {
    return void 0
  }

  const clonedThresholdValue = [...thresholds]

  const updatedThresholds = { ...clonedThresholdValue[index] }

  const criteriaDetails = updatedThresholds.criteria

  if (criteriaDetails) {
    criteriaDetails.type = selectedValue

    if (!criteriaDetails.spec) {
      criteriaDetails.spec = {}
    }

    if (isIgnoreThresholdTab) {
      criteriaDetails.spec.greaterThan = undefined
    } else if (isFailFastThresholdTab) {
      criteriaDetails.spec.lessThan = undefined
    }

    clonedThresholdValue[index] = updatedThresholds

    replaceFn(updatedThresholds)
  }
}

/**
 * ⭐️ Metric thresholds for common health sources ⭐️
 */

/**
 * Generates metric packs payload from metricData.
 */
export const getMetricPacksForPayloadV2 = (formData: any): TimeSeriesMetricPackDTO[] => {
  const { metricData, ignoreThresholds, failFastThresholds } = formData

  const metricPacks = Object.entries(metricData).map(item => {
    return item[1] && item[0] !== MetricTypeValues.Custom
      ? {
          identifier: item[0] as string,
          metricThresholds: getMetricThresholdsForPayload(item[0], ignoreThresholds, failFastThresholds)
        }
      : {}
  })

  const filteredMetricPacks = metricPacks.filter(item => !isEmpty(item)) as TimeSeriesMetricPackDTO[]

  return filteredMetricPacks
}

const isAllRequiredValuesPresentForPayload = ({
  metricName,
  metricThresholds
}: MetricThresholdsForCustomMetricProps): boolean =>
  Boolean(metricName && Array.isArray(metricThresholds) && metricThresholds.length)

/**
 * Generates metric thresholds payload for a custom metric
 */
export const getMetricThresholdsForCustomMetric = ({
  metricName,
  metricThresholds
}: MetricThresholdsForCustomMetricProps): Array<MetricThresholdType> => {
  if (!isAllRequiredValuesPresentForPayload({ metricName, metricThresholds })) {
    return []
  }

  return metricThresholds.filter(
    metricThreshold =>
      metricThreshold.metricType === MetricTypeValues.Custom && metricThreshold.metricName === metricName
  )
}

/**
 * Returns all metric thresholds from query definitions (custom metrics)
 */
export const getAllMetricThresholdsOfQueryDefinitions = (
  queryDefinitions?: Array<{ metricThresholds?: MetricThresholdType[] }>
): MetricThresholdType[] => {
  if (!Array.isArray(queryDefinitions) || !queryDefinitions?.length) {
    return []
  }

  const thresholds = []

  for (const metricDefinition of queryDefinitions) {
    thresholds.push(...(metricDefinition?.metricThresholds ?? []))
  }

  return thresholds
}

/**
 * Returns metric thresholds of particular thresholdType for edit
 */
export const getFilteredMetricThresholdValuesV2 = (
  thresholdType: AvailableThresholdTypes,
  metricPacks?: TimeSeriesMetricPackDTO[],
  queryDefinitions?: Array<{ metricThresholds?: MetricThresholdType[] }>
): MetricThresholdType[] => {
  if ((!metricPacks?.length && !queryDefinitions?.length) || !thresholdType) {
    return []
  }

  const metricThresholds = getAllMetricThresholds(metricPacks)

  metricThresholds.push(...getAllMetricThresholdsOfQueryDefinitions(queryDefinitions))

  return metricThresholds.filter(metricThreshold => metricThreshold.type === thresholdType)
}

/**
 * Checks whether metric thresholds section can be shown or not
 * based on metric packs config and custom metric values
 */
export const getCanShowMetricThresholds = ({
  isMetricThresholdConfigEnabled,
  isMetricPacksEnabled,
  groupedCreatedMetrics,
  metricData
}: {
  isMetricThresholdConfigEnabled: boolean
  isMetricPacksEnabled?: boolean
  groupedCreatedMetrics: GroupedCreatedMetrics
  metricData?: { [key: string]: boolean }
}): boolean => {
  if (!isMetricThresholdConfigEnabled || isEmpty(groupedCreatedMetrics)) {
    return false
  }

  if (!isMetricPacksEnabled) {
    /**
     * If "metricPacks" is disabled, then criteria to enable metric thresholds are
     *
     * 1. We need to have atleast one custom metric with group name (AND)
     * 2. We need to have atleast one custom metric with CV enabled
     */
    return Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length)
  } else {
    /**
     * If "metricPacks" is enabled, then criteria to enable metric thresholds are
     *
     * 1. We need to have atleast one metric pack selected
     *
     * OR
     *
     * 1. We need to have atleast one custom metric with group name (AND)
     * 2. We need to have atleast one custom metric with CV enabled
     */
    return Boolean(getIsMetricThresholdCanBeShown(metricData, groupedCreatedMetrics))
  }
}
