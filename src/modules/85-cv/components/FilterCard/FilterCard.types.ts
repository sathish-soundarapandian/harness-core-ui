/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { FilterTypes } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'

export interface FilterCardItem {
  type: FilterTypes
  title: string
  icon: IconName
  iconSize?: number
  count?: number
}

export interface FilterCardProps {
  data: Array<FilterCardItem>
  cardClassName?: string
  selected?: FilterCardItem
  onChange: (selected: FilterCardItem) => void
}
