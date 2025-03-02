/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import CVHomePage from '@cv/pages/home/CVHomePage'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps, templatePathProps } from '@common/utils/routeUtils'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'

import './components/PipelineSteps'
import './components/MonitoredServiceTemplate'
import './components/ExecutionVerification'
import CVMonitoredService from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService'
import MonitoredServicePage from '@cv/pages/monitored-service/MonitoredServicePage'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import SideNav from '@cv/components/SideNav/SideNav'
import { SecretRouteDestinations } from '@secrets/RouteDestinations'
import { ConnectorRouteDestinations } from '@connectors/RouteDestinations'
import { DelegateRouteDestinations } from '@delegates/RouteDestinations'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { VariableRouteDestinations } from '@variables/RouteDestinations'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import TemplatesPage from '@templates-library/pages/TemplatesPage/TemplatesPage'
import { TemplateStudio } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { CVChanges } from '@cv/pages/changes/CVChanges'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import type { ResourceDTO } from 'services/audit'
import type { ResourceScope } from 'services/cd-ng'
import AuditTrailFactory from 'framework/AuditTrail/AuditTrailFactory'
import featureFactory, { RenderMessageReturn } from 'framework/featureStore/FeaturesFactory'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { BannerType } from '@common/layouts/Constants'
import { ErrorTracking } from '@cet/ErrorTrackingApp'
import { String } from 'framework/strings'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { DefaultSettingsRouteDestinations } from '@default-settings/RouteDestinations'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import NotificationMethods from '@pipeline/components/Notifications/Steps/NotificationMethods'
import Overview from '@pipeline/components/Notifications/Steps/Overview'
import type { ETCustomMicroFrontendProps } from '@cet/ErrorTracking.types'
import { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParams, useDeepCompareEffect } from '@common/hooks'
import { formatDatetoLocale, getReadableDateTime, ALL_TIME_ZONES } from '@common/utils/dateUtils'
import { CDSideNavProps } from '@cd/RouteDestinations'
import { ProjectDetailsSideNavProps } from '@projects-orgs/RouteDestinations'
import ChildAppMounter from '../../microfrontends/ChildAppMounter'
import CVTrialHomePage from './pages/home/CVTrialHomePage'
import { editParams } from './utils/routeUtils'
import CVSLOsListingPage from './pages/slos/CVSLOsListingPage'
import CVSLODetailsPage from './pages/slos/CVSLODetailsPage/CVSLODetailsPage'
import { MonitoredServiceProvider } from './pages/monitored-service/MonitoredServiceContext'
import MonitoredServiceInputSetsTemplate from './pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate'
import { CVCodeErrors } from './pages/code-errors/CVCodeErrors'
import { CVCodeErrorsAgents } from './pages/code-errors-agent-control/code-errors-agents/CVCodeErrorsAgents'
import CVCodeErrorsSettings from './pages/code-errors-agent-control/CVCodeErrorsSettings'
import CVCreateSLOV2 from './pages/slos/components/CVCreateSLOV2/CVCreateSLOV2'
import { getIsValuePresent } from './utils/licenseBannerUtils'
import { ThresholdPercentageToShowBanner } from './constants'
import SLODowntimePage from './pages/slos/SLODowntimePage/SLODowntimePage'
import CVCreateDowntime from './pages/slos/components/CVCreateDowntime/CVCreateDowntime'
import {
  CD_MONITORED_SERVICE_CONFIG,
  PROJECT_MONITORED_SERVICE_CONFIG
} from './components/MonitoredServiceListWidget/MonitoredServiceListWidget.constants'
import CommonMonitoredServiceDetails from './components/MonitoredServiceListWidget/components/CommonMonitoredServiceDetails/CommonMonitoredServiceDetails'
import type { SRMCustomMicroFrontendProps } from './interface/SRMCustomMicroFrontendProps.types'
import MonitoredServiceListWidget from './components/MonitoredServiceListWidget/MonitoredServiceListWidget'

// PubSubPipelineActions.subscribe(
//   PipelineActions.RunPipeline,
//   async ({ template, accountPathProps: accountPathParams, pipeline }) => {
//     let response = { ...template }
//     const payload = { pipelineYaml: yamlStringify({ pipeline }), templateYaml: yamlStringify(template) }

//     // Making the BE call to get the updated template, only if the stage contains verify step then
//     if (isVerifyStepPresent(pipeline)) {
//       const updatedResponse = await inputSetTemplatePromise({
//         queryParams: { accountId: accountPathParams?.accountId },
//         body: payload
//       })
//       if (updatedResponse?.data?.inputSetTemplateYaml) {
//         response = { ...parse(updatedResponse.data.inputSetTemplateYaml)?.pipeline }
//       }
//     }
//     return Promise.resolve(response)
//   }
// )

