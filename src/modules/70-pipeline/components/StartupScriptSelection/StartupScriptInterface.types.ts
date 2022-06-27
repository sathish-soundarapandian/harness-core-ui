import { Connectors } from "@connectors/constants"
import type { StringKeys } from "framework/strings"
import type { ConnectorInfoDTO, ServiceDefinition } from "services/cd-ng"

export const AllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket', 'Artifactory']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Artifactory'

export const ConnectorIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Artifactory: 'service-artifactory'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Artifactory: Connectors.ARTIFACTORY
}

export const ConnectorLabelMap: Record<ConnectorTypes, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  Artifactory: 'connectors.artifactory.artifactoryLabel'
}

export interface StartupScriptSelectionProps {
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  isReadonlyServiceMode: boolean
  readonly: boolean
}
