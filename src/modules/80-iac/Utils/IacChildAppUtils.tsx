import React from 'react'
import { Redirect, useLocation, useParams } from 'react-router-dom'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { createTemplate } from '@pipeline/utils/templateUtils'
import { ApprovalStageExecution } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageExecution'
import { ApprovalStageOverview } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageOverview'
import ApprovalAdvancedSpecifications from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageAdvanced'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import IacSideNav from '@iac/components/IacSideNav'
import routes from '@common/RouteDefinitions'
import { getStyles } from './getStyles'

const customComponents = {
  FormMultiTypeConnectorField,
  ApprovalStageOverview,
  ApprovalStageExecution,
  ApprovalAdvancedSpecifications,
  SaveTemplateButton,
  VariablesListTable
}

const customFunctions = {
  createTemplate,
  getStyles,
  isDuplicateStageId,
  getNameAndIdentifierSchema
}

const customHooks = {
  usePipelineContext,
  useLocation
}

const IacSideNavProps: SidebarContext = {
  navComponent: IacSideNav,
  subtitle: 'IACM',
  title: 'Engineering',
  icon: 'iacm'
}

const RedirectToIacProject = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()
  if (selectedProject) {
    return (
      <Redirect
        to={routes.toProjectOverview({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier,
          module: 'iac'
        })}
      />
    )
  } else {
    return <Redirect to={routes.toIacMicroFrontend({ accountId })} />
  }
}

export { customComponents, customFunctions, customHooks, IacSideNavProps, RedirectToIacProject }
