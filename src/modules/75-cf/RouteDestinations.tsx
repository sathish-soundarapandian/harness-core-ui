/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Redirect, Route, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  environmentPathProps,
  featureFlagPathProps,
  projectPathProps,
  segmentPathProps,
  targetPathProps
} from '@common/utils/routeUtils'
import type { AccountPathProps, ModulePathParams, ProjectPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { EmptyLayout, MinimalLayout } from '@common/layouts'
import CFHomePage from '@cf/pages/home/CFHomePage'
import FeatureFlagsDetailPage from '@cf/pages/feature-flags-detail/FeatureFlagsDetailPage'
import EnvironmentsPage from '@cf/pages/environments/EnvironmentsPage'
import EnvironmentDetails from '@cf/pages/environment-details/EnvironmentDetails'
import CFWorkflowsPage from '@cf/pages/workflows/CFWorkflowsPage'
import { PipelineRouteDestinations } from '@pipeline/RouteDestinations'
import { ConnectorRouteDestinations } from '@connectors/RouteDestinations'
import { GitSyncRouteDestinations } from '@gitsync/RouteDestinations'
import { VariableRouteDestinations } from '@variables/RouteDestinations'
import { SecretRouteDestinations } from '@secrets/RouteDestinations'
import { TemplateRouteDestinations } from '@templates-library/RouteDestinations'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { CFSideNavProps } from '@cf/constants'
import PipelineStudio from '@pipeline/components/PipelineStudio/PipelineStudio'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { TriggersRouteDestinations } from '@triggers/RouteDestinations'
import featureFactory from 'framework/featureStore/FeaturesFactory'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { getBannerText } from '@cf/utils/UsageLimitUtils'
import { String } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RedirectToModuleTrialHomeFactory, RedirectToSubscriptionsFactory } from '@common/Redirects'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { DefaultSettingsRouteDestinations } from '@default-settings/RouteDestinations'
import { TemplateStudio } from '@templates-library/components/TemplateStudio/TemplateStudio'
import type { AuditEventData, ResourceDTO } from 'services/audit'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import { PipelineDeploymentList } from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import { registerFeatureFlagPipelineStage } from './pages/pipeline-studio/views/FeatureFlagStage'
import { registerFlagConfigurationPipelineStep } from './components/PipelineSteps'
import { TargetsPage } from './pages/target-management/targets/TargetsPage'
import TargetDetailPage from './pages/target-detail/TargetDetailPage'
import { SegmentsPage } from './pages/target-management/segments/SegmentsPage'
import TargetGroupDetailPage from './pages/target-group-detail/TargetGroupDetailPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { OnboardingDetailPage } from './pages/onboarding/OnboardingDetailPage'
import CFTrialHomePage from './pages/home/trialPage/CFTrialHomePage'
import FeatureFlagsLandingPage from './pages/feature-flags/FeatureFlagsLandingPage'
import { FFGitSyncProvider } from './contexts/ff-git-sync-context/FFGitSyncContext'
import ConfigurePath from './pages/onboarding/ConfigurePath'
import FFUIApp from './pages/FFUIApp/FFUIApp'

featureFactory.registerFeaturesByModule('cf', {
  features: [FeatureIdentifier.MAUS],
  renderMessage: (props, getString, additionalLicenseProps = {}) => {
    const monthlyActiveUsers = props.features.get(FeatureIdentifier.MAUS)
    const count = monthlyActiveUsers?.featureDetail?.count
    const limit = monthlyActiveUsers?.featureDetail?.limit

    const { message, bannerType } = getBannerText(getString, additionalLicenseProps, count, limit)

    return {
      message: () => message,
      bannerType
    }
  }
})

const RedirectToCFHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCFHome(params)} />
}

const RedirectToCFProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CF)) {
    return <Redirect to={routes.toCFConfigurePath(params)} />
  } else {
    return <Redirect to={routes.toCFHome(params)} />
  }
}

const RedirectToTargets = (): React.ReactElement => {
  const { withActiveEnvironment } = useActiveEnvironment()
  const params = useParams<ProjectPathProps & AccountPathProps>()

  return <Redirect to={withActiveEnvironment(routes.toCFTargets(params))} />
}

