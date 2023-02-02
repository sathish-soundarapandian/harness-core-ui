/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { useGetPipelineSummaryQuery } from 'services/pipeline-rq'
import { ExecutionList } from '@pipeline/pages/execution-list/ExecutionList'

export default function SSCSPipelineDeploymentList(): React.ReactElement {
  const { pipelineIdentifier, orgIdentifier, projectIdentifier, accountId, module } =
    useParams<PipelineType<PipelinePathProps>>()

  const { branch, repoIdentifier, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()

  const history = useHistory()
  const onRunPipeline = (): void => {
    history.push(
      routes.toPipelineStudio({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module,
        branch,
        repoIdentifier,
        connectorRef,
        repoName,
        storeType,
        runPipeline: true
      })
    )
  }

  const { data: pipeline } = useGetPipelineSummaryQuery(
    {
      pipelineIdentifier,
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        repoIdentifier,
        branch,
        getMetadataOnly: true
      }
    },
    { staleTime: 5 * 60 * 1000 }
  )

  const isPipelineInvalid = pipeline?.data?.entityValidityDetails?.valid === false

  return (
    <ExecutionList
      showHealthAndExecution
      showBranchFilter
      onRunPipeline={onRunPipeline}
      isPipelineInvalid={isPipelineInvalid}
    />
  )
}
