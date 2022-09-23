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
  FormInput,
  MultiSelectOption,
  MultiTypeInputType,
  MultiTypeInputValue,
  SelectOption
} from '@harness/uicore'

import type { ServiceSpec } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getAllowedValuesFromTemplate } from '@pipeline/utils/CIUtils'

interface UseRenderMultiTypeInputWithAllowedValuesArgs {
  name: string
  tooltipProps?: DataTooltipInterface
  labelKey: string
  placeholderKey?: string
  fieldPath: string
  allowedTypes: AllowedTypes
  template: any
  readonly?: boolean
  className?: string
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
  className
}: UseRenderMultiTypeInputWithAllowedValuesArgs): { getMultiTypeInputWithAllowedValues: () => JSX.Element } => {
  const { expressions } = useVariablesExpression()

  const getMultiTypeInputWithAllowedValues = (): JSX.Element => {
    const items = getAllowedValuesFromTemplate(template, fieldPath)
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
          selectProps: { disabled: readonly, items }
        }}
        disabled={readonly}
        tooltipProps={tooltipProps}
        className={className}
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
