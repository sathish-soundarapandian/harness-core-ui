/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import { Layout, Popover, Text, TagsPopover, Icon, TableV2 } from '@harness/uicore'
import { Classes, Position, PopoverInteractionKind } from '@blueprintjs/core'
import type { Column } from 'react-table'
import { parse } from '@common/utils/YamlHelperMethods'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import { getReadableDateTime } from '@common/utils/dateUtils'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { FreezeSummaryResponse } from 'services/cd-ng'
import { getFreezeRouteLink } from '@common/utils/freezeWindowUtils'
import type {
  CellProps,
  CellType,
  FrozenExecutionListTableProps} from './FrozenExecutionUtil';
import {
  FreezeStatus,
  getComputedFreezeStatusMap,
  getReadableDateFromDateString
} from './FrozenExecutionUtil'
import css from './FrozenExecutionDrawer.module.scss'

export function FreezeWindowCell({ row, column }: CellProps): CellType {
  const data = row.original
  const { getString } = useStrings()

  const getViewFreezeRowLink = (): string =>
    getFreezeRouteLink(
      { freezeScope: data.freezeScope, identifier: data.identifier, type: data.type },
      {
        projectIdentifier: defaultTo(data.projectIdentifier, ''),
        orgIdentifier: defaultTo(data.orgIdentifier, ''),
        accountId: defaultTo(data.accountId, ''),
        module: defaultTo(column.module, 'cd')
      }
    )

  return (
    <Layout.Vertical>
      <Layout.Horizontal
        spacing="small"
        flex={{ alignItems: 'center', justifyContent: 'start' }}
        margin={{ bottom: 'small' }}
      >
        <Text
          font={{ variation: FontVariation.BODY2 }}
          color={Color.PRIMARY_7}
          lineClamp={1}
          onClick={e => {
            e.stopPropagation()
            window.open(`${windowLocationUrlPartBeforeHash()}#${getViewFreezeRowLink()}`)
          }}
          className={cx(css.cursor, css.hoverUnderline)}
        >
          {data.name}
        </Text>

        {data.description && (
          <Popover className={Classes.DARK} position={Position.TOP} interactionKind={PopoverInteractionKind.HOVER}>
            <Icon name="description" width={16} height={20} />
            <Layout.Vertical spacing="medium" padding="medium" style={{ maxWidth: 400 }}>
              <Text color={Color.GREY_200} font={{ variation: FontVariation.SMALL_SEMI }}>
                Description
              </Text>
              <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                {data.description}
              </Text>
            </Layout.Vertical>
          </Popover>
        )}

        {data.tags && Object.keys(data.tags || {}).length ? (
          <TagsPopover
            tags={data.tags}
            iconProps={{ size: 14, color: Color.GREY_600 }}
            popoverProps={{ className: Classes.DARK }}
            className={css.tags}
          />
        ) : null}
      </Layout.Horizontal>
      <Text color={Color.GREY_600} font="small" lineClamp={1}>
        {getString('idLabel', { id: data.identifier })}
      </Text>
    </Layout.Vertical>
  )
}

export function ScheduleCell({ row }: CellProps): CellType {
  const data = row.original
  const freezeWindow = data.windows?.[0]

  if (!freezeWindow) {
    return <></>
  }

  const { startTime, duration, endTime, timeZone, recurrence } = freezeWindow
  return (
    <Layout.Vertical>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
          <b>{getReadableDateFromDateString(startTime)}</b>
          {duration ? ' for ' : ' to '}
          <b>{duration || getReadableDateFromDateString(endTime)}</b>
        </Text>
      </Layout.Horizontal>

      <Layout.Horizontal>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
          {timeZone}
        </Text>

        {recurrence && (
          <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL }}>
            &nbsp;| {recurrence?.type}
            {freezeWindow?.recurrence?.spec?.until &&
              ` until ${getReadableDateFromDateString(freezeWindow?.recurrence?.spec?.until)}`}
          </Text>
        )}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export function StatusCell({ row, column }: CellProps): CellType {
  const { getString } = useStrings()
  const data = row.original
  const status = column.freezeStatusMap[defaultTo(data.identifier, '')]

  return (
    <Text
      font={{ variation: FontVariation.TINY_SEMI }}
      color={status === FreezeStatus.ACTIVE ? Color.PRIMARY_7 : Color.GREY_700}
      className={css.status}
      data-state={status}
    >
      {status || getString('inactive')}
    </Text>
  )
}

export function ScopeCell({ row }: CellProps): CellType {
  const scope = defaultTo(row.original.freezeScope, 'unknown')

  return (
    <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.PRIMARY_7} className={css.scope}>
      {scope}
    </Text>
  )
}

export function FreezeConfigCell({ row }: CellProps): CellType {
  const convertedJson = parse(defaultTo(row.original.yaml, ''))
  const ruleNames = (get(convertedJson, `freeze.entityConfigs`, []) || []).map((it: any) => it?.name)

  return (
    <div className={css.freezeConfigList}>
      {ruleNames.map((rule: string, index: number) => (
        <span key={`${rule}_${index}`} className={css.freezeConfigBadge}>
          {rule}
        </span>
      ))}
    </div>
  )
}

export function LastModifiedCell({ row }: CellProps): CellType {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {getReadableDateTime(data.lastUpdatedAt)}
    </Text>
  )
}

export function FrozenExecutionListTable({ data }: FrozenExecutionListTableProps): React.ReactElement {
  const { getString } = useStrings()
  const freezeStatusMap = getComputedFreezeStatusMap(data)
  const { module } = useParams<ModulePathParams>()

  const columns: Column<FreezeSummaryResponse>[] = React.useMemo(() => {
    return [
      {
        Header: getString('name'),
        accessor: 'name',
        width: '20%',
        Cell: FreezeWindowCell,
        module
      },
      {
        Header: getString('common.scope'),
        width: '7%',
        Cell: ScopeCell,
        accessor: (row: FreezeSummaryResponse) => row.freezeScope
      },
      {
        Header: getString('pipeline.frozenExecList.freezeTime'),
        accessor: 'schedule',
        width: '30%',
        Cell: ScheduleCell,
        disableSortBy: true
      },
      {
        Header: getString('pipeline.frozenExecList.freezeConfig'),
        accessor: 'rules',
        width: '25%',
        Cell: FreezeConfigCell,
        disableSortBy: true
      },
      {
        Header: (
          <Text tooltipProps={{ dataTooltipId: 'freezeStatusColumnTitle' }} color={Color.GREY_800}>
            {getString('status')}
          </Text>
        ),
        accessor: 'status',
        width: '8%',
        Cell: StatusCell,
        disableSortBy: true,
        freezeStatusMap
      },
      {
        Header: getString('lastUpdated'),
        accessor: 'lastUpdatedAt',
        width: '10%',
        disableSortBy: true,
        Cell: LastModifiedCell
      }
    ] as unknown as Column<FreezeSummaryResponse>[]
  }, [freezeStatusMap])

  return <TableV2 columns={columns} data={data} sortable className={css.table} />
}
