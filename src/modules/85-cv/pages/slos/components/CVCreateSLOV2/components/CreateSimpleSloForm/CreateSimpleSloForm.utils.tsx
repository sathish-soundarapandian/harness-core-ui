/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
import type {
  GetMetricOnboardingGraphPathParams,
  GetMetricOnboardingGraphQueryParams,
  ServiceLevelIndicatorDTO,
  WindowBasedServiceLevelIndicatorSpec
} from 'services/cv'
import { EvaluationType, SLIMetricTypes, SLOV2Form, SLOV2FormFields } from '../../CVCreateSLOV2.types'
import {
  validateErrorBudgetPolicy,
  validateSetSLOTarget,
  validateSetSLOTimeWindow
} from '../CreateCompositeSloForm/CreateCompositeSloForm.utils'
import {
  CreateSimpleSLOSteps,
  GetMetricDefinitionsValues,
  GetMetricsAndTypeProps,
  GetSLIDerivedProps,
  GetSLIDerivedValues
} from './CreateSimpleSloForm.types'
import { MAX_OBJECTIVE_PERCENTAGE } from '../../CVCreateSLOV2.constants'

export const validateDefineSLOSection = (formikProps: FormikProps<SLOV2Form>): boolean => {
  formikProps.setFieldTouched(SLOV2FormFields.NAME, true)
  formikProps.setFieldTouched(SLOV2FormFields.IDENTIFIER, true)
  formikProps.setFieldTouched(SLOV2FormFields.USER_JOURNEY_REF, true)
  formikProps.setFieldTouched(SLOV2FormFields.MONITORED_SERVICE_REF, true)

  const isNameValid = /^[0-9a-zA-Z-_\s]+$/.test(formikProps.values['name'])
  const { name, identifier, userJourneyRef, monitoredServiceRef } = formikProps.values
  if (!name || !identifier || isEmpty(userJourneyRef) || !monitoredServiceRef || !isNameValid) {
    return false
  }
  return true
}

const isValidObjectivePercentage = (value: number) => value >= 0 && value < MAX_OBJECTIVE_PERCENTAGE

const validateWindowBased = (values: SLOV2Form): boolean => {
  const {
    eventType,
    validRequestMetric,
    goodRequestMetric,
    SLIMetricType,
    objectiveComparator,
    objectiveValue,
    SLIMissingDataType
  } = values

  if (!SLIMetricType) return false
  if (!objectiveValue) return false
  if (!objectiveComparator) return false
  if (SLIMetricType && SLIMetricType === SLIMetricTypes.RATIO) {
    if (!validRequestMetric || !goodRequestMetric || !eventType) return false
    if (validRequestMetric === goodRequestMetric) return false
    if (!isValidObjectivePercentage(objectiveValue)) return false
  }
  if (!SLIMissingDataType) return false
  return true
}

const validateRequestBased = (values: SLOV2Form): boolean => {
  const { eventType, validRequestMetric, goodRequestMetric } = values
  if (!validRequestMetric || !goodRequestMetric || !eventType) return false
  if (validRequestMetric === goodRequestMetric) return false
  return true
}

export const validateConfigureServiceLevelIndicatiors = (formikProps: FormikProps<SLOV2Form>): boolean => {
  const { SLIMetricType, evaluationType } = formikProps.values

  formikProps.setTouched({
    [SLOV2FormFields.EVENT_TYPE]: SLIMetricType === SLIMetricTypes.RATIO,
    [SLOV2FormFields.SLI_METRIC_TYPE]: true,
    [SLOV2FormFields.VALID_REQUEST_METRIC]: true,
    [SLOV2FormFields.GOOD_REQUEST_METRIC]: true,
    [SLOV2FormFields.OBJECTIVE_COMPARATOR]: true,
    [SLOV2FormFields.OBJECTIVE_VALUE]: true,
    [SLOV2FormFields.SLI_MISSING_DATA_TYPE]: true,
    [SLOV2FormFields.HEALTH_SOURCE_REF]: true
  })

  if (evaluationType === EvaluationType.WINDOW) {
    return validateWindowBased(formikProps.values)
  } else {
    return validateRequestBased(formikProps.values)
  }
}

