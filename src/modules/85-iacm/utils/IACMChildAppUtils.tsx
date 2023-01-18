/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useLocation, useParams } from 'react-router-dom'
import type { IACMCustomMicroFrontendProps } from '@iacm/interfaces/IACMCustomMicroFrontendProps.types'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { MultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { createTemplate } from '@pipeline/utils/templateUtils'
import { ApprovalStageExecution } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageExecution'
import { ApprovalStageOverview } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageOverview'
import ApprovalAdvancedSpecifications from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageAdvanced'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import IACMSideNav from '@iacm/components/IACMSideNav'
import routes from '@common/RouteDefinitions'
import { getStyles } from '@iacm/utils'
import IACMResourceStackWizard from '@iacm/components/IACMResourceStackWizard'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import ExecutionGraph from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'

const customComponents: IACMCustomMicroFrontendProps['customComponents'] = {
  ApprovalStageOverview,
  ApprovalStageExecution,
  ApprovalAdvancedSpecifications,
  SaveTemplateButton,
  IACMResourceStackWizard,
  MultiTypeConnectorField,
  MultiTypeFieldSelector,
  ExecutionGraph
}

const customFunctions: IACMCustomMicroFrontendProps['customFunctions'] = {
  createTemplate,
  getStyles,
  isDuplicateStageId,
  getNameAndIdentifierSchema
}

const customHooks: IACMCustomMicroFrontendProps['customHooks'] = {
  usePipelineContext,
  useLocation,
  useVariablesExpression
}

const IACMSideNavProps: SidebarContext = {
  navComponent: IACMSideNav,
  subtitle: 'IACM',
  title: 'Engineering',
  icon: 'iacm'
}

const RedirectToIACMProject = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()
  if (selectedProject) {
    return (
      <Redirect
        to={routes.toProjectOverview({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier,
          module: 'iacm'
        })}
      />
    )
  } else {
    return <Redirect to={routes.toIACMMicroFrontend({ accountId })} />
  }
}

export { customComponents, customFunctions, customHooks, IACMSideNavProps, RedirectToIACMProject }
