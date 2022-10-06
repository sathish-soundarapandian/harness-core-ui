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
import { ALL_TIME_ZONES } from '@common/utils/dateUtils'
import { DOES_NOT_REPEAT, RECURRENCE } from '@freeze-windows/utils/freezeWindowUtils'
import type { FreezeWindow } from 'services/cd-ng'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { DateTimePicker } from './DateTimePicker'
import css from './ScheduleFreezeForm.module.scss'

interface ScheduleFreezeFormProps {
  freezeWindow?: FreezeWindow
  onSubmit?: (freezeWindow: FreezeWindow) => void
  onChange?: (freezeWindow: FreezeWindow) => void
  formActions?: ReactNode
}

export type FreezeWindowFormData = FreezeWindow & {
  endTimeMode: '0' | '1'
  recurrence: {
    spec: {
      recurrenceEndMode: '0' | '1'
    }
  }
}

const validationSchema = Yup.object().shape({
  timeZone: Yup.string().required('Timezone is required'),
  startTime: Yup.string().required('Start Time is required'),
  endTimeMode: Yup.string().oneOf(['0', '1']),
  duration: Yup.string().when('endTimeMode', {
    is: '0',
    then: getDurationValidationSchema({ minimum: '10m' }).required('Minimum duration is 10 minutes')
  }),
  endTime: Yup.string().when('endTimeMode', {
    is: '1',
    then: Yup.string().required('End Time is required')
  }),
  recurrence: Yup.object().shape({
    type: Yup.string(),
    spec: Yup.object().shape({
      recurrenceEndMode: Yup.string().oneOf(['0', '1']),
      until: Yup.string().when('recurrenceEndMode', {
        is: '1',
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
  return {
    ...freezeWindow,
    endTimeMode: freezeWindow?.endTime ? '1' : '0',
    recurrence: {
      ...freezeWindow.recurrence,
      spec: {
        ...freezeWindow.recurrence?.spec,
        recurrenceEndMode: freezeWindow?.recurrence?.type && freezeWindow?.recurrence?.spec?.until ? '1' : '0'
      }
    }
  }
}

const processFormData = (form: FreezeWindowFormData): FreezeWindow => {
  return omit(form, ['endTimeMode', 'recurrence.spec.recurrenceEndMode'])
}

export const ScheduleFreezeForm: React.FC<ScheduleFreezeFormProps> = ({
  freezeWindow = {},
  onSubmit,
  onChange,
  formActions
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
            <Layout.Vertical width={'300px'}>
              <FormInput.DropDown
                label="Timezone"
                name="timeZone"
                items={timeZoneList}
                dropDownProps={{
                  minWidth: 200
                }}
              />
              <DateTimePicker name="startTime" label="Start time" />
              <FormInput.RadioGroup
                radioGroup={{
                  className: css.radioGroup
                }}
                name="endTimeMode"
                label="End Time"
                items={[
                  {
                    label: (
                      <FormInput.DurationInput
                        name="duration"
                        label=""
                        disabled={formikProps.values?.endTimeMode === '1'}
                        style={{ width: '100% !important' }}
                      />
                    ),
                    value: '0'
                  },
                  {
                    label: (
                      <DateTimePicker
                        name="endTime"
                        label=""
                        disabled={formikProps.values?.endTimeMode === '0'}
                        style={{ width: '100% !important' }}
                      />
                    ),
                    value: '1'
                  }
                ]}
              />

              <FormInput.DropDown
                placeholder="Does not repeat"
                label="Recurrence"
                name="recurrence.type"
                items={recurrenceList}
                dropDownProps={{
                  filterable: false,
                  minWidth: 200
                }}
              />

              {formikProps.values?.recurrence?.type && (
                <FormInput.RadioGroup
                  name="recurrence.spec.recurrenceEndMode"
                  label="Recurrence End Date"
                  items={[
                    { label: 'Never', value: '0' },
                    {
                      label: (
                        <DateTimePicker
                          name="recurrence.spec.until"
                          label=""
                          disabled={formikProps.values?.recurrence?.spec.recurrenceEndMode === '0'}
                        />
                      ),
                      value: '1'
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
