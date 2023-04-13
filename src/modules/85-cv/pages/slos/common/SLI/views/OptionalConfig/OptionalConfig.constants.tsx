/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import type { SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import {
  MinConsecutiveStartTime,
  MaxConsecutiveStartTime
} from '@cv/pages/slos/components/CVCreateSLOV2/components/CreateCompositeSloForm/CreateCompositeSloForm.constant'

export const consecutiveStartTimeOption = (getString: UseStringsReturn['getString']): SelectOption[] =>
  [
    { label: getString('cv.good'), value: false },
    { label: getString('cv.bad'), value: true }
  ] as unknown as SelectOption[]

export const EmptySelectOption = { label: '', value: '' }

export const getInputGroupProps = (getString: UseStringsReturn['getString']) => ({
  type: 'number',
  min: MinConsecutiveStartTime,
  max: MaxConsecutiveStartTime,
  step: 1,
  rightElement: <Text padding="small">{getString('cv.mins')}</Text>
})
