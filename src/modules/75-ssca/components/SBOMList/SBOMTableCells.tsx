/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Layout, Text } from '@harness/uicore'
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import { useStrings } from 'framework/strings'
import { getExecutionPipelineViewLink } from '@pipeline/pages/execution-list/ExecutionListTable/ExecutionListCells'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import type { PackageReferenceResponseBody } from 'services/ssca'

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D>
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<PackageReferenceResponseBody>>


export const ExecutionCell: CellType = ({ row }) => {
  const data = row.original
  const pathParams = useParams<PipelineType<PipelinePathProps>>()
  const toExecutionPipelineView = getExecutionPipelineViewLink(data, pathParams, {})
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall">
        <Link to={toExecutionPipelineView}>
          <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7} lineClamp={1}>
            {data.PipelineIdentifier}
          </Text>
        </Link>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500} lineClamp={1}>
        {`${getString('pipeline.executionId')}: ${data.SequenceId}`}
      </Text>
    </Layout.Vertical>
  )
}

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
    <Layout.Horizontal spacing="xsmall">
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
        {data.Originator}
      </Text>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
        |
      </Text>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
        {data.VersionInfo}
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
