/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import type { Column } from 'react-table'
import { TableV2, Icon } from '@harness/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { CodeSourceCell, PipelineNameIdTagCell, ViewPipelineButtonCell } from './utils'
import css from './PipelineStageMinimalMode.module.scss'

export interface PipelineListProps {
  pipelineData: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  selectedRow: PMSPipelineSummaryResponse
  setSelectedRow: (data: PMSPipelineSummaryResponse) => void
  orgIdentifier: string
  projectIdentifier: string
}

export function PipelineList({
  pipelineData,
  gotoPage,
  selectedRow,
  setSelectedRow,
  orgIdentifier,
  projectIdentifier
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
        width: '40%',
        Cell: PipelineNameIdTagCell
      },
      {
        Header: getString('pipeline.codeSource'),
        accessor: 'codeSource',
        width: '30%',
        Cell: CodeSourceCell
      },
      {
        Header: getString('pipeline.openPipelineInNewTab'),
        accessor: 'modules',
        width: '25%',
        Cell: ViewPipelineButtonCell,
        orgIdentifier,
        projectIdentifier
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
