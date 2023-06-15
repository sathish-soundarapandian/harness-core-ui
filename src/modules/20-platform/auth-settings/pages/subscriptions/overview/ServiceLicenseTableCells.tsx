/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
import { Link } from 'react-router-dom'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import React from 'react'
import moment from 'moment'
import type { ActiveServiceDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D>
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<ActiveServiceDTO>>
export const ServiceNameCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {data.name}
    </Text>
  )
}

export const OrganizationCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {data.orgName}
    </Text>
  )
}
export const ProjectCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {data.projectName}
    </Text>
  )
}
export const LastModifiedServiceIdCell: CellType = ({ row }) => {
  const data = row.original
  const accountId = data.accountIdentifier || ''
  const serviceId = data.identifier
  return (
    <Link
      to={routes.toServiceStudio({
        accountId,
        orgIdentifier: data.orgIdentifier,
        projectIdentifier: data.projectIdentifier,
        serviceId,
        module: 'cd'
      })}
    >
      <Text color={Color.PRIMARY_7} font={{ size: 'small' }} lineClamp={1}>
        {data.identifier}
      </Text>
    </Link>
  )
}
export const ServiceInstancesCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {data.instanceCount}
    </Text>
  )
}
export const LastDeployedCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {moment(data.lastDeployed).format('MM-DD-YYYY')}
    </Text>
  )
}
export const LicenseConsumedCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {data.licensesConsumed}
    </Text>
  )
}
