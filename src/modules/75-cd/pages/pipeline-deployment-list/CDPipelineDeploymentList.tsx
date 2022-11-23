/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetPipelineSummaryQuery } from 'services/pipeline-rq'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useQueryParams } from '@common/hooks'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ExecutionList } from '@pipeline/pages/execution-list/ExecutionList'

export default function CDPipelineDeploymentList(): React.ReactElement {
  const { pipelineIdentifier, orgIdentifier, projectIdentifier, accountId } =
    useParams<PipelineType<PipelinePathProps>>()

  const { branch, repoIdentifier, storeType, repoName, connectorRef } = useQueryParams<GitQueryParams>()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { getString } = useStrings()
  useDocumentTitle([getString('pipelines'), getString('executionsText')])

  const onRunPipeline = (): void => {
    openRunPipelineModal()
  }
  const { openRunPipelineModal } = useRunPipelineModal({
    pipelineIdentifier,
    repoIdentifier: isGitSyncEnabled ? repoIdentifier : repoName,
    branch,
    connectorRef,
    storeType
  })

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

  useDocumentTitle([pipeline?.data?.name || getString('pipelines'), getString('executionsText')])

  return (
    <>
      <HelpPanel referenceId="ExecutionHistory" type={HelpPanelType.FLOATING_CONTAINER} />
      <ExecutionList
        showHealthAndExecution
        repoName={repoName}
        showBranchFilter
        onRunPipeline={onRunPipeline}
        isPipelineInvalid={isPipelineInvalid}
      />
    </>
  )
}
