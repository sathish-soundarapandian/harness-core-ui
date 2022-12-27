/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ProjectPathProps, RequiredField } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

export interface CODEProps {
  space?: string
  repoPath?: string
  repoName?: string
  gitRef?: string
  resourcePath?: string
  commitRef?: string
  branch?: string
  diffRefs?: string // comparing diff refs, i.e: main...v1.0.1
  pullRequestId?: string
  pullRequestSection?: string // commits | diffs | checks ...
}

export type CODEPathProps = RequiredField<
  Partial<Pick<ProjectPathProps, 'accountId' | 'orgIdentifier' | 'projectIdentifier'>>,
  'accountId' | 'orgIdentifier' | 'projectIdentifier'
> &
  Omit<CODEProps, 'space' | 'repoPath'>

export default {
  toCODE: routes.toCODE,
  toCODEHome: routes.toCODEHome,
  toCODERepositories: ({ space }: Required<Pick<CODEProps, 'space'>>) => {
    const [accountId, orgIdentifier, projectIdentifier] = space.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}`
  },
  toCODERepository: ({
    repoPath,
    gitRef,
    resourcePath
  }: RequiredField<Pick<CODEProps, 'repoPath' | 'gitRef' | 'resourcePath'>, 'repoPath'>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}${
      gitRef ? '/files/' + gitRef : ''
    }${resourcePath ? '/~/' + resourcePath : ''}`
  },
  toCODEFileEdit: ({
    repoPath,
    gitRef,
    resourcePath
  }: RequiredField<Pick<CODEProps, 'repoPath' | 'gitRef' | 'resourcePath'>, 'repoPath' | 'gitRef'>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/edit/${gitRef}/~/${
      resourcePath || ''
    }`
  },
  toCODECommits: ({ repoPath, commitRef }: RequiredField<Pick<CODEProps, 'repoPath' | 'commitRef'>, 'repoPath'>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/commits${
      commitRef ? '/' + commitRef : ''
    }`
  },
  toCODEBranches: ({ repoPath }: Required<Pick<CODEProps, 'repoPath'>>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/branches`
  },
  toCODEPullRequests: ({ repoPath }: Required<Pick<CODEProps, 'repoPath'>>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/pulls`
  },
  toCODEPullRequest: ({
    repoPath,
    pullRequestId,
    pullRequestSection
  }: RequiredField<
    Pick<CODEProps, 'repoPath' | 'pullRequestId' | 'pullRequestSection'>,
    'repoPath' | 'pullRequestId'
  >) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/pulls/${pullRequestId}${
      pullRequestSection ? '/' + pullRequestSection : ''
    }`
  },
  toCODECompare: ({ repoPath, diffRefs }: Required<Pick<CODEProps, 'repoPath' | 'diffRefs'>>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/pulls/compare/${diffRefs}`
  },
  toCODESettings: ({ repoPath }: Required<Pick<CODEProps, 'repoPath'>>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/settings`
  },
  toCODECreateWebhook: ({ repoPath }: Required<Pick<CODEProps, 'repoPath'>>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/settings/webhook/new`
  }
}
