/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { Comparators } from './SLI.types'

export enum SLIMetricEnum {
  THRESHOLD = 'Threshold',
  RATIO = 'Ratio'
}

export enum SLITypeEnum {
  AVAILABILITY = 'Availability',
  LATENCY = 'Latency'
}

export const comparatorOptions: SelectOption[] = [
  {
    label: '<',
    value: Comparators.LESS
  },
  {
    label: '>',
    value: Comparators.GREATER
  },
  {
    label: '<=',
    value: Comparators.LESS_EQUAL
  },
  {
    label: '>=',
    value: Comparators.GREATER_EQUAL
  }
]

export const defaultOption: SelectOption = {
  label: '',
  value: ''
}
