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
import { ExecutionList } from '@pipeline/pages/execution-list/ExecutionList'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { useGetPipelineSummaryQuery } from 'services/pipeline-rq'
import { useModuleInfo } from '@common/hooks/useModuleInfo'

export default function IACMPipelineDeploymentList(): React.ReactElement {
  const { pipelineIdentifier, orgIdentifier, projectIdentifier, accountId } =
    useParams<PipelineType<PipelinePathProps>>()
  const { module } = useModuleInfo()
  const [branch, ,] = useQueryParamsState<GitQueryParams['branch']>('branch', '')
  const [repoIdentifier, ,] = useQueryParamsState<GitQueryParams['repoIdentifier']>('repoIdentifier', '')
  const [connectorRef, ,] = useQueryParamsState<GitQueryParams['connectorRef']>('connectorRef', '')
  const [repoName, ,] = useQueryParamsState<GitQueryParams['repoName']>('repoName', '')
  const [storeType, ,] = useQueryParamsState<GitQueryParams['storeType']>('storeType', undefined)

  const history = useHistory()
  /* istanbul ignore next */
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
        repoName,
        connectorRef,
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
        getDefaultFromOtherRepo: true
      }
    },
    { staleTime: 5 * 60 * 1000 }
  )

  /* istanbul ignore next */
  const isPipelineInvalid = pipeline?.data?.entityValidityDetails?.valid === false

  return <ExecutionList onRunPipeline={onRunPipeline} isPipelineInvalid={isPipelineInvalid} showBranchFilter />
}
