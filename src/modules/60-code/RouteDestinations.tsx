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
import { ModuleName } from 'framework/types/ModuleName'
import { String as LocaleString } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
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
  Webhooks,
  WebhookNew,
  WebhookDetails,
  Tags
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
  tag: ':tag*',
  diffRefs: ':diffRefs*',
  pullRequestId: ':pullRequestId',
  pullRequestSection: ':pullRequestSection',
  webhookId: ':webhookId'
}

const RedirectToDefaultSCMRoute: React.FC = () => {
  const { accountId } = useParams<CODEPathProps>()

  const history = useHistory()
  const { selectedProject } = useAppStore() // eslint-disable-line react-hooks/rules-of-hooks

  useEffect(() => {
    if (selectedProject?.modules?.includes(ModuleName.CODE)) {
      history.replace(
        routes.toCODERepositories({
          space: [accountId, selectedProject.orgIdentifier || '', selectedProject.identifier].join('/')
        })
      )
    } else {
      history.replace(routes.toCODEHome({ accountId }))
    }
  }, [history, accountId])

  return null
}

export default function CODERouteDestinations(): React.ReactElement {
  const repoPath = [
    codePathProps.accountId,
    codePathProps.orgIdentifier,
    codePathProps.projectIdentifier,
    codePathProps.repoName
  ].join('/')

  RbacFactory.registerResourceCategory(ResourceCategory.CODE, {
    icon: 'code',
    label: 'common.purpose.code.name'
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.CODE_REPOSITORY, {
    icon: 'code',
    label: 'repository',
    labelSingular: 'repository',
    category: ResourceCategory.CODE,

    permissionLabels: {
      [PermissionIdentifier.CODE_REPO_VIEW]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.CODE_REPO_EDIT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.CODE_REPO_DELETE]: <LocaleString stringID="delete" />,
      [PermissionIdentifier.CODE_REPO_PUSH]: <LocaleString stringID="rbac.permissionLabels.push" />
    }
  })
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
          repoPath,
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
            repoPath,
            pullRequestId: codePathProps.pullRequestId,
            pullRequestSection: codePathProps.pullRequestSection
          }),
          routes.toCODEPullRequest({
            repoPath,
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
        path={routes.toCODEPullRequests({ repoPath })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEPullRequests}
        exact
      >
        <PullRequests />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODEWebhookNew({ repoPath })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEWebhookNew}
        exact
      >
        <WebhookNew />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODEWebhookDetails({
          repoPath,
          webhookId: codePathProps.webhookId
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEWebhookDetails}
      >
        <WebhookDetails />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODEWebhooks({ repoPath })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEWebhooks}
        exact
      >
        <Webhooks />
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toCODESettings({ repoPath })}
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
          repoPath,
          commitRef: codePathProps.commitRef
        })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODECommits}
      >
        <Commits />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODEBranches({ repoPath })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODEBranches}
        exact
      >
        <Branches />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODETags({ repoPath })}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODETags}
        exact
      >
        <Tags />
      </RouteWithLayout>
      <RouteWithLayout
        path={routes.toCODEFileEdit({
          repoPath,
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
            repoPath,
            gitRef: codePathProps.gitRef,
            resourcePath: codePathProps.resourcePath
          }),
          routes.toCODERepository({
            repoPath,
            gitRef: codePathProps.gitRef
          }),
          routes.toCODERepository({ repoPath })
        ]}
        sidebarProps={sidebarProps}
        pageName={PAGE_NAME.CODERepository}
      >
        <Repository />
      </RouteWithLayout>
    </Route>
  )
}
