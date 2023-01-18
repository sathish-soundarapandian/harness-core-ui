/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ErrorNodeSummary, ResponseValidateTemplateInputsResponseDto } from 'services/pipeline-rq'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { OutOfSyncErrorStrip } from '@pipeline/components/TemplateLibraryErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip'

export interface PipelineOutOfSyncErrorStripProps {
  updateRootEntity: (entityYaml: string) => Promise<void>
  onRefreshEntity(): void
  errorData?: ResponseValidateTemplateInputsResponseDto
}
export function PipelineOutOfSyncErrorStrip(props: PipelineOutOfSyncErrorStripProps): React.ReactElement {
  const { updateRootEntity, errorData, onRefreshEntity } = props
  const {
    state: { originalPipeline, gitDetails, storeMetadata },
    isReadonly
  } = usePipelineContext()

  const errorNodeSummary = React.useMemo((): ErrorNodeSummary | undefined => {
    if (errorData?.data?.validYaml === false && errorData?.data.errorNodeSummary) {
      return errorData?.data.errorNodeSummary
    }
  }, [errorData?.data])

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
