/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getCIPipelineStages } from '@ci/components/PipelineStudio/CIPipelineStagesUtils'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { TemplateStudioWrapper } from '@templates-library/components/TemplateStudio/TemplateStudioWrapper'

export const CITemplateStudioWrapper: React.FC = (): JSX.Element => {
  const { getString } = useStrings()
  const { licenseInformation } = useLicenseStore()
  const { CING_ENABLED, CDNG_ENABLED, CFNG_ENABLED, SECURITY_STAGE } = useFeatureFlags()
  return (
    <TemplateStudioWrapper
      renderPipelineStage={args =>
        getCIPipelineStages({
          args,
          getString,
          isCIEnabled: licenseInformation['CI'] && CING_ENABLED,
          isCDEnabled: licenseInformation['CD'] && CDNG_ENABLED,
          isCFEnabled: licenseInformation['CF'] && CFNG_ENABLED,
          isSTOEnabled: SECURITY_STAGE,
          isApprovalStageEnabled: true
        })
      }
    />
  )
}
