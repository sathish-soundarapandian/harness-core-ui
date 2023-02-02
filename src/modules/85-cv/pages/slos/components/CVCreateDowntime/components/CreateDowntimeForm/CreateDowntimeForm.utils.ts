/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import moment from 'moment'
import type { UseStringsReturn } from 'framework/strings'
import { DowntimeForm, DowntimeFormFields, EndTimeMode } from '../../CVCreateDowntime.types'
import { CreateDowntimeSteps, DowntimeWindowToggleViews } from './CreateDowntimeForm.types'

export const getDurationOptions = (getString: UseStringsReturn['getString']): SelectOption[] => [
  { label: getString('cv.minutes'), value: 'Minutes' },
  { label: getString('hours'), value: 'Hours' },
  { label: getString('cv.days'), value: 'Days' },
  { label: getString('cv.weeks'), value: 'Weeks' }
]

export const getRecurrenceTypeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => [
  { label: getString('cv.days'), value: 'Day' },
  { label: getString('cv.weeks'), value: 'Week' },
  { label: getString('cv.months'), value: 'Month' }
]

export const isFormDataValid = (
  formikProps: FormikProps<DowntimeForm>,
  selectedTabId: CreateDowntimeSteps
): boolean => {
  switch (selectedTabId) {
    case CreateDowntimeSteps.DEFINE_DOWNTIME:
      return validateDefineDowntimeSection(formikProps)
    case CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW:
      return validateSelectDowntimeWindowSection(formikProps)
    default:
      return false
  }
}

export const validateDefineDowntimeSection = (formikProps: FormikProps<DowntimeForm>): boolean => {
  formikProps.setFieldTouched(DowntimeFormFields.NAME, true)
  formikProps.setFieldTouched(DowntimeFormFields.IDENTIFIER, true)
  formikProps.setFieldTouched(DowntimeFormFields.CATEGORY, true)

  const isNameValid = /^[0-9a-zA-Z-_\s]+$/.test(formikProps.values['name'])
  const { name, identifier, category } = formikProps.values
  if (!name || isEmpty(identifier) || isEmpty(category) || !isNameValid) {
    return false
  }
  return true
}

export const validateSelectDowntimeWindowSection = (formikProps: FormikProps<DowntimeForm>): boolean => {
  formikProps.setFieldTouched(DowntimeFormFields.TIMEZONE, true)
  formikProps.setFieldTouched(DowntimeFormFields.START_TIME, true)

  const { timezone, startTime, type, endTimeMode } = formikProps.values
  if (!timezone || !startTime || moment(startTime).isBefore(moment())) {
    return false
  }

  if (type === DowntimeWindowToggleViews.ONE_TIME) {
    if (endTimeMode === EndTimeMode.DURATION) {
      formikProps.setFieldTouched(DowntimeFormFields.DURATION_VALUE, true)
      formikProps.setFieldTouched(DowntimeFormFields.DURATION_TYPE, true)

      const { durationValue, durationType } = formikProps.values
      if (!durationValue || !durationType) {
        return false
      }
    } else {
      formikProps.setFieldTouched(DowntimeFormFields.END_TIME, true)

      const { endTime } = formikProps.values
      if (!endTime || moment(endTime).isBefore(moment(startTime))) {
        return false
      }
    }
  } else {
    formikProps.setFieldTouched(DowntimeFormFields.DURATION_VALUE, true)
    formikProps.setFieldTouched(DowntimeFormFields.DURATION_TYPE, true)
    formikProps.setFieldTouched(DowntimeFormFields.RECURRENCE_VALUE, true)
    formikProps.setFieldTouched(DowntimeFormFields.RECURRENCE_TYPE, true)
    formikProps.setFieldTouched(DowntimeFormFields.RECURRENCE_END_TIME, true)

    const { durationValue, durationType, recurrenceValue, recurrenceType, recurrenceEndTime } = formikProps.values
    if (
      !durationValue ||
      !durationType ||
      !recurrenceValue ||
      !recurrenceType ||
      !recurrenceEndTime ||
      moment(recurrenceEndTime).isBefore(moment(startTime))
    ) {
      return false
    }
  }
  return true
}

export const getErrorMessageByTabId = (
  formikProps: FormikProps<DowntimeForm>,
  selectedTabId: CreateDowntimeSteps
): string[] => {
  switch (selectedTabId) {
    case CreateDowntimeSteps.DEFINE_DOWNTIME:
      return errorDefineDowntimeSection(formikProps.errors)
    case CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW:
      return errorSelectDowntimeWindowSection(formikProps)
    default:
      return []
  }
}

const errorDefineDowntimeSection = (errors: FormikProps<DowntimeForm>['errors']): string[] => {
  const { name, identifier, category } = errors
  return [name, identifier, category].filter(item => Boolean(item)) as string[]
}

const errorSelectDowntimeWindowSection = (formikProps: FormikProps<DowntimeForm>): string[] => {
  const { type, endTimeMode } = formikProps.values
  const { timezone, startTime } = formikProps.errors

  const errors = [timezone, startTime].filter(item => Boolean(item)) as string[]
  if (type === DowntimeWindowToggleViews.ONE_TIME) {
    if (endTimeMode === EndTimeMode.DURATION) {
      const { durationValue, durationType } = formikProps.errors
      return [...errors, ...([durationValue, durationType].filter(item => Boolean(item)) as string[])]
    } else {
      const { endTime } = formikProps.errors
      return [...errors, ...([endTime].filter(item => Boolean(item)) as string[])]
    }
  } else {
    const { durationValue, durationType, recurrenceValue, recurrenceType, recurrenceEndTime } = formikProps.errors
    const recurrenceErrors = [durationValue, durationType, recurrenceValue, recurrenceType, recurrenceEndTime].filter(
      item => Boolean(item)
    ) as string[]
    return [...errors, ...recurrenceErrors]
  }
}
