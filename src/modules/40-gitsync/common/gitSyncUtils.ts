/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import { Connectors } from '@connectors/constants'
import type { GitSyncConfig, ConnectorInfoDTO, GitSyncEntityDTO, EntityGitDetails } from 'services/cd-ng'
import { GitSuffixRegex } from '@common/utils/StringUtils'

export const getGitConnectorIcon = (type: GitSyncConfig['gitConnectorType']): IconName => {
  switch (type) {
    case Connectors.GITHUB:
      return 'github'
    case Connectors.GITLAB:
      return 'service-gotlab'
    case Connectors.BITBUCKET:
      return 'bitbucket-selected'
    default:
      return 'cog'
  }
}

export const modalTypes = {
  GIT_SYNC_REP: 'gitSyncRepo',
  GIT_SYNC_BRANCH: 'gitSyncBranch'
}

export interface ConnectorCardInterface {
  type: ConnectorInfoDTO['type']
  disabled?: boolean
  icon: {
    default: IconName
    selected: IconName
  }
}

export const gitCards: Array<ConnectorCardInterface> = [
  {
    type: Connectors.GITHUB,
    icon: {
      default: 'github-unselected',
      selected: 'github-selected'
    }
  },
  {
    type: Connectors.BITBUCKET,
    icon: {
      default: 'bitbucket-unselected',
      selected: 'bitbucket-selected'
    }
  }
]

export const getRepoPath = (gitRepo: GitSyncConfig): string => {
  let basePath = ''
  switch (gitRepo.gitConnectorType) {
    case Connectors.GITHUB:
      basePath = 'https://github.com/'
      break
    case Connectors.GITLAB:
      basePath = 'https://gitlab.com/'
      break
    case Connectors.BITBUCKET:
      basePath = 'https://bitbucket.com/'
  }

  return gitRepo.repo ? gitRepo.repo.replace(GitSuffixRegex, '').split(basePath)?.[1] ?? '' : ''
}

export const getRepoUrl = (baseUrl: string, repoName: string) => {
  if (!baseUrl) {
    return ''
  }
  if (baseUrl.endsWith('/')) {
    return baseUrl + repoName
  }
  return `${baseUrl}/${repoName}`
}

export const getHarnessFolderPathWithSuffix = (folderPath: string, suffix: string): string => {
  const sanitizedRootFolder = folderPath.split('/').reduce(rootFolderFormatter, '')
  return sanitizedRootFolder.concat(suffix)
}

const rootFolderFormatter = (previousValue: string, currentValue: string): string => {
  /* Convert folder paths like
    /* ///////a/////b////c///// to a/b/c/ */
  /* a/////b////c to a/b/c */
  /* ///////a/////b////c to a/b/c */
  const folderPart = currentValue.trim()
  return folderPart ? `${previousValue}/${folderPart}` : previousValue
}

export const getCompleteGitPath = (repo: string, folderPath: string, suffix: string): string => {
  // Convert repo url like
  /* https://github.com/wings-software/vb.git//// to https://github.com/wings-software/vb */
  /* https://github.com/wings-software/vb.git to https://github.com/wings-software/vb */
  const sanitizedRepo = repo.replace(GitSuffixRegex, '')
  const sanitizedRootFolder = folderPath.split('/').reduce(rootFolderFormatter, '')
  if (sanitizedRootFolder) {
    return sanitizedRepo.endsWith('/')
      ? `${sanitizedRepo}${sanitizedRootFolder.substring(1)}${suffix}`
      : `${sanitizedRepo}${sanitizedRootFolder}${suffix}`
  } else {
    return `${sanitizedRepo}${sanitizedRepo.endsWith('/') ? suffix.substring(1) : suffix}`
  }
  return ''
}

export const getExternalUrl = (config: GitSyncConfig, folderPath?: string): string => {
  const { repo, branch, gitConnectorType } = config
  if (!repo || !branch || !folderPath) {
    return ''
  }
  switch (gitConnectorType) {
    case Connectors.GITHUB:
      return `${repo}/tree/${branch}${folderPath.startsWith('/') ? '' : '/'}${folderPath}`
    case Connectors.BITBUCKET:
      return `${repo}/src/${branch}${folderPath.startsWith('/') ? '' : '/'}${folderPath}`
    default:
      return ''
  }
}

export const getEntityUrl = (entity: GitSyncEntityDTO): string => {
  const { repoUrl, folderPath, branch, entityGitPath } = entity
  if (repoUrl && branch && folderPath && entityGitPath) {
    return `${repoUrl}/blob/${branch}${folderPath.startsWith('/') ? '' : '/'}${folderPath}${entityGitPath}`
  } else {
    return ''
  }
}

export const getRepoEntityObject = (
  repo: GitSyncConfig | undefined,
  gitDetails: EntityGitDetails
): GitSyncEntityDTO => {
  return {
    repoUrl: repo?.repo,
    folderPath: gitDetails?.rootFolder,
    branch: repo?.branch,
    entityGitPath: gitDetails?.filePath
  }
}
