/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { connect, FormikContextType } from 'formik'
import { get } from 'lodash-es'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import { DataTooltipInterface, DateInput, errorCheck, FormError, getFormFieldLabel } from '@harness/uicore'
import type { DateInputProps } from '@harness/uicore/dist/components/DateInput/DateInput'

export interface FormikExtended<T> extends FormikContextType<T> {
  disabled?: boolean
  formName: string
}

export interface FormikContextProps<T> {
  formik?: FormikExtended<T>
  tooltipProps?: DataTooltipInterface
}

interface FormikDateTimePickerProps extends IFormGroupProps {
  onChange?: (value?: string) => void
  name: string
  placeholder?: string
  disabled?: boolean
  dateInputProps?: DateInputProps
}

function _DateTimePicker(props: FormikDateTimePickerProps & FormikContextProps<any>): ReactElement {
  const { formik, name, ...restProps } = props
  const hasError = errorCheck(name, formik)
  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled = formik?.disabled,
    label,
    tooltipProps,
    placeholder,
    onChange,
    dateInputProps,
    ...rest
  } = restProps

  return (
    <FormGroup
      label={getFormFieldLabel(label, name, { tooltipProps })}
      labelFor={name}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
      {...rest}
    >
      <DateInput
        value={formik?.values[name]}
        onChange={value => {
          formik?.setFieldValue(name, value)
          onChange?.(value)
        }}
        name={name}
        contentEditable={false}
        timePrecision="minute"
        dateProps={{
          timePickerProps: { useAmPm: true },
          highlightCurrentDay: true,
          minDate: new Date()
        }}
        popoverProps={{
          disabled,
          usePortal: true
        }}
        dateTimeFormat={'YYYY-MM-DD hh:mm a'}
        autoComplete="off"
        disabled={disabled}
        {...dateInputProps}
      />
    </FormGroup>
  )
}

export const DateTimePicker = connect(_DateTimePicker)
