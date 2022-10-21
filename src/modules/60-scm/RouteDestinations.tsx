/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Route, useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { scmPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { SCMPathProps } from '@common/interfaces/RouteInterfaces'
import SideNav from '@scm/components/SideNav/SideNav'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RemmoteRepoResourceDetails, RemoteRepoResources, RemoteRepos, RemoteWelcome } from './SCMApp'

export const SCMSideNavProps: SidebarContext = {
  navComponent: SideNav,
  title: 'Repos',
  icon: 'gitops-green'
}

const RedirectToDefaultSCMRoute: React.FC = () => {
  const { accountId } = useParams<SCMPathProps>()
  const history = useHistory()

  useEffect(() => {
    history.replace(routes.toSCMHome({ accountId }))
  }, [history, accountId])

  return null
}

export const SCMRouteDestinations: React.FC<{
  sidebarProps: SidebarContext
  pathProps: Required<SCMPathProps>
}> = ({ sidebarProps, pathProps }) => (
  <Route path={routes.toSCM(pathProps)}>
    <Route path={routes.toSCM(pathProps)} exact>
      <RedirectToDefaultSCMRoute />
    </Route>
    <RouteWithLayout path={routes.toSCMHome(pathProps)} sidebarProps={sidebarProps} pageName={PAGE_NAME.SCMWelcome}>
      <RemoteWelcome />
    </RouteWithLayout>
    <RouteWithLayout
      path={routes.toSCMRepos(pathProps)}
      sidebarProps={sidebarProps}
      pageName={PAGE_NAME.SCMRepos}
      exact
    >
      <RemoteRepos />
    </RouteWithLayout>
    <RouteWithLayout path={routes.toSCMFiles(pathProps)} sidebarProps={sidebarProps} pageName={PAGE_NAME.SCMFiles}>
      <RemoteRepoResources />
    </RouteWithLayout>
    <RouteWithLayout
      path={routes.toSCMFileDetails(pathProps)}
      sidebarProps={sidebarProps}
      pageName={PAGE_NAME.SCMFileDetails}
    >
      <RemmoteRepoResourceDetails />
    </RouteWithLayout>
  </Route>
)

export default <>{SCMRouteDestinations({ sidebarProps: SCMSideNavProps, pathProps: scmPathProps })}</>
