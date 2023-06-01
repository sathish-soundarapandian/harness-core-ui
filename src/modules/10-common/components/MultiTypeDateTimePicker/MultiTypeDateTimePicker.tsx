/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import {
  DateInput,
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  FormError,
  getFormFieldLabel,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiTypeInputValue
} from '@harness/uicore'
import { connect } from 'formik'
import { get, isEmpty } from 'lodash-es'

import moment from 'moment'
import type { DateInputProps } from '@harness/uicore/dist/components/DateInput/DateInput'
import { isMultiTypeExpression, isMultiTypeFixed, isMultiTypeRuntime } from '@common/utils/utils'
import { DATE_PARSE_FORMAT, FormikContextProps } from '../DateTimePicker/DateTimePicker'
import css from './MultiTypeDateTimePicker.module.scss'

export interface MultiTypeDateTimePickerProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps' | 'value'> {
  name: string
  value?: string
  dateInputProps?: DateInputProps
}

export interface FormMultiTypeDateTimePickerProps extends Omit<IFormGroupProps, 'label'> {
  label: string
  name: string
  multiTypeDateTimePicker?: Omit<MultiTypeDateTimePickerProps, 'onChange' | 'name'>
  placeholder?: string
  defaultToCurrentTime?: boolean
  onChange?: MultiTypeDateTimePickerProps['onChange']
  defaultValueToReset?: string
}

function MultiTypeDateTimePickerFixedTypeComponent(props: {
  name: string
  dateInputProps?: DateInputProps
  value?: string
  placeholder?: string
  disabled?: boolean
  onChange?: MultiTypeDateTimePickerProps['onChange']
}): React.ReactElement {
  const { dateInputProps, value = '', name, placeholder, disabled, onChange } = props
  const { dateProps, ...restDateInputProps } = dateInputProps || {}

  return (
    <div className={css.dateTimeWrapper}>
      <DateInput
        name={name}
        value={value}
        onChange={val => {
          onChange?.(val, MultiTypeInputValue.STRING, MultiTypeInputType.FIXED)
        }}
        placeholder={placeholder}
        contentEditable={false}
        timePrecision="minute"
        dateProps={{
          timePickerProps: { useAmPm: true },
          highlightCurrentDay: true,
          maxDate: moment().add(5, 'year').toDate(),
          ...dateProps
        }}
        popoverProps={{
          disabled,
          usePortal: true
        }}
        dateTimeFormat="LLLL"
        autoComplete="off"
        disabled={disabled}
        readOnly
        {...restDateInputProps}
      />
    </div>
  )
}

export const MultiTypeDateTimePicker: React.FC<MultiTypeDateTimePickerProps> = ({
  dateInputProps,
  value = '',
  name,
  placeholder,
  disabled,
  ...rest
}) => {
  return (
    <ExpressionAndRuntimeType
      value={value}
      name={name}
      disabled={disabled}
      resetExpressionOnFixedTypeChange
      fixedTypeComponent={MultiTypeDateTimePickerFixedTypeComponent}
      fixedTypeComponentProps={{ name, value, placeholder, disabled, dateInputProps }}
      {...rest}
    />
  )
}

function FormMultiTypeDateTimePicker(props: FormMultiTypeDateTimePickerProps & FormikContextProps<any>): ReactElement {
  const { formik, name, label, onChange, multiTypeDateTimePicker, ...restProps } = props
  const formValue = get(formik?.values, name)
  const [multiType, setMultiType] = React.useState<MultiTypeInputType>(getMultiTypeFromValue(formValue))

  const hasError = get(formik?.errors, name)
  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled = formik?.disabled,
    tooltipProps,
    placeholder,
    defaultToCurrentTime,
    defaultValueToReset,
    ...rest
  } = restProps

  const { dateInputProps, ...restMultiProps } = multiTypeDateTimePicker || {}
  let value = ''
  if (formValue) {
    const parsedFormikDateValue = moment(formValue, DATE_PARSE_FORMAT).valueOf()
    const currentDate = moment().format(DATE_PARSE_FORMAT)
    // to handle invalid expression value and change formik value to current date
    value = isNaN(parsedFormikDateValue)
      ? moment(currentDate, DATE_PARSE_FORMAT).valueOf().toString()
      : parsedFormikDateValue.toString()
  }

  if (!isMultiTypeFixed(multiType)) value = formValue

  return (
    <FormGroup
      {...rest}
      labelFor={name}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
      label={getFormFieldLabel(label, name, { tooltipProps })}
    >
      <MultiTypeDateTimePicker
        name={name}
        value={value}
        disabled={disabled}
        dateInputProps={dateInputProps}
        defaultValueToReset={defaultValueToReset}
        onTypeChange={setMultiType}
        placeholder={placeholder}
        onChange={(val, valueType, type) => {
          if (isMultiTypeExpression(type) && val === defaultValueToReset) formik?.setFieldValue(name, undefined)
          else if (isMultiTypeRuntime(type) || isMultiTypeExpression(type)) formik?.setFieldValue(name, val)
          else
            formik?.setFieldValue(
              name,
              val && typeof val === 'string' && !isEmpty(val) ? moment(parseInt(val)).format(DATE_PARSE_FORMAT) : null
            )
          onChange?.(val, valueType, type)
        }}
        {...restMultiProps}
      />
    </FormGroup>
  )
}
export const FormMultiTypeDateTimePickerField = connect(FormMultiTypeDateTimePicker)
