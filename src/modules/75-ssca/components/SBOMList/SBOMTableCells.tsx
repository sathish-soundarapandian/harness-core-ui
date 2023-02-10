/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Layout, Text } from '@harness/uicore'
import React from 'react'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import type { PackageReferenceResponseBody } from 'services/ssca'

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D>
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<PackageReferenceResponseBody>>

export const NameCell: CellType = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
        {data.name}
      </Text>
    </Layout.Horizontal>
  )
}

export const OriginatorCell: CellType = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
        {data.Originator}
      </Text>
    </Layout.Horizontal>
  )
}

export const StageNameCell: CellType = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
        {data.StageName}
      </Text>
    </Layout.Horizontal>
  )
}

export const VersionInfoCell: CellType = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
        {data.VersionInfo}
      </Text>
    </Layout.Horizontal>
  )
}
