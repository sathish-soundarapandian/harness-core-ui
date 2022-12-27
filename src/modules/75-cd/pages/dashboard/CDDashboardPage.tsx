/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Dialog, PageHeader, PageSpinner } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import moment from 'moment'
import { useModalHook } from '@harness/use-modal'
import type { IDialogProps } from '@blueprintjs/core'
import qs from 'qs'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import { useGetWorkloads, useGetDeployments, ExecutionStatusInfo, ServiceDeploymentInfo } from 'services/cd-ng'
import type { CIBuildCommit, CIWebhookInfoDTO } from 'services/ci'
import { PipelineExecutionSummary, useGetListOfExecutions } from 'services/pipeline-ng'
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
import {
  startOfDay,
  TimeRangeSelector,
  TimeRangeSelectorProps
} from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { DeploymentsTimeRangeContext } from '@cd/components/Services/common'
import { useLocalStorage, useMutateAsGet, useQueryParams } from '@common/hooks'
import PipelineModalListView from '@pipeline/components/PipelineModalListView/PipelineModalListView'
import { TitleWithToolTipId } from '@common/components/Title/TitleWithToolTipId'
import { DashboardSelected } from '@pipeline/components/ServiceExecutionsCard/ServiceExecutionsCard'
import {
  ExecutionListFilterContextProvider,
  ProcessedExecutionListPageQueryParams,
  queryParamOptions
} from '@pipeline/pages/execution-list/ExecutionListFilterContext/ExecutionListFilterContext'
import { OverviewExecutionListEmpty } from '@pipeline/pages/execution-list/ExecutionListEmpty/OverviewExecutionListEmpty'
import DeploymentsHealthCards from './DeploymentsHealthCards'
import DeploymentExecutionsChart from './DeploymentExecutionsChart'
import WorkloadCard from './DeploymentCards/WorkloadCard'
import bgImage from './images/CD-OverviewImageBG-compressed.png'
import { getFormattedTimeRange, convertStringToDateTimeRange } from './dashboardUtils'
import styles from './CDDashboardPage.module.scss'

export interface CDModuleInfoProps {
  serviceIdentifier: ServiceDeploymentInfo[]
  envIdentifiers: string[]
}

const NoDataOverviewPage: React.FC<{ onHide: () => void }> = ({ onHide }) => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  const runPipelineDialogProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: { minWidth: 800, minHeight: 280, backgroundColor: 'var(--grey-50)', padding: 0 }
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog {...runPipelineDialogProps}>
        <PipelineModalListView onClose={hideModal} />
      </Dialog>
    ),
    [projectIdentifier, orgIdentifier, accountId]
  )
  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        height: '100%',
        width: 'auto',
        opacity: 0.5,
        backdropFilter: 'blur(1px)',
        margin: 16
      }}
    >
      <ExecutionListFilterContextProvider>
        <OverviewExecutionListEmpty onRunPipeline={openModal} onHide={onHide} />
      </ExecutionListFilterContextProvider>
    </div>
  )
}

/** TODO: fix types after BE merge */
export function executionStatusInfoToExecutionSummary(
  info: ExecutionStatusInfo,
  caller: string
): PipelineExecutionSummary {
  const cd = {
    serviceIdentifiers: info.serviceInfoList,
    envIdentifiers: info.environmentInfoList
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
    modules: [caller],
    executionTriggerInfo: {
      triggeredBy: {
        identifier: info.author?.name
      },
      triggerType: info.triggerType as Required<PipelineExecutionSummary>['executionTriggerInfo']['triggerType']
    }
  }
}

