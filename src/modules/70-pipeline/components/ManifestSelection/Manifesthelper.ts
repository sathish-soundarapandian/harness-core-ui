/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Schema } from 'yup'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'
import { Connectors } from '@connectors/constants'
import type { ConnectorConfigDTO, ConnectorInfoDTO, ServiceDefinition } from 'services/cd-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import type { StringKeys } from 'framework/strings'
import { NameSchema } from '@common/utils/Validation'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import {
  buildAzureRepoPayload,
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type {
  CLIVersionOptions,
  HelmVersionOptions,
  ManifestStores,
  ManifestStoreWithoutConnector,
  ManifestTypes,
  PrimaryManifestType
} from './ManifestInterface'

export type ReleaseRepoPipeline = PipelineInfoConfig & { gitOpsEnabled: boolean }

export const isManifestAdditionAllowed = (deploymentType: ServiceDefinition['type']): boolean => {
  return !(
    deploymentType === ServiceDeploymentType.Ssh ||
    deploymentType === ServiceDeploymentType.WinRm ||
    deploymentType === ServiceDeploymentType.AzureWebApp
  )
}

export const showAddManifestBtn = (
  isReadonly: boolean,
  allowOnlyOne: boolean,
  listOfManifests: Array<any>,
  deploymentType?: ServiceDefinition['type']
): boolean => {
  if (allowOnlyOne && listOfManifests.length >= 1) {
    return false
  }
  if (deploymentType) {
    return !isReadonly && isManifestAdditionAllowed(deploymentType)
  }
  return !isReadonly
}

export const ManifestDataType: Record<ManifestTypes, ManifestTypes> = {
  K8sManifest: 'K8sManifest',
  Values: 'Values',
  HelmChart: 'HelmChart',
  Kustomize: 'Kustomize',
  OpenshiftTemplate: 'OpenshiftTemplate',
  OpenshiftParam: 'OpenshiftParam',
  KustomizePatches: 'KustomizePatches',
  ServerlessAwsLambda: 'ServerlessAwsLambda',
  EcsTaskDefinition: 'EcsTaskDefinition',
  EcsServiceDefinition: 'EcsServiceDefinition',
  EcsScalingPolicyDefinition: 'EcsScalingPolicyDefinition',
  EcsScalableTargetDefinition: 'EcsScalableTargetDefinition',
  TasManifest: 'TasManifest',
  TasVars: 'TasVars',
  TasAutoScaler: 'TasAutoScaler',
  AsgConfiguration: 'AsgConfiguration',
  AsgLaunchTemplate: 'AsgLaunchTemplate',
  AsgScalingPolicy: 'AsgScalingPolicy',
  AsgScheduledUpdateGroupAction: 'AsgScheduledUpdateGroupAction'
}

export const TASManifestTypes = [ManifestDataType.TasManifest, ManifestDataType.TasVars, ManifestDataType.TasAutoScaler]
export const TASManifestAllowedPaths = [ManifestDataType.TasVars, ManifestDataType.TasAutoScaler]

export const ManifestToPathMap: Record<PrimaryManifestType, string> = {
  K8sManifest: 'Values',
  HelmChart: 'Values',
  OpenshiftTemplate: 'OpenshiftParam',
  Kustomize: 'KustomizePatches',
  TasVars: 'Vars',
  TasAutoScaler: 'AutoScaler'
}
export const ManifestToPathLabelMap: Record<PrimaryManifestType, StringKeys> = {
  K8sManifest: 'pipeline.manifestType.valuesYamlPath',
  HelmChart: 'pipeline.manifestType.valuesYamlPath',
  OpenshiftTemplate: 'pipeline.manifestType.paramsYamlPath',
  Kustomize: 'pipeline.manifestTypeLabels.KustomizePatches',
  TasVars: 'pipeline.manifestType.addVarsYAMLPath',
  TasAutoScaler: 'pipeline.manifestType.addAutoScalerYAMLPath'
}
export const ManifestToPathKeyMap: Record<PrimaryManifestType, string> = {
  K8sManifest: 'valuesPaths',
  HelmChart: 'valuesPaths',
  OpenshiftTemplate: 'paramsPaths',
  Kustomize: 'patchesPaths',
  TasVars: 'varsPaths',
  TasAutoScaler: 'autoScalerPath'
}

export const ManifestStoreMap: { [key: string]: ManifestStores } = {
  Git: 'Git',
  Github: 'Github',
  GitLab: 'GitLab',
  Bitbucket: 'Bitbucket',
  Http: 'Http',
  OciHelmChart: 'OciHelmChart',
  S3: 'S3',
  Gcs: 'Gcs',
  InheritFromManifest: 'InheritFromManifest',
  Inline: 'Inline',
  Harness: 'Harness',
  CustomRemote: 'CustomRemote',
  AzureRepo: 'AzureRepo'
}

export const allowedManifestTypes: Record<string, Array<ManifestTypes>> = {
  Kubernetes: [
    ManifestDataType.K8sManifest,
    ManifestDataType.Values,
    ManifestDataType.HelmChart,
    ManifestDataType.OpenshiftTemplate,
    ManifestDataType.OpenshiftParam,
    ManifestDataType.Kustomize,
    ManifestDataType.KustomizePatches
  ],
  NativeHelm: [ManifestDataType.Values, ManifestDataType.HelmChart],
  ServerlessAwsLambda: [ManifestDataType.ServerlessAwsLambda],
  Ssh: [],
  WinRm: [],
  AzureWebApp: [],
  ECS: [
    ManifestDataType.EcsTaskDefinition,
    ManifestDataType.EcsServiceDefinition,
    ManifestDataType.EcsScalingPolicyDefinition,
    ManifestDataType.EcsScalableTargetDefinition
  ],
  TAS: TASManifestTypes,
  Asg: [
    ManifestDataType.AsgLaunchTemplate,
    ManifestDataType.AsgConfiguration,
    ManifestDataType.AsgScalingPolicy,
    ManifestDataType.AsgScheduledUpdateGroupAction
  ],
  CustomDeployment: []
}

export const gitStoreTypes: Array<ManifestStores> = [
  ManifestStoreMap.Git,
  ManifestStoreMap.Github,
  ManifestStoreMap.GitLab,
  ManifestStoreMap.Bitbucket
]

export const gitStoreTypesWithHarnessStoreType: Array<ManifestStores> = [...gitStoreTypes, ManifestStoreMap.Harness]

export const ManifestTypetoStoreMap: Record<ManifestTypes, ManifestStores[]> = {
  K8sManifest: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.AzureRepo, ManifestStoreMap.CustomRemote],
  Values: [
    ...gitStoreTypes,
    ManifestStoreMap.AzureRepo,
    ManifestStoreMap.InheritFromManifest,
    ManifestStoreMap.Harness,
    ManifestStoreMap.CustomRemote
  ],
  HelmChart: [
    ...gitStoreTypes,
    ManifestStoreMap.AzureRepo,
    ManifestStoreMap.Http,
    ManifestStoreMap.OciHelmChart,
    ManifestStoreMap.S3,
    ManifestStoreMap.Gcs,
    ManifestStoreMap.Harness,
    ManifestStoreMap.CustomRemote
  ],
  OpenshiftTemplate: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.AzureRepo, ManifestStoreMap.CustomRemote],
  OpenshiftParam: [
    ...gitStoreTypes,
    ManifestStoreMap.AzureRepo,
    ManifestStoreMap.InheritFromManifest,
    ManifestStoreMap.Harness,
    ManifestStoreMap.CustomRemote
  ],
  Kustomize: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.AzureRepo],
  KustomizePatches: [
    ...gitStoreTypes,
    ManifestStoreMap.AzureRepo,
    ManifestStoreMap.InheritFromManifest,
    ManifestStoreMap.Harness
  ],
  ServerlessAwsLambda: [...gitStoreTypes, ManifestStoreMap.S3],
  EcsTaskDefinition: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.S3],
  EcsServiceDefinition: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.S3],
  EcsScalingPolicyDefinition: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.S3],
  EcsScalableTargetDefinition: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.S3],
  TasManifest: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.CustomRemote],
  TasVars: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.CustomRemote],
  TasAutoScaler: [...gitStoreTypesWithHarnessStoreType, ManifestStoreMap.CustomRemote],
  AsgLaunchTemplate: gitStoreTypesWithHarnessStoreType,
  AsgConfiguration: gitStoreTypesWithHarnessStoreType,
  AsgScalingPolicy: gitStoreTypesWithHarnessStoreType,
  AsgScheduledUpdateGroupAction: gitStoreTypesWithHarnessStoreType
}

