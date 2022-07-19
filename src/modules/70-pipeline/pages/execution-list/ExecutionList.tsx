/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, HarnessDocTooltip, PageSpinner } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { PipelinePathProps, PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { Page } from '@common/exports'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { StringsMap } from 'stringTypes'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { ExecutionCompareProvider } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import { ExecutionListTable } from './ExecutionListTable/ExecutionListTable'
import { ExecutionListSubHeader } from './ExecutionListSubHeader/ExecutionListSubHeader'
import {
  ExecutionListFilterContextProvider,
  useExecutionListFilterContext
} from './ExecutionListFilterContext/ExecutionListFilterContext'
import css from './ExecutionList.module.scss'
import { useMutateAsGet } from '@common/hooks'
import { PipelineExecutionSummary, useGetListOfExecutions } from 'services/pipeline-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { usePolling } from '@pipeline/hooks/usePolling'
import { useGetCommunity } from '@common/utils/utils'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import PipelineBuildExecutionsChart from '@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart'
import PipelineSummaryCards from '@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards'
import { OverviewExecutionListEmpty } from './ExecutionListEmpty/OverviewExecutionListEmpty'
import { ExecutionListEmpty } from './ExecutionListEmpty/ExecutionListEmpty'
import { ExecutionCompiledYaml } from '@pipeline/components/ExecutionCompiledYaml/ExecutionCompiledYaml'

export interface ExecutionListProps {
  onRunPipeline(): void
  showHealthAndExecution?: boolean
  isPipelineInvalid?: boolean
  isOverviewPage?: boolean
}

export function ExecutionList(props: ExecutionListProps): React.ReactElement {
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
    loading,
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

  const isCommunity = useGetCommunity()
  const isCommunityAndCDModule = module === 'cd' && isCommunity

  const isPolling = usePolling(fetchExecutions, page, loading)
  const executionList = data?.data?.content || []
  const hasExecutions = executionList.length > 0 || isAnyFilterApplied
  const isInitialLoading = loading && !isPolling

  if (isOverviewPage && !isInitialLoading) {
    return <OverviewExecutionListEmpty {...rest} />
  }

  return (
    <GitSyncStoreProvider>
      <ExecutionListFilterContextProvider>
        <ExecutionCompareProvider>
          <ExecutionListSubHeader {...rest} />
          <Page.Body error={(error?.data as Error)?.message || error?.message} retryOnError={fetchExecutions}>
            {showHealthAndExecution && !isCommunityAndCDModule && (
              <Container className={css.healthAndExecutions}>
                <PipelineSummaryCards />
                <PipelineBuildExecutionsChart />
              </Container>
            )}
            <ExecutionCompiledYaml onClose={() => setViewCompiledYaml(undefined)} executionSummary={viewCompiledYaml} />
            {isInitialLoading ? (
              <PageSpinner />
            ) : executions.length > 0 ? (
              <ExecutionListTable executionList={executionList} {...rest} />
            ) : (
              <ExecutionListEmpty {...rest} />
            )}
          </Page.Body>
        </ExecutionCompareProvider>
      </ExecutionListFilterContextProvider>
    </GitSyncStoreProvider>
  )
}
