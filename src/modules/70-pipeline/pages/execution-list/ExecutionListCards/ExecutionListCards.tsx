/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import { Pagination } from '@harness/uicore'
import type { PagePipelineExecutionSummary, PipelineExecutionSummary } from 'services/pipeline-ng'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import { NavigatedToPage } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useUpdateQueryParams } from '@common/hooks'
import css from './ExecutionListCards.module.scss'

export interface ExecutionListCardsProps {
  executionList: PagePipelineExecutionSummary | undefined
  isPipelineInvalid?: boolean
  onViewCompiledYaml: (pipelineExecutionSummary: PipelineExecutionSummary) => void
}

export function ExecutionListCards({
  executionList,
  isPipelineInvalid,
  onViewCompiledYaml
}: ExecutionListCardsProps): React.ReactElement {
  const { trackEvent } = useTelemetry()
  const location = useLocation()
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()
  const { updateQueryParams } = useUpdateQueryParams<{ page: number }>()

  function gotoPage(page: number): void {
    updateQueryParams({ page })
  }

  const isDeploymentsPage = !!matchPath(location.pathname, {
    path: routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module })
  })

  React.useEffect(() => {
    if (isDeploymentsPage) {
      trackEvent(NavigatedToPage.DeploymentsPage, {})
    }
  }, [])

  return (
    <div className={css.main}>
      {executionList?.content?.map(pipelineExecution => (
        <ExecutionCard
          pipelineExecution={pipelineExecution}
          key={pipelineExecution.planExecutionId}
          isPipelineInvalid={isPipelineInvalid}
          showGitDetails={isDeploymentsPage}
          onViewCompiledYaml={() => onViewCompiledYaml(pipelineExecution)}
        />
      ))}
      <div className={css.pagination}>
        <Pagination
          pageSize={executionList?.size || 0}
          pageIndex={executionList?.number}
          pageCount={executionList?.totalPages || 0}
          itemCount={executionList?.totalElements || 0}
          gotoPage={gotoPage}
        />
      </div>
    </div>
  )
}
