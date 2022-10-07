/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { AccountSideNavProps } from '@common/RouteDestinations'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RouteWithLayout } from '@common/router'
import FreezeWindowsPage from '@freeze-windows/pages/FreezeWindowsPage/FreezeWindowsPage'
import { FreezeStudioWrapper } from '@freeze-windows/components/FreezeStudioWrapper'

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
      <FreezeStudioWrapper />
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
      <FreezeStudioWrapper />
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
        sidebarProps={AccountSideNavProps}
        path={routes.toFreezeWindowStudio({
          ...projectPathProps,
          ...moduleParams,
          ...{
            windowIdentifier: ':windowIdentifier'
          }
        })}
        exact
      >
        <FreezeStudioWrapper />
      </RouteWithLayout>
    </>
  )
}
