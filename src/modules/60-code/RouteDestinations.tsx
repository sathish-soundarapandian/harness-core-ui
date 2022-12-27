/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Route, useHistory, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import SideNav from '@code/components/SideNav/SideNav'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { projectPathProps } from '@common/utils/routeUtils'
import {
  Repository,
  Repositories,
  Commits,
  Branches,
  FileEdit,
  Settings,
  PullRequests,
  PullRequest,
  Compare,
  CreateWebhook
} from './CodeApp'
import routes, { CODEPathProps } from './RouteDefinitions'
import CODEHomePage from './pages/home/CODEHomePage'

const sidebarProps: SidebarContext = {
  navComponent: SideNav,
  title: 'Code',
  icon: 'code'
}

const codePathProps: Required<CODEPathProps> = {
  ...projectPathProps,
  repoName: ':repoName',
  gitRef: ':gitRef*',
  resourcePath: ':resourcePath*',
  commitRef: ':commitRef*',
  branch: ':branch*',
  diffRefs: ':diffRefs*',
  pullRequestId: ':pullRequestId',
  pullRequestSection: ':pullRequestSection'
}

const RedirectToDefaultSCMRoute: React.FC = () => {
  const { accountId } = useParams<CODEPathProps>()
  const history = useHistory()

  useEffect(() => {
    history.replace(routes.toCODEHome({ accountId }))
  }, [history, accountId])

  return null
}

export default function CODERouteDestinations(): React.ReactElement {
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
        <CODEHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODECompare({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/'),
          diffRefs: codePathProps.diffRefs
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEPullRequestsCompare}
      >
        <Compare />
      </RouteWithLayout>

      <RouteWithLayout
        path={[
          routes.toCODEPullRequest({
            repoPath: [
              codePathProps.accountId,
              codePathProps.orgIdentifier,
              codePathProps.projectIdentifier,
              codePathProps.repoName
            ].join('/'),
            pullRequestId: codePathProps.pullRequestId,
            pullRequestSection: codePathProps.pullRequestSection
          }),
          routes.toCODEPullRequest({
            repoPath: [
              codePathProps.accountId,
              codePathProps.orgIdentifier,
              codePathProps.projectIdentifier,
              codePathProps.repoName
            ].join('/'),
            pullRequestId: codePathProps.pullRequestId
          })
        ]}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEPullRequests}
        exact
      >
        <PullRequest />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODEPullRequests({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEPullRequests}
        exact
      >
        <PullRequests />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODECreateWebhook({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODECreateWebhook}
        exact
      >
        <CreateWebhook />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODESettings({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODESettings}
        exact
      >
        <Settings />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODERepositories({
          space: [codePathProps.accountId, codePathProps.orgIdentifier, codePathProps.projectIdentifier].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODERepositories}
        exact
      >
        <Repositories />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODECommits({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/'),
          commitRef: codePathProps.commitRef
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODECommits}
      >
        <Commits />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODEBranches({
          repoPath: [
            codePathProps.accountId,
            codePathProps.orgIdentifier,
            codePathProps.projectIdentifier,
            codePathProps.repoName
          ].join('/')
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEBranches}
        exact
      >
        <Branches />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODEFileEdit({
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
        pageName={PAGE_NAME.CODEFileEdit}
      >
        <FileEdit />
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
