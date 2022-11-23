/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Route, useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { codePathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { SCMPathProps } from '@common/interfaces/RouteInterfaces'
import SideNav from '@code/components/SideNav/SideNav'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import {
  Repository,
  RepositoriesListing,
  RepositoryCommits,
  RepositoryBranches,
  RepositoryFileEdit,
  RepositorySettings
} from './CodeApp'
import SCMHomePage from './pages/home/SCMHomePage'

export const sidebarProps: SidebarContext = {
  navComponent: SideNav,
  title: 'Code',
  icon: 'code'
}

const RedirectToDefaultSCMRoute: React.FC = () => {
  const { accountId } = useParams<SCMPathProps>()
  const history = useHistory()

  useEffect(() => {
    history.replace(routes.toCODEHome({ accountId }))
  }, [history, accountId])

  return null
}

export function SCMRouteDestinations(): React.ReactElement {
  return (
    <Route path={routes.toCODE(codePathProps)}>
      <Route path={routes.toCODE(codePathProps)} exact>
        <RedirectToDefaultSCMRoute />
      </Route>
      <RouteWithLayout
        path={routes.toCODEHome(codePathProps)}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEHomePage}
      >
        <SCMHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODERepositorySettings({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODERepositorySettings}
        exact
      >
        <RepositorySettings />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODERepositoriesListing({
          space: [codePathProps.accountId, codePathProps.orgIdentifier, codePathProps.projectIdentifier].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODERepositoriesListing}
        exact
      >
        <RepositoriesListing />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODERepositoryCommits({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/'),
          commitRef: codePathProps.commitRef
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODERepositoryCommits}
      >
        <RepositoryCommits />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODERepositoryBranches({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/'),
          branch: codePathProps.branch
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODERepositoryBranches}
      >
        <RepositoryBranches />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODERepositoryFileEdit({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/'),
          gitRef: codePathProps.gitRef,
          resourcePath: codePathProps.resourcePath
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODERepositoryFileEdit}
      >
        <RepositoryFileEdit />
      </RouteWithLayout>
      <RouteWithLayout
        path={[
          routes.toCODERepository({
            repoPath: [
              codePathProps.accountId,
              codePathProps.orgIdentifier,
              codePathProps.projectIdentifier,
              codePathProps.repoName
            ].join('/'),
            gitRef: codePathProps.gitRef,
            resourcePath: codePathProps.resourcePath
          }),
          routes.toCODERepository({
            repoPath: [
              codePathProps.accountId,
              codePathProps.orgIdentifier,
              codePathProps.projectIdentifier,
              codePathProps.repoName
            ].join('/'),
            gitRef: codePathProps.gitRef
          }),
          routes.toCODERepository({
            repoPath: [
              codePathProps.accountId,
              codePathProps.orgIdentifier,
              codePathProps.projectIdentifier,
              codePathProps.repoName
            ].join('/')
          })
        ]}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODERepository}
      >
        <Repository />
      </RouteWithLayout>
    </Route>
  )
}
