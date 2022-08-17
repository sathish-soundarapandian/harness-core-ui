/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { parse } from '@common/utils/YamlHelperMethods'
import type { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/ReconcileDialog/ReconcileDialog'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import type { ErrorNodeSummary, NGTemplateInfoConfig } from 'services/template-ng'

export const getTitleFromErrorNodeSummary = (
  errorNodeSummary: ErrorNodeSummary,
  entity: TemplateErrorEntity,
  originalEntityYaml?: string
) => {
  const { nodeInfo, templateResponse } = errorNodeSummary
  if (templateResponse) {
    return `${templateResponse.templateEntityType}: ${templateResponse?.name}: ${templateResponse.identifier} (${templateResponse?.versionLabel})`
  } else if (nodeInfo) {
    return `${entity}: ${nodeInfo?.name}`
  } else if (originalEntityYaml) {
    const originalEntity = parse(originalEntityYaml) as {
      pipeline?: PipelineInfoConfig
      template?: NGTemplateInfoConfig
    }
    return `${entity}: ${
      (originalEntity?.pipeline as PipelineInfoConfig)?.name || (originalEntity?.template as NGTemplateInfoConfig)?.name
    }`
  }
}
