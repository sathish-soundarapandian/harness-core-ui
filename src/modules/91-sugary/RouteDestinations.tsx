/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, useParams } from 'react-router-dom'
import { Layout } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import SugaryMFE from './SugaryApp';

const SideNav = () => { 
  const { accountId } = useParams<GovernancePathProps>();

  return (
  <Layout.Vertical spacing="small" margin={{ top: 'xxxlarge' }}>
      <SidebarLink exact label={"Test Sets"} to={routes.toSugary({accountId})} />
    </Layout.Vertical>
)}

export const AccountSideNavProps: SidebarContext = {
  navComponent: SideNav,
  icon: 'nav-settings',
  title: 'Sugary'
}

//
// This function constructs Governance Routes based on context. Governance can be mounted in three
// places: Account Settings, Project Detail, and Org Detail. Depends on pathProps of where this module
// is mounted, this function will generate proper Governance routes.
//
export const SugaryRoutes: React.FC<{
  sidebarProps: SidebarContext
  pathProps: GovernancePathProps
}> = ({ sidebarProps, pathProps }) => {
  return (
    <Route path={routes.toSugary(pathProps)}>
      <RouteWithLayout
        path={routes.toSugary(pathProps)}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.OPAPolicyDashboard}
      >
        <SugaryMFE />
      </RouteWithLayout>
    </Route>
  )
}

export default <>{SugaryRoutes({ sidebarProps: AccountSideNavProps, pathProps: accountPathProps })}</>