export const manifestTypeIcons: Record<ManifestTypes, IconName> = {
  K8sManifest: 'service-kubernetes',
  Values: 'functions',
  HelmChart: 'service-helm',
  Kustomize: 'kustamize',
  OpenshiftTemplate: 'openshift',
  OpenshiftParam: 'openshift-params',
  KustomizePatches: 'kustomizeparam',
  ServerlessAwsLambda: 'service-serverless-aws',
  EcsTaskDefinition: 'service-amazon-ecs',
  EcsServiceDefinition: 'service-amazon-ecs',
  EcsScalingPolicyDefinition: 'service-amazon-ecs',
  EcsScalableTargetDefinition: 'service-amazon-ecs',
  TasManifest: 'tas-manifest',
  TasVars: 'list-vars',
  TasAutoScaler: 'autoScaler',
  AsgLaunchTemplate: 'aws-asg',
  AsgConfiguration: 'aws-asg',
  AsgScalingPolicy: 'aws-asg',
  AsgScheduledUpdateGroupAction: 'aws-asg'
}

export const manifestTypeLabels: Record<ManifestTypes, StringKeys> = {
  K8sManifest: 'pipeline.manifestTypeLabels.K8sManifest',
  Values: 'pipeline.manifestTypeLabels.ValuesYaml',
  HelmChart: 'pipeline.manifestTypeLabels.HelmChartLabel',
  Kustomize: 'pipeline.manifestTypeLabels.KustomizeLabel',
  OpenshiftTemplate: 'pipeline.manifestTypeLabels.OpenshiftTemplate',
  OpenshiftParam: 'pipeline.manifestTypeLabels.OpenshiftParam',
  KustomizePatches: 'pipeline.manifestTypeLabels.KustomizePatches',
  ServerlessAwsLambda: 'pipeline.manifestTypeLabels.ServerlessAwsLambda',
  EcsTaskDefinition: 'pipeline.manifestTypeLabels.EcsTaskDefinition',
  EcsServiceDefinition: 'pipeline.manifestTypeLabels.EcsServiceDefinition',
  EcsScalingPolicyDefinition: 'pipeline.manifestTypeLabels.EcsScalingPolicyDefinition',
  EcsScalableTargetDefinition: 'pipeline.manifestTypeLabels.EcsScalableTargetDefinition',
  TasManifest: 'pipeline.manifestTypeLabels.TASManifest',
  TasVars: 'pipeline.manifestTypeLabels.VarsYAML',
  TasAutoScaler: 'pipeline.manifestTypeLabels.Autoscaler',
  AsgLaunchTemplate: 'pipeline.manifestTypeLabels.AsgLaunchTemplate',
  AsgConfiguration: 'pipeline.manifestTypeLabels.AsgConfiguration',
  AsgScalingPolicy: 'pipeline.manifestTypeLabels.AsgScalingPolicy',
  AsgScheduledUpdateGroupAction: 'pipeline.manifestTypeLabels.AsgScheduledUpdateGroupAction'
}

