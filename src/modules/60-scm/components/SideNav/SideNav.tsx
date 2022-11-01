/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { ProjectSelector, ProjectSelectorProps } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { SCMPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './SideNav.module.scss'

export default function SCMSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, repoName, commitRef } = useParams<SCMPathProps>()
  const history = useHistory()
  const { updateAppStore } = useAppStore()
  const projectSelectHandler: ProjectSelectorProps['onSelect'] = data => {
    updateAppStore({ selectedProject: data })

    history.push(
      routes.toSCMRepositoriesListing({ space: [accountId, data.orgIdentifier as string, data.identifier].join('/') })
    )
  }

  console.log({ commitRef })

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.SCM as ProjectSelectorProps['moduleFilter']}
        onSelect={projectSelectHandler}
      />
      {projectIdentifier && orgIdentifier && (
        <>
          <SidebarLink
            label={getString('repositories')}
            to={routes.toSCMRepositoriesListing({ space: [accountId, orgIdentifier, projectIdentifier].join('/') })}
            {...(repoName ? { activeClassName: '' } : {})}
          />

          {repoName && (
            <SidebarLink
              className={css.subNav}
              icon="file"
              textProps={{
                iconProps: {
                  size: 14
                }
              }}
              label={getString('scm.files')}
              to={routes.toSCMRepository({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              className={css.subNav}
              icon="git-branch-existing"
              textProps={{
                iconProps: {
                  size: 14
                }
              }}
              label={getString('commits')}
              to={routes.toSCMRepositoryCommits({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/'),
                commitRef: ''
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              className={css.subNav}
              icon="git-branch"
              textProps={{
                iconProps: {
                  size: 14
                }
              }}
              label={getString('scm.branches')}
              to={routes.toSCMRepositoryBranches({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/'),
                branch: ''
              })}
            />
          )}
        </>
      )}
    </Layout.Vertical>
  )
}
