/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type routes from '@common/RouteDefinitions'
import type { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { ApprovalStageOverview } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageOverview'
import type { ApprovalStageExecution } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageExecution'
import type ApprovalAdvancedSpecifications from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageAdvanced'
import type { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import type { createTemplate } from '@pipeline/utils/templateUtils'
import type { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import type { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { getStyles } from './Utils'

export interface IacCustomMicroFrontendProps {
  customHooks: {
    usePipelineContext: typeof usePipelineContext
  }
  customFunctions: {
    createTemplate: typeof createTemplate
    isDuplicateStageId: typeof isDuplicateStageId
    getNameAndIdentifierSchema: typeof getNameAndIdentifierSchema
    getStyles: typeof getStyles
  }
  customComponents: {
    FormMultiTypeConnectorField: typeof FormMultiTypeConnectorField
    VariablesListTable: typeof VariablesListTable
    ApprovalStageOverview: typeof ApprovalStageOverview
    ApprovalStageExecution: typeof ApprovalStageExecution
    ApprovalAdvancedSpecifications: typeof ApprovalAdvancedSpecifications
    SaveTemplateButton: typeof SaveTemplateButton
  }
  customRoutes: typeof routes
  customUtils: unknown
  customEnums: unknown
}
