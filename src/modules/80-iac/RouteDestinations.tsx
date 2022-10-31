import React, { lazy } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { createTemplate } from '@pipeline/utils/templateUtils'
import { ApprovalStageExecution } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageExecution'
import { ApprovalStageOverview } from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageOverview'
import ApprovalAdvancedSpecifications from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageAdvanced'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import IacSideNav from './components/IacSideNav'
import '@iac/PipelineStages'
import { getStyles } from './Utils'

const RemoteIacApp = lazy(() => import('iac/MicroFrontendApp'))
// eslint-disable-next-line import/no-unresolved
export const TestStepForm = lazy(() => import('iac/TestStepForm'))
// eslint-disable-next-line import/no-unresolved
export const TestInputStep = lazy(() => import('iac/TestInputStep'))
export const IacStepUtils = import('iac/StepUtils')
const VariableView = lazy(() => import('iac/VariableView'))
const IacStageRemote = lazy(() => import('iac/IacStage'))

type IacCustomMicroFrontendProps = {
  children?: React.ReactNode
  customComponents: unknown
  customHooks: unknown // TODO - add type
  customFunctions: unknown
}

const IacSideNavProps: SidebarContext = {
  navComponent: IacSideNav,
  subtitle: 'Iac',
  title: 'Engineering',
  icon: 'chaos-main'
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
    return <Redirect to={routes.toModuleHome({ accountId, module: 'iac' })} />
  }
}

const IacApp = (): React.ReactElement => (
  <ChildAppMounter<IacCustomMicroFrontendProps>
    ChildApp={RemoteIacApp}
    customComponents={{ FormMultiTypeConnectorField }}
    customFunctions={{}}
    customHooks={{}}
  />
)

export const StepVariableView = (props: any): React.ReactElement => (
  <ChildAppMounter<IacCustomMicroFrontendProps>
    ChildApp={VariableView}
    customComponents={{ VariablesListTable }}
    customFunctions={{}}
    customHooks={{}}
    {...props}
  />
)

export const IacStage = (props: any): React.ReactElement => (
  <ChildAppMounter<IacCustomMicroFrontendProps>
    ChildApp={RemoteIacApp}
    customComponents={{
      ApprovalStageOverview,
      ApprovalStageExecution,
      ApprovalAdvancedSpecifications,
      SaveTemplateButton
    }}
    customFunctions={{
      createTemplate,
      getStyles,
      isDuplicateStageId,
      getNameAndIdentifierSchema
    }}
    customHooks={{
      usePipelineContext
    }}
    {...props}
  >
    <IacStageRemote {...props} />
  </ChildAppMounter>
)

export default (
  <>
    <RouteWithLayout sidebarProps={IacSideNavProps} path={routes.toIac({ ...accountPathProps })} exact>
      <RedirectToIacProject />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={IacSideNavProps}
      path={[routes.toIacMicroFrontend({ ...projectPathProps }), routes.toIac({ ...accountPathProps })]}
    >
      <IacApp />
    </RouteWithLayout>
  </>
)
