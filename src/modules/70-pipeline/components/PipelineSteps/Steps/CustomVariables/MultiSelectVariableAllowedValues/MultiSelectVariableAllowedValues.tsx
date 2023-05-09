/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import {
  AllowedTypes,
  MultiSelectOption,
  MultiSelectTypeInput,
  MultiTypeInputType,
  MultiTypeInputValue,
  SelectOption,
  getMultiTypeFromValue
} from '@harness/uicore'
import { FormikContextType, connect } from 'formik'
import { defaultTo, get, isArray, isEmpty } from 'lodash-es'
import type { MultiSelectTypeInputProps } from '@harness/uicore/dist/components/MultiTypeInput/MultiTypeInput'
import type { FormMultiTextTypeInputProps } from '@harness/uicore/dist/components/FormikForm/FormikForm'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { parseInputStringWithCommas } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'
import type { AcceptableValue } from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'

import css from './MultiSelectVariableAllowedValues.module.scss'

interface MultiSelectVariableAllowedValuesProps extends FormMultiTextTypeInputProps {
  disabled?: boolean
  formik?: FormikContextType<any>
  allowableTypes: AllowedTypes
  selectOption: SelectOption[]
  name: string
  label: string
  onChange: (value: AcceptableValue | undefined, valueType: MultiTypeInputValue, type: MultiTypeInputType) => void
  multiSelectTypeInputProps?: Omit<MultiSelectTypeInputProps, 'name'>
  usePortal?: boolean
}

export function concatValuesWithQuotes(data: MultiSelectOption[]): string {
  if (!isArray(data)) {
    return data
  }
  const values = data.map(item => {
    const value = item?.value
    if (typeof value === 'string') {
      return value.includes(',') ? `\\'${value}\\'` : value
    }
    return value
  })

  return values.filter(str => typeof str === 'number' || !isEmpty(str)).toString()
}

export function getMultiSelectValues(formikFieldValue: string): MultiSelectOption[] {
  const valueArr = defaultTo(parseInputStringWithCommas(formikFieldValue), [])
  if (!isArray(valueArr)) {
    return []
  }
  return valueArr
    .filter(str => !isEmpty(str))
    .map(item => ({
      label: item,
      value: item
    }))
}

export function isFixedInput(formik: any, name: string): boolean {
  const value = get(formik?.values, name, '')
  return getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
}

function MultiSelectVariableView(props: MultiSelectVariableAllowedValuesProps): JSX.Element {
  const {
    allowableTypes,
    selectOption,
    name,
    onChange,
    multiSelectTypeInputProps,
    formik,
    disabled = false,
    usePortal = true,
    ...rest
  } = props
  const { expressions } = useVariablesExpression()
  const { label, placeholder, ...restprops } = rest
  const value = get(formik?.values, name, '')
  return (
    <div className={cx(css.fieldAndOptions, 'variableInput')} data-testid="multiSelectVariableAllowedValues">
      <MultiSelectTypeInput
        {...multiSelectTypeInputProps}
        name={name}
        key={name}
        disabled={disabled}
        allowableTypes={allowableTypes}
        expressions={expressions}
        onChange={onChange}
        multiSelectProps={{ items: selectOption, usePortal, placeholder }}
        value={getMultiSelectValues(value)}
        {...restprops}
      />
    </div>
  )
}

export const MultiSelectVariableAllowedValues = connect(MultiSelectVariableView)