featureFactory.registerFeaturesByModule('cv', {
  features: [FeatureIdentifier.SRM_SERVICES],
  renderMessage: (_, getString, additionalLicenseProps, usageAndLimitInfo): RenderMessageReturn => {
    const { isFreeEdition, isTeamEdition, isEnterpriseEdition } = additionalLicenseProps || {}

    const { limitData, usageData } = usageAndLimitInfo || {}
    const { totalServices } = limitData?.limit?.cv || {}
    const { activeServices } = usageData?.usage?.cv || {}

    const activeServicesCount = activeServices?.count

    /**
     *  ********** activeServices < totalServices *************
     *
     * Banner type: Info
     *
     * Team edition:
     * Show banner only if activeServices is above or equal to 75% of totalServices.
     *
     * Free edition:
     * Show banner usage always
     *
     *
     * ********** activeServices === totalServices *************
     *
     * Banner type: Level up
     *
     * Team edition and Free edition:
     * You have exceeded your service subscription limit. Consider increasing your limits.
     */

    if (getIsValuePresent(activeServicesCount) && getIsValuePresent(totalServices)) {
      const usagePercentge = (activeServicesCount / totalServices) * 100

      if (activeServicesCount < totalServices) {
        if (isFreeEdition) {
          return {
            message: () =>
              getString('cv.licenseBanner.freePlanUsageMessage', {
                activeServicesCount,
                totalServices
              }),
            bannerType: BannerType.INFO
          }
        }

        if (isTeamEdition && usagePercentge > ThresholdPercentageToShowBanner) {
          return {
            message: () =>
              getString('cv.licenseBanner.teamPlanUsageMessage', {
                activeServicesCount,
                totalServices
              }),
            bannerType: BannerType.INFO
          }
        }
      }

      if (activeServicesCount >= totalServices && !isEnterpriseEdition) {
        return {
          message: () => getString('cv.licenseBanner.limitExceedMessage'),
          bannerType: BannerType.LEVEL_UP
        }
      }
    }

    // ⭐️ No banner will be shown
    return {
      message: () => '',
      bannerType: BannerType.LEVEL_UP
    }
  }
})

export const cvModuleParams: ModulePathParams = {
  module: ':module(cv)'
}

export const cdModuleParams: ModulePathParams = {
  module: ':module(cd)'
}

const RedirectToCVProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CV)) {
    return (
      <Redirect
        to={routes.toCVSLOs({
          accountId: params.accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toCVHome(params)} />
  }
}

const cvLabel = 'common.purpose.cv.serviceReliability'
AuditTrailFactory.registerResourceHandler(ResourceType.MONITORED_SERVICE, {
  moduleIcon: {
    name: 'cv-main'
  },
  moduleLabel: cvLabel,
  resourceLabel: 'cv.monitoredServices.title',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope, module?: any) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    if (module && orgIdentifier && projectIdentifier) {
      return routes.toCVAddMonitoringServicesEdit({
        module,
        orgIdentifier,
        projectIdentifier,
        accountId: accountIdentifier!,
        identifier: resource.identifier
      })
    }
    return undefined
  }
})

AuditTrailFactory.registerResourceHandler(ResourceType.SERVICE_LEVEL_OBJECTIVE, {
  moduleIcon: {
    name: 'cv-main'
  },
  moduleLabel: cvLabel,
  resourceLabel: 'cv.slos.title',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope, module?: any) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    if (module && orgIdentifier && projectIdentifier) {
      return routes.toCVSLODetailsPage({
        module,
        orgIdentifier,
        projectIdentifier,
        accountId: accountIdentifier!,
        identifier: resource.identifier
      })
    }
    return undefined
  }
})

RbacFactory.registerResourceCategory(ResourceCategory.CHANGEINTELLIGENCE_FUNCTION, {
  icon: 'cv-main',
  label: 'common.purpose.cv.serviceReliability'
})