export const validateSetSimpleSLOTimeWindow = (formikProps: FormikProps<SLOV2Form>) => {
  const timePeriodValid = validateSetSLOTimeWindow(formikProps)
  if (timePeriodValid) {
    return validateSetSLOTarget(formikProps)
  }
  return timePeriodValid
}

export const isFormDataValid = (formikProps: FormikProps<SLOV2Form>, selectedTabId: CreateSimpleSLOSteps): boolean => {
  switch (selectedTabId) {
    case CreateSimpleSLOSteps.Define_SLO_Identification:
      return validateDefineSLOSection(formikProps)
    case CreateSimpleSLOSteps.Configure_Service_Level_Indicatiors:
      return validateConfigureServiceLevelIndicatiors(formikProps)
    case CreateSimpleSLOSteps.Set_SLO:
      return validateSetSimpleSLOTimeWindow(formikProps)
    case CreateSimpleSLOSteps.Error_Budget_Policy:
      return validateErrorBudgetPolicy()
    default:
      return false
  }
}

const errorDefineSLOSection = (errors: FormikProps<SLOV2Form>['errors']) => {
  const { name, identifier, userJourneyRef, monitoredServiceRef } = errors
  return [name, identifier, monitoredServiceRef, userJourneyRef as string].filter(item => Boolean(item)) as string[]
}

const errorConfigureServiceLevelIndicatiors = (errors: FormikProps<SLOV2Form>['errors']) => {
  const {
    validRequestMetric,
    goodRequestMetric,
    SLIMetricType,
    objectiveComparator,
    objectiveValue,
    SLIMissingDataType
  } = errors

  const objectiveValueError = objectiveValue ? `Objective value is ${objectiveValue}` : null
  const objectiveComparatorError = objectiveValue ? `Objective comparator is ${objectiveComparator}` : null
  return [
    validRequestMetric,
    goodRequestMetric,
    SLIMetricType,
    objectiveComparatorError,
    objectiveValueError,
    SLIMissingDataType
  ].filter(item => Boolean(item)) as string[]
}

const errorSetSLO = (errors: FormikProps<SLOV2Form>['errors']) => {
  const { SLOTargetPercentage } = errors
  return [SLOTargetPercentage].filter(item => Boolean(item)) as string[]
}

export const getErrorMessageByTabId = (
  formikProps: FormikProps<SLOV2Form>,
  selectedTabId: CreateSimpleSLOSteps
): string[] => {
  switch (selectedTabId) {
    case CreateSimpleSLOSteps.Define_SLO_Identification:
      return errorDefineSLOSection(formikProps.errors)
    case CreateSimpleSLOSteps.Configure_Service_Level_Indicatiors:
      return errorConfigureServiceLevelIndicatiors(formikProps.errors)
    case CreateSimpleSLOSteps.Set_SLO:
      return errorSetSLO(formikProps.errors)
    case CreateSimpleSLOSteps.Error_Budget_Policy:
      return []
    default:
      return []
  }
}

export const shouldFetchMetricGraph = ({
  isWindow,
  eventType,
  isRatioBased,
  validRequestMetric,
  goodRequestMetric
}: {
  isWindow: boolean
  isRatioBased: boolean
  validRequestMetric?: string
  goodRequestMetric?: string
  eventType?: GetMetricOnboardingGraphQueryParams['ratioSLIMetricEventType']
}): boolean => {
  return shouldShowGoodMetric(isWindow, isRatioBased)
    ? (Boolean(validRequestMetric) || Boolean(goodRequestMetric)) &&
        validRequestMetric !== goodRequestMetric &&
        Boolean(eventType)
    : Boolean(validRequestMetric)
}

