import type { IconName } from '@harness/icons'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import { Connectors } from '@connectors/constants'

export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket'
export const AllowedTypes: Array<ConnectorTypes> = ['Git', 'Github', 'GitLab', 'Bitbucket']

export const ConnectorIcons: Record<string, IconName> = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET
}

export const ConnectorLabelMap: Record<ConnectorTypes, keyof StringsMap> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel'
}

export enum GitRepoName {
  Account = 'Account',
  Repo = 'Repo'
}

export const gitFetchTypeList = [
  { label: 'Latest from Branch', value: 'Branch' },
  { label: 'Specific Commit Id / Git Tag', value: 'Commit' }
]

export enum GitFetchTypes {
  Branch = 'Branch',
  Commit = 'Commit'
}
