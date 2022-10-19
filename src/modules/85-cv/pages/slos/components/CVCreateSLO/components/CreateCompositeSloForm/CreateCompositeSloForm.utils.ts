/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { MutableRefObject } from 'react'
import { PeriodTypes } from '../../CVCreateSLO.types'
import {
  // CompositeSLOFormFields,
  CompositeSLOFormInterface,
  CreateCompositeSLOSteps
} from './CreateCompositeSloForm.types'

// const setAllTouched = async (formikProps: FormikProps<SLOForm>) => {
//   const validationErrors = await formikProps.validateForm()
//   if (Object.keys(validationErrors).length > 0) {
//     formikProps.setTouched(setNestedObjectValues(validationErrors, true))
//     return
//   }
// }

export const isFormDataValid = (
  formikProps: FormikProps<CompositeSLOFormInterface>,
  selectedTabId: CreateCompositeSLOSteps
): boolean => {
  if (selectedTabId === CreateCompositeSLOSteps.Define_SLO_Identification) {
    // formikProps.setFieldTouched(CompositeSLOFormFields.NAME, true)
    // formikProps.setFieldTouched(CompositeSLOFormFields.IDENTIFIER, true)
    // formikProps.setFieldTouched(CompositeSLOFormFields.USER_JOURNEY_REF, true)

    const isNameValid = /^[0-9a-zA-Z-_\s]+$/.test(formikProps.values['name'])
    const { name, identifier, userJourneyRef } = formikProps.values
    if (!name || !identifier || !userJourneyRef || !isNameValid) {
      return false
    }
    return true
  }

  if (selectedTabId === CreateCompositeSLOSteps.Set_SLO_Time_Window) {
    // formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_LENGTH, true)
    // formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_TYPE, true)
    // formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_LENGTH_TYPE, true)

    const { periodType, periodLength, periodLengthType } = formikProps.values
    if (periodType === PeriodTypes.ROLLING) {
      return Boolean(periodLength)
    }
    if (periodType === PeriodTypes.CALENDAR) {
      return Boolean(periodLengthType)
    }
  }

  if (selectedTabId === CreateCompositeSLOSteps.Add_SLOs) {
    const { sloList } = formikProps.values
    if (!sloList?.length) {
      return false
    }
    return true
  }

  if (selectedTabId === CreateCompositeSLOSteps.Set_SLO_Target) {
    // formikProps.setFieldTouched(CompositeSLOFormFields.SLO_TARGET_PERCENTAGE, true)
    const { SLOTargetPercentage } = formikProps.values
    if (SLOTargetPercentage) {
      return true
    }
    return false
  }

  if (selectedTabId === CreateCompositeSLOSteps.Error_Budget_Policy) {
    return true
  }

  return false
}

export const handleStepChange = (
  nextTabId: string,
  formik: FormikProps<CompositeSLOFormInterface>,
  setStepId: (tabId: CreateCompositeSLOSteps) => void,
  skipValidation = false,
  compositeSloPayloadRef: MutableRefObject<CompositeSLOFormInterface | null>
): void => {
  switch (nextTabId) {
    case CreateCompositeSLOSteps.Set_SLO_Time_Window: {
      ;(skipValidation || isFormDataValid(formik, CreateCompositeSLOSteps.Define_SLO_Identification)) &&
        setStepId(CreateCompositeSLOSteps.Set_SLO_Time_Window)
      compositeSloPayloadRef.current = formik.values
      break
    }
    case CreateCompositeSLOSteps.Add_SLOs: {
      if (skipValidation || isFormDataValid(formik, CreateCompositeSLOSteps.Set_SLO_Time_Window)) {
        setStepId(CreateCompositeSLOSteps.Add_SLOs)
        compositeSloPayloadRef.current = formik.values
      }
      break
    }
    case CreateCompositeSLOSteps.Set_SLO_Target: {
      if (skipValidation || isFormDataValid(formik, CreateCompositeSLOSteps.Add_SLOs)) {
        setStepId(CreateCompositeSLOSteps.Set_SLO_Target)
        compositeSloPayloadRef.current = formik.values
      }
      break
    }
    default: {
      if (skipValidation || isFormDataValid(formik, nextTabId as CreateCompositeSLOSteps)) {
        setStepId(nextTabId as CreateCompositeSLOSteps)
        compositeSloPayloadRef.current = formik.values
      }
    }
  }
}
