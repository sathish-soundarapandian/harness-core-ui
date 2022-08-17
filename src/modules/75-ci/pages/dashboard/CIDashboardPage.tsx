/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Container, PageHeader, Dialog, PageSpinner } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { camelCase } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import type { IDialogProps } from '@blueprintjs/core'
import moment from 'moment'
import { useModalHook } from '@harness/use-modal'
import qs from 'qs'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import {
  ExecutionListFilterContextProvider,
  ProcessedExecutionListPageQueryParams,
  queryParamOptions
} from '@pipeline/pages/execution-list/ExecutionListFilterContext/ExecutionListFilterContext'
import type { Failure } from 'services/cd-ng'
import { BuildActiveInfo, BuildFailureInfo, CIWebhookInfoDTO, useGetBuilds, useGetRepositoryBuild } from 'services/ci'
import { useStrings } from 'framework/strings'
import { OverviewExecutionListEmpty } from '@pipeline/pages/execution-list/ExecutionListEmpty/OverviewExecutionListEmpty'
import {
  startOfDay,
  TimeRangeSelector,
  TimeRangeSelectorProps
} from '@common/components/TimeRangeSelector/TimeRangeSelector'
import CIDashboardSummaryCards from '@pipeline/components/Dashboards/CIDashboardSummaryCards/CIDashboardSummaryCards'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import BuildExecutionsChart from '@pipeline/components/Dashboards/BuildExecutionsChart/BuildExecutionsChart'
import RepositoryCard from '@pipeline/components/Dashboards/BuildCards/RepositoryCard'
import PipelineModalListView from '@pipeline/components/PipelineModalListView/PipelineModalListView'
import { ActiveStatus, FailedStatus, useErrorHandler, useRefetchCall } from '@pipeline/components/Dashboards/shared'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import { CardVariant } from '@pipeline/utils/constants'
import { ExecutionTriggerInfo, PipelineExecutionSummary, useGetListOfExecutions } from 'services/pipeline-ng'
import { TitleWithToolTipId } from '@common/components/Title/TitleWithToolTipId'
import bgImage from './images/CI-OverviewImageBG.png'
import styles from './CIDashboardPage.module.scss'

