/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, noop } from 'lodash-es'
import { DataTooltipInterface, FormInput, MultiSelectOption, MultiTypeInputType } from '@harness/uicore'
import type { MultiSelectTypeInputProps } from '@harness/uicore/dist/components/MultiTypeInput/MultiTypeInput'

import { shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import { useRenderMultiSelectTypeInputWithAllowedValues } from '../utils/utils'

interface MultiSelectInputSetViewProps {
  name: string
  label: string
  selectItems: MultiSelectOption[]
  fieldPath: string
  template: any
  placeholder?: string
  disabled?: boolean
  helperText?: string
  readonly?: boolean
  tooltipProps?: DataTooltipInterface
  multiSelectTypeInputProps: Omit<MultiSelectTypeInputProps, 'name'>
  useValue?: boolean
}

export function MultiSelectInputSetView(props: MultiSelectInputSetViewProps): JSX.Element {
  const {
    name,
    label,
    selectItems,
    placeholder,
    disabled,
    template,
    fieldPath,
    readonly,
    tooltipProps,
    helperText,
    multiSelectTypeInputProps,
    useValue
  } = props

  const { getMultiSelectTypeInputWithAllowedValues } = useRenderMultiSelectTypeInputWithAllowedValues({
    name: name,
    labelKey: label,
    placeholderKey: placeholder,
    fieldPath: fieldPath,
    allowedTypes: defaultTo(multiSelectTypeInputProps?.allowableTypes, [MultiTypeInputType.FIXED]),
    template: template,
    readonly: readonly,
    tooltipProps: tooltipProps,
    options: selectItems,
    onChange: defaultTo(multiSelectTypeInputProps?.onChange, noop)
  })

  if (shouldRenderRunTimeInputViewWithAllowedValues(fieldPath, template)) {
    return getMultiSelectTypeInputWithAllowedValues()
  }

  return (
    <FormInput.MultiSelectTypeInput
      label={label}
      tooltipProps={tooltipProps}
      name={name}
      disabled={disabled}
      placeholder={placeholder}
      multiSelectTypeInputProps={multiSelectTypeInputProps}
      selectItems={selectItems}
      helperText={helperText}
      useValue={useValue}
    />
  )
}
