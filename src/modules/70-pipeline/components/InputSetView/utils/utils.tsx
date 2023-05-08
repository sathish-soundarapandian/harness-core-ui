/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  AllowedTypes,
  DataTooltipInterface,
  ExpressionAndRuntimeTypeProps,
  FormInput,
  MultiSelectOption,
  MultiTypeInputType,
  MultiTypeInputValue,
  SelectOption
} from '@harness/uicore'
import { isArray } from 'lodash-es'

import type { ServiceSpec } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getAllowedValuesFromTemplate } from '@pipeline/utils/CIUtils'
import { getStringValueWithComma } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'

interface UseRenderMultiTypeInputWithAllowedValuesArgs {
  name: string
  tooltipProps?: DataTooltipInterface
  labelKey: string
  placeholderKey?: string
  fieldPath: string
  allowedTypes: AllowedTypes
  template: any
  readonly?: boolean
  onChange?: ExpressionAndRuntimeTypeProps['onChange']
}

export const useRenderMultiTypeInputWithAllowedValues = ({
  name,
  tooltipProps,
  labelKey,
  placeholderKey,
  fieldPath,
  allowedTypes,
  template,
  readonly,
  onChange
}: UseRenderMultiTypeInputWithAllowedValuesArgs): { getMultiTypeInputWithAllowedValues: () => JSX.Element } => {
  const { expressions } = useVariablesExpression()

  // In case we have strings with commas, we store them as \'a,b\' in Yaml (or other places) and send this accepted format to BE
  // Hence we need to convert item values coming here to suitable format (only for strings with commas)
  const getEscapedSelectOptions = (data: SelectOption[]): SelectOption[] => {
    if (!isArray(data)) {
      return data
    }
    const values: SelectOption[] = data.map(item => {
      const value = typeof item.value === 'string' ? (getStringValueWithComma(item.value) as string) : item.value
      return {
        label: item.label,
        value: value ?? item.value,
        icon: item.icon
      }
    })
    return values
  }

  const getMultiTypeInputWithAllowedValues = (): JSX.Element => {
    const allowedValues = getAllowedValuesFromTemplate(template, fieldPath)
    const items = getEscapedSelectOptions(allowedValues)

    return (
      <FormInput.MultiTypeInput
        name={name}
        label={labelKey}
        useValue
        selectItems={items}
        placeholder={placeholderKey}
        multiTypeInputProps={{
          allowableTypes: allowedTypes,
          expressions,
          selectProps: { disabled: readonly, items },
          onChange
        }}
        disabled={readonly}
        tooltipProps={tooltipProps}
      />
    )
  }

  return {
    getMultiTypeInputWithAllowedValues
  }
}

interface UseRenderMultiSelectTypeInputWithAllowedValuesArgs {
  name: string
  tooltipProps?: DataTooltipInterface
  labelKey: string
  placeholderKey?: string
  fieldPath: string
  allowedTypes: AllowedTypes
  template: ServiceSpec
  readonly?: boolean
  options: MultiSelectOption[]
  onChange?: (
    value: boolean | string | number | SelectOption | string[] | MultiSelectOption[] | undefined,
    valueType: MultiTypeInputValue,
    type: MultiTypeInputType
  ) => void
}

export const useRenderMultiSelectTypeInputWithAllowedValues = ({
  name,
  tooltipProps,
  labelKey,
  placeholderKey,
  fieldPath,
  allowedTypes,
  template,
  readonly,
  options,
  onChange
}: UseRenderMultiSelectTypeInputWithAllowedValuesArgs): {
  getMultiSelectTypeInputWithAllowedValues: () => JSX.Element
} => {
  const { expressions } = useVariablesExpression()

  const getMultiSelectTypeInputWithAllowedValues = (): JSX.Element => {
    const items = getAllowedValuesFromTemplate(template, fieldPath)
    return (
      <FormInput.MultiSelectTypeInput
        name={name}
        label={labelKey}
        selectItems={items}
        placeholder={placeholderKey}
        disabled={readonly}
        tooltipProps={tooltipProps}
        multiSelectTypeInputProps={{
          multiSelectProps: {
            usePortal: true,
            items: options,
            placeholder: placeholderKey
          },
          allowableTypes: allowedTypes,
          expressions: expressions,
          onChange: onChange
        }}
      />
    )
  }

  return {
    getMultiSelectTypeInputWithAllowedValues
  }
}
