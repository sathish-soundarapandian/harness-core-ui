/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { MetricPackDTO, MetricThreshold, MetricThresholdCriteriaSpec, TimeSeriesMetricPackDTO } from 'services/cv'
import type { MetricThresholdType } from '../../connectors/AppDynamics/AppDHealthSource.types'
import type { GroupedCreatedMetrics } from '../CustomMetric/CustomMetric.types'
import {
  CustomMetricDropdownOption,
  DefaultCustomMetricGroupName,
  ExceptionGroupName,
  FailFastActionValues,
  MetricCriteriaValues,
  MetricThresholdPropertyName,
  MetricTypesForTransactionTextField,
  MetricTypeValues,
  PercentageCriteriaDropdownValues
} from './MetricThresholds.constants'
import type {
  AvailableThresholdTypes,
  CriteriaThresholdValues,
  SelectItem,
  ThresholdCriteriaPropsType
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

export const getCriteriaPercentageDropdownOptions = (getString: UseStringsReturn['getString']): SelectItem[] => [
  {
    label: getString('cv.monitoringSources.appD.greaterThan'),
    value: PercentageCriteriaDropdownValues.GreaterThan
  },
  {
    label: getString('cv.monitoringSources.appD.lesserThan'),
    value: PercentageCriteriaDropdownValues.LessThan
  }
]

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

export function getCustomMetricGroupNames(groupedCreatedMetrics: GroupedCreatedMetrics): string[] {
  const groupsNames = Object.keys(groupedCreatedMetrics)

  return groupsNames.filter(
    groupName => groupName !== '' && groupName !== DefaultCustomMetricGroupName && groupName !== ExceptionGroupName
  )
}

export function getGroupDropdownOptions(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  const validGroups = getCustomMetricGroupNames(groupedCreatedMetrics)

  return validGroups.map(group => ({
    label: group,
    value: group
  }))
}

function isPercentageSelectedAndAPIHasGreaterThanValue(
  isAbsoluteSelected: boolean,
  criteriaSpecValues: MetricThresholdCriteriaSpec | undefined
): boolean {
  return (
    !isAbsoluteSelected &&
    typeof criteriaSpecValues?.greaterThan !== 'undefined' &&
    criteriaSpecValues?.greaterThan !== null
  )
}

function isPercentageSelectedAndAPIHasLessThanValue(
  isAbsoluteSelected: boolean,
  criteriaSpecValues: MetricThresholdCriteriaSpec | undefined
): boolean {
  return (
    !isAbsoluteSelected && typeof criteriaSpecValues?.lessThan !== 'undefined' && criteriaSpecValues?.lessThan !== null
  )
}

/**
 * A flag to show Greater than input or to hide it
 *
 * Conditions to show Greater than
 *
 * 1. Absolute criteria selected
 * 2. Percentage criteria is selected and Greater than criteriaPercentageType is selected
 * 3. Percentage criteria is selected and API response has greaterThan value
 *
 *
 */
export function getIsShowGreaterThan(
  criteriaType: ThresholdCriteriaPropsType['criteriaType'],
  criteriaPercentageType?: CriteriaThresholdValues,
  criteriaSpecValues?: MetricThresholdCriteriaSpec
): boolean {
  const isAbsoluteSelected = criteriaType === MetricCriteriaValues.Absolute

  // Absolute criteria selected
  if (isAbsoluteSelected) {
    return true
  }

  const isGreaterThanSelected = criteriaPercentageType === PercentageCriteriaDropdownValues.GreaterThan

  // Percentage criteria is selected and Greater than criteriaPercentageType is selected
  if (!isAbsoluteSelected && isGreaterThanSelected) {
    return true
  }

  if (isPercentageSelectedAndAPIHasGreaterThanValue(isAbsoluteSelected, criteriaSpecValues)) {
    return true
  }

  return false
}

/**
 * A flag to show Less than input or to hide it
 *
 * 1. Absolute criteria selected
 * 2. Percentage criteria is selected and Less than criteriaPercentageType is selected
 * 3. Percentage criteria is selected and API response has lessThan value
 *
 */
export function getIsShowLessThan(
  criteriaType: ThresholdCriteriaPropsType['criteriaType'],
  criteriaPercentageType?: CriteriaThresholdValues,
  criteriaSpecValues?: MetricThresholdCriteriaSpec
): boolean {
  const isAbsoluteSelected = criteriaType === MetricCriteriaValues.Absolute

  // Absolute criteria selected
  if (isAbsoluteSelected) {
    return true
  }

  const isLessThanSelected = criteriaPercentageType === PercentageCriteriaDropdownValues.LessThan

  // Percentage criteria is selected and Less than criteriaPercentageType is selected
  if (!isAbsoluteSelected && isLessThanSelected) {
    return true
  }

  if (isPercentageSelectedAndAPIHasLessThanValue(isAbsoluteSelected, criteriaSpecValues)) {
    return true
  }

  return false
}

function getAreAllRequiredValuesPresent(thresholdValueToCompare: MetricThresholdType): boolean {
  return [
    thresholdValueToCompare.metricType,
    thresholdValueToCompare.metricName,
    thresholdValueToCompare.spec.action,
    thresholdValueToCompare.criteria.type
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
      slicedThresholdValue.criteria.type === thresholdValueToCompare.criteria.type

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
  if (thresholdValues.length < 2) {
    return void 0
  }

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
  thresholdValues: MetricThresholdType[],
  getString: UseStringsReturn['getString'],
  isValidateGroup = false
): void {
  thresholdValues.forEach((value: MetricThresholdType, index: number) => {
    if (!value.metricType) {
      errors[`${thresholdName}.${index}.metricType`] = getString('cv.metricThresholds.validations.metricType')
    }
    if (!value.metricName) {
      errors[`${thresholdName}.${index}.metricName`] = getString('cv.metricThresholds.validations.metricName')
    }

    if (isValidateGroup && !value.groupName) {
      errors[`${thresholdName}.${index}.groupName`] = getString('cv.metricThresholds.validations.groupTransaction')
    }

    if (!value.criteria?.type) {
      errors[`${thresholdName}.${index}.criteria.type`] = getString('cv.metricThresholds.validations.criteria')
    }

    // For absolute type, greaterThan or lessThan any one of the field is mandatory.
    if (
      value.criteria?.type === MetricCriteriaValues.Absolute &&
      !value.criteria?.spec?.greaterThan &&
      !value.criteria?.spec?.lessThan
    ) {
      errors[`${thresholdName}.${index}.criteria.spec.greaterThan`] = getString('cv.required')
      errors[`${thresholdName}.${index}.criteria.spec.lessThan`] = getString('cv.required')
    }

    // If both the fields are filled, then less than value must be bigger than greater than value
    if (
      value.criteria?.type === MetricCriteriaValues.Absolute &&
      (value.criteria?.spec?.lessThan as number) >= 1 &&
      (value.criteria?.spec?.greaterThan as number) >= 1 &&
      (value.criteria?.spec?.lessThan as number) <= (value.criteria?.spec?.greaterThan as number)
    ) {
      errors[`${thresholdName}.${index}.criteria.spec.lessThan`] = getString(
        'cv.metricThresholds.validations.lessThanBigger'
      )
      errors[`${thresholdName}.${index}.criteria.spec.greaterThan`] = getString(
        'cv.metricThresholds.validations.greaterThanSmaller'
      )
    }

    // Percentage value is required for selected criteria percentage type
    if (
      value.criteria?.type === MetricCriteriaValues.Percentage &&
      value?.criteria?.spec &&
      !value?.criteria?.spec[value?.criteria?.criteriaPercentageType as CriteriaThresholdValues]
    ) {
      errors[`${thresholdName}.${index}.criteria.spec.${value.criteria.criteriaPercentageType}`] =
        getString('cv.required')
    }

    // Percentage value must not be greater than 100
    if (
      value.criteria?.type === MetricCriteriaValues.Percentage &&
      value?.criteria?.spec &&
      (value?.criteria?.spec[value?.criteria?.criteriaPercentageType as CriteriaThresholdValues] as number) > 100
    ) {
      errors[`${thresholdName}.${index}.criteria.spec.${value.criteria.criteriaPercentageType}`] = getString(
        'cv.metricThresholds.validations.percentageValidation'
      )
    }

    if (thresholdName === MetricThresholdPropertyName.FailFastThresholds) {
      if (value.spec.action !== FailFastActionValues.FailImmediately && !value.spec.spec?.count) {
        errors[`${thresholdName}.${index}.spec.spec.count`] = getString('cv.required')
      }

      if (value.spec.action !== FailFastActionValues.FailImmediately && (value.spec?.spec?.count as number) <= 1) {
        errors[`${thresholdName}.${index}.spec.spec.count`] = getString('cv.metricThresholds.validations.countValue')
      }
    }
  })

  checkDuplicate(thresholdName, thresholdValues, errors, isValidateGroup, getString)
}

export const getIsMetricPacksSelected = (metricData: { [key: string]: boolean }): boolean => {
  return Object.keys(metricData).some(metricPackKey => metricData[metricPackKey])
}

export function getMetricTypeItems(
  metricPacks: MetricPackDTO[],
  metricData: Record<string, boolean>,
  groupedCreatedMetrics: GroupedCreatedMetrics
): SelectItem[] {
  if (!metricPacks || !metricPacks.length) return []

  const options: SelectItem[] = []

  metricPacks.forEach(metricPack => {
    // Adding only the Metric type options which are checked in metric packs
    if (metricData[metricPack.identifier as string]) {
      options.push({
        label: metricPack.identifier as string,
        value: metricPack.identifier as string
      })
    }
  })

  // Adding Custom metric option only if there are any custom metric is present
  const isCustomMetricPresent = Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length)

  if (isCustomMetricPresent) {
    options.push(CustomMetricDropdownOption)
  }

  return options
}

function getMetricsNameOptionsFromGroupName(
  selectedGroup: string,
  groupedCreatedMetrics: GroupedCreatedMetrics
): SelectItem[] {
  const selectedGroupDetails = groupedCreatedMetrics[selectedGroup]

  if (!selectedGroupDetails) {
    return []
  }

  return selectedGroupDetails.map(selectedGroupDetail => {
    return {
      label: selectedGroupDetail.metricName as string,
      value: selectedGroupDetail.metricName as string
    }
  })
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
  if (!metricPacks?.length) {
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
  if (!metricPacksIdentifier) {
    return []
  }

  const metricThresholds = [...ignoreThresholds, ...failFastThresholds]

  return metricThresholds.filter(metricThreshold => metricThreshold.metricType === metricPacksIdentifier)
}

export const getMetricPacksForPayload = (
  formData: any,
  isMetricThresholdEnabled: boolean
): TimeSeriesMetricPackDTO[] => {
  const { metricData, ignoreThresholds, failFastThresholds } = formData

  const metricPacks = Object.entries(metricData).map(item => {
    return item[1]
      ? {
          identifier: item[0] as string,
          metricThresholds: isMetricThresholdEnabled
            ? getMetricThresholdsForPayload(item[0], ignoreThresholds, failFastThresholds)
            : undefined
        }
      : {}
  })

  const filteredMetricPacks = metricPacks.filter(item => !isEmpty(item)) as TimeSeriesMetricPackDTO[]

  if (filteredMetricPacks.length && isMetricThresholdEnabled) {
    const customMetricThresholds = getMetricPacksOfCustomMetrics(ignoreThresholds, failFastThresholds)

    if (customMetricThresholds) {
      filteredMetricPacks.push(customMetricThresholds)
    }
  }

  return filteredMetricPacks
}
