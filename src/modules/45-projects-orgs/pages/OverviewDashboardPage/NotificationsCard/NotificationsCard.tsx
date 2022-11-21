import { Container, Layout, Text, Popover, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEqual } from 'lodash-es'
import { HTMLTable } from '@blueprintjs/core'
import cx from 'classnames'
import { String, useStrings } from 'framework/strings'
import {
  DeploymentsOverview,
  useGetDeploymentStatsOverview,
  GetDeploymentStatsOverviewQueryParams,
  PipelineExecutionInfo
} from 'services/dashboard-service'
import { useLandingDashboardContext, TimeRangeToDays } from '@common/factories/LandingDashboardContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import type { ExecutionSummaryInfo } from 'services/pipeline-ng'
import css from './NotificationsCard.module.scss'

export enum TimeRangeGroupByMapping {
  '30Days' = 'DAY',
  '60Days' = 'WEEK',
  '90Days' = 'WEEK',
  '1Year' = 'MONTH'
}

export type ExecutionStatus = Exclude<
  Required<ExecutionSummaryInfo>['lastExecutionStatus'],
  'NOT_STARTED' | 'INTERVENTION_WAITING' | 'APPROVAL_WAITING' | 'APPROVAL_REJECTED' | 'WAITING'
>

const makeKey = (item: PipelineExecutionInfo) => {
  const accountInfo = item.accountInfo?.accountIdentifier
  const orgInfo = item.orgInfo?.orgIdentifier
  const projectInfo = item.projectInfo?.projectIdentifier
  return `${accountInfo}-${orgInfo}-${projectInfo}`
}

export const FailedStatus: Partial<Record<ExecutionStatus, ExecutionStatus>> = {
  Failed: 'Failed',
  Aborted: 'Aborted',
  AbortedByFreeze: 'AbortedByFreeze',
  Expired: 'Expired',
  IgnoreFailed: 'IgnoreFailed',
  Errored: 'Errored'
}

export const ActiveStatus: Partial<Record<ExecutionStatus, ExecutionStatus>> = {
  Running: 'Running',
  AsyncWaiting: 'AsyncWaiting',
  TaskWaiting: 'TaskWaiting',
  TimedWaiting: 'TimedWaiting',
  Paused: 'Paused',
  InterventionWaiting: 'InterventionWaiting',
  ApprovalWaiting: 'ApprovalWaiting',
  ResourceWaiting: 'ResourceWaiting'
}

