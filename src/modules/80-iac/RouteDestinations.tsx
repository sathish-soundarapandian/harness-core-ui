import React, { lazy } from 'react'
import { Redirect, useLocation, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
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
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { iacmStageConfiguration } from '@iac/PipelineStages'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import IacSideNav from './components/IacSideNav'
import { getStyles } from './Utils'
import type { IacCustomMicroFrontendProps } from './IacCustomMicroFrontendProps.types'
import { TestStep } from './PipelineSteps/TestStep/TestStep'

// eslint-disable-next-line import/no-unresolved
const RemoteIacApp = lazy(() => import('iac/MicroFrontendApp'))
// eslint-disable-next-line import/no-unresolved
export const TestStepForm = lazy(() => import('iac/TestStepForm'))
// eslint-disable-next-line import/no-unresolved
export const TestInputStep = lazy(() => import('iac/TestInputStep'))
// eslint-disable-next-line import/no-unresolved
export const IacStepUtils = import('iac/StepUtils')
// eslint-disable-next-line import/no-unresolved
const VariableView = lazy(() => import('iac/VariableView'))
// eslint-disable-next-line import/no-unresolved
const IacStageRemote = lazy(() => import('iac/IacStage'))

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
    return <Redirect to={routes.toIacMicroFrontend({ accountId })} />
  }
}

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

const IacApp = (props: any): React.ReactElement => (
  <ChildAppMounter<IacCustomMicroFrontendProps>
    ChildApp={RemoteIacApp}
    customComponents={customComponents}
    customFunctions={customFunctions}
    customHooks={customHooks}
    {...props}
  />
)

export const StepVariableView = (props: any): React.ReactElement => (
  <ChildAppMounter<IacCustomMicroFrontendProps>
    ChildApp={VariableView}
    customComponents={customComponents}
    customFunctions={customFunctions}
    customHooks={customHooks}
    {...props}
  />
)

export const IacStage = (props: any): React.ReactElement => (
  <ChildAppMounter<IacCustomMicroFrontendProps>
    ChildApp={RemoteIacApp}
    customComponents={customComponents}
    customFunctions={customFunctions}
    customHooks={customHooks}
    {...props}
  >
    <IacStageRemote {...props} />
  </ChildAppMounter>
)

function IacmRoutes(): JSX.Element {
  const iacmEnabled = useFeatureFlag(FeatureFlag.IACM_ENABLED)
  const { getStageAttributes, getStageEditorImplementation } = iacmStageConfiguration

  if (iacmEnabled) {
    stagesCollection.registerStageFactory(StageType.IAC, getStageAttributes, getStageEditorImplementation)
    factory.registerStep(new TestStep())
  }

  return (
    <>
      <RouteWithLayout sidebarProps={IacSideNavProps} path={routes.toIac({ ...accountPathProps })} exact>
        <RedirectToIacProject />
      </RouteWithLayout>
      <RouteWithLayout
        sidebarProps={IacSideNavProps}
        path={[
          routes.toIacMicroFrontend({ ...projectPathProps, ...accountPathProps, ...orgPathProps }),
          routes.toIac({ ...accountPathProps })
        ]}
      >
        <IacApp />
      </RouteWithLayout>
    </>
  )
}

export default IacmRoutes
