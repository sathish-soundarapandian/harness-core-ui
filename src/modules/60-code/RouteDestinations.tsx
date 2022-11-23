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
import SideNav from '@code/components/SideNav/SideNav'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import {
  Repository,
  RepositoriesListing,
  RepositoryCommits,
  RepositoryBranches,
  RepositoryFileEdit,
  RepositorySettings
} from './SCMApp'
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
    history.replace(routes.toSCMHome({ accountId }))
  }, [history, accountId])

  return null
}

export function SCMRouteDestinations(): React.ReactElement {
  return (
    <Route path={routes.toSCM(scmPathProps)}>
      <Route path={routes.toSCM(scmPathProps)} exact>
        <RedirectToDefaultSCMRoute />
      </Route>
      <RouteWithLayout
        path={routes.toSCMHome(scmPathProps)}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMHomePage}
      >
        <SCMHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toSCMRepositorySettings({
          repoPath: [
            scmPathProps.accountId,
            scmPathProps.orgIdentifier,
            scmPathProps.projectIdentifier,
            scmPathProps.repoName
          ].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMRepositorySettings}
        exact
      >
        <RepositorySettings />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toSCMRepositoriesListing({
          space: [scmPathProps.accountId, scmPathProps.orgIdentifier, scmPathProps.projectIdentifier].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMRepositoriesListing}
        exact
      >
        <RepositoriesListing />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toSCMRepositoryCommits({
          repoPath: [
            scmPathProps.accountId,
            scmPathProps.orgIdentifier,
            scmPathProps.projectIdentifier,
            scmPathProps.repoName
          ].join('/'),
          commitRef: scmPathProps.commitRef
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMRepositoryCommits}
      >
        <RepositoryCommits />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toSCMRepositoryBranches({
          repoPath: [
            scmPathProps.accountId,
            scmPathProps.orgIdentifier,
            scmPathProps.projectIdentifier,
            scmPathProps.repoName
          ].join('/'),
          branch: scmPathProps.branch
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMRepositoryBranches}
      >
        <RepositoryBranches />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toSCMRepositoryFileEdit({
          repoPath: [
            scmPathProps.accountId,
            scmPathProps.orgIdentifier,
            scmPathProps.projectIdentifier,
            scmPathProps.repoName
          ].join('/'),
          gitRef: scmPathProps.gitRef,
          resourcePath: scmPathProps.resourcePath
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMRepositoryFileEdit}
      >
        <RepositoryFileEdit />
      </RouteWithLayout>
      <RouteWithLayout
        path={[
          routes.toSCMRepository({
            repoPath: [
              scmPathProps.accountId,
              scmPathProps.orgIdentifier,
              scmPathProps.projectIdentifier,
              scmPathProps.repoName
            ].join('/'),
            gitRef: scmPathProps.gitRef,
            resourcePath: scmPathProps.resourcePath
          }),
          routes.toSCMRepository({
            repoPath: [
              scmPathProps.accountId,
              scmPathProps.orgIdentifier,
              scmPathProps.projectIdentifier,
              scmPathProps.repoName
            ].join('/'),
            gitRef: scmPathProps.gitRef
          }),
          routes.toSCMRepository({
            repoPath: [
              scmPathProps.accountId,
              scmPathProps.orgIdentifier,
              scmPathProps.projectIdentifier,
              scmPathProps.repoName
            ].join('/')
          })
        ]}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.SCMRepository}
      >
        <Repository />
      </RouteWithLayout>
    </Route>
  )
}