RbacFactory.registerResourceTypeHandler(ResourceType.MONITOREDSERVICE, {
  icon: 'cv-main',
  label: 'cv.monitoredServices.title',
  labelSingular: 'cv.monitoredServices.heading',
  category: ResourceCategory.CHANGEINTELLIGENCE_FUNCTION,
  permissionLabels: {
    [PermissionIdentifier.VIEW_MONITORED_SERVICE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_MONITORED_SERVICE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_MONITORED_SERVICE]: <String stringID="delete" />,
    [PermissionIdentifier.TOGGLE_MONITORED_SERVICE]: <String stringID="cf.rbac.featureflag.toggle" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.SLO, {
  icon: 'cv-main',
  label: 'cv.SLO',
  category: ResourceCategory.CHANGEINTELLIGENCE_FUNCTION,
  permissionLabels: {
    [PermissionIdentifier.VIEW_SLO_SERVICE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_SLO_SERVICE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SLO_SERVICE]: <String stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.DOWNTIME, {
  icon: 'cv-main',
  label: 'cv.sloDowntime.label',
  category: ResourceCategory.CHANGEINTELLIGENCE_FUNCTION,
  permissionLabels: {
    [PermissionIdentifier.VIEW_DOWNTIME]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_DOWNTIME]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_DOWNTIME]: <String stringID="delete" />
  }
})

// eslint-disable-next-line import/no-unresolved
const SrmMicroFrontendPath = React.lazy(() => import('srmui/MicroFrontendApp'))

const CVSideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'Service',
  title: 'Reliability',
  icon: 'cv-main'
}

const RedirectToCVCodeErrorsControl = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CV)) {
    return (
      <Redirect
        to={routes.toCVCodeErrorsAgents({
          accountId: params.accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toCVHome(params)} />
  }
}

export const SRMRoutes = (
  <>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toMonitoredServices({ ...accountPathProps, ...orgPathProps, ...projectPathProps })}
      exact
    >
      <MonitoredServiceListWidget config={PROJECT_MONITORED_SERVICE_CONFIG} />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toAddMonitoredServices({ ...accountPathProps, ...orgPathProps, ...projectPathProps })}
    >
      <MonitoredServiceProvider isTemplate={false}>
        <CommonMonitoredServiceDetails config={PROJECT_MONITORED_SERVICE_CONFIG} />
      </MonitoredServiceProvider>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toMonitoredServicesConfigurations({
        ...accountPathProps,
        ...orgPathProps,
        ...projectPathProps,
        ...editParams
      })}
      exact
    >
      <CommonMonitoredServiceDetails config={PROJECT_MONITORED_SERVICE_CONFIG} />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toMonitoredServices({
        ...accountPathProps,
        ...orgPathProps,
        ...projectPathProps,
        ...cdModuleParams
      })}
      exact
    >
      <MonitoredServiceListWidget config={CD_MONITORED_SERVICE_CONFIG} />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toAddMonitoredServices({
        ...accountPathProps,
        ...orgPathProps,
        ...projectPathProps,
        ...cdModuleParams
      })}
    >
      <MonitoredServiceProvider isTemplate={false}>
        <CommonMonitoredServiceDetails config={CD_MONITORED_SERVICE_CONFIG} />
      </MonitoredServiceProvider>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toMonitoredServicesConfigurations({
        ...accountPathProps,
        ...orgPathProps,
        ...projectPathProps,
        ...cdModuleParams,
        ...editParams
      })}
      exact
    >
      <CommonMonitoredServiceDetails config={CD_MONITORED_SERVICE_CONFIG} />
    </RouteWithLayout>

    <Route
      path={[routes.toCV({ ...accountPathProps }), routes.toCVProject({ ...accountPathProps, ...projectPathProps })]}
      exact
    >
      <RedirectToCVProject />
    </Route>
    <RouteWithLayout exact sidebarProps={CVSideNavProps} path={routes.toCVHome({ ...accountPathProps })}>
      <CVHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cv' })}
      exact
    >
      <CVTrialHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVMonitoringServices({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <MonitoredServiceProvider isTemplate={false}>
        <CVMonitoredService />
      </MonitoredServiceProvider>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVMonitoringServicesInputSets({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <MonitoredServiceInputSetsTemplate />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVChanges({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <CVChanges />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={routes.toCVCodeErrors({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <CVCodeErrors />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[routes.toCVCodeErrorsSettings({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })]}
    >
      <RedirectToCVCodeErrorsControl />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[routes.toCVCodeErrorsAgents({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })]}
    >
      <CVCodeErrorsSettings>
        <CVCodeErrorsAgents pathComponentLocation={'/agents'} />
      </CVCodeErrorsSettings>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[routes.toCVCodeErrorsAgentsTokens({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })]}
    >
      <CVCodeErrorsSettings>
        <CVCodeErrorsAgents pathComponentLocation={'/tokens'} />
      </CVCodeErrorsSettings>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[routes.toCVCodeErrorsCriticalEvents({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })]}
    >
      <CVCodeErrorsSettings>
        <CVCodeErrorsAgents pathComponentLocation={'/criticalevents'} />
      </CVCodeErrorsSettings>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[routes.toCVSLODowntime({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })]}
    >
      <SLODowntimePage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[
        routes.toCVCreateSLODowntime({ ...accountPathProps, ...projectPathProps, ...cvModuleParams }),
        routes.toCVEditSLODowntime({ ...accountPathProps, ...projectPathProps, ...cvModuleParams, ...editParams })
      ]}
    >
      <CVCreateDowntime />
    </RouteWithLayout>

    <RouteWithLayout exact sidebarProps={CVSideNavProps} path={routes.toAccountCVSLOs({ ...accountPathProps })}>
      <CVSLOsListingPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toAccountCVCreateCompositeSLOs({ ...accountPathProps, ...cvModuleParams })}
    >
      <CVCreateSLOV2 isComposite />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={routes.toErrorTracking({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <ChildAppMounter<ETCustomMicroFrontendProps>
        ChildApp={ErrorTracking}
        customComponents={{
          NotificationWizardOverviewStep: Overview,
          NotificationWizardMethodStep: NotificationMethods
        }}
      />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVCreateSLOs({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <CVCreateSLOV2 />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVSLODetailsPage({
        ...accountPathProps,
        ...projectPathProps,
        ...editParams,
        ...cvModuleParams
      })}
    >
      <CVSLODetailsPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toAccountCVSLODetailsPage({
        ...accountPathProps,
        ...editParams,
        ...cvModuleParams
      })}
    >
      <CVSLODetailsPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVCreateCompositeSLOs({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <CVCreateSLOV2 isComposite />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[
        routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
        routes.toCVAddMonitoringServicesEdit({
          ...accountPathProps,
          ...projectPathProps,
          ...editParams,
          ...cvModuleParams
        })
      ]}
    >
      <MonitoredServiceProvider isTemplate={false}>
        <MonitoredServicePage />
      </MonitoredServiceProvider>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toConnectors({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <ConnectorsPage />
    </RouteWithLayout>
    {/* uncomment once BE integration is complete  */}
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toTemplates({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <TemplatesPage />
    </RouteWithLayout>

    {/* Replace TemplateStudioWrapper route with following code once BE integration is complete: */}
    {/*{*/}
    {/*  TemplateRouteDestinations({*/}
    {/*    moduleParams,*/}
    {/*    sidebarProps: CVSideNavProps*/}
    {/*  })?.props.children*/}
    {/*}*/}
    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      exact
      path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...cvModuleParams })}
    >
      <TemplateStudio />
    </RouteWithLayout>
    {/* Replace above route once BE integration is complete */}

    {
      SecretRouteDestinations({
        moduleParams: cvModuleParams,
        sidebarProps: CVSideNavProps
      })?.props.children
    }

    {
      VariableRouteDestinations({
        moduleParams: cvModuleParams,
        sidebarProps: CVSideNavProps
      })?.props.children
    }

    {
      DelegateRouteDestinations({
        moduleParams: cvModuleParams,
        sidebarProps: CVSideNavProps
      })?.props.children
    }

    {
      ConnectorRouteDestinations({
        moduleParams: cvModuleParams,
        sidebarProps: CVSideNavProps
      })?.props.children
    }
    {
      DefaultSettingsRouteDestinations({
        moduleParams: cvModuleParams,
        sidebarProps: CVSideNavProps
      })?.props.children
    }

    {
      AccessControlRouteDestinations({
        moduleParams: cvModuleParams,
        sidebarProps: CVSideNavProps
      })?.props.children
    }

    {
      GovernanceRouteDestinations({
        sidebarProps: CVSideNavProps,
        pathProps: { ...accountPathProps, ...projectPathProps, ...cvModuleParams }
      })?.props.children
    }
  </>
)

export const SRMMFERoutes: React.FC = () => {
  const { SRM_MICRO_FRONTEND: enableMicroFrontend } = useFeatureFlags()
  const mfePaths = enableMicroFrontend
    ? [routes.toCVSLOs({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })]
    : []

  return (
    <>
      {enableMicroFrontend ? (
        <RouteWithLayout exact path={[...mfePaths]} sidebarProps={CVSideNavProps}>
          <ChildAppMounter<SRMCustomMicroFrontendProps>
            ChildApp={SrmMicroFrontendPath}
            customHooks={{ useQueryParams, useFeatureFlag, useFeatureFlags, useDeepCompareEffect }}
            customFunctions={{
              formatDatetoLocale,
              getReadableDateTime
            }}
            customConstants={{ ALL_TIME_ZONES }}
          />
        </RouteWithLayout>
      ) : (
        <RouteWithLayout
          exact
          sidebarProps={CVSideNavProps}
          path={routes.toCVSLOs({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
        >
          <CVSLOsListingPage />
        </RouteWithLayout>
      )}
    </>
  )
}
