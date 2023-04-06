/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode, useState } from 'react'
import { FormikForm, Formik, Layout, FormInput, SelectOption, Text, DropDown } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import * as Yup from 'yup'
import produce from 'immer'
import { defaultTo, isNull, isUndefined, omit, omitBy, set } from 'lodash-es'
import moment from 'moment'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { ALL_TIME_ZONES } from '@common/utils/dateUtils'
import {
  DOES_NOT_REPEAT,
  getMomentFormat,
  RECURRENCE,
  RecurrenceTypeEnum
} from '@freeze-windows/utils/freezeWindowUtils'
import type { FreezeWindow, Recurrence } from 'services/cd-ng'
import { useFreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { DateTimePicker, DATE_PARSE_FORMAT } from '@common/components/DateTimePicker/DateTimePicker'
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

function getEndTimeValidationSchema(): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .required('End Time is required')
    .test({
      test(value: string): boolean | Yup.ValidationError {
        const startTime = this.parent.startTime
        if (moment(value).diff(startTime, 'minutes') < 0) {
          return this.createError({ message: 'End Time should not be before the Start Time' })
        } else if (moment(value).diff(startTime, 'minutes') < 30) {
          return this.createError({ message: 'End Time should be at least "30 minutes" from Start Time' })
        } else if (moment(value).diff(startTime, 'year') > 1) {
          return this.createError({ message: 'End Time should be less than an year from Start Time' })
        }

        return true
      }
    })
}

function getRecurrenceEndDateValidationSchema(): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .required('Recurrence End Date is required')
    .test({
      test(value: string): boolean | Yup.ValidationError {
        if (moment(value).diff((this as any).from[2].value.endTime, 'minutes') < 0) {
          return this.createError({ message: 'Recurrence End Date should be after the End Time' })
        }
        return true
      }
    })
}

