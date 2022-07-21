/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { TemplateStudio } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { TemplateProvider } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type {
  GitQueryParams,
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

interface TemplateStudioWrapperProps {
  renderPipelineStage?: PipelineContextInterface['renderPipelineStage']
}

export const TemplateStudioWrapper: (props: TemplateStudioWrapperProps) => JSX.Element = ({ renderPipelineStage }) => {
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier, templateType } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { versionLabel, repoIdentifier, branch } = useQueryParams<TemplateStudioQueryParams & GitQueryParams>()
  return (
    <TemplateProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      templateIdentifier={templateIdentifier}
      versionLabel={versionLabel}
      templateType={templateType}
      renderPipelineStage={renderPipelineStage}
    >
      <GitSyncStoreProvider>
        <TemplateStudio />
      </GitSyncStoreProvider>
    </TemplateProvider>
  )
}
