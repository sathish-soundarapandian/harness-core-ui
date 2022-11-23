/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import { defaultTo, isEmpty, isEqual } from 'lodash-es'
import type { SLOTargetFilterDTO } from 'services/cv'
import { PeriodLengthTypes, PeriodTypes } from '../../../CVCreateSLO/CVCreateSLO.types'
import type { SLOV2Form } from '../../CVCreateSLOV2.types'
import { createSloTargetFilterDTO } from './components/AddSlos/AddSLOs.utils'
import { MinNumberOfSLO, MaxNumberOfSLO, SLOWeight } from './CreateCompositeSloForm.constant'
import { CompositeSLOFormFields, CreateCompositeSLOSteps } from './CreateCompositeSloForm.types'

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
  const { serviceLevelObjectivesDetails } = formikProps.values
  const sumOfSLOweight = serviceLevelObjectivesDetails?.reduce((total, num) => {
    return num.weightagePercentage + total
  }, 0)
  if (!serviceLevelObjectivesDetails?.length) {
    return false
  } else if (Math.floor(defaultTo(sumOfSLOweight, 0)) !== 100) {
    return false
  } else if (serviceLevelObjectivesDetails?.length < MinNumberOfSLO) {
    return false
  } else if (serviceLevelObjectivesDetails?.length > MaxNumberOfSLO) {
    return false
  } else {
    const hasInValidValue = serviceLevelObjectivesDetails.some(
      slo => slo.weightagePercentage > SLOWeight.MAX || slo.weightagePercentage < SLOWeight.MIN
    )
    return !hasInValidValue
  }
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
