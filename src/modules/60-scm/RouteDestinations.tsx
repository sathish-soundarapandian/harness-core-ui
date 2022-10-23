/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Route, useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { scmPathProps as pathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { SCMPathProps } from '@common/interfaces/RouteInterfaces'
import SideNav from '@scm/components/SideNav/SideNav'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RemoteRepoResources, RemoteRepos } from './SCMApp'
import SCMHomePage from './pages/home/SCMHomePage'

export const sidebarProps: SidebarContext = {
  navComponent: SideNav,
  title: 'Code',
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

export function SCMRouteDestinations(): React.ReactElement {
  return (
    <Route path={routes.toSCM(pathProps)}>
      <Route path={routes.toSCM(pathProps)} exact>
        <RedirectToDefaultSCMRoute />
      </Route>
      <RouteWithLayout path={routes.toSCMHome(pathProps)} sidebarProps={sidebarProps} pageName={PAGE_NAME.SCMHomePage}>
        <SCMHomePage />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toSCMRepositoriesListing({
          space: [pathProps.accountId, pathProps.orgIdentifier, pathProps.projectIdentifier].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMRepositoriesListing}
        exact
      >
        <RemoteRepos />
      </RouteWithLayout>
      <RouteWithLayout
        path={[
          routes.toSCMRepository({
            repoPath: [
              pathProps.accountId,
              pathProps.orgIdentifier,
              pathProps.projectIdentifier,
              pathProps.repoName
            ].join('/'),
            gitRef: ':gitRef*',
            resourcePath: ':resourcePath*'
          }),
          routes.toSCMRepository({
            repoPath: [
              pathProps.accountId,
              pathProps.orgIdentifier,
              pathProps.projectIdentifier,
              pathProps.repoName
            ].join('/'),
            gitRef: ':gitRef*'
          })
        ]}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMRepository}
      >
        <RemoteRepoResources />
      </RouteWithLayout>
    </Route>
  )
}