function DeployOverviewPopover({
  overview,
  status
}: {
  overview: PipelineExecutionInfo[]
  status: string[]
}): JSX.Element {
  const { getString } = useStrings()

  const projectOrgCount = new Map()
  const projectOrgMap = new Map()

  overview.forEach(item => projectOrgCount.set(makeKey(item), (projectOrgCount.get(makeKey(item)) || 0) + 1))
  overview.forEach(item => projectOrgMap.set(makeKey(item), item))

  function toDeployment(item: PipelineExecutionInfo): void {
    const projectIdentifier = defaultTo(item.projectInfo?.projectIdentifier, '')
    const orgIdentifier = defaultTo(item.orgInfo?.orgIdentifier, '')
    const accountId = defaultTo(item.accountInfo?.accountIdentifier, '')
    const route = routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' })
    const filterQuery = isEqual(status, Object.keys(FailedStatus))
      ? {
          status,
          timeRange: {
            startTime: Date.now() - 24 * 60 * 60000,
            endTime: Date.now()
          }
        }
      : { status }
    const search = qs.stringify({ filters: { ...filterQuery } })
    window.open(`#${route + '?' + search}`)
  }

  const keyList = Array.from(projectOrgCount.keys())
  return (
    <HTMLTable small className={css.popoverTable}>
      <thead>
        <tr>
          <th>{getString('projectsText').toLocaleUpperCase()}</th>
          <th>{getString('deploymentsText').toLocaleUpperCase()}</th>
        </tr>
      </thead>
      <tbody>
        {keyList.map(i => (
          <tr key={i}>
            <td>
              <Layout.Vertical>
                <Text color={Color.GREY_1000} lineClamp={1} style={{ maxWidth: 200 }}>
                  {(projectOrgMap.get(i) as PipelineExecutionInfo).projectInfo?.projectName}
                </Text>
                {(projectOrgMap.get(i) as PipelineExecutionInfo).orgInfo?.orgIdentifier !== 'default' && (
                  <div className={css.orgStyle}>
                    <Icon name="nav-organization" size={12} />
                    <Text color={Color.GREY_450} font={{ size: 'xsmall' }}>
                      {` Orgs: ${(projectOrgMap.get(i) as PipelineExecutionInfo).orgInfo?.orgName}`}
                    </Text>
                  </div>
                )}
              </Layout.Vertical>
            </td>
            <td>
              <Text
                onClick={() => toDeployment(projectOrgMap.get(i))}
                color={Color.PRIMARY_7}
                className={css.executionCount}
              >
                {projectOrgCount.get(i)}
              </Text>
            </td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}

const getBadge = (type: string, deployStat: PipelineExecutionInfo[]): JSX.Element | null => {
  const stat = deployStat.length
  if (stat <= 0) {
    return null
  }
  switch (type) {
    case 'pendingManualInterventionExecutions':
      return (
        <Popover interactionKind="hover" popoverClassName={css.popoverStyle} autoFocus={false}>
          <div className={css.badge} key={type}>
            <Icon name="status-pending" size={16} color={Color.ORANGE_700} />
            <Text className={css.badgeText}>
              {`${stat} `}
              {stat > 1 ? (
                <String stringID={'pipeline.dashboardDeploymentsWidget.pendingManualIntervention.plural'} />
              ) : (
                <String stringID={'pipeline.dashboardDeploymentsWidget.pendingManualIntervention.singular'} />
              )}
            </Text>
          </div>
          <DeployOverviewPopover overview={deployStat} status={['InterventionWaiting']} />
        </Popover>
      )
    case 'pendingApprovalExecutions':
      return (
        <Popover interactionKind="hover" popoverClassName={css.popoverStyle} autoFocus={false}>
          <div className={css.badge} key={type}>
            <Icon name="status-pending" size={16} color={Color.ORANGE_700} />
            <Text className={css.badgeText}>
              {`${stat} `}
              {stat > 1 ? (
                <String stringID={'pipeline.dashboardDeploymentsWidget.pendingApproval.plural'} />
              ) : (
                <String stringID={'pipeline.dashboardDeploymentsWidget.pendingApproval.singular'} />
              )}
            </Text>
          </div>
          <DeployOverviewPopover overview={deployStat} status={['ApprovalWaiting']} />
        </Popover>
      )
    case 'failed24HrsExecutions':
      return (
        <Popover interactionKind="hover" popoverClassName={css.popoverStyle} autoFocus={false}>
          <div className={cx(css.badge, css.failed24HrsExecutionsBadge)} key={type}>
            <Icon name="warning-sign" size={12} color={Color.RED_600} />
            <Text className={css.badgeText}>
              {`${stat} `}
              {stat > 1 ? (
                <String stringID={'pipeline.dashboardDeploymentsWidget.failed24Hrs.plural'} />
              ) : (
                <String stringID={'pipeline.dashboardDeploymentsWidget.failed24Hrs.singular'} />
              )}
            </Text>
          </div>
          <DeployOverviewPopover overview={deployStat} status={Object.keys(FailedStatus)} />
        </Popover>
      )
    case 'runningExecutions':
      return (
        <Popover interactionKind="hover" popoverClassName={css.popoverStyle} autoFocus={false}>
          <div className={cx(css.badge, css.runningExecutions)} key={type}>
            <Icon name="status-running" size={16} color={Color.PRIMARY_7} />
            <Text className={css.badgeText}>
              {`${stat} `}
              {stat > 1 ? (
                <String stringID={'pipeline.dashboardDeploymentsWidget.runningPipeline.plural'} />
              ) : (
                <String stringID={'pipeline.dashboardDeploymentsWidget.runningPipeline.singular'} />
              )}
            </Text>
          </div>
          <DeployOverviewPopover overview={deployStat} status={['Running']} />
        </Popover>
      )
    default:
      return null
  }
}

const showBadgesCard = (deploymentsOverview: DeploymentsOverview): boolean => {
  const deploymentsOverviewKeys = Object.keys(deploymentsOverview)
  if (Object.keys(deploymentsOverviewKeys).length === 0) {
    return false
  }
  const nonZeroDeploymentsOverviewKeys = deploymentsOverviewKeys.filter(
    key => (deploymentsOverview as any)[key].length > 0
  )
  return nonZeroDeploymentsOverviewKeys.length > 0
}

export const NotificationsCard = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const [range, setRange] = useState([0, 0])
  const { selectedTimeRange } = useLandingDashboardContext()
  const [sortByValue, setSortByValue] = useState<GetDeploymentStatsOverviewQueryParams['sortBy']>('DEPLOYMENTS')
  const [groupByValue, setGroupByValues] = useState(TimeRangeGroupByMapping[selectedTimeRange])

  const { data, error, refetch, loading } = useGetDeploymentStatsOverview({
    queryParams: {
      accountIdentifier: accountId,
      startTime: range[0],
      endTime: range[1],
      groupBy: groupByValue,
      sortBy: sortByValue
    },
    lazy: true
  })

  const response = data?.data?.response

  useEffect(() => {
    setRange([Date.now() - TimeRangeToDays[selectedTimeRange] * 24 * 60 * 60000, Date.now()])
    setGroupByValues(TimeRangeGroupByMapping[selectedTimeRange])
  }, [selectedTimeRange])

  useEffect(() => {
    if (!range[0]) {
      return
    }
    refetch()
  }, [refetch, range, groupByValue, sortByValue])

  return (
    <Layout.Vertical className={css.container}>
      <Container className={css.header}>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.CARD_TITLE }}>
          {getString('common.notification')}
        </Text>
      </Container>
      {!loading ? (
        <Container className={css.badgesContainer}>
          {response?.deploymentsOverview &&
            showBadgesCard(response?.deploymentsOverview) &&
            response?.deploymentsOverview &&
            Object.keys(response?.deploymentsOverview).map(key =>
              // eslint-disable-next-line
              getBadge(key, (response?.deploymentsOverview as any)[key])
            )}
        </Container>
      ) : (
        <Container flex className={css.loadingContainer} height="100%">
          <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
        </Container>
      )}
    </Layout.Vertical>
  )
}

export default NotificationsCard
