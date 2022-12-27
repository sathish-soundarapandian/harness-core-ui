/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import React from 'react'
import moment from 'moment'
import type { ActiveServiceDTO } from 'services/cd-ng'

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D>
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<ActiveServiceDTO>>

export const LastModifiedNameCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {data.name}
    </Text>
  )
}

export const OrganizationCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {data.orgName}
    </Text>
  )
}
export const ProjectCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {data.projectName}
    </Text>
  )
}
export const LastModifiedServiceIdCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {data.identifier}
    </Text>
  )
}
export const ServiceInstancesCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {data.instanceCount}
    </Text>
  )
}
export const LastDeployedCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {moment(data.lastDeployed).format('DD-MM-YYYY')}
    </Text>
  )
}
export const LicenseConsumedCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {data.licensesConsumed}
    </Text>
  )
}
