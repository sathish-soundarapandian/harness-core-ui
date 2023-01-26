/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { useLocation } from 'react-router-dom'
import type { getStyles } from '@iacm/utils'
import type { ApprovalStageOverview } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageOverview'
import type { ApprovalStageExecution } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageExecution'
import type ApprovalAdvancedSpecifications from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageAdvanced'
import type { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import type { createTemplate } from '@pipeline/utils/templateUtils'
import type { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import type { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { MultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type ExecutionGraph from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import type RbacButton from '@rbac/components/Button/Button'
import type RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import type { usePermission } from '@rbac/hooks/usePermission'

export interface IACMCustomMicroFrontendProps {
  customHooks: {
    usePipelineContext: typeof usePipelineContext
    useVariablesExpression: typeof useVariablesExpression
    useLocation: typeof useLocation
    usePermission: typeof usePermission
  }
  customFunctions: {
    createTemplate: typeof createTemplate
    isDuplicateStageId: typeof isDuplicateStageId
    getNameAndIdentifierSchema: typeof getNameAndIdentifierSchema
    getStyles: typeof getStyles
  }
  customComponents: {
    ApprovalStageOverview: typeof ApprovalStageOverview
    ApprovalStageExecution: typeof ApprovalStageExecution
    ApprovalAdvancedSpecifications: typeof ApprovalAdvancedSpecifications
    SaveTemplateButton: typeof SaveTemplateButton
    MultiTypeConnectorField: typeof MultiTypeConnectorField
    MultiTypeFieldSelector: typeof MultiTypeFieldSelector
    ExecutionGraph: typeof ExecutionGraph
    RbacOptionsMenuButton: typeof RbacOptionsMenuButton
    RbacButton: typeof RbacButton
  }
}
