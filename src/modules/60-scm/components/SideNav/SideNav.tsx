/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { ProjectSelector, ProjectSelectorProps } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { SCMPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

export default function SCMSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<SCMPathProps>()
  const history = useHistory()
  const { updateAppStore } = useAppStore()
  const projectSelectHandler: ProjectSelectorProps['onSelect'] = data => {
    updateAppStore({ selectedProject: data })

    history.push(
      routes.toSCMReposListing({
        accountId,
        orgIdentifier: data.orgIdentifier as string,
        projectIdentifier: data.identifier
      })
    )
  }

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
            to={routes.toSCMReposListing({ accountId, orgIdentifier, projectIdentifier })}
          />

          {/** TODO: DON"T COMMIT THESE
          <SidebarLink label="Repos" to={routes.toSCMRepos({ accountId, orgIdentifier, projectIdentifier })} />
          <SidebarLink label="NewRepo" to={routes.toSCMNewRepo({ accountId, orgIdentifier, projectIdentifier })} />
          <SidebarLink
            label="RepoFiles"
            to={routes.toSCMFiles({
              accountId,
              orgIdentifier,
              projectIdentifier,
              repoName: 'testRepo',
              branchName: 'dev'
            })}
          />
          <SidebarLink
            label="RepoFileDetails"
            to={routes.toSCMFileDetails({
              accountId,
              orgIdentifier,
              projectIdentifier,
              repoName: 'testRepo',
              branchName: 'dev',
              filePath: 'README.md'
            })}
          />

          <SidebarLink
            label="RepoCommits"
            to={routes.toSCMCommits({
              accountId,
              orgIdentifier,
              projectIdentifier,
              repoName: 'testRepo',
              branchName: 'dev'
            })}
          />

          <SidebarLink
            label="RepoCommitDetails"
            to={routes.toSCMCommitDetails({
              accountId,
              orgIdentifier,
              projectIdentifier,
              repoName: 'testRepo',
              branchName: 'dev',
              commitId: 'abc-xyz'
            })}
          />

          <SidebarLink
            label="RepoPullRequests"
            to={routes.toSCMPullRequests({
              accountId,
              orgIdentifier,
              projectIdentifier,
              repoName: 'testRepo',
              branchName: 'dev'
            })}
          />

          <SidebarLink
            label="RepoPullRequestDetails"
            to={routes.toSCMPullRequestDetails({
              accountId,
              orgIdentifier,
              projectIdentifier,
              repoName: 'testRepo',
              branchName: 'dev',
              pullRequestId: 'adkajdl'
            })}
          />

          <SidebarLink
            label="RepoSettings"
            to={routes.toSCMRepoSettings({
              accountId,
              orgIdentifier,
              projectIdentifier,
              repoName: 'testRepo'
            })}
          />*/}
        </>
      )}
    </Layout.Vertical>
  )
}
