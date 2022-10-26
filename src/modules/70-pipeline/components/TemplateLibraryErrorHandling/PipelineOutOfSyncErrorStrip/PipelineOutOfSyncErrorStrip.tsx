/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { ErrorNodeSummary, useValidateTemplateInputs } from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { OutOfSyncErrorStrip } from '@pipeline/components/TemplateLibraryErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip'
import { useGetCommunity } from '@common/utils/utils'

export interface PipelineOutOfSyncErrorStripProps {
  updateRootEntity: (entityYaml: string) => Promise<void>
}

export function PipelineOutOfSyncErrorStrip({ updateRootEntity }: PipelineOutOfSyncErrorStripProps) {
  const {
    state: { pipeline, originalPipeline, gitDetails },
    isReadonly,
    fetchPipeline
  } = usePipelineContext()
  const isCommunity = useGetCommunity()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { data: errorData } = useValidateTemplateInputs({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      identifier: pipeline?.identifier,
      repoIdentifier: gitDetails.repoIdentifier,
      branch: gitDetails.branch,
      getDefaultFromOtherRepo: true
    },
    lazy: isCommunity
  })

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
    />
  ) : (
    <></>
  )
}
