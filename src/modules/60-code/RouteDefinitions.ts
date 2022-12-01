/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ProjectPathProps, RequireField } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'

export interface CODEProps {
  space?: string
  repoPath?: string
  repoName?: string
  gitRef?: string
  resourcePath?: string
  commitRef?: string
  branch?: string
  diffRefs?: string // comparing diff refs, i.e: main...v1.0.1
}

export const codePathProps: Required<CODEPathProps> = {
  ...projectPathProps,
  repoName: ':repoName',
  gitRef: ':gitRef*',
  resourcePath: ':resourcePath*',
  commitRef: ':commitRef*',
  branch: ':branch*',
  diffRefs: ':diffRefs*'
}

export type CODEPathProps = RequireField<
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
  }: RequireField<Pick<CODEProps, 'repoPath' | 'gitRef' | 'resourcePath'>, 'repoPath'>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}${
      gitRef ? '/files/' + gitRef : ''
    }${resourcePath ? '/~/' + resourcePath : ''}`
  },
  toCODEFileEdit: ({
    repoPath,
    gitRef,
    resourcePath
  }: RequireField<Pick<CODEProps, 'repoPath' | 'gitRef' | 'resourcePath'>, 'repoPath' | 'gitRef'>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/edit/${gitRef}/~/${
      resourcePath || ''
    }`
  },
  toCODECommits: ({ repoPath, commitRef }: Required<Pick<CODEProps, 'repoPath' | 'commitRef'>>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/commits${
      commitRef ? '/' + commitRef : ''
    }`
  },
  toCODEBranches: ({ repoPath, branch }: Required<Pick<CODEProps, 'repoPath' | 'branch'>>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/branches${
      branch ? '/' + branch : ''
    }`
  },
  toCODEPullRequests: ({ repoPath }: Required<Pick<CODEProps, 'repoPath'>>) => {
    const [accountId, orgIdentifier, projectIdentifier, repoName] = repoPath.split('/')
    return `/account/${accountId}/code/${orgIdentifier}/${projectIdentifier}/${repoName}/pulls`
  },
  toCODEPullRequestsCompare: ({ repoPath, diffRefs }: Required<Pick<CODEProps, 'repoPath' | 'diffRefs'>>) => {
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