const validationSchema = (getString: UseStringsReturn['getString']): Yup.ObjectSchema =>
  Yup.object().shape({
    timeZone: Yup.string().required(getString('common.validation.fieldIsRequired', { name: 'Timezone' })),
    startTime: Yup.string().required(getString('common.validation.fieldIsRequired', { name: 'Start Time' })),
    endTimeMode: Yup.string().oneOf(['duration', 'date']),
    duration: Yup.string().when('endTimeMode', {
      is: 'duration',
      then: getDurationValidationSchema({ minimum: '30m' }).required(
        getString('common.validation.fieldIsRequired', { name: 'Duration' })
      )
    }),
    endTime: Yup.string().when('endTimeMode', {
      is: 'date',
      then: getEndTimeValidationSchema()
    }),
    recurrence: Yup.object().shape({
      type: Yup.string(),
      spec: Yup.object().shape({
        recurrenceEndMode: Yup.string().oneOf(['never', 'date']),
        until: Yup.string().when('recurrenceEndMode', {
          is: 'date',
          then: getRecurrenceEndDateValidationSchema()
        }),
        value: Yup.number()
          .lessThan(12, getString('freezeWindows.recurrenceConfig.nMonthsValidationLessThan'))
          .moreThan(1, getString('freezeWindows.recurrenceConfig.nMonthsValidationMoreThan'))
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
    startTime: freezeWindow?.startTime ?? moment().format(DATE_PARSE_FORMAT),
    endTime:
      freezeWindow?.endTime ?? getMomentFormat(freezeWindow?.startTime).add(30, 'minutes').format(DATE_PARSE_FORMAT),
    duration: freezeWindow?.duration ?? '30m',
    endTimeMode: freezeWindow?.endTime ? 'date' : 'duration',
    recurrence: {
      ...freezeWindow.recurrence,
      spec: {
        until:
          freezeWindow?.recurrence?.spec?.until ??
          getMomentFormat(freezeWindow?.endTime).endOf('year').format(DATE_PARSE_FORMAT),
        recurrenceEndMode: freezeWindow?.recurrence?.type && freezeWindow?.recurrence?.spec?.until ? 'date' : 'never',
        value: freezeWindow?.recurrence?.spec?.value
      }
    }
  } as FreezeWindowFormData

  return processedValues
}

const processFormData = (form: FreezeWindowFormData): FreezeWindow => {
  const processedForm = omit(form, ['endTimeMode', 'recurrence.spec.recurrenceEndMode'])

  const recurrenceSpec = {
    ...(form.recurrence.spec.recurrenceEndMode === 'date' ? processedForm.recurrence?.spec : undefined),
    value: processedForm.recurrence?.spec?.value ? processedForm.recurrence?.spec.value : undefined
  }

  const recurrenceValue = {
    type: processedForm.recurrence?.type,
    spec:
      form.recurrence.spec.recurrenceEndMode === 'date' || processedForm.recurrence?.spec?.value
        ? omitBy(recurrenceSpec, value => isUndefined(value) || isNull(value) || value === '')
        : undefined
  }

  const processedData = {
    ...processedForm,
    duration: form.endTimeMode === 'duration' ? processedForm.duration : undefined,
    endTime: form.endTimeMode === 'date' ? processedForm.endTime : undefined,
    recurrence: processedForm.recurrence?.type
      ? omitBy(recurrenceValue, value => isUndefined(value) || isNull(value))
      : undefined
  }

  return omitBy(processedData, value => isUndefined(value) || isNull(value) || value === '') as unknown as FreezeWindow
}

export const ScheduleFreezeForm: React.FC<ScheduleFreezeFormProps> = ({
  freezeWindow = {} as FreezeWindow,
  onSubmit,
  onChange,
  formActions,
  isGlobalFreezeForm
}) => {
  const { getString } = useStrings()
  const { setFreezeFormError } = useFreezeWindowContext()
  const freezeRecurrence = freezeWindow?.recurrence
  const recurrenceInitialValue = defaultTo(freezeRecurrence?.spec?.value, 1)
  const [recurrenceSelectOption, setRecurrenceSelectOption] = useState<SelectOption>({
    label: recurrenceInitialValue.toString(),
    value: recurrenceInitialValue
  })

  const [selectedRecurrenceType, setSelectedRecurrenceType] = useState<string | undefined>(
    freezeRecurrence?.spec?.value
      ? RecurrenceTypeEnum.Monthly
      : defaultTo(freezeRecurrence?.type, RecurrenceTypeEnum.DoesNotRepeat)
  )

  const monthlySelectItems = React.useMemo(
    () =>
      [...Array(11)] //only 1 to 11 interger allowed and only Monthly type supported
        .map((_, index): SelectOption => {
          return { label: (index + 1).toString(), value: index + 1 }
        }),
    []
  )

  return (
    <Formik<FreezeWindowFormData>
      enableReinitialize
      validateOnMount
      validate={values => onChange?.(processFormData(values))}
      onSubmit={values => onSubmit?.(processFormData(values))}
      formName="freezeWindowSchedule"
      initialValues={processInitialvalues(freezeWindow)}
      validationSchema={validationSchema(getString)}
    >
      {formikProps => {
        setFreezeFormError?.(formikProps.errors)
        return (
          <FormikForm>
            <Layout.Vertical width={'320px'} className={css.scheduleFreezeForm}>
              <FormInput.DropDown
                label={getString('freezeWindows.recurrenceConfig.Timezone')}
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
                label={getString('freezeWindows.recurrenceConfig.endTime')}
                className={css.marginBottom8}
                items={[
                  {
                    label: (
                      <Layout.Horizontal spacing="small" flex={{ alignItems: 'baseline' }} className={css.endTime}>
                        <FormInput.DurationInput
                          name="duration"
                          disabled={formikProps.values.endTimeMode === 'date'}
                          inputProps={{ placeholder: 'Enter w/d/h/m' }}
                        />
                        <span className={css.text}>from start time</span>
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
                <Layout.Vertical>
                  <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_600} margin={{ bottom: 'xxsmall' }}>
                    {getString('freezeWindows.recurrenceConfig.recurrence')}
                  </Text>
                  <Layout.Horizontal
                    spacing="small"
                    flex={{ alignItems: 'center' }}
                    data-testid={'recurrenceType-selection'}
                  >
                    <DropDown
                      placeholder={getString('freezeWindows.recurrenceConfig.doesNotRepeat')}
                      items={recurrenceList}
                      value={selectedRecurrenceType}
                      minWidth={200}
                      usePortal={true}
                      filterable={false}
                      className={css.marginBottom24}
                      onChange={item => {
                        const isMonthly = item.value === RecurrenceTypeEnum.Monthly
                        setSelectedRecurrenceType(item.value as string)
                        const recurrenceField = formikProps.values?.recurrence
                        const recurrenceValue =
                          isMonthly && (recurrenceField?.spec.value as number) > 1
                            ? recurrenceField?.spec.value
                            : undefined
                        const newValues = produce(formikProps.values, draft => {
                          set(draft, 'recurrence.type', item.value as Recurrence['type'])
                          set(draft, 'recurrence.spec.value', recurrenceValue)
                        })
                        formikProps.setValues(newValues)
                      }}
                    />
                    {selectedRecurrenceType === RecurrenceTypeEnum.Monthly && (
                      <div className={css.marginBottom8}>
                        <FormInput.Select
                          name="recurrence.spec.value"
                          placeholder={getString('select')}
                          items={monthlySelectItems}
                          value={recurrenceSelectOption}
                          addClearButton={true}
                          usePortal={true}
                          className={css.selectDropdownWidth}
                          onChange={item => {
                            setRecurrenceSelectOption(item)
                            const recurrenceValue = (item.value as number) > 1 ? (item.value as number) : undefined
                            const newValues = produce(formikProps.values, draft => {
                              set(draft, 'recurrence.type', RecurrenceTypeEnum.Monthly)
                              set(draft, 'recurrence.spec.value', recurrenceValue)
                            })
                            formikProps.setValues(newValues)
                          }}
                        />
                      </div>
                    )}
                  </Layout.Horizontal>
                </Layout.Vertical>
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
