/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { DataTooltipInterface, MultiTypeInputType } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import {
  FormMultiTypeDurationField,
  MultiTypeDurationProps
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import { useRenderMultiTypeInputWithAllowedValues } from '../utils/utils'

interface TimeoutFieldInpuSetViewProps {
  name: string
  label: string
  placeholder?: string
  multiTypeDurationProps?: Omit<MultiTypeDurationProps, 'name' | 'onChange' | 'value'>
  fieldPath: string
  template: any
  disabled?: boolean
  className?: string
  tooltipProps?: DataTooltipInterface
}

export function TimeoutFieldInputSetView(props: TimeoutFieldInpuSetViewProps): JSX.Element {
  const { name, label, placeholder, template, fieldPath, tooltipProps, multiTypeDurationProps, className, disabled } =
    props

  const { getMultiTypeInputWithAllowedValues } = useRenderMultiTypeInputWithAllowedValues({
    name: name,
    labelKey: label,
    placeholderKey: placeholder,
    fieldPath: fieldPath,
    allowedTypes: defaultTo(multiTypeDurationProps?.allowableTypes, [MultiTypeInputType.FIXED]),
    template: template,
    readonly: disabled,
    tooltipProps: tooltipProps,
    className
  })

  if (shouldRenderRunTimeInputViewWithAllowedValues(fieldPath, template)) {
    return getMultiTypeInputWithAllowedValues()
  }

  return (
    <FormMultiTypeDurationField
      multiTypeDurationProps={multiTypeDurationProps}
      className={className}
      label={label}
      name={name}
      disabled={disabled}
      placeholder={placeholder}
    />
  )
}
