import React from 'react'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import ChaosSideNav from './components/ChaosSideNav/ChaosSideNav'

// eslint-disable-next-line import/no-unresolved
const ChaosMicroFrontend = React.lazy(() => import('chaos/MicroFrontendApp'))

const chaosSideNavProps: SidebarContext = {
  navComponent: ChaosSideNav,
  subtitle: 'Engineering',
  title: 'Chaos',
  icon: 'cd-main'
}

const chaosModuleParams: ModulePathParams = {
  module: ':module(chaos)'
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
      <div>project onboarding</div>
    </RouteWithLayout>
    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      sidebarProps={chaosSideNavProps}
      path={routes.toChaosHome({ ...projectPathProps, ...chaosModuleParams })}
      // pageName={PAGE_NAME.ChaosHomePage}
    >
      <ChildAppMounter ChildApp={ChaosMicroFrontend} />
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
  </>
)