export const helmVersions: Array<{ label: string; value: HelmVersionOptions }> = [
  { label: 'Version 2', value: 'V2' },
  { label: 'Version 3', value: 'V3' }
]

export const cfCliVersions: Array<{ label: string; value: CLIVersionOptions }> = [
  { label: 'CLI Version 7.0', value: 'V7' }
]

export const ManifestIconByType: Record<ManifestStores, IconName> = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Http: 'service-helm',
  OciHelmChart: 'helm-oci',
  S3: 'service-service-s3',
  Gcs: 'gcs-step',
  InheritFromManifest: 'custom-artifact',
  Inline: 'custom-artifact',
  Harness: 'harness',
  CustomRemote: 'custom-remote-manifest',
  AzureRepo: 'service-azure'
}

export const ManifestStoreTitle: Record<ManifestStores, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  Http: 'pipeline.manifestType.httpHelmRepoConnectorLabel',
  OciHelmChart: 'pipeline.manifestType.ociHelmConnectorLabel',
  S3: 'connectors.S3',
  Gcs: 'connectors.GCS.fullName',
  InheritFromManifest: 'pipeline.manifestType.InheritFromManifest',
  Inline: 'inline',
  Harness: 'harness',
  CustomRemote: 'pipeline.manifestType.customRemote',
  AzureRepo: 'pipeline.manifestType.azureRepoConnectorLabel'
}

export const ManifestToConnectorMap: Record<ManifestStores | string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Http: Connectors.HttpHelmRepo,
  OciHelmChart: Connectors.OciHelmRepo,
  S3: Connectors.AWS,
  Gcs: Connectors.GCP,
  AzureRepo: Connectors.AZURE_REPO
}

export const ManifestToConnectorLabelMap: Record<ManifestStoreWithoutConnector, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  Http: 'connectors.title.helmConnector',
  OciHelmChart: 'connectors.title.ociHelmConnector',
  S3: 'pipeline.manifestToConnectorLabelMap.AWSLabel',
  Gcs: 'common.gcp',
  AzureRepo: 'pipeline.manifestType.azureRepoConnectorLabel'
}

export enum GitRepoName {
  Account = 'Account',
  Repo = 'Repo'
}

