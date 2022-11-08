/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { Layout, TableV2 } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView/TemplatesView'
import {
  RenderColumnScope,
  RenderColumnTemplate,
  RenderColumnType,
  RenderIcon
} from '@templates-library/pages/TemplatesPage/views/TemplatesListView/TemplatesListView'
import { DTListCardContextMenu } from '../DTListCardContextMenu/DTListCardContextMenu'
import css from './ExecutionPanelListView.module.scss'

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  onPreview?: (template: TemplateSummaryResponse) => void
  onOpenEdit?: (template: TemplateSummaryResponse) => void
  onDelete?: (template: TemplateSummaryResponse) => void
}

export const RenderColumnMenu: Renderer<CellProps<TemplateSummaryResponse>> = ({ row, column }) => {
  const data = row.original
  const { onPreview, onOpenEdit, onDelete } = column as CustomColumn<TemplateSummaryResponse>
  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      {onPreview && onOpenEdit && onDelete && (
        <DTListCardContextMenu template={data} onPreview={onPreview} onOpenEdit={onOpenEdit} onDelete={onDelete} />
      )}
    </Layout.Horizontal>
  )
}

const ExecutionPanelListView: React.FC<TemplatesViewProps> = (props): JSX.Element => {
  const { getString } = useStrings()
  const { data, onPreview, onOpenEdit, onDelete, onSelect } = props
  /* istanbul ignore next */
  const hideMenu = !onPreview && !onOpenEdit && !onDelete

  const getTemplateNameWidth = React.useCallback(() => {
    /* istanbul ignore next */
    if (hideMenu) {
      return '55%'
    }
    return '50%'
  }, [hideMenu])

  const columns: CustomColumn<TemplateSummaryResponse>[] = React.useMemo(
    () => [
      {
        Header: getString('typeLabel').toUpperCase(),
        accessor: 'templateEntityType',
        width: '20%',
        Cell: RenderColumnType
      },
      {
        accessor: 'icon',
        width: '10%',
        Cell: RenderIcon,
        disableSortBy: true
      },
      {
        Header: 'Template',
        accessor: 'name',
        width: getTemplateNameWidth(),
        Cell: RenderColumnTemplate
      },
      {
        Header: 'Scope',
        accessor: 'accountId',
        width: '15%',
        Cell: RenderColumnScope,
        disableSortBy: true
      },
      {
        Header: '',
        accessor: 'version',
        width: '5%',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        onPreview,
        onOpenEdit,
        onDelete
      }
    ],
    [getTemplateNameWidth, onPreview, onOpenEdit, onDelete, getString]
  )

  if (hideMenu) {
    /* istanbul ignore next */
    columns.pop()
  }

  return (
    <TableV2<TemplateSummaryResponse>
      className={css.table}
      columns={columns}
      data={defaultTo(data.content, [])}
      onRowClick={item => onSelect(item)}
    />
  )
}

export default ExecutionPanelListView
