/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IFormGroupProps } from '@blueprintjs/core'
import type {
  DataTooltipInterface,
  ExpressionAndRuntimeTypeProps,
  FixedTypeComponentProps,
  MultiSelectDropDownProps,
  MultiSelectOption,
  SelectOption
} from '@harness/uicore'
import type { ConfigureOptionsProps } from '../ConfigureOptions/ConfigureOptions'

export interface AllSelectedProps {
  /** enables support for selecting all items */
  isAllSelectionSupported?: boolean
  /** should `All` option be selected and others deselected if all items are individually selected */
  selectAllOptionIfAllItemsAreSelected?: boolean
}

export type MultiSelectDropDownFixedProps = FixedTypeComponentProps & MultiSelectDropDownProps & AllSelectedProps

export interface FormMultiTypeMultiSelectDropDownProps extends Omit<IFormGroupProps, 'label'> {
  label: string
  name: string
  dropdownProps: Omit<MultiSelectDropDownProps, 'onChange' | 'value'> & AllSelectedProps
  multiTypeProps?: Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps' | 'name'>
  tooltipProps?: DataTooltipInterface
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'name' | 'type' | 'value' | 'onChange'>
  onChange?: (value: SelectOption[]) => void
}

export const SELECT_ALL_OPTION: MultiSelectOption = {
  label: 'All',
  value: 'All'
}

export function getLocalValueFromSelectedOptions(
  options: MultiSelectOption[],
  itemsLength: number,
  clearRestOnSelect?: boolean
): MultiSelectOption[] {
  const allOptionIndex = options.findIndex(opt => opt.value === SELECT_ALL_OPTION.value)

  // if All Option is the last selected option, clear the rest and select All Option
  if (allOptionIndex === options.length - 1) {
    return [SELECT_ALL_OPTION]
  }
  // else if option selected when All option is selected, clear All option
  else if (allOptionIndex === 0) {
    return options.slice(1)
  }
  // else if plain option selected
  else {
    // and selecting all options, should clear the rest and select All option
    if (clearRestOnSelect && options.length === itemsLength) {
      return [SELECT_ALL_OPTION]
    }
    // else set plain options
    else {
      return options
    }
  }
}
