/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, PageHeader } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import moment from 'moment'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import { useGetWorkloads, useGetDeployments, CDPipelineModuleInfo, ExecutionStatusInfo } from 'services/cd-ng'
import type { CIBuildCommit, CIWebhookInfoDTO } from 'services/ci'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import {
  ActiveStatus,
  FailedStatus,
  mapToExecutionStatus,
  useErrorHandler,
  useRefetchCall
} from '@pipeline/components/Dashboards/shared'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import { CardVariant } from '@pipeline/utils/constants'
import {
  startOfDay,
  TimeRangeSelector,
  TimeRangeSelectorProps
} from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { DeploymentsTimeRangeContext } from '@cd/components/Services/common'
import { useLocalStorage } from '@common/hooks'
import { validTimeFormat } from '@common/factories/LandingDashboardContext'

import { TitleWithToolTipId } from '@common/components/Title/TitleWithToolTipId'
import DeploymentsHealthCards from './DeploymentsHealthCards'
import DeploymentExecutionsChart from './DeploymentExecutionsChart'
import WorkloadCard from './DeploymentCards/WorkloadCard'
import styles from './CDDashboardPage.module.scss'

/** TODO: fix types after BE merge */
export function executionStatusInfoToExecutionSummary(info: ExecutionStatusInfo): PipelineExecutionSummary {
  const cd: CDPipelineModuleInfo = {
    serviceIdentifiers: info.serviceInfoList?.map(({ serviceName }) => defaultTo(serviceName, '')).filter(svc => !!svc)
  }

  const branch = get(info, 'gitInfo.targetBranch')
  const commits: CIBuildCommit[] = [{ message: get(info, 'gitInfo.commit'), id: get(info, 'gitInfo.commitID') }]

  const ciExecutionInfoDTO: CIWebhookInfoDTO = {
    author: info.author,
    event: get(info, 'gitInfo.eventType'),
    branch: {
      name: get(info, 'gitInfo.sourceBranch'),
      commits
    },
    pullRequest: {
      sourceBranch: get(info, 'gitInfo.sourceBranch'),
      targetBranch: branch,
      commits
    }
  }

  return {
    startTs: info.startTs,
    endTs: typeof info.endTs === 'number' && info.endTs > 0 ? info.endTs : undefined,
    name: info.pipelineName,
    status: mapToExecutionStatus(info.status),
    planExecutionId: info.planExecutionId,
    pipelineIdentifier: info.pipelineIdentifier,
    moduleInfo: {
      cd: cd as any,
      ci: (branch ? { ciExecutionInfoDTO, branch } : undefined) as any
    },
    executionTriggerInfo: {
      triggeredBy: {
        identifier: info.author?.name
      },
      triggerType: info.triggerType as Required<PipelineExecutionSummary>['executionTriggerInfo']['triggerType']
    }
  }
}

export const CDDashboardPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const [timeRange, setTimeRange] = useLocalStorage<TimeRangeSelectorProps>(
    'timeRangeCDDashboard',
    {
      range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
      label: getString('common.duration.month')
    },
    window.sessionStorage
  )
  const resultTimeRange = validTimeFormat(timeRange)
  timeRange.range[0] = resultTimeRange.range[0]
  timeRange.range[1] = resultTimeRange.range[1]

  const history = useHistory()

  useDocumentTitle([getString('deploymentsText'), getString('overview')])

  const { data, loading, error, refetch } = useGetDeployments({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const {
    data: workloadsData,
    loading: loadingWorkloads,
    error: workloadsError
  } = useGetWorkloads({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1]?.getTime() || 0
    }
  })

  useErrorHandler(error)
  useErrorHandler(workloadsError)

  const refetchingDeployments = useRefetchCall(refetch, loading)
  const activeDeployments = [...(data?.data?.active ?? []), ...(data?.data?.pending ?? [])]
  return (
    <>
      <PageHeader
        title={<TitleWithToolTipId title={getString('overview')} toolTipId={'cdOverViewTitle'} />}
        breadcrumbs={<NGBreadcrumbs links={[]} />}
        toolbar={
          <>
            <TimeRangeSelector timeRange={timeRange?.range} setTimeRange={setTimeRange} minimal />
          </>
        }
      ></PageHeader>
      <Page.Body className={styles.content} loading={(loading && !refetchingDeployments) || loadingWorkloads}>
        <DeploymentsTimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
          <Container className={styles.page} padding="large">
            <DeploymentsHealthCards range={timeRange} setRange={setTimeRange} title="Deployments Health" />
            <Container className={styles.executionsWrapper}>
              <DeploymentExecutionsChart range={timeRange} setRange={setTimeRange} title="Deployments" />
            </Container>
            <CardRailView contentType="WORKLOAD" isLoading={loadingWorkloads}>
              {workloadsData?.data?.workloadDeploymentInfoList?.map((workload, i) => (
                <WorkloadCard
                  key={i}
                  serviceName={workload.serviceName!}
                  lastExecuted={workload?.lastExecuted}
                  totalDeployments={workload.totalDeployments!}
                  percentSuccess={workload.percentSuccess!}
                  rateSuccess={workload.rateSuccess!}
                  workload={workload.workload}
                  serviceId={workload.serviceId}
                />
              ))}
            </CardRailView>
            <CardRailView
              contentType="FAILED_DEPLOYMENT"
              isLoading={loading && !refetchingDeployments}
              onShowAll={() =>
                history.push(
                  routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }) +
                    `?filters=${JSON.stringify({ status: Object.keys(FailedStatus) })}`
                )
              }
            >
              {data?.data?.failure?.map((d, i) => (
                <ExecutionCard
                  variant={CardVariant.Minimal}
                  key={i}
                  pipelineExecution={executionStatusInfoToExecutionSummary(d)}
                />
              ))}
            </CardRailView>
            <CardRailView
              contentType="ACTIVE_DEPLOYMENT"
              isLoading={loading && !refetchingDeployments}
              onShowAll={() =>
                history.push(
                  routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }) +
                    `?filters=${JSON.stringify({ status: Object.keys(ActiveStatus) })}`
                )
              }
            >
              {activeDeployments.map((d, i) => (
                <ExecutionCard
                  variant={CardVariant.Minimal}
                  key={i}
                  pipelineExecution={executionStatusInfoToExecutionSummary(d)}
                />
              ))}
            </CardRailView>
          </Container>
        </DeploymentsTimeRangeContext.Provider>
      </Page.Body>
    </>
  )
}

export default CDDashboardPage
