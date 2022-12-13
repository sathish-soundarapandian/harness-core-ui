/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { ErrorNodeSummary, useValidateTemplateInputsQuery } from 'services/pipeline-rq'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { OutOfSyncErrorStrip } from '@pipeline/components/TemplateLibraryErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip'
import { useGetCommunity } from '@common/utils/utils'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'

export interface PipelineOutOfSyncErrorStripProps {
  updateRootEntity: (entityYaml: string) => Promise<void>
}

export function PipelineOutOfSyncErrorStrip({
  updateRootEntity
}: PipelineOutOfSyncErrorStripProps): React.ReactElement {
  const {
    state: { originalPipeline, gitDetails, storeMetadata, pipelineIdentifier },
    isReadonly,
    fetchPipeline
  } = usePipelineContext()
  const isCommunity = useGetCommunity()
  const params = useParams<ProjectPathProps>()
  const { accountId, orgIdentifier, projectIdentifier } = params

  const { data: errorData } = useValidateTemplateInputsQuery(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        identifier: pipelineIdentifier,
        ...getGitQueryParamsWithParentScope(storeMetadata, params)
      }
    },
    {
      enabled: (!!originalPipeline?.identifier || originalPipeline?.identifier !== '-1') && !isCommunity,
      staleTime: 5_000
    }
  )

  const errorNodeSummary = React.useMemo((): ErrorNodeSummary | undefined => {
    if (errorData?.data?.validYaml === false && errorData?.data.errorNodeSummary) {
      return errorData?.data.errorNodeSummary
    }
  }, [errorData?.data])

  const onRefreshEntity = React.useCallback(() => {
    fetchPipeline({ forceFetch: true, forceUpdate: true })
  }, [fetchPipeline])

  return errorNodeSummary ? (
    <OutOfSyncErrorStrip
      errorNodeSummary={errorNodeSummary}
      entity={TemplateErrorEntity.PIPELINE}
      originalYaml={yamlStringify({ pipeline: originalPipeline })}
      isReadOnly={isReadonly}
      onRefreshEntity={onRefreshEntity}
      updateRootEntity={updateRootEntity}
      gitDetails={gitDetails}
      storeMetadata={storeMetadata}
    />
  ) : (
    <></>
  )
}
