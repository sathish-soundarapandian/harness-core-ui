/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { noop } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import { ADD_NEW_VALUE } from '@cv/constants'
import type { UseStringsReturn } from 'framework/strings'

export const AddNewSelectOption = (getString: UseStringsReturn['getString']): SelectOption => {
  return {
    label: getString('cv.addNew'),
    value: ADD_NEW_VALUE
  }
}

export const initModalData = {
  data: {
    name: '',
    description: '',
    identifier: '',
    tags: {}
  },
  isService: true,
  isEdit: false,
  onClose: noop
}
