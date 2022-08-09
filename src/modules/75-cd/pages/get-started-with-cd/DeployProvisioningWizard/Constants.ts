/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName, SelectOption } from '@harness/uicore'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO, UserRepoResponse } from 'services/cd-ng'

import type { StringsMap } from 'stringTypes'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { InfraDeploymentType } from '@cd/components/PipelineSteps/PipelineStepsUtil'

export interface DeployProvisioningWizardProps {
  lastConfiguredWizardStepId?: DeployProvisiongWizardStepId
}

export const enum Hosting {
  SaaS = 'SAAS',
  OnPrem = 'ON_PREM'
}
export interface WizardStep {
  stepRender: React.ReactElement
  onClickNext?: () => void
  onClickBack?: () => void
  stepFooterLabel?: keyof StringsMap
}

export enum ProvisioningStatus {
  TO_DO,
  IN_PROGRESS,
  FAILURE,
  SUCCESS
}

export enum DeployProvisiongWizardStepId {
  SelectArtifact = 'SELECT_ARTIFACT',
  SelectWorkload = 'SELECT_WORKLOAD',
  SelectInfrastructure = 'SELECT_INFRASTRUCTURE',
  CreatePipeline = 'CREATE_PIPELINE'
}

export enum StepStatus {
  ToDo = 'TODO',
  InProgress = 'INPROGRESS',
  Failed = 'FAILED',
  Success = 'SUCCESS'
}

export interface WorkloadType {
  icon: IconName
  label: keyof StringsMap
  value: string
  disabled?: boolean
}

export const WorkloadProviders: WorkloadType[] = [
  {
    label: 'service',
    value: 'service',
    icon: 'service',
    disabled: false
  },
  {
    label: 'multipleService',
    value: 'multiple-service',
    icon: 'multi-service',
    disabled: true
  },
  {
    label: 'functions',
    value: 'functions',
    icon: 'functions',
    disabled: true
  },
  {
    label: 'otherWorkloads',
    value: 'other-workloads',
    icon: 'other-workload',
    disabled: true
  }
]

export interface ServiceDeploymentTypes {
  icon: IconName
  label: keyof StringsMap
  value: string
  disabled?: boolean
}

export const deploymentTypes: ServiceDeploymentTypes[] = [
  {
    label: 'pipeline.serviceDeploymentTypes.kubernetes',
    icon: 'service-kubernetes',
    value: ServiceDeploymentType.Kubernetes,
    disabled: false
  },
  {
    label: 'pipeline.nativeHelm',
    icon: 'service-helm',
    value: ServiceDeploymentType.NativeHelm,
    disabled: true
  },
  {
    label: 'pipeline.serviceDeploymentTypes.ssh',
    icon: 'secret-ssh',
    value: ServiceDeploymentType.Ssh,
    disabled: true
  },
  {
    label: 'pipeline.serviceDeploymentTypes.winrm',
    icon: 'command-winrm',
    value: ServiceDeploymentType.WinRm,
    disabled: true
  },
  {
    label: 'pipeline.serviceDeploymentTypes.azureWebApp',
    icon: 'azurewebapp',
    value: ServiceDeploymentType.AzureWebApp,
    disabled: true
  },
  {
    label: 'pipeline.serviceDeploymentTypes.serverlessAwsLambda',
    icon: 'service-serverless-aws',
    value: ServiceDeploymentType.ServerlessAwsLambda,
    disabled: true
  }
]

export interface InfrastructureType {
  icon: IconName
  label: keyof StringsMap
  value: string
  disabled?: boolean
}

export const InfrastructureTypes: InfrastructureType[] = [
  {
    icon: 'service-kubernetes',
    label: 'pipelineSteps.deploymentTypes.kubernetes',
    value: InfraDeploymentType.KubernetesDirect,
    disabled: false
  },
  {
    label: 'pipelineSteps.deploymentTypes.gk8engine',
    icon: 'google-kubernetes-engine',
    value: InfraDeploymentType.KubernetesGcp,
    disabled: true
  },
  {
    label: 'pipeline.serviceDeploymentTypes.azureWebApp',
    icon: 'azurewebapp',
    value: InfraDeploymentType.AzureWebApp,
    disabled: true
  },
  {
    label: 'cd.steps.azureInfraStep.azure',
    icon: 'microsoft-azure',
    value: InfraDeploymentType.KubernetesAzure,
    disabled: true
  }
]

export interface ArtifactType {
  icon: IconName
  label: keyof StringsMap
  value: string
  disabled?: boolean
  details: keyof StringsMap
}

export const ArtifactProviders: ArtifactType[] = [
  {
    icon: 'service-kubernetes',
    label: 'cd.getStartedWithCD.inManifest',
    details: 'cd.getStartedWithCD.inManifestContent',
    value: 'inManifest',
    disabled: false
  },
  {
    icon: 'git-configure',
    label: 'cd.getStartedWithCD.artifactManifest',
    details: 'cd.getStartedWithCD.artifactManifestContent',
    value: 'artifactManifest',
    disabled: true
  }
]

export interface GitProvider {
  icon: IconName
  label: keyof StringsMap
  type: ConnectorInfoDTO['type']
  disabled?: boolean
}

export const AllSaaSGitProviders: GitProvider[] = [
  { icon: 'github', label: 'common.repo_provider.githubLabel', type: Connectors.GITHUB },
  { icon: 'gitlab', label: 'common.repo_provider.gitlabLabel', type: Connectors.GITLAB },
  { icon: 'bitbucket-blue', label: 'pipeline.manifestType.bitBucketLabel', type: Connectors.BITBUCKET }
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

export const DEFAULT_HARNESS_KMS = 'harnessSecretManager'

export const ACCOUNT_SCOPE_PREFIX = 'account.'

export const OAUTH_REDIRECT_URL_PREFIX = `${location.protocol}//${location.host}/gateway/`

export const getFullRepoName = (repository: UserRepoResponse): string => {
  const { name: repositoryName, namespace } = repository
  return namespace && repositoryName ? `${namespace}/${repositoryName}` : repositoryName ?? ''
}

export enum GitFetchTypes {
  Branch = 'Branch',
  Commit = 'Commit'
}

export const gitFetchTypeList = [
  { label: 'Latest from Branch', value: 'Branch' },
  { label: 'Specific Commit Id / Git Tag', value: 'Commit' }
]

enum CLIENT_KEY_ALGO {
  RSA = 'RSA',
  EC = 'EC'
}

export const CLIENT_KEY_ALGO_OPTIONS: SelectOption[] = [
  {
    label: CLIENT_KEY_ALGO.RSA,
    value: CLIENT_KEY_ALGO.RSA
  },
  {
    label: CLIENT_KEY_ALGO.EC,
    value: CLIENT_KEY_ALGO.EC
  }
]

export enum DelegtaAuthMethod {
  ManualConfig = 'ManualConfig',
  InheritFromDelegate = 'InheritFromDelegate'
}
export const AccessTokenPermissionsDocLinks: Map<ConnectorInfoDTO['type'], string> = new Map([
  [Connectors.GITHUB, 'https://docs.harness.io/article/jd77qvieuw#step_3_credentials'],
  [Connectors.GITLAB, 'https://docs.harness.io/article/5abnoghjgo#password_personal_access_token'],
  [Connectors.BITBUCKET, 'https://docs.harness.io/article/iz5tucdwyu#personal_access_token']
])
