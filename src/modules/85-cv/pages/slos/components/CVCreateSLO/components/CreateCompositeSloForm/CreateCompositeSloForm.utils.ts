import type { FormikProps } from 'formik'
import { PeriodTypes } from '../../CVCreateSLO.types'
import { CompositeSLOFormInterface, CreateCompositeSLOSteps } from './CreateCompositeSloForm.types'

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
    const isNameValid = /^[0-9a-zA-Z-_\s]+$/.test(formikProps.values['name'])
    const { name, identifier, userJourneyRef } = formikProps.values
    if (!name || !identifier || !userJourneyRef || !isNameValid) {
      return false
    }
    return true
  }

  if (selectedTabId === CreateCompositeSLOSteps.Set_SLO_Time_Window) {
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

  if (selectedTabId === CreateCompositeSLOSteps.Error_Budget_Policy) {
    return true
  }

  return false
}

export const handleStepChange = (
  nextTabId: string,
  formik: FormikProps<CompositeSLOFormInterface>,
  setStepId: (tabId: CreateCompositeSLOSteps) => void,
  skipValidation = false
): void => {
  switch (nextTabId) {
    case CreateCompositeSLOSteps.Set_SLO_Time_Window: {
      ;(skipValidation || isFormDataValid(formik, CreateCompositeSLOSteps.Define_SLO_Identification)) &&
        setStepId(CreateCompositeSLOSteps.Set_SLO_Time_Window)
      break
    }
    case CreateCompositeSLOSteps.Add_SLOs: {
      if (skipValidation || isFormDataValid(formik, CreateCompositeSLOSteps.Set_SLO_Time_Window)) {
        setStepId(CreateCompositeSLOSteps.Add_SLOs)
      }
      break
    }
    case CreateCompositeSLOSteps.Set_SLO_Target: {
      if (skipValidation || isFormDataValid(formik, CreateCompositeSLOSteps.Add_SLOs)) {
        setStepId(CreateCompositeSLOSteps.Set_SLO_Target)
      }
      break
    }
    default: {
      if (skipValidation || isFormDataValid(formik, nextTabId as CreateCompositeSLOSteps)) {
        setStepId(nextTabId as CreateCompositeSLOSteps)
      }
    }
  }
}
