/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
/* istanbul ignore file */

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
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { usePermission } from '@rbac/hooks/usePermission'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { useGetConnector, useGetListOfBranchesByRefConnectorV2, useGetListOfReposByRefConnector } from 'services/cd-ng'
import { MultiTypeSecretInput } from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'

const customComponents: IACMCustomMicroFrontendProps['customComponents'] = {
  ApprovalStageOverview,
  ApprovalStageExecution,
  ApprovalAdvancedSpecifications,
  SaveTemplateButton,
  MultiTypeConnectorField,
  MultiTypeFieldSelector,
  ConnectorReferenceField,
  MultiTypeSecretInput
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
  useVariablesExpression,
  usePermission,
  useGetListOfReposByRefConnector,
  useGetListOfBranchesByRefConnectorV2,
  useGetConnector
}

const IACMSideNavProps: SidebarContext = {
  navComponent: IACMSideNav,
  title: 'Infrastructure as Code Management',
  icon: 'iacm'
}

const RedirectToIACMProject = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()
  if (selectedProject) {
    return (
      <Redirect
        to={routes.toIACMWorkspaces({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toIACMOverview({ accountId })} />
  }
}

export { customComponents, customFunctions, customHooks, IACMSideNavProps, RedirectToIACMProject }
