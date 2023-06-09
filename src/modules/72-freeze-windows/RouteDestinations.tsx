/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { String } from 'framework/strings'
import { AccountSideNavProps } from '@common/RouteDestinations'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RouteWithLayout } from '@common/router'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import FreezeWindowsPage from '@freeze-windows/pages/FreezeWindowsPage'
import FreezeWindowStudioPage from '@freeze-windows/pages/FreezeWindowStudioPage'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'

RbacFactory.registerResourceTypeHandler(ResourceType.DEPLOYMENTFREEZE, {
  icon: 'nav-settings',
  label: 'freezeWindows.deploymentFreeze',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.MANAGE_DEPLOYMENT_FREEZE]: <String stringID="rbac.permissionLabels.manage" />,
    [PermissionIdentifier.OVERRIDE_DEPLOYMENT_FREEZE]: <String stringID="common.override" />,
    [PermissionIdentifier.GLOBAL_DEPLOYMENT_FREEZE]: <String stringID="freezeWindows.rbac.global" />
  }
})

AuditTrailFactory.registerResourceHandler('DEPLOYMENT_FREEZE', {
  moduleIcon: {
    name: 'cd-main'
  },
  moduleLabel: 'common.purpose.cd.continuous',
  resourceLabel: 'freezeWindows.deploymentFreeze',
  resourceUrl: (windowIdentifier: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    if (windowIdentifier.identifier) {
      if (windowIdentifier.identifier === '_GLOBAL_') {
        return routes.toFreezeWindows({
          module: 'cd',
          orgIdentifier,
          projectIdentifier,
          accountId: accountIdentifier
        })
      }
      return routes.toFreezeWindowStudio({
        module: 'cd',
        orgIdentifier,
        projectIdentifier,
        accountId: accountIdentifier,
        windowIdentifier: windowIdentifier.identifier
      })
    }
    return undefined
  }
})

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toFreezeWindows({ ...accountPathProps })} exact>
      <FreezeWindowsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toFreezeWindowStudio({
        ...accountPathProps,
        ...{
          windowIdentifier: ':windowIdentifier'
        }
      })}
      exact
    >
      <FreezeWindowStudioPage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toFreezeWindows({ ...orgPathProps })} exact>
      <FreezeWindowsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toFreezeWindowStudio({
        ...orgPathProps,
        ...{
          windowIdentifier: ':windowIdentifier'
        }
      })}
      exact
    >
      <FreezeWindowStudioPage />
    </RouteWithLayout>
  </>
)

export const FreezeWindowRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => {
  return (
    <>
      <RouteWithLayout
        exact
        licenseRedirectData={licenseRedirectData}
        sidebarProps={sidebarProps}
        path={routes.toFreezeWindows({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
        pageName={PAGE_NAME.FreezeWindowsPage}
      >
        <FreezeWindowsPage />
      </RouteWithLayout>
      <RouteWithLayout
        pageName={PAGE_NAME.FreezeWindowsPage}
        licenseRedirectData={licenseRedirectData}
        sidebarProps={sidebarProps}
        path={routes.toFreezeWindowStudio({
          ...projectPathProps,
          ...moduleParams,
          ...{
            windowIdentifier: ':windowIdentifier'
          }
        })}
        exact
      >
        <FreezeWindowStudioPage />
      </RouteWithLayout>
    </>
  )
}