const moduleParams: ModulePathParams = {
  module: ':module(cf)'
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.FF_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.CF),
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.CF)
}

AuditTrailFactory.registerResourceHandler('FEATURE_FLAG', {
  moduleIcon: {
    name: 'nav-cf'
  },
  moduleLabel: 'cf.auditTrail.label',
  resourceLabel: 'common.moduleTitles.cf',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

    return routes.toCFFeatureFlagsDetail({
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      featureFlagIdentifier: resource.identifier,
      accountId: accountIdentifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('TARGET_GROUP', {
  moduleIcon: {
    name: 'nav-cf'
  },
  moduleLabel: 'cf.auditTrail.label',
  resourceLabel: 'cf.auditTrail.tgResourceLabel',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    auditEventData?: AuditEventData
  ) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    return routes.toCFSegmentDetailsWithEnv({
      accountId: accountIdentifier,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      segmentIdentifier: resource.identifier,
      environmentIdentifier: (auditEventData as any)?.environment
    })
  }
})

RbacFactory.registerResourceCategory(ResourceCategory.FEATUREFLAG_FUNCTIONS, {
  icon: 'nav-cf',
  label: 'cf.rbac.category'
})

RbacFactory.registerResourceTypeHandler(ResourceType.FEATUREFLAG, {
  icon: 'nav-cf',
  label: 'cf.rbac.featureflag.label',
  labelSingular: 'common.moduleTitles.cf',
  category: ResourceCategory.FEATUREFLAG_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.TOGGLE_FF_FEATUREFLAG]: <String stringID="cf.rbac.featureflag.toggle" />,
    [PermissionIdentifier.EDIT_FF_FEATUREFLAG]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_FF_FEATUREFLAG]: <String stringID="cf.rbac.featureflag.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.TARGETGROUP, {
  icon: 'nav-cf',
  label: 'cf.rbac.targetgroup.label',
  category: ResourceCategory.FEATUREFLAG_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.EDIT_FF_TARGETGROUP]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_FF_TARGETGROUP]: <String stringID="cf.rbac.targetgroup.delete" />
  }
})

registerFeatureFlagPipelineStage()
registerFlagConfigurationPipelineStep()