export const CDDashboardPage: React.FC = () => {
  const { getString } = useStrings()
  const queryParams = useQueryParams<ProcessedExecutionListPageQueryParams>(queryParamOptions)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  const [timeRange, setTimeRange] = useLocalStorage<TimeRangeSelectorProps>(
    'timeRangeCDDashboard',
    {
      range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
      label: getString('common.duration.month')
    },
    window.sessionStorage
  )
  const resultTimeRange = convertStringToDateTimeRange(timeRange)

  const history = useHistory()

  useDocumentTitle([getString('deploymentsText'), getString('overview')])

  const [startTime, endTime] = getFormattedTimeRange(resultTimeRange)

  const { data, loading, error, refetch } = useGetDeployments({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      startTime,
      endTime
    }
  })

  // this for detecting whether the project have any pipelines or if pipelines then any execution or not
  const { data: pipelineExecution, loading: pipelineLoading } = useMutateAsGet(useGetListOfExecutions, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    body: {
      ...queryParams.filters,
      filterType: 'PipelineExecution'
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
      startTime,
      endTime
    }
  })

  useErrorHandler(error)
  useErrorHandler(workloadsError)

  const refetchingDeployments = useRefetchCall(refetch, loading)
  const activeDeployments = [...(data?.data?.active ?? []), ...(data?.data?.pending ?? [])]

  const pipelineExecutionSummary = pipelineExecution?.data || {}

  const [showOverviewDialog, setShowOverviewDialog] = useState(!pipelineExecutionSummary?.content?.length)

  useEffect(() => {
    setShowOverviewDialog(!pipelineExecutionSummary?.content?.length)
  }, [pipelineExecutionSummary])

  if (loadingWorkloads || pipelineLoading) {
    return (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <PageSpinner />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={<TitleWithToolTipId title={getString('overview')} toolTipId={'cdOverViewTitle'} />}
        breadcrumbs={<NGBreadcrumbs links={[]} />}
        toolbar={
          <>
            <TimeRangeSelector timeRange={resultTimeRange?.range} setTimeRange={setTimeRange} minimal />
          </>
        }
      ></PageHeader>
      <Page.Body className={styles.content} loading={(loading && !refetchingDeployments) || loadingWorkloads}>
        {showOverviewDialog ? (
          <NoDataOverviewPage onHide={() => setShowOverviewDialog(false)} />
        ) : (
          <DeploymentsTimeRangeContext.Provider value={{ timeRange: resultTimeRange, setTimeRange }}>
            <Container className={styles.page} padding="large">
              <DeploymentsHealthCards range={resultTimeRange} setRange={setTimeRange} title="Deployments Health" />
              <Container className={styles.executionsWrapper}>
                <DeploymentExecutionsChart
                  range={resultTimeRange}
                  setRange={setTimeRange}
                  title={getString('executionsText')}
                />
              </Container>
              <CardRailView contentType="WORKLOAD" isLoading={loadingWorkloads}>
                {workloadsData?.data?.workloadDeploymentInfoList?.map(workload => (
                  <WorkloadCard
                    key={workload.serviceId}
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
                  history.push({
                    pathname: routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }),
                    search: qs.stringify({ filters: { status: Object.keys(FailedStatus) } })
                  })
                }
              >
                {data?.data?.failure?.map(d => (
                  <ExecutionCard
                    key={d.planExecutionId}
                    pipelineExecution={executionStatusInfoToExecutionSummary(d, DashboardSelected.OVERVIEW)}
                  />
                ))}
              </CardRailView>
              <CardRailView
                contentType="ACTIVE_DEPLOYMENT"
                isLoading={loading && !refetchingDeployments}
                onShowAll={() =>
                  history.push({
                    pathname: routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }),
                    search: qs.stringify({ filters: { status: Object.keys(ActiveStatus) } })
                  })
                }
              >
                {activeDeployments.map(d => (
                  <ExecutionCard
                    key={d.planExecutionId}
                    pipelineExecution={executionStatusInfoToExecutionSummary(d, DashboardSelected.OVERVIEW)}
                  />
                ))}
              </CardRailView>
            </Container>
          </DeploymentsTimeRangeContext.Provider>
        )}
      </Page.Body>
    </>
  )
}

export default CDDashboardPage