export const createMetricGraphPayload = ({
  isWindow,
  eventType,
  isRatioBased,
  accountId,
  orgIdentifier,
  projectIdentifier,
  healthSourceRef,
  validRequestMetric,
  goodRequestMetric,
  monitoredServiceIdentifier
}: {
  isWindow: boolean
  isRatioBased: boolean
  eventType?: GetMetricOnboardingGraphQueryParams['ratioSLIMetricEventType']
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  healthSourceRef: string
  validRequestMetric?: string
  goodRequestMetric?: string
  monitoredServiceIdentifier: string
}): {
  queryParams: GetMetricOnboardingGraphQueryParams
  pathParams: GetMetricOnboardingGraphPathParams
  body: string[]
} => {
  const { eventTypeParam, selectedMetricList } = getMetricsAndType({
    isWindow,
    isRatioBased,
    eventType,
    goodRequestMetric,
    validRequestMetric
  })
  return {
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      healthSourceRef,
      ...eventTypeParam
    },
    pathParams: {
      monitoredServiceIdentifier
    },
    body: selectedMetricList.filter(i => Boolean(i)) as string[]
  }
}

export const getSLIDerivedProps = ({
  value,
  sliGraphData,
  enableRequestSLO
}: GetSLIDerivedProps): GetSLIDerivedValues => {
  const {
    eventType,
    healthSourceRef,
    SLIMetricType,
    evaluationType,
    validRequestMetric,
    objectiveValue,
    objectiveComparator,
    SLIMissingDataType,
    goodRequestMetric,
    serviceLevelIndicatorType
  } = value
  const isRatioBased = SLIMetricType === SLIMetricTypes.RATIO
  const isWindow = evaluationType === EvaluationType.WINDOW
  const metricsByType = shouldShowGoodMetric(isWindow, isRatioBased)
    ? [eventType, validRequestMetric, goodRequestMetric]
    : [validRequestMetric]

  const ffBasedProp = enableRequestSLO ? [] : [serviceLevelIndicatorType]
  const valuesToDetermineReload = !isWindow
    ? [healthSourceRef, ...metricsByType]
    : [
        healthSourceRef,
        SLIMetricType,
        ...metricsByType,
        objectiveValue,
        objectiveComparator,
        SLIMissingDataType,
        ...ffBasedProp
      ]

  const shouldFetchSliGraph = valuesToDetermineReload.reduce((total, data) => {
    return Boolean(data) && total
  }, true)

  const showSLIMetricChart = shouldFetchMetricGraph({
    isWindow,
    isRatioBased,
    validRequestMetric,
    goodRequestMetric,
    eventType
  })

  const sliAreaGraphData = shouldFetchSliGraph ? sliGraphData?.resource : undefined
  return { shouldFetchSliGraph, valuesToDetermineReload, showSLIMetricChart, isWindow, isRatioBased, sliAreaGraphData }
}

export const showGoodMetrics = (
  evaluationType: ServiceLevelIndicatorDTO['type'],
  SLIMetricType?: WindowBasedServiceLevelIndicatorSpec['type']
): boolean => {
  const isRatio = SLIMetricType === SLIMetricTypes.RATIO
  const isWindow = evaluationType === EvaluationType.WINDOW
  const isNotWindow = evaluationType !== EvaluationType.WINDOW
  return (isRatio && isWindow) || isNotWindow
}

const shouldShowGoodMetric = (isWindow?: boolean, isRatioBased?: boolean): boolean =>
  (isWindow && isRatioBased) || !isWindow

const getMetricsAndType = ({
  isWindow,
  isRatioBased,
  eventType,
  goodRequestMetric,
  validRequestMetric
}: GetMetricsAndTypeProps): GetMetricDefinitionsValues => {
  const showGoodMetric = shouldShowGoodMetric(isWindow, isRatioBased)
  const eventTypeParam = (
    showGoodMetric ? { ratioSLIMetricEventType: eventType } : {}
  ) as GetMetricDefinitionsValues['eventTypeParam']
  const selectedMetricList = showGoodMetric ? [goodRequestMetric, validRequestMetric] : [validRequestMetric]
  return { eventTypeParam, selectedMetricList }
}
