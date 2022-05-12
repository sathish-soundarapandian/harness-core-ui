import React, { Context } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import {
  accountPathProps,
  projectPathProps,
  resourceGroupPathProps,
  rolePathProps,
  serviceAccountProps,
  userGroupPathProps,
  userPathProps
} from '@common/utils/routeUtils'
import { String as LocaleString } from 'framework/strings'
import ExecutionGraphView from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/ExecutionGraphView'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { ExecutionContextParams } from '@pipeline/context/ExecutionContext'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import ServiceAccountsPage from '@rbac/pages/ServiceAccounts/ServiceAccounts'
import ServiceAccountDetails from '@rbac/pages/ServiceAccountDetails/ServiceAccountDetails'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import Roles from '@rbac/pages/Roles/Roles'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import SideNav from './components/SideNav/SideNav'
import ChaosHomePage from './pages/home/ChaosHomePage'

// eslint-disable-next-line import/no-unresolved
const ChaosMicroFrontend = React.lazy(() => import('chaos/MicroFrontendApp'))

export interface ChaosCustomMicroFrontendProps {
  customComponents: {
    ExecutionGraphView: React.ComponentType
    ExecutionContext?: Context<ExecutionContextParams>
  }
}

RbacFactory.registerResourceCategory(ResourceCategory.CHAOS, {
  icon: 'ci-dev-exp',
  label: 'common.chaos'
})

RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_HUB, {
  icon: 'ci-dev-exp',
  label: 'chaos.chaoshub',
  category: ResourceCategory.CHAOS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CHAOSHUB]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CHAOSHUB]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CHAOSHUB]: <LocaleString stringID="delete" />
  }
})

const chaosSideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'Chaos',
  title: 'Engineering',
  icon: 'cd-main'
}

const chaosModuleParams: ModulePathParams = {
  module: ':module(chaos)'
}

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module: 'chaos' })} />
}

export default (
  <>
    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      sidebarProps={chaosSideNavProps}
      path={routes.toChaos({ ...accountPathProps })}
      exact
      // pageName={PAGE_NAME.ChaosHomePage}
    >
      <ChaosHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      sidebarProps={chaosSideNavProps}
      path={routes.toChaosWorkflows({ ...projectPathProps, ...chaosModuleParams })}
      // pageName={PAGE_NAME.ChaosHomePage}
    />
    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      sidebarProps={chaosSideNavProps}
      path={routes.toChaosHubs({ ...projectPathProps, ...chaosModuleParams })}
      // pageName={PAGE_NAME.ChaosHomePage}
    />
    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      sidebarProps={chaosSideNavProps}
      path={routes.toChaosAgents({ ...projectPathProps, ...chaosModuleParams })}
      // pageName={PAGE_NAME.ChaosHomePage}
    />
    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={[routes.toAccessControl({ ...projectPathProps, ...chaosModuleParams })]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={[routes.toUsers({ ...projectPathProps, ...chaosModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={routes.toUserDetails({ ...projectPathProps, ...chaosModuleParams, ...userPathProps })}
      exact
    >
      <UserDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={[routes.toUserGroups({ ...projectPathProps, ...chaosModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={routes.toUserGroupDetails({ ...projectPathProps, ...chaosModuleParams, ...userGroupPathProps })}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={routes.toServiceAccounts({ ...projectPathProps, ...chaosModuleParams })}
      exact
    >
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={routes.toServiceAccountDetails({ ...projectPathProps, ...chaosModuleParams, ...serviceAccountProps })}
      exact
    >
      <ServiceAccountDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={[routes.toResourceGroups({ ...projectPathProps, ...chaosModuleParams })]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={[routes.toRoles({ ...projectPathProps, ...chaosModuleParams })]}
      exact
    >
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={[routes.toRoleDetails({ ...projectPathProps, ...chaosModuleParams, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={chaosSideNavProps}
      path={[routes.toResourceGroupDetails({ ...projectPathProps, ...chaosModuleParams, ...resourceGroupPathProps })]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      sidebarProps={chaosSideNavProps}
      path={routes.toChaosHome({ ...projectPathProps, ...chaosModuleParams })}
      // pageName={PAGE_NAME.ChaosHomePage}
    >
      <ChildAppMounter<ChaosCustomMicroFrontendProps>
        ChildApp={ChaosMicroFrontend}
        customComponents={{
          ExecutionGraphView
        }}
      />
    </RouteWithLayout>
  </>
)
