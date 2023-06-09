/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import type { Column, Renderer, CellProps } from 'react-table'
import { Text, Layout, TableV2, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { capitalize, defaultTo } from 'lodash-es'
import { Drawer } from '@blueprintjs/core'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import type { NGTriggerEventHistoryResponse, PageNGTriggerEventHistoryResponse } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import css from './TriggerActivityHistoryPage.module.scss'

interface TriggerActivityListProps {
  triggersListResponse?: PageNGTriggerEventHistoryResponse
}

type CellType = Renderer<CellProps<NGTriggerEventHistoryResponse>>

const RenderColumnTime: CellType = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical>
      <Layout.Horizontal spacing="small" width={230}>
        <Text color={Color.BLACK} lineClamp={1} font={{ variation: FontVariation.BODY2 }}>
          <ReactTimeago date={data?.targetExecutionSummary?.startTs as number} />
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const RenderColumnEventId: CellType = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ justifyContent: 'flex-start' }} spacing="xsmall">
      <Text>{data?.eventCorrelationId}</Text>
    </Layout.Horizontal>
  )
}

const RenderColumnStatus: CellType = ({ row }) => {
  const data = row.original.triggerEventStatus
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
      <ExecutionStatusLabel status={capitalize(data?.status) as ExecutionStatus} />
      <div className={css.statusMessage}>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500} lineClamp={1}>
          {data?.message}
        </Text>
      </div>
    </Layout.Vertical>
  )
}

const RenderColumnExecutionId: CellType = ({ row }) => {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } =
    useParams<PipelineType<PipelinePathProps>>()
  const data = row.original
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ justifyContent: 'flex-start' }} spacing="xsmall">
      <Link
        to={routes.toExecutionPipelineView({
          accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier: pipelineIdentifier || '-1',
          executionIdentifier: data?.targetExecutionSummary?.planExecutionId || '-1',
          module,
          source: 'executions'
        })}
      >
        <Text
          font={{ variation: FontVariation.LEAD }}
          color={Color.PRIMARY_7}
          tooltipProps={{ isDark: true }}
          lineClamp={1}
        >
          {data?.targetExecutionSummary?.targetId}
        </Text>
      </Link>
    </Layout.Horizontal>
  )
}

const RenderColumnPayload: CellType = ({ row, column }) => {
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ justifyContent: 'flex-start' }}>
      <Icon
        name="main-notes"
        size={20}
        className={css.notesIcon}
        onClick={() => {
          ;(column as any)?.setShowPayload(true)
          ;(column as any)?.setSelectedPayloadRow(row.original?.payload)
        }}
      />
    </Layout.Horizontal>
  )
}

const TriggerActivityList: React.FC<TriggerActivityListProps> = ({ triggersListResponse }) => {
  const { getString } = useStrings()
  const [showPayload, setShowPayload] = React.useState<boolean>(true)
  const [selectedPayloadRow, setSelectedPayloadRow] = React.useState<string | undefined>()
  const data: NGTriggerEventHistoryResponse[] = useMemo(
    () => triggersListResponse?.content || [],
    [triggersListResponse?.content]
  )

  const columns: Column<NGTriggerEventHistoryResponse>[] = useMemo(
    () => [
      {
        Header: getString('timeLabel'),
        id: 'time',
        width: '15%',
        Cell: RenderColumnTime
      },
      {
        Header: getString('triggers.activityHistory.eventCorrelationId'),
        accessor: 'eventCorrelationId',
        width: '25%',
        Cell: RenderColumnEventId
      },
      {
        Header: getString('triggers.activityHistory.triggerStatus'),
        accessor: 'triggerEventStatus',
        width: '25%',
        Cell: RenderColumnStatus
      },
      {
        Header: getString('triggers.activityHistory.executionDetails'),
        accessor: row => row?.targetExecutionSummary?.planExecutionId,
        width: '25%',
        Cell: RenderColumnExecutionId
      },
      {
        Header: getString('common.payload'),
        width: '10%',
        Cell: RenderColumnPayload,
        setShowPayload,
        setSelectedPayloadRow
      }
    ],
    []
  )

  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(triggersListResponse?.totalElements, 0),
    pageSize: defaultTo(triggersListResponse?.size, COMMON_DEFAULT_PAGE_SIZE),
    pageCount: defaultTo(triggersListResponse?.totalPages, -1),
    pageIndex: defaultTo(triggersListResponse?.pageable?.pageNumber, 0)
  })

  return (
    <>
      <TableV2<NGTriggerEventHistoryResponse>
        className={css.table}
        columns={columns}
        data={data}
        name="TriggerListView"
        pagination={paginationProps}
      />
      {showPayload && selectedPayloadRow && (
        <Drawer
          className={css.drawer}
          autoFocus={true}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          enforceFocus={true}
          hasBackdrop={true}
          usePortal={true}
          isOpen={true}
          size={790}
          title={<Text font={{ variation: FontVariation.H4 }}>{getString('common.payload')}</Text>}
          onClose={() => setShowPayload(false)}
        >
          <MonacoEditor
            language="yaml"
            value={JSON.stringify(JSON.parse(selectedPayloadRow), null, 2)}
            data-testid="monaco-editor"
            alwaysShowDarkTheme={true}
            options={
              {
                readOnly: true,
                wordBasedSuggestions: false,
                minimap: {
                  enabled: false
                },
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 13,
                scrollBeyondLastLine: false
              } as any
            }
          />
        </Drawer>
      )}
    </>
  )
}

export default TriggerActivityList