const CFRoutes: FC = () => {
  const {
    FFM_3959_FF_MFE_Environment_Detail,
    FFM_5939_MFE_TARGET_GROUPS_LISTING,
    FFM_6666_FF_MFE_Target_Group_Detail,
    FFM_5256_FF_MFE_Environment_Listing,
    FFM_5951_FF_MFE_Targets_Listing,
    FFM_6665_FF_MFE_Target_Detail,
    FFM_6800_FF_MFE_Onboarding,
    FFM_7127_FF_MFE_Onboarding_Detail
  } = useFeatureFlags()

  return (
    <>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        path={routes.toCF({ ...accountPathProps })}
        exact
        pageName={PAGE_NAME.CFHomePage}
      >
        <RedirectToCFHome />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFProject({ ...accountPathProps, ...projectPathProps })}
        exact
      >
        <RedirectToCFProject />
      </RouteWithLayout>

      <RouteWithLayout
        layout={MinimalLayout}
        path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cf' })}
        exact
        pageName={PAGE_NAME.CFTrialHomePage}
      >
        <CFTrialHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFHome({ ...accountPathProps })}
        exact
        pageName={PAGE_NAME.CFHomePage}
      >
        <CFHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFFeatureFlags({ ...accountPathProps, ...projectPathProps })}
        exact
        pageName={PAGE_NAME.FeatureFlagsLandingPage}
      >
        <FFGitSyncProvider>
          <FeatureFlagsLandingPage />
        </FFGitSyncProvider>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFFeatureFlagsDetail({
          ...accountPathProps,
          ...projectPathProps,
          ...featureFlagPathProps
        })}
        exact
        pageName={PAGE_NAME.FeatureFlagsDetailPage}
      >
        <FFGitSyncProvider>
          <FeatureFlagsDetailPage />
        </FFGitSyncProvider>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFSegmentDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...segmentPathProps
        })}
        exact
        pageName={PAGE_NAME.TargetGroupDetailPage}
      >
        <FFGitSyncProvider>
          {FFM_6666_FF_MFE_Target_Group_Detail ? <FFUIApp /> : <TargetGroupDetailPage />}
        </FFGitSyncProvider>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFTargetDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...targetPathProps
        })}
        exact
        pageName={PAGE_NAME.TargetDetailPage}
      >
        <FFGitSyncProvider>{FFM_6665_FF_MFE_Target_Detail ? <FFUIApp /> : <TargetDetailPage />}</FFGitSyncProvider>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFTargetManagement({ ...accountPathProps, ...projectPathProps })}
        exact
      >
        <RedirectToTargets />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFSegments({ ...accountPathProps, ...projectPathProps })}
        exact
        pageName={PAGE_NAME.SegmentsPage}
      >
        <FFGitSyncProvider>{FFM_5939_MFE_TARGET_GROUPS_LISTING ? <FFUIApp /> : <SegmentsPage />}</FFGitSyncProvider>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFTargets({ ...accountPathProps, ...projectPathProps })}
        exact
        pageName={PAGE_NAME.TargetsPage}
      >
        {FFM_5951_FF_MFE_Targets_Listing ? <FFUIApp /> : <TargetsPage />}
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFEnvironments({ ...accountPathProps, ...projectPathProps })}
        exact
        pageName={PAGE_NAME.EnvironmentsPage}
      >
        <FFGitSyncProvider>
          {FFM_5256_FF_MFE_Environment_Listing ? <FFUIApp /> : <EnvironmentsPage />}
        </FFGitSyncProvider>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFEnvironmentDetails({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
        exact
        pageName={PAGE_NAME.EnvironmentDetails}
      >
        {FFM_3959_FF_MFE_Environment_Detail ? <FFUIApp /> : <EnvironmentDetails />}
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFOnboarding({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
        exact
        pageName={PAGE_NAME.OnboardingPage}
      >
        {FFM_6800_FF_MFE_Onboarding ? <FFUIApp /> : <OnboardingPage />}
      </RouteWithLayout>

      <RouteWithLayout
        layout={EmptyLayout}
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFOnboardingDetail({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
        exact
        pageName={PAGE_NAME.OnboardingDetailPage}
      >
        {FFM_7127_FF_MFE_Onboarding_Detail ? <FFUIApp /> : <OnboardingDetailPage />}
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFConfigurePath({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
        exact
        pageName={PAGE_NAME.CFConfigurePath}
      >
        {FFM_6800_FF_MFE_Onboarding ? <FFUIApp /> : <ConfigurePath />}
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CFSideNavProps}
        path={routes.toCFWorkflows({ ...accountPathProps, ...projectPathProps })}
        exact
        pageName={PAGE_NAME.CFWorkflowsPage}
      >
        <CFWorkflowsPage />
      </RouteWithLayout>

      <Route path="/account/:accountId/:module(cf)">
        <TemplateRouteDestinations
          templateStudioComponent={TemplateStudio}
          templateStudioPageName={PAGE_NAME.CFTemplateStudioWrapper}
          moduleParams={moduleParams}
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CFSideNavProps}
        />
        <ConnectorRouteDestinations
          moduleParams={moduleParams}
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CFSideNavProps}
        />
        {
          <DefaultSettingsRouteDestinations
            moduleParams={moduleParams}
            licenseRedirectData={licenseRedirectData}
            sidebarProps={CFSideNavProps}
          />
        }
        <SecretRouteDestinations
          moduleParams={moduleParams}
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CFSideNavProps}
        />
        <VariableRouteDestinations
          moduleParams={moduleParams}
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CFSideNavProps}
        />
        <GitSyncRouteDestinations
          moduleParams={moduleParams}
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CFSideNavProps}
        />
        <AccessControlRouteDestinations
          moduleParams={moduleParams}
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CFSideNavProps}
        />
        <PipelineRouteDestinations
          pipelineStudioComponent={PipelineStudio}
          pipelineDeploymentListComponent={PipelineDeploymentList}
          moduleParams={moduleParams}
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CFSideNavProps}
        />
        <TriggersRouteDestinations
          moduleParams={moduleParams}
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CFSideNavProps}
        />
        <GovernanceRouteDestinations
          sidebarProps={CFSideNavProps}
          pathProps={{ ...accountPathProps, ...projectPathProps, ...moduleParams }}
        />
      </Route>
    </>
  )
}

export default CFRoutes
