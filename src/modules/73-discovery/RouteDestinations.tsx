/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, discoveryPathProps, projectPathProps, variablePathProps } from '@common/utils/routeUtils'

import { AccountSideNavProps } from '@common/RouteDestinations'
import DiscoveryPage from './pages/home/DiscoveryPage'
import DiscoveryDetails from './pages/discovery-details/DiscoveryDetails'

// const platformLabel = 'common.resourceCenter.ticketmenu.platform'
// Enable when BE adds support for Network Map Audit
// AuditTrailFactory.registerResourceHandler('VARIABLE', {
//   moduleIcon: {
//     name: 'variable' // Add an icon for network map
//   },
//   moduleLabel: platformLabel,
//   resourceLabel: 'common.networkMap'
// })

// RbacFactory.registerResourceTypeHandler(ResourceType.NETWORKMAP, {
//   icon: 'networkMap',
//   label: 'common.networkMap',
//   labelSingular: 'netowrkMapLabel',
//   category: ResourceCategory.SHARED_RESOURCES,
//   permissionLabels: {
//     [PermissionIdentifier.VIEW_DISCOVERY]: <String stringID="rbac.permissionLabels.view" />,
//     [PermissionIdentifier.EDIT_DISCOVERY]: <String stringID="rbac.permissionLabels.createEdit" />,
//     [PermissionIdentifier.DELETE_DISCOVERY]: <String stringID="rbac.permissionLabels.delete" />,
//     [PermissionIdentifier.ACCESS_DISCOVERY]: <String stringID="rbac.permissionLabels.access" />
//   }
//   // enable when BE adds support
// })

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toDiscovery({ ...accountPathProps })} exact>
      <DiscoveryPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toDiscoveryDetails({ ...accountPathProps, ...discoveryPathProps })}
      exact
    >
      <DiscoveryDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toDiscovery({ ...accountPathProps, ...variablePathProps })}
      exact
    >
      {/* TODO */}
    </RouteWithLayout>
  </>
)

export const DiscoveryRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => (
  <>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routes.toDiscovery({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
      pageName={PAGE_NAME.DiscoveryPage}
    >
      <DiscoveryPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routes.toDiscoveryDetails({ ...accountPathProps, ...discoveryPathProps, ...moduleParams })}
      pageName={PAGE_NAME.NetworkMapOverview}
    >
      <DiscoveryDetails />
    </RouteWithLayout>
  </>
)