const NoDataOverviewPage: React.FC<{ onHide: () => void }> = ({ onHide }): JSX.Element => {
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

function buildInfoToExecutionSummary(buildInfo: BuildActiveInfo | BuildFailureInfo): PipelineExecutionSummary {
  const ciExecutionInfoDTO: CIWebhookInfoDTO = {
    author: buildInfo.author,
    branch: { name: buildInfo.branch, commits: [{ message: buildInfo.commit, id: buildInfo.commitID }] }
  }

  return {
    startTs: buildInfo.startTs,
    endTs: typeof buildInfo.endTs === 'number' && buildInfo.endTs > 0 ? buildInfo.endTs : undefined,
    name: buildInfo.piplineName,
    status: (buildInfo.status
      ? buildInfo.status.charAt(0).toUpperCase() + camelCase(buildInfo.status).slice(1)
      : '') as any,
    planExecutionId: (buildInfo as any).planExecutionId, // TODO: fix once BE changes are merged
    pipelineIdentifier: buildInfo.pipelineIdentifier,
    moduleInfo: {
      ci: {
        ciExecutionInfoDTO,
        branch: buildInfo.branch as any
      }
    },
    executionTriggerInfo: {
      triggerType: buildInfo.triggerType as ExecutionTriggerInfo['triggerType']
    }
  }
}

export const CIDashboardPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  const queryParams = useQueryParams<ProcessedExecutionListPageQueryParams>(queryParamOptions)

  const [timeRange, setTimeRange] = useState<TimeRangeSelectorProps>({
    range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
    label: getString('common.duration.month')
  })

  const { data, loading, error, refetch } = useGetBuilds({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

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
    data: repositoriesData,
    loading: loadingRepositories,
    error: repoError,
    refetch: refetchRepos
  } = useGetRepositoryBuild({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1]?.getTime() || 0
    }
  })

  const refetchingBuilds = useRefetchCall(refetch, loading)
  const refetchingRepos = useRefetchCall(refetchRepos, loadingRepositories)

  const pipelineExecutionSummary = pipelineExecution?.data || {}
  const [showOverviewDialog, setShowOverviewDialog] = useState(!pipelineExecutionSummary?.content?.length)

  useEffect(() => {
    setShowOverviewDialog(!pipelineExecutionSummary?.content?.length)
  }, [pipelineExecutionSummary])

  useErrorHandler(error as GetDataError<Failure | Error> | null, undefined, 'ci.get.build.error')
  useErrorHandler(repoError as GetDataError<Failure | Error> | null, undefined, 'ci.get.repo.error')

  if (loadingRepositories || pipelineLoading) {
    return (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <PageSpinner />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={<TitleWithToolTipId title={getString('overview')} toolTipId={'ciOverViewTitle'} />}
        breadcrumbs={<NGBreadcrumbs links={[]} />}
        toolbar={
          <>
            <TimeRangeSelector timeRange={timeRange?.range} setTimeRange={setTimeRange} minimal />
          </>
        }
      />
      <Page.Body
        className={styles.content}
        loading={loading && !refetchingBuilds && loadingRepositories && !refetchingRepos}
      >
        {showOverviewDialog ? (
          <NoDataOverviewPage onHide={() => setShowOverviewDialog(false)} />
        ) : (
          <Container className={styles.page} padding="large">
            <CIDashboardSummaryCards timeRange={timeRange} />
            <Container className={styles.executionsWrapper}>
              <BuildExecutionsChart isCIPage={true} timeRange={timeRange} />
            </Container>
            <CardRailView contentType="REPOSITORY" isCIPage={true} isLoading={loadingRepositories && !refetchingRepos}>
              {repositoriesData?.data?.repositoryInfo?.map((repo, index) => (
                <RepositoryCard
                  key={index}
                  title={repo.name!}
                  message={repo?.lastRepository?.commit}
                  lastBuildStatus={repo?.lastRepository?.status}
                  startTime={repo?.lastRepository?.startTime}
                  endTime={repo?.lastRepository?.endTime}
                  username={(repo?.lastRepository as any)?.author?.name}
                  avatarUrl={(repo?.lastRepository as any)?.author?.url}
                  count={repo.buildCount!}
                  successRate={repo.percentSuccess!}
                  successRateDiff={repo.successRate!}
                  countList={repo.countList}
                />
              ))}
            </CardRailView>
            <CardRailView
              contentType="FAILED_BUILD"
              isLoading={loading && !refetchingBuilds}
              onShowAll={() =>
                history.push({
                  pathname: routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'ci' }),
                  search: qs.stringify({ filters: { status: Object.keys(FailedStatus) } })
                })
              }
            >
              {data?.data?.failed?.map((build, index) => (
                <ExecutionCard
                  key={index}
                  variant={CardVariant.Minimal}
                  pipelineExecution={buildInfoToExecutionSummary(build)}
                  staticCard={true}
                  // staticCard={!build?.planExecutionId} // Enable when Backend supports re-routing
                />
              ))}
            </CardRailView>
            <CardRailView
              contentType="ACTIVE_BUILD"
              isLoading={loading && !refetchingBuilds}
              onShowAll={() =>
                history.push({
                  pathname: routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'ci' }),
                  search: qs.stringify({ filters: { status: Object.keys(ActiveStatus) } })
                })
              }
            >
              {data?.data?.active?.map((build, index) => (
                <ExecutionCard
                  key={index}
                  variant={CardVariant.Minimal}
                  pipelineExecution={buildInfoToExecutionSummary(build)}
                  staticCard={true}
                  // staticCard={!build?.planExecutionId} // Enable when Backend supports re-routing
                />
              ))}
            </CardRailView>
          </Container>
        )}
      </Page.Body>
    </>
  )
}

export default CIDashboardPage
