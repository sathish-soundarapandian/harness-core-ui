/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout } from '@harness/uicore'
import { Icon } from '@harness/icons'
import { Color } from '@harness/design-system'
import { HTMLTable } from '@blueprintjs/core'
import qs from 'qs'
import { defaultTo, isEqual } from 'lodash-es'
import type { PipelineExecutionInfo } from 'services/dashboard-service'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ExecutionSummaryInfo } from 'services/pipeline-ng'
import css from './NotificationsCard.module.scss'

const makeKey = (item: PipelineExecutionInfo) => {
  const accountInfo = item.accountInfo?.accountIdentifier
  const orgInfo = item.orgInfo?.orgIdentifier
  const projectInfo = item.projectInfo?.projectIdentifier
  return `${accountInfo}-${orgInfo}-${projectInfo}`
}

export type ExecutionStatus = Exclude<
  Required<ExecutionSummaryInfo>['lastExecutionStatus'],
  'NOT_STARTED' | 'INTERVENTION_WAITING' | 'APPROVAL_WAITING' | 'APPROVAL_REJECTED' | 'WAITING'
>

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

export default function DeployOverviewPopover({
  overview,
  status
}: {
  overview: PipelineExecutionInfo[]
  status: string[]
}): JSX.Element | null {
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

  if (keyList.length === 0) {
    return null
  }

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
                data-testid={`projectCount - ${i}`}
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
