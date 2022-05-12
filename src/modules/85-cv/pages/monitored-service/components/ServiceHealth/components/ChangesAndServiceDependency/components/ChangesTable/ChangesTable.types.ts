/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Column } from 'react-table'
import type { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'

export interface ChangesTableInterface {
  isCardView?: boolean
  startTime: number
  endTime: number
  hasChangeSource: boolean
  monitoredServiceIdentifier?: string
  serviceIdentifier?: string | string[]
  environmentIdentifier?: string | string[]
  customCols?: Column<any>[]
  changeCategories?: ('Deployment' | 'Infrastructure' | 'Alert')[]
  changeSourceTypes?: ChangeSourceTypes[]
  recordsPerPage?: number
  dataTooltipId?: string
}

export interface ChangesTableContentWrapper {
  isCardView: boolean
  totalItems: number
  dataTooltipId?: string
}
