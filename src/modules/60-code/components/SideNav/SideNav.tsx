/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@harness/uicore'
import cx from 'classnames'
import { ProjectSelector, ProjectSelectorProps } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes, { CODEPathProps } from '../../RouteDefinitions'
import css from './SideNav.module.scss'

export default function CODESideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, repoName } = useParams<CODEPathProps>()
  const history = useHistory()
  const { path } = useRouteMatch()
  const { updateAppStore } = useAppStore()
  const projectSelectHandler: ProjectSelectorProps['onSelect'] = data => {
    updateAppStore({ selectedProject: data })
    history.push(
      routes.toCODERepositories({ space: [accountId, data.orgIdentifier as string, data.identifier].join('/') })
    )
  }
  const isFiles =
    path.endsWith(':repoName') || path.includes(':repoName/files/') || path.endsWith(':gitRef*/~/:resourcePath*')

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CODE as ProjectSelectorProps['moduleFilter']}
        onSelect={projectSelectHandler}
      />
      {projectIdentifier && orgIdentifier && (
        <>
          <SidebarLink
            label={getString('repositories')}
            to={routes.toCODERepositories({ space: [accountId, orgIdentifier, projectIdentifier].join('/') })}
            {...(repoName ? { activeClassName: '' } : {})}
          />

          {repoName && (
            <SidebarLink
              data-code-repo-section="files"
              className={css.subNav}
              icon="code-file-light"
              textProps={{
                iconProps: {
                  size: 18
                }
              }}
              label={getString('common.files')}
              to={routes.toCODERepository({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
              {...(isFiles ? {} : { activeClassName: '' })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="commits"
              className={css.subNav}
              icon="git-commit"
              textProps={{
                iconProps: {
                  size: 16
                }
              }}
              label={getString('commits')}
              to={routes.toCODECommits({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/'),
                commitRef: ''
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="branches"
              className={css.subNav}
              icon="git-branch"
              textProps={{
                iconProps: {
                  size: 14
                }
              }}
              label={getString('code.branches')}
              to={routes.toCODEBranches({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="pull-requests"
              className={css.subNav}
              icon="git-pull"
              textProps={{
                iconProps: {
                  size: 14
                }
              }}
              label={getString('code.pullRequests')}
              to={routes.toCODEPullRequests({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="branches"
              className={cx(css.subNav, css.webhooks)}
              icon="code-webhook"
              textProps={{
                iconProps: {
                  size: 20
                }
              }}
              label={getString('code.webhooks')}
              to={routes.toCODEWebhooks({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}
        </>
      )}
    </Layout.Vertical>
  )
}
