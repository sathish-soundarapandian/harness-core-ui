/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import { defaultTo, isEmpty, isEqual } from 'lodash-es'
import type { SLOTargetFilterDTO } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import { PeriodLengthTypes, PeriodTypes } from '../../../CVCreateSLO/CVCreateSLO.types'
import type { SLOV2Form } from '../../CVCreateSLOV2.types'
import { createSloTargetFilterDTO } from './components/AddSlos/AddSLOs.utils'
import { MinNumberOfSLO, MaxNumberOfSLO, SLOWeight } from './CreateCompositeSloForm.constant'
import { CompositeSLOFormFields, CreateCompositeSLOSteps } from './CreateCompositeSloForm.types'

const addSLOError = (formikProps: FormikProps<SLOV2Form>, getString?: UseStringsReturn['getString']) => {
  let errorList: string[] = []
  const { serviceLevelObjectivesDetails } = formikProps.values
  const sumOfSLOweight = serviceLevelObjectivesDetails?.reduce((total, num) => {
    return num.weightagePercentage + total
  }, 0)
  if (!serviceLevelObjectivesDetails?.length) {
    errorList = [getString?.('cv.CompositeSLO.AddSLOValidation.minMaxSLOCount') as string]
    return { status: false, errorMessages: errorList }
  } else if (defaultTo(sumOfSLOweight, 0) !== 100) {
    errorList = [getString?.('cv.CompositeSLO.AddSLOValidation.totalSLOWeight') as string]
    return { status: false, errorMessages: errorList }
  } else if (serviceLevelObjectivesDetails?.length < MinNumberOfSLO) {
    errorList = [getString?.('cv.CompositeSLO.AddSLOValidation.minSLOCount') as string]
    return { status: false, errorMessages: errorList }
  } else if (serviceLevelObjectivesDetails?.length > MaxNumberOfSLO) {
    errorList = [getString?.('cv.CompositeSLO.AddSLOValidation.maxSLOCount') as string]
    return { status: false, errorMessages: errorList }
  } else {
    const hasInValidValue = serviceLevelObjectivesDetails.some(
      slo => slo.weightagePercentage > SLOWeight.MAX || slo.weightagePercentage < SLOWeight.MIN
    )
    errorList = hasInValidValue ? [getString?.('cv.CompositeSLO.AddSLOValidation.weightMinMax') as string] : []
    return { status: !hasInValidValue, errorMessages: errorList }
  }
}

export const validateDefineSLOSection = (formikProps: FormikProps<SLOV2Form>): boolean => {
  formikProps.setFieldTouched(CompositeSLOFormFields.NAME, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.IDENTIFIER, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.USER_JOURNEY_REF, true)

  const isNameValid = /^[0-9a-zA-Z-_\s]+$/.test(formikProps.values['name'])
  const { name, identifier, userJourneyRef } = formikProps.values
  if (!name || !identifier || isEmpty(userJourneyRef) || !isNameValid) {
    return false
  }
  return true
}

export const validateSetSLOTimeWindow = (formikProps: FormikProps<SLOV2Form>): boolean => {
  formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_LENGTH, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_TYPE, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_LENGTH_TYPE, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.DAY_OF_MONTH, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.DAY_OF_WEEK, true)

  const { periodType, periodLength, periodLengthType, dayOfMonth, dayOfWeek } = formikProps.values
  if (periodType === PeriodTypes.ROLLING) {
    return Boolean(periodLength)
  }
  if (periodType === PeriodTypes.CALENDAR) {
    if (periodLengthType === PeriodLengthTypes.MONTHLY) {
      return Boolean(periodLengthType) && Boolean(dayOfMonth)
    }
    if (periodLengthType === PeriodLengthTypes.WEEKLY) {
      return Boolean(periodLengthType) && Boolean(dayOfWeek)
    }
    if (periodLengthType === PeriodLengthTypes.QUARTERLY) {
      return Boolean(periodLengthType)
    }
  }
  return false
}

export const validateAddSLO = (formikProps: FormikProps<SLOV2Form>): boolean => {
  const { status } = addSLOError(formikProps)
  return status
}

export const validateSetSLOTarget = (formikProps: FormikProps<SLOV2Form>): boolean => {
  formikProps.setFieldTouched(CompositeSLOFormFields.SLO_TARGET_PERCENTAGE, true)
  const { SLOTargetPercentage } = formikProps.values
  if (SLOTargetPercentage) {
    return true
  }
  return false
}

export const validateErrorBudgetPolicy = (): boolean => {
  return true
}

export const isFormDataValid = (
  formikProps: FormikProps<SLOV2Form>,
  selectedTabId: CreateCompositeSLOSteps
): boolean => {
  switch (selectedTabId) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return validateDefineSLOSection(formikProps)
    case CreateCompositeSLOSteps.Set_SLO_Time_Window:
      return validateSetSLOTimeWindow(formikProps)
    case CreateCompositeSLOSteps.Add_SLOs:
      return validateAddSLO(formikProps)
    case CreateCompositeSLOSteps.Set_SLO_Target:
      return validateSetSLOTarget(formikProps)
    case CreateCompositeSLOSteps.Error_Budget_Policy:
      return validateErrorBudgetPolicy()
    default:
      return false
  }
}

const errorDefineSLOSection = (errors: FormikProps<SLOV2Form>['errors']) => {
  const { name, identifier, userJourneyRef } = errors
  return [name, identifier, userJourneyRef as string].filter(item => Boolean(item)) as string[]
}

const errorSetSLOTimeWindow = (errors: FormikProps<SLOV2Form>['errors']) => {
  const { periodLength, periodLengthType, periodType } = errors
  return [periodLength, periodLengthType, periodType].filter(item => Boolean(item)) as string[]
}

const errorAddSLO = (formikProps: FormikProps<SLOV2Form>, getString: UseStringsReturn['getString']) => {
  const { errorMessages } = addSLOError(formikProps, getString)
  return errorMessages.filter(item => Boolean(item)) as string[]
}

const errorSetSLOTarget = (errors: FormikProps<SLOV2Form>['errors']) => {
  const { SLOTargetPercentage } = errors
  return [SLOTargetPercentage].filter(item => Boolean(item)) as string[]
}

export const getErrorMessageByTabId = (
  formikProps: FormikProps<SLOV2Form>,
  selectedTabId: CreateCompositeSLOSteps,
  getString: UseStringsReturn['getString']
): string[] => {
  switch (selectedTabId) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return errorDefineSLOSection(formikProps.errors)
    case CreateCompositeSLOSteps.Set_SLO_Time_Window:
      return errorSetSLOTimeWindow(formikProps.errors)
    case CreateCompositeSLOSteps.Add_SLOs:
      return errorAddSLO(formikProps, getString)
    case CreateCompositeSLOSteps.Set_SLO_Target:
      return errorSetSLOTarget(formikProps.errors)
    case CreateCompositeSLOSteps.Error_Budget_Policy:
      return []
    default:
      return []
  }
}

export const shouldOpenPeriodUpdateModal = (
  formikValues: SLOV2Form,
  filterData: React.MutableRefObject<SLOTargetFilterDTO | undefined>
): boolean => {
  const formikFilterData = createSloTargetFilterDTO(formikValues)
  return (
    Boolean(formikValues.periodType) &&
    Boolean(filterData?.current) &&
    !isEmpty(formikValues.serviceLevelObjectivesDetails) &&
    !isEqual(formikFilterData, filterData?.current)
  )
}