export enum GitFetchTypes {
  Branch = 'Branch',
  Commit = 'Commit'
}

export const gitFetchTypeList = [
  { label: 'Latest from Branch', value: 'Branch' },
  { label: 'Specific Commit Id / Git Tag', value: 'Commit' }
]

export const ManifestIdentifierValidation = (
  manifestNames: Array<string>,
  id: string | undefined,
  validationMsg: string
): { identifier: Schema<unknown> } => {
  if (!id) {
    return {
      identifier: NameSchema().notOneOf(manifestNames, validationMsg)
    }
  }
  return {
    identifier: NameSchema()
  }
}

export const doesStorehasConnector = (selectedStore: ManifestStoreWithoutConnector): boolean => {
  return [
    ManifestStoreMap.InheritFromManifest,
    ManifestStoreMap.Harness,
    ManifestStoreMap.Inline,
    ManifestStoreMap.CustomRemote
  ].includes(selectedStore)
}

export function isConnectorStoreType(): boolean {
  return !(ManifestStoreMap.InheritFromManifest || ManifestStoreMap.Harness || ManifestStoreMap.Inline,
  ManifestStoreMap.CustomRemote)
}
export const isGitTypeManifestStore = (manifestStore: ManifestStores): boolean =>
  [
    ManifestStoreMap.Git,
    ManifestStoreMap.Github,
    ManifestStoreMap.GitLab,
    ManifestStoreMap.Bitbucket,
    ManifestStoreMap.AzureRepo
  ].includes(manifestStore)
export const isECSTypeManifest = (selectedManifest: ManifestTypes): boolean =>
  [
    ManifestDataType.EcsTaskDefinition,
    ManifestDataType.EcsServiceDefinition,
    ManifestDataType.EcsScalingPolicyDefinition,
    ManifestDataType.EcsScalableTargetDefinition
  ].includes(selectedManifest)
export function getManifestLocation(manifestType: ManifestTypes, manifestStore: ManifestStores): string {
  switch (true) {
    case manifestStore === ManifestStoreMap.Harness:
      return 'store.spec.files'
    case manifestStore === ManifestStoreMap.CustomRemote:
      return 'store.spec.filePath'
    case [
      ManifestDataType.K8sManifest,
      ManifestDataType.Values,
      ManifestDataType.KustomizePatches,
      ManifestDataType.OpenshiftParam,
      ManifestDataType.OpenshiftTemplate,
      ManifestDataType.ServerlessAwsLambda,
      ManifestDataType.EcsTaskDefinition,
      ManifestDataType.EcsServiceDefinition,
      ManifestDataType.EcsScalableTargetDefinition,
      ManifestDataType.EcsScalingPolicyDefinition,
      ManifestDataType.AsgLaunchTemplate,
      ManifestDataType.AsgConfiguration,
      ManifestDataType.AsgScalingPolicy,
      ManifestDataType.AsgScheduledUpdateGroupAction
    ].includes(manifestType):
      return 'store.spec.paths'
    case manifestType === ManifestDataType.Kustomize:
    case manifestType === ManifestDataType.HelmChart &&
      ([ManifestStoreMap.S3, ManifestStoreMap.Gcs].includes(manifestStore) || isGitTypeManifestStore(manifestStore)):
      return 'store.spec.folderPath'
    case manifestType === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.Http:
      return 'chartName'
    default:
      return 'paths'
  }
}
export const getBuildPayload = (type: ConnectorInfoDTO['type']) => {
  switch (type) {
    case Connectors.GIT:
      return buildGitPayload
    case Connectors.GITHUB:
      return buildGithubPayload
    case Connectors.BITBUCKET:
      return buildBitbucketPayload
    case Connectors.GITLAB:
      return buildGitlabPayload
    case Connectors.AZURE_REPO:
      return buildAzureRepoPayload
    default:
      return () => ({})
  }
}

export const getManifestsHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  return `${selectedDeploymentType}DeploymentTypeManifests`
}

const getConnectorRef = (prevStepData: ConnectorConfigDTO): string => {
  return getMultiTypeFromValue(prevStepData.connectorRef) !== MultiTypeInputType.FIXED
    ? prevStepData.connectorRef
    : prevStepData.connectorRef?.value
}

const getConnectorId = (prevStepData?: ConnectorConfigDTO): string => {
  return prevStepData?.identifier ? prevStepData?.identifier : ''
}

export const getConnectorRefOrConnectorId = (prevStepData?: ConnectorConfigDTO): string => {
  return prevStepData?.connectorRef ? getConnectorRef(prevStepData) : getConnectorId(prevStepData)
}
