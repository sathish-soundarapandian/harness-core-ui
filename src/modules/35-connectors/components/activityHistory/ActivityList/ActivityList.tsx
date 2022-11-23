/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import moment from 'moment'

import { Layout, Text, Icon, IconName, Container, TableV2 } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type { CellProps, Renderer, Column } from 'react-table'
import type { DateRange } from '@blueprintjs/datetime'
import { useStrings } from 'framework/strings'

import type { ResponsePageActivity, Activity, ResponseConnectivityCheckSummary } from 'services/cd-ng'

import { Page } from '@common/exports'
import { ActivityStatus, ActivityType } from '@connectors/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../ActivityHistory/ActivityHistory.module.scss'

interface ActivityListProps {
  activityList: ResponsePageActivity
  connectivitySummary: ResponseConnectivityCheckSummary
  entityIdentifier: string | undefined
  dateRange: DateRange
  refetchActivities: () => Promise<void>
  refetchConnectivitySummary: () => Promise<void>
  showOtherActivity: boolean
  showConnectivityChecks: boolean
}

interface AllActivity extends Activity {
  failureCount?: number
}

function getIconForActivity(data: Activity): IconName {
  if (data.type === 'CONNECTIVITY_CHECK') {
    return 'main-delete'
  }
  if (data.activityStatus === ActivityStatus.FAILED) {
    return 'warning-sign'
  } else {
    return 'tick'
  }
}

const GetStatusText: React.FC<AllActivity> = (data: AllActivity) => {
  const { getString } = useStrings()
  let status = ''

  if (data.activityStatus === ActivityStatus.FAILED) {
    status = getString('common.test.connectionFailed')
  } else if (data.activityStatus === ActivityStatus.SUCCESS) {
    status = getString('common.test.connectionSuccessful')
  }

  if (data.type === ActivityType.CONNECTIVITY_CHECK) {
    status = `${getString('activityHistory.heartbeatFailure')} (${data.failureCount})`
  }
  if (data.type === ActivityType.ENTITY_CREATION) {
    status = getString('activityHistory.createdSuccessfully')
  }
  if (data.type === ActivityType.ENTITY_UPDATE) {
    status = getString('activityHistory.updatedSuccessfully')
  }

  return <Text color={Color.GREY_900}>{status}</Text>
}

const RenderColumnTime: Renderer<CellProps<Activity>> = ({ row }) => {
  const { getString } = useStrings()
  const data = row.original
  return (
    <Layout.Vertical spacing="xsmall">
      <Text color={Color.GREY_900}>{getString('activityLog')}</Text>
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

const RenderColumnStatus: Renderer<CellProps<AllActivity>> = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal>
      <Icon
        name={getIconForActivity(data)}
        size={12}
        color={data.activityStatus === ActivityStatus.SUCCESS ? Color.GREEN_500 : Color.RED_500}
        style={{
          margin: '2px 5px'
        }}
      />

      <Layout.Vertical>
        {GetStatusText(data)}
        <Text font={{ size: 'small' }} color={Color.GREY_450}>
          {data.detail?.activityStatusMessage}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const ActivityList: React.FC<ActivityListProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const columns: Column<Activity>[] = useMemo(
    () => [
      {
        Header: getString('timeLabel')?.toUpperCase(),
        accessor: 'activityTime',
        width: '25%',
        Cell: RenderColumnTime
      },
      {
        Header: getString('activity')?.toUpperCase(),
        accessor: 'description',
        width: '50%',
        Cell: RenderColumnActivity
      },
      {
        Header: getString('status')?.toUpperCase(),
        accessor: 'activityStatus',
        width: '25%',
        Cell: RenderColumnStatus
      }
    ],
    [props.refetchActivities, props.refetchConnectivitySummary]
  )
  const activity: AllActivity[] = useMemo(
    () => (props.showOtherActivity ? props.activityList?.data?.content || [] : []),
    [props.activityList?.data?.content, props.showOtherActivity]
  )

  const connectivity = useMemo(
    () => (props.showConnectivityChecks ? props.connectivitySummary?.data || null : null),
    [props.connectivitySummary?.data, props.showConnectivityChecks]
  )

  let dataArray
  if (props.showConnectivityChecks && props.connectivitySummary?.data && connectivity?.failureCount) {
    dataArray = activity.concat([
      {
        accountIdentifier: accountId,
        type: ActivityType.CONNECTIVITY_CHECK,
        activityTime: connectivity?.startTime as number,
        description: getString('activityHistory.connectivityCheck'),
        activityStatus: 'FAILED',
        detail: {
          activityStatusMessage: getString('activityHistory.connectivityCheckFailed')
        },
        failureCount: connectivity?.failureCount
      }
    ])
  } else {
    dataArray = activity
  }

  return (
    <Layout.Vertical className={css.activity}>
      {dataArray?.length ? (
        <TableV2<AllActivity> columns={columns} data={dataArray || []} />
      ) : (
        <Container height={'200px'}>
          <Page.NoDataCard icon="nav-dashboard" message={getString('activityHistory.noData')} />
        </Container>
      )}
    </Layout.Vertical>
  )
}
export default ActivityList
