/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
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
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { StageType } from '@pipeline/utils/stageHelpers'
import { PipelineStages, PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'

interface TemplateStudioWrapperProps {
  renderPipelineStage?: PipelineContextInterface['renderPipelineStage']
}

export const TemplateStudioWrapper: (props: TemplateStudioWrapperProps) => JSX.Element = ({ renderPipelineStage }) => {
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier, templateType } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { versionLabel, repoIdentifier, branch } = useQueryParams<TemplateStudioQueryParams & GitQueryParams>()
  const { licenseInformation } = useLicenseStore()
  const { CING_ENABLED, CDNG_ENABLED, CFNG_ENABLED, SECURITY_STAGE } = useFeatureFlags()
  const { getString } = useStrings()

  const defaultRenderPipelineStage = (args: Omit<PipelineStagesProps, 'children'>) => {
    return (
      <PipelineStages {...args}>
        {stagesCollection.getStage(StageType.DEPLOY, !!CDNG_ENABLED && !!licenseInformation['CD'], getString)}
        {stagesCollection.getStage(StageType.BUILD, !!CING_ENABLED && !!licenseInformation['CI'], getString)}
        {stagesCollection.getStage(StageType.APPROVAL, true, getString)}
        {stagesCollection.getStage(StageType.FEATURE, !!CFNG_ENABLED && !!licenseInformation['CF'], getString)}
        {stagesCollection.getStage(StageType.SECURITY, !!SECURITY_STAGE, getString)}
        {/*{stagesCollection.getStage(StageType.PIPELINE, false, getString)}*/}
        {stagesCollection.getStage(StageType.CUSTOM, true, getString)}
        {stagesCollection.getStage(StageType.Template, false, getString)}
      </PipelineStages>
    )
  }

  return (
    <TemplateProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      templateIdentifier={templateIdentifier}
      versionLabel={versionLabel}
      templateType={templateType}
      renderPipelineStage={defaultTo(renderPipelineStage, defaultRenderPipelineStage)}
    >
      <GitSyncStoreProvider>
        <TemplateStudio />
      </GitSyncStoreProvider>
    </TemplateProvider>
  )
}
