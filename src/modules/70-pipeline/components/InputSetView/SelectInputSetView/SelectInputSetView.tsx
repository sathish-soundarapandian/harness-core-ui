/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { DataTooltipInterface, FormInput, MultiTypeInputProps, MultiTypeInputType } from '@harness/uicore'

import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import { useRenderMultiTypeInputWithAllowedValues } from '../utils/utils'

interface SelectInputSetViewProps {
  className?: string
  name: string
  label: string
  fieldPath: string
  selectItems: SelectOption[]
  template: any
  placeholder?: string
  disabled?: boolean
  helperText?: string
  readonly?: boolean
  tooltipProps?: DataTooltipInterface
  multiTypeInputProps?: Omit<MultiTypeInputProps, 'name'>
  useValue?: boolean
}

export function SelectInputSetView(props: SelectInputSetViewProps): JSX.Element {
  const {
    className,
    selectItems,
    name,
    label,
    placeholder,
    disabled,
    helperText,
    template,
    fieldPath,
    readonly,
    tooltipProps,
    multiTypeInputProps,
    useValue
  } = props

  const { getMultiTypeInputWithAllowedValues } = useRenderMultiTypeInputWithAllowedValues({
    name: name,
    labelKey: label,
    placeholderKey: placeholder,
    fieldPath: fieldPath,
    allowedTypes: defaultTo(multiTypeInputProps?.allowableTypes, [MultiTypeInputType.FIXED]),
    template: template,
    readonly: readonly,
    tooltipProps: tooltipProps
  })

  if (shouldRenderRunTimeInputViewWithAllowedValues(fieldPath, template)) {
    return getMultiTypeInputWithAllowedValues()
  }

  return (
    <FormInput.MultiTypeInput
      className={className}
      selectItems={selectItems}
      label={label}
      placeholder={placeholder}
      name={name}
      disabled={disabled}
      helperText={helperText}
      useValue={useValue}
      multiTypeInputProps={multiTypeInputProps}
    />
  )
}
