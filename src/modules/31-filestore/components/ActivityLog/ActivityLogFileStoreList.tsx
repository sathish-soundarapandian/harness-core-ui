/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { CellProps, Renderer, Column } from 'react-table'

import moment from 'moment'
import { Layout, Text, Container, TableV2 } from '@harness/uicore'

import { Color } from '@harness/design-system'
import type { Activity } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { Page } from '@common/exports'

import css from './ActivityLogFileStore.module.scss'

const RenderColumnTime: Renderer<CellProps<any>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical spacing="xsmall">
      <Text color={Color.GREY_900}>{moment(data.activityTime).format('hh:mm a')}</Text>
      <Text font={{ size: 'small' }} color={Color.GREY_450}>
        {moment(data.activityTime).format('DD MMM YYYY')}
      </Text>
    </Layout.Vertical>
  )
}

const RenderColumnActivity: Renderer<CellProps<Activity>> = ({ row }) => {
  const data = row.original
  return <Text>{data.description}</Text>
}

const RenderColumnStatus: Renderer<CellProps<Activity>> = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal>
      <Layout.Vertical>
        <Text font={{ size: 'small' }} color={Color.GREY_450}>
          {data.detail?.activityStatusMessage}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

interface LogsFileStoreList {
  activityList?: Activity[]
  refetchActivities?: () => Promise<void>
}

export function ActivityLogFileStoreList(props: LogsFileStoreList): React.ReactElement {
  const { activityList = [] } = props
  const { getString } = useStrings()

  const columns: Column<Activity>[] = useMemo(
    () => [
      {
        Header: getString('timeLabel').toUpperCase(),
        accessor: 'activityTime',
        width: '25%',
        Cell: RenderColumnTime
      },
      {
        Header: getString('activity').toUpperCase(),
        accessor: 'description',
        width: '50%',
        Cell: RenderColumnActivity
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: 'activityStatus',
        width: '25%',
        Cell: RenderColumnStatus
      }
    ],
    [activityList]
  )

  return (
    <Layout.Vertical>
      {activityList?.length ? (
        <TableV2<Activity> columns={columns} data={activityList} className={css.table} />
      ) : (
        <Container height="100%" background={Color.PRIMARY_BG}>
          <Page.NoDataCard icon="nav-dashboard" message={getString('activityHistory.noData')} />
        </Container>
      )}
    </Layout.Vertical>
  )
}
