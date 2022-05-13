/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import { Connectors } from '@connectors/constants'

export interface InfraProvisioningWizardProps {
  lastConfiguredWizardStepId?: InfraProvisiongWizardStepId
  stepMetaData?: Map<string, Record<string, any>>
}

export const enum Hosting {
  SaaS = 'SAAS',
  OnPrem = 'ON_PREM'
}

export const enum BuildLocation {
  HostedByHarness = 'HOSTED_BY_HARNESS',
  Kubernetes = 'KUBERNETES',
  AWS = 'AWS',
  DockerRunner = 'DOCKER_RUNNER'
}

export interface BuildLocationDetails {
  icon: IconName
  location: BuildLocation
  label: keyof StringsMap
  details: keyof StringsMap
  approxETAInMins: number
  disabled?: boolean
}

export interface WizardStep {
  stepRender: React.ReactElement
  onClickNext?: () => void
  onClickBack?: () => void
  stepFooterLabel?: keyof StringsMap
}

export enum ProvisioningStatus {
  IN_PROGRESS,
  FAILURE,
  SUCCESS
}

export interface SelectBuildLocationProps {
  selectedHosting?: Hosting
  selectedBuildLocation?: BuildLocationDetails
  provisioningStatus?: ProvisioningStatus
}

export const HostedByHarnessBuildLocation: BuildLocationDetails = {
  icon: 'harness',
  location: BuildLocation.HostedByHarness,
  label: 'ci.getStartedWithCI.hostedByHarness',
  details: 'ci.getStartedWithCI.hostedByHarnessBuildLocation',
  approxETAInMins: 2
}

export const K8sBuildLocation: BuildLocationDetails = {
  icon: 'app-kubernetes',
  location: BuildLocation.Kubernetes,
  label: 'kubernetesText',
  details: 'ci.getStartedWithCI.k8sBuildLocation',
  approxETAInMins: 12
}

export const AllBuildLocationsForOnPrem: BuildLocationDetails[] = [
  K8sBuildLocation,
  {
    icon: 'docker-step',
    location: BuildLocation.DockerRunner,
    label: 'ci.getStartedWithCI.dockerRunner',
    details: 'ci.getStartedWithCI.dockerRunnerBuildLocation',
    approxETAInMins: 2,
    disabled: true
  }
]

export const AllBuildLocationsForSaaS: BuildLocationDetails[] = [
  HostedByHarnessBuildLocation,
  ...AllBuildLocationsForOnPrem
]

export enum InfraProvisiongWizardStepId {
  SelectBuildLocation = 'SELECT_BUILD_LOCATION',
  SelectGitProvider = 'SELECT_GIT_PROVIDER',
  SelectRepository = 'SELECT_REPOSITORY'
}

// TODO Need to use exported StepStatus from uicore -> MultiStepProgressIndicator component
export enum StepStatus {
  ToDo = 'TODO',
  InProgress = 'INPROGRESS',
  Failed = 'FAILED',
  Success = 'SUCCESS'
}

export interface GitProvider {
  icon: IconName
  label: keyof StringsMap
  type: ConnectorInfoDTO['type']
  disabled?: boolean
}

export const AllSaaSGitProviders: GitProvider[] = [
  { icon: 'github', label: 'common.repo_provider.githubLabel', type: Connectors.GITHUB },
  { icon: 'gitlab', label: 'common.repo_provider.gitlabLabel', type: Connectors.GITLAB },
  { icon: 'bitbucket-blue', label: 'common.repo_provider.bitbucketLabel', type: Connectors.BITBUCKET }
]

export const AllOnPremGitProviders: GitProvider[] = [
  ...AllSaaSGitProviders,
  { icon: 'service-github', label: 'ci.getStartedWithCI.genericGit', type: Connectors.GIT }
]

export enum GitAuthenticationMethod {
  OAuth = 'OAUTH',
  AccessToken = 'ACCESS_TOKEN',
  AccessKey = 'ACCESS_KEY',
  UserNameAndApplicationPassword = 'USERNAME_AND_PASSWORD'
}

export interface GitProviderPermission {
  type: ConnectorInfoDTO['type']
  permissions: string[]
}

export const GitProviderPermissions: GitProviderPermission[] = [
  { type: Connectors.GITHUB, permissions: ['repo', 'admin:repo_hook', 'user'] },
  { type: Connectors.BITBUCKET, permissions: ['Issues:read', 'Webhooks:read and write', 'Pull requests:write'] },
  { type: Connectors.GITLAB, permissions: ['api', 'read_repository', 'write_repository'] }
]

export const GitProviderTypeToAuthenticationMethodMapping: Map<ConnectorInfoDTO['type'], GitAuthenticationMethod> =
  new Map([
    [Connectors.GITHUB, GitAuthenticationMethod.AccessToken],
    [Connectors.GITLAB, GitAuthenticationMethod.AccessKey],
    [Connectors.BITBUCKET, GitAuthenticationMethod.UserNameAndApplicationPassword]
  ])
