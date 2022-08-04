/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useGetPipelines } from '@pipeline/hooks/useGetPipelines'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { useExecutionListFilterContext } from '../ExecutionListFilterContext/ExecutionListFilterContext'

export function useExecutionListEmptyAction(isPipelineInvalid: boolean, onRunPipeline: () => void) {
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier } =
    useParams<PipelineType<PipelinePathProps>>()
  const { module = 'cd' } = useModuleInfo()
  const { getString } = useStrings()
  const history = useHistory()
  const { queryParams } = useExecutionListFilterContext()

  const { data, loading } = useGetPipelines({
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    module,
    size: 1,
    lazy: false
  })
  const hasNoPipelines = data?.data?.totalElements === 0

  const onCreatePipeline = useCallback(() => {
    history.push(
      routes.toPipelineStudio({
        projectIdentifier,
        orgIdentifier,
        pipelineIdentifier: '-1',
        accountId,
        module
      })
    )
  }, [accountId, history, module, orgIdentifier, projectIdentifier])

  // eslint-disable-next-line react/function-component-definition
  const EmptyAction = () => (
    <RbacButton
      loading={loading}
      intent="primary"
      text={hasNoPipelines ? getString('common.createPipeline') : getString('pipeline.runAPipeline')}
      disabled={isPipelineInvalid}
      tooltip={isPipelineInvalid ? getString('pipeline.cannotRunInvalidPipeline') : ''}
      onClick={hasNoPipelines ? onCreatePipeline : onRunPipeline}
      permission={{
        permission: hasNoPipelines ? PermissionIdentifier.EDIT_PIPELINE : PermissionIdentifier.EXECUTE_PIPELINE,
        resource: {
          resourceType: ResourceType.PIPELINE,
          resourceIdentifier: pipelineIdentifier || queryParams.pipelineIdentifier
        },
        options: {
          skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
        }
      }}
    />
  )

  return {
    EmptyAction,
    hasNoPipelines,
    loading
  }
}
