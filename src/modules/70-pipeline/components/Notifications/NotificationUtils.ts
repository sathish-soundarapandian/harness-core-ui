/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption } from '@harness/uicore'

export enum Actions {
  Delete = 'Delete',
  Update = 'Update',
  Added = 'Added'
}

export const ALL_STAGES: MultiSelectOption = {
  label: 'All',
  value: 'AllStages'
}

export const getValuesFromOptions = (
  options: MultiSelectOption[],
  previousOptions: MultiSelectOption[]
): MultiSelectOption[] => {
  const allOptionSelected = options.some(opt => opt.value === ALL_STAGES.value)
  let selectedOptions: MultiSelectOption[] = []

  if (allOptionSelected) {
    /** If 'Select All' option is selected and any other option is deselected, remove 'Select All' */
    if (previousOptions.find(opt => opt.value === ALL_STAGES.value)) {
      selectedOptions = options.filter(opt => opt.value !== ALL_STAGES.value)
    } else {
      //select 'Select All'
      selectedOptions = [ALL_STAGES]
    }
  } else if (previousOptions.find(opt => opt.value === ALL_STAGES.value)) {
    /** If 'Select All' is deselected, clear selected options */
    selectedOptions = []
  } else {
    /** Else select whatever options are selected */
    selectedOptions = options
  }

  return selectedOptions || []
}
