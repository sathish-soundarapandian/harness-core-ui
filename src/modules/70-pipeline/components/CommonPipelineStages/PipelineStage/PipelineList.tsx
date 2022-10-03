/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import type { CellProps, Column, Renderer } from 'react-table'
import { Text, TableV2, FontVariation, Layout, Icon, Color, IconName } from '@harness/uicore'
import { get } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { getModuleIcon } from '@common/utils/utils'
import { Module, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import css from './PipelineStageMinimalMode.module.scss'

export interface PipelineListProps {
  pipelineData: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  selectedRow: PMSPipelineSummaryResponse
  setSelectedRow: (data: PMSPipelineSummaryResponse) => void
}

// eslint-disable-next-line react/function-component-definition
const PipelineNameIdTagCell: Renderer<CellProps<PMSPipelineSummaryResponse>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="xsmall">
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H6 }} lineClamp={1} color={Color.BLACK}>
          {data?.name}
        </Text>
        <Text font={{ variation: FontVariation.BODY }} lineClamp={1} color={Color.GREY_600}>
          <String stringID="idLabel" vars={{ id: data?.identifier }} />
        </Text>
      </Layout.Vertical>
      {Object.keys(get(data, 'tags', {})).length > 0 && (
        <>
          <Icon name="main-tags" size={15} />
          <Text color={Color.GREY_600}>{Object.keys(get(data, 'tags', {})).length}</Text>
        </>
      )}
    </Layout.Horizontal>
  )
}

// eslint-disable-next-line react/function-component-definition
const ModuleCell: Renderer<CellProps<PMSPipelineSummaryResponse>> = ({ row }) => {
  const data = row.original
  const modules = get(data, 'modules', [])
  const modulesIcon = modules.map((module: Module | string) =>
    module === 'pms' ? 'pipeline' : getModuleIcon(moduleToModuleNameMapping[module as Module])
  )

  return (
    <Layout.Horizontal spacing="xsmall">
      {modulesIcon.length > 0 &&
        modulesIcon.map((iconName: IconName, idx) => <Icon name={iconName} size={25} key={idx} />)}
    </Layout.Horizontal>
  )
}

export function PipelineList({
  pipelineData,
  gotoPage,
  selectedRow,
  setSelectedRow
}: PipelineListProps): React.ReactElement {
  const { getString } = useStrings()

  const content = get(pipelineData, 'content', [])
  const totalElements = get(pipelineData, 'totalElements', 0)
  const totalPages = get(pipelineData, 'totalPages', 0)
  const number = get(pipelineData, 'number', DEFAULT_PAGE_INDEX)
  const size = get(pipelineData, 'size', DEFAULT_PAGE_SIZE)

  const columns = (): Column<PMSPipelineSummaryResponse>[] => {
    return [
      {
        Header: getString('common.pipeline'),
        accessor: 'pipeline',
        width: '45%',
        Cell: PipelineNameIdTagCell
      },
      {
        Header: getString('modules'),
        accessor: 'modules',
        width: '50%',
        Cell: ModuleCell
      },
      {
        accessor: 'icon',
        width: '5%',
        Cell: () => (
          <Icon className={cx(css.iconCheck, { [css.iconChecked]: selectedRow })} size={14} name="pipeline-approval" />
        )
      }
    ] as unknown as Column<PMSPipelineSummaryResponse>[]
  }

  return (
    <TableV2<PMSPipelineSummaryResponse>
      className={css.table}
      columns={columns()}
      data={content}
      pagination={
        totalElements > size
          ? {
              itemCount: totalElements,
              pageSize: size,
              pageCount: totalPages,
              pageIndex: number,
              gotoPage
            }
          : undefined
      }
      getRowClassName={row =>
        cx(css.tableRow, {
          [css.selectedItem]: selectedRow?.identifier === row.original.identifier
        })
      }
      onRowClick={data => setSelectedRow(data)}
    />
  )
}
