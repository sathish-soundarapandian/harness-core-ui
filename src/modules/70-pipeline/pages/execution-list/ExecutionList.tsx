/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, PageSpinner } from '@wings-software/uicore'
import React from 'react'
import { useParams } from 'react-router-dom'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { Page } from '@common/exports'
import { useMutateAsGet } from '@common/hooks'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useGetCommunity } from '@common/utils/utils'
import PipelineBuildExecutionsChart from '@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart'
import PipelineSummaryCards from '@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards'
import { ExecutionCompareProvider } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import { ExecutionCompiledYaml } from '@pipeline/components/ExecutionCompiledYaml/ExecutionCompiledYaml'
import { usePolling } from '@pipeline/hooks/usePolling'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PipelineExecutionSummary, useGetListOfExecutions } from 'services/pipeline-ng'
import useTabVisible from '@common/hooks/useTabVisible'
import { ExecutionListEmpty } from './ExecutionListEmpty/ExecutionListEmpty'
import { OverviewExecutionListEmpty } from './ExecutionListEmpty/OverviewExecutionListEmpty'
import {
  ExecutionListFilterContextProvider,
  useExecutionListFilterContext
} from './ExecutionListFilterContext/ExecutionListFilterContext'
import { ExecutionListSubHeader } from './ExecutionListSubHeader/ExecutionListSubHeader'
import { ExecutionListTable } from './ExecutionListTable/ExecutionListTable'
import css from './ExecutionList.module.scss'

export interface ExecutionListProps {
  onRunPipeline(): void
  showHealthAndExecution?: boolean
  isPipelineInvalid?: boolean
  isOverviewPage?: boolean
}

function ExecutionListInternal(props: ExecutionListProps): React.ReactElement {
  const { showHealthAndExecution, isOverviewPage, ...rest } = props
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId } =
    useParams<PipelineType<PipelinePathProps>>()
  const { isAnyFilterApplied, isSavedFilterApplied, queryParams } = useExecutionListFilterContext()
  const {
    page,
    filterIdentifier,
    myDeployments,
    status,
    repoIdentifier,
    branch,
    searchTerm,
    pipelineIdentifier: pipelineIdentifierFromQueryParam
  } = queryParams
  const { isGitSyncEnabled } = useAppStore()
  const { module = 'cd' } = useModuleInfo()
  const [viewCompiledYaml, setViewCompiledYaml] = React.useState<PipelineExecutionSummary | undefined>(undefined)

  const {
    data,
    initLoading,
    refetch: fetchExecutions,
    error
  } = useMutateAsGet(useGetListOfExecutions, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      module,
      size: 20,
      pipelineIdentifier: pipelineIdentifier || pipelineIdentifierFromQueryParam,
      page: page ? page - 1 : 0,
      filterIdentifier: isSavedFilterApplied ? filterIdentifier : undefined,
      myDeployments,
      status,
      branch,
      searchTerm,
      ...(isGitSyncEnabled ? { repoIdentifier } : {})
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    body: isSavedFilterApplied
      ? null
      : {
          ...queryParams.filters,
          filterType: 'PipelineExecution'
        }
  })
  const tabVisible = useTabVisible()
  usePolling(fetchExecutions, page === 1 && !initLoading && tabVisible)

  const isCommunity = useGetCommunity()
  const isCommunityAndCDModule = module === 'cd' && isCommunity
  const executionList = data?.data
  const hasExecutions = executionList?.totalElements && executionList?.totalElements > 0

  if (isOverviewPage && !initLoading && !hasExecutions) {
    return <OverviewExecutionListEmpty {...rest} />
  }

  return (
    <>
      {(hasExecutions || isAnyFilterApplied) && <ExecutionListSubHeader {...rest} />}

      <Page.Body error={(error?.data as Error)?.message || error?.message} retryOnError={fetchExecutions}>
        {showHealthAndExecution && !isCommunityAndCDModule && (
          <Container className={css.healthAndExecutions} data-testid="health-and-executions">
            <PipelineSummaryCards />
            <PipelineBuildExecutionsChart />
          </Container>
        )}

        <ExecutionCompiledYaml onClose={() => setViewCompiledYaml(undefined)} executionSummary={viewCompiledYaml} />
        {initLoading ? (
          <PageSpinner />
        ) : hasExecutions ? (
          <ExecutionListTable executionList={executionList} onViewCompiledYaml={setViewCompiledYaml} {...rest} />
        ) : (
          <ExecutionListEmpty {...rest} />
        )}
      </Page.Body>
    </>
  )
}

export function ExecutionList(props: ExecutionListProps): React.ReactElement {
  return (
    <>
      <GitSyncStoreProvider>
        <ExecutionListFilterContextProvider>
          <ExecutionCompareProvider>
            <ExecutionListInternal {...props} />
          </ExecutionCompareProvider>
        </ExecutionListFilterContextProvider>
      </GitSyncStoreProvider>
      <HelpPanel referenceId="ExecutionHistory" type={HelpPanelType.FLOATING_CONTAINER} />
    </>
  )
}
