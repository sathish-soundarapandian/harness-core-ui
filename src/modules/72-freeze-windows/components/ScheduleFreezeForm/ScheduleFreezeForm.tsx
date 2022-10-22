/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import { FormikForm, Formik, Layout, FormInput, SelectOption } from '@harness/uicore'
import * as Yup from 'yup'
import { omit } from 'lodash-es'
import moment from 'moment'
import { ALL_TIME_ZONES } from '@common/utils/dateUtils'
import { DOES_NOT_REPEAT, RECURRENCE } from '@freeze-windows/utils/freezeWindowUtils'
import type { FreezeWindow } from 'services/cd-ng'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { DateTimePicker, DATE_PARSE_FORMAT } from './DateTimePicker'
import css from './ScheduleFreezeForm.module.scss'

interface ScheduleFreezeFormProps {
  freezeWindow?: FreezeWindow
  onSubmit?: (freezeWindow: FreezeWindow) => void
  onChange?: (freezeWindow: FreezeWindow) => void
  formActions?: ReactNode
  isGlobalFreezeForm?: boolean
}

export type FreezeWindowFormData = FreezeWindow & {
  endTimeMode: 'duration' | 'date'
  recurrence: {
    spec: {
      recurrenceEndMode: 'never' | 'date'
    }
  }
}

const validationSchema = Yup.object().shape({
  timeZone: Yup.string().required('Timezone is required'),
  startTime: Yup.string().required('Start Time is required'),
  endTimeMode: Yup.string().oneOf(['duration', 'date']),
  duration: Yup.string().when('endTimeMode', {
    is: 'duration',
    then: getDurationValidationSchema({ minimum: '30m' })
  }),
  endTime: Yup.string().when('endTimeMode', {
    is: 'date',
    then: Yup.string()
      .required('End Time is required')
      .test('isAfterStartTime', 'End time can not be before the start time', function (value) {
        return moment(value).diff(this.parent.startTime, 'minutes') >= 0
      })
      .test('isMinimum30MinutesWindow', 'End time need to be at least "30 minutes" after start time', function (value) {
        return moment(value).diff(this.parent.startTime, 'minutes') >= 30
      })
  }),
  recurrence: Yup.object().shape({
    type: Yup.string(),
    spec: Yup.object().shape({
      recurrenceEndMode: Yup.string().oneOf(['never', 'date']),
      until: Yup.string().when('recurrenceEndMode', {
        is: 'date',
        then: Yup.string().required('Recurrence End Date is required')
      })
    })
  })
})

const timeZoneList: SelectOption[] = ALL_TIME_ZONES.map(timeZone => ({ value: timeZone, label: timeZone }))
const recurrenceList: SelectOption[] = [
  { value: '', label: DOES_NOT_REPEAT },
  ...RECURRENCE.map(item => ({ value: item, label: item }))
]

const processInitialvalues = (freezeWindow: FreezeWindow): FreezeWindowFormData => {
  const processedValues = {
    ...freezeWindow,
    timeZone: freezeWindow?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    startTime: freezeWindow?.startTime ?? moment().add(1, 'hour').format(DATE_PARSE_FORMAT),
    endTime: freezeWindow?.endTime ?? moment(freezeWindow?.startTime).add(30, 'minutes').format(DATE_PARSE_FORMAT),
    duration: freezeWindow?.duration ?? '30m',
    endTimeMode: freezeWindow?.endTime ? 'date' : 'duration',
    recurrence: {
      ...freezeWindow.recurrence,
      spec: {
        until: freezeWindow?.recurrence?.spec?.until ?? moment().endOf('year').format(DATE_PARSE_FORMAT),
        recurrenceEndMode: freezeWindow?.recurrence?.type && freezeWindow?.recurrence?.spec?.until ? 'date' : 'never'
      }
    }
  } as FreezeWindowFormData

  return processedValues
}

const processFormData = (form: FreezeWindowFormData): FreezeWindow => {
  const processedForm = omit(form, ['endTimeMode', 'recurrence.spec.recurrenceEndMode'])
  return {
    ...processedForm,
    duration: form.endTimeMode === 'duration' ? processedForm.duration : undefined,
    endTime: form.endTimeMode === 'date' ? processedForm.endTime : undefined,
    recurrence: processedForm.recurrence?.type
      ? {
          type: processedForm.recurrence?.type,
          spec: form.recurrence.spec.recurrenceEndMode === 'date' ? processedForm.recurrence.spec : undefined
        }
      : undefined
  } as FreezeWindow
}

export const ScheduleFreezeForm: React.FC<ScheduleFreezeFormProps> = ({
  freezeWindow = {} as FreezeWindow,
  onSubmit,
  onChange,
  formActions,
  isGlobalFreezeForm
}) => {
  return (
    <Formik<FreezeWindowFormData>
      enableReinitialize
      validate={values => onChange?.(processFormData(values))}
      onSubmit={values => onSubmit?.(processFormData(values))}
      formName="freezeWindowSchedule"
      initialValues={processInitialvalues(freezeWindow)}
      validationSchema={validationSchema}
    >
      {formikProps => {
        return (
          <FormikForm>
            <Layout.Vertical width={'350px'} className={css.scheduleFreezeForm}>
              <FormInput.DropDown
                label="Timezone"
                name="timeZone"
                items={timeZoneList}
                dropDownProps={{
                  minWidth: 200
                }}
                usePortal
              />
              <DateTimePicker name="startTime" label="Start Time" defaultToCurrentTime />
              <FormInput.RadioGroup
                name="endTimeMode"
                label="End Time"
                items={[
                  {
                    label: (
                      <Layout.Horizontal spacing="small" flex={{ alignItems: 'baseline' }}>
                        <FormInput.DurationInput name="duration" disabled={formikProps.values.endTimeMode === 'date'} />
                        <span>from start time</span>
                      </Layout.Horizontal>
                    ),
                    value: 'duration'
                  },
                  {
                    label: <DateTimePicker name="endTime" disabled={formikProps.values.endTimeMode === 'duration'} />,
                    value: 'date'
                  }
                ]}
              />

              {!isGlobalFreezeForm && (
                <FormInput.DropDown
                  placeholder="Does not repeat"
                  label="Recurrence"
                  name="recurrence.type"
                  items={recurrenceList}
                  dropDownProps={{
                    filterable: false,
                    minWidth: 200
                  }}
                  usePortal
                />
              )}

              {formikProps.values?.recurrence?.type && (
                <FormInput.RadioGroup
                  name="recurrence.spec.recurrenceEndMode"
                  label="Recurrence End Date"
                  items={[
                    { label: 'Never', value: 'never' },
                    {
                      label: (
                        <DateTimePicker
                          name="recurrence.spec.until"
                          disabled={formikProps.values?.recurrence?.spec.recurrenceEndMode === 'never'}
                        />
                      ),
                      value: 'date'
                    }
                  ]}
                />
              )}
            </Layout.Vertical>
            {formActions}
          </FormikForm>
        )
      }}
    </Formik>
  )
}
