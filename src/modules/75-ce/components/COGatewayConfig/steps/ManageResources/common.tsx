/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import type { CellProps } from 'react-table'
import { Color } from '@harness/design-system'
import type { InstanceDetails } from '@ce/components/COCreateGateway/models'

export const TableCell = (tableProps: CellProps<InstanceDetails>): JSX.Element => {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
export const NameCell = (tableProps: CellProps<InstanceDetails>): JSX.Element => {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ overflowWrap: 'anywhere' }}>
      {tableProps.value} {tableProps.row.original.id}
    </Text>
  )
}
