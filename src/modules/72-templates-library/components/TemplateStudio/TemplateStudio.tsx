/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { TemplateStudioInternal } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { TemplateProvider } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type {
  GitQueryParams,
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'
import { getPipelineStages } from '@pipeline/components/PipelineStudio/PipelineStagesUtils'

export function TemplateStudio(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier, templateType, module } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { versionLabel, repoIdentifier, branch } = useQueryParams<TemplateStudioQueryParams & GitQueryParams>()
  const { licenseInformation } = useLicenseStore()
  const { CING_ENABLED, CDNG_ENABLED, CFNG_ENABLED, SECURITY_STAGE } = useFeatureFlags()
  const { getString } = useStrings()

  const renderPipelineStage = (args: Omit<PipelineStagesProps, 'children'>) =>
    getPipelineStages({
      args,
      getString,
      module,
      isCIEnabled: licenseInformation['CI'] && CING_ENABLED,
      isCDEnabled: licenseInformation['CD'] && CDNG_ENABLED,
      isCFEnabled: licenseInformation['CF'] && CFNG_ENABLED,
      isSTOEnabled: SECURITY_STAGE,
      isApprovalStageEnabled: true
    })

  return (
    <TemplateProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      templateIdentifier={templateIdentifier}
      versionLabel={versionLabel}
      templateType={templateType}
      renderPipelineStage={renderPipelineStage}
    >
      <GitSyncStoreProvider>
        <TemplateStudioInternal />
      </GitSyncStoreProvider>
    </TemplateProvider>
  )
}
