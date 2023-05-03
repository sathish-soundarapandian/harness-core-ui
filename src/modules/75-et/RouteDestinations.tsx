/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import { MinimalLayout } from '@common/layouts'
import routes from '@common/RouteDefinitions'
import { RedirectToSubscriptionsFactory } from '@common/Redirects'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import { Module, ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import PolicyManagementMFE from '@governance/GovernanceApp'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateListing from '@delegates/pages/delegates/DelegateListing'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import SettingsList from '@default-settings/pages/SettingsList'
import { ETMonitoredServices } from './pages/ETMonitoredServices'
import SideNav from './components/SideNav/SideNav'
import ETHomePage from './pages/ETHomePage'
import ETTrialPage from './pages/trialPage/ETTrialPage'
import { ETEventsSummary } from './pages/events-summary/ETEventsSummary'
import { ETAgents } from './pages/ET-agent-control/ET-agents/ETAgents'
import ETSettings from './pages/ET-agent-control/ETSettings'

export const ETSideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'Continuous',
  title: 'Error Tracking',
  icon: 'cet'
}

export const etModuleParams: ModulePathParams = {
  module: ':module(et)'
}

const RedirectToETControl = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject && selectedProject?.modules?.includes(ModuleName.CET)) {
    return (
      <Redirect
        to={routes.toETAgents({
          accountId: params.accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toETHome(params)} />
  }
}

const RedirectToETProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject) {
    return (
      <Redirect
        to={routes.toETEventsSummary({
          accountId: params.accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toETHome(params)} />
  }
}

const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return <Redirect to={routes.toETHomeTrial({ accountId })} />
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CET_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.CET)
}

const ETRoutes: FC = () => {
  return (
    <>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        path={routes.toET({ ...accountPathProps })}
        exact
        pageName={PAGE_NAME.ETHomePage}
      >
        <RedirectToETProject />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={ETSideNavProps}
        path={routes.toETHome({ ...projectPathProps })}
        exact
        pageName={PAGE_NAME.ETHomePage}
      >
        <ETHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        layout={MinimalLayout}
        path={routes.toModuleTrialHome({ ...accountPathProps, module: ModuleName.CET.toLowerCase() as Module })}
        exact
        pageName={PAGE_NAME.ETTrialPage}
      >
        <ETTrialPage />
      </RouteWithLayout>

      <RouteWithLayout
        layout={MinimalLayout}
        path={routes.toETHomeTrial({ ...accountPathProps })}
        exact
        pageName={PAGE_NAME.ETTrialPage}
      >
        <ETTrialPage />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={ETSideNavProps}
        path={routes.toETEventsSummary({ ...accountPathProps, ...projectPathProps, ...etModuleParams })}
      >
        <ETEventsSummary />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETSettings({ ...accountPathProps, ...projectPathProps, ...etModuleParams })]}
      >
        <RedirectToETControl />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETAgents({ ...accountPathProps, ...projectPathProps, ...etModuleParams })]}
      >
        <ETSettings>
          <ETAgents pathComponentLocation={'/agents'} />
        </ETSettings>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETAgentsTokens({ ...accountPathProps, ...projectPathProps, ...etModuleParams })]}
      >
        <ETSettings>
          <ETAgents pathComponentLocation={'/tokens'} />
        </ETSettings>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETConnectors({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <ConnectorsPage />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETSecrets({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <SecretsPage />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETAccessControl({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <AccessControlPage>
          <UsersPage />
        </AccessControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETDelegates({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <DelegatesPage>
          <DelegateListing />
        </DelegatesPage>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETDefaultSettings({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <SettingsList />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETPolicies({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
        pageName={PAGE_NAME.OPAPolicyDashboard}
      >
        <PolicyManagementMFE />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={ETSideNavProps}
        path={[routes.toETCodeErrorsCriticalEvents({ ...accountPathProps, ...projectPathProps, ...etModuleParams })]}
      >
        <ETSettings>
          <ETAgents pathComponentLocation={'/criticalevents'} />
        </ETSettings>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={ETSideNavProps}
        path={routes.toETMonitoredServices({ ...accountPathProps, ...projectPathProps, ...orgPathProps })}
      >
        <ETMonitoredServices />
      </RouteWithLayout>
    </>
  )
}

export default ETRoutes
