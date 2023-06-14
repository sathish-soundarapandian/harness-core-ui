/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, isEmpty, omit, pick, set } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import type { SelectOption } from '@harness/uicore'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'
import type {
  GraphLayoutNode,
  PipelineExecutionSummary,
  PipelineInfoConfig,
  StageElementConfig,
  StageElementWrapperConfig
} from 'services/pipeline-ng'
import type { StringKeys } from 'framework/strings'
import type {
  GetExecutionStrategyYamlQueryParams,
  Infrastructure,
  ServerlessAwsLambdaInfrastructure,
  ServiceDefinition,
  CustomDeploymentServiceSpec
} from 'services/cd-ng'
import { CIBuildInfrastructureType, connectorTypes } from '@pipeline/utils/constants'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getStageFromPipeline as getStageByPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/helpers'
import type { CIInfraDetails, DependencyElement } from 'services/ci'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'

import type { InputSetDTO } from './types'
import type { DeploymentStageElementConfig, PipelineStageWrapper, StageElementWrapper } from './pipelineTypes'
import type { TemplateServiceDataType } from './templateUtils'
import type { ExecutionStatus } from './statusHelpers'

export enum StageType {
  DEPLOY = 'Deployment',
  BUILD = 'CI',
  FEATURE = 'FeatureFlag',
  PIPELINE = 'Pipeline',
  APPROVAL = 'Approval',
  CUSTOM = 'Custom',
  Template = 'Template',
  SECURITY = 'SecurityTests',
  MATRIX = 'MATRIX',
  LOOP = 'LOOP',
  PARALLELISM = 'PARALLELISM',
  IACM = 'IACM',
  PIPELINE_ROLLBACK = 'PipelineRollback'
}

export enum ServiceDeploymentType {
  Kubernetes = 'Kubernetes',
  KubernetesGitops = 'KubernetesGitops',
  NativeHelm = 'NativeHelm',
  amazonAmi = 'amazonAmi',
  awsCodeDeploy = 'awsCodeDeploy',
  WinRm = 'WinRm',
  awsLambda = 'awsLambda',
  TAS = 'TAS',
  Pdc = 'Pdc',
  Ssh = 'Ssh',
  CustomDeployment = 'CustomDeployment',
  ServerlessAwsLambda = 'ServerlessAwsLambda',
  ServerlessAzureFunctions = 'ServerlessAzureFunctions',
  ServerlessGoogleFunctions = 'ServerlessGoogleFunctions',
  AmazonSAM = 'AwsSAM',
  AzureFunctions = 'AzureFunctions',
  AzureWebApp = 'AzureWebApp',
  ECS = 'ECS',
  Elastigroup = 'Elastigroup',
  SshWinRmAws = 'SshWinRmAws',
  SshWinRmAzure = 'SshWinRmAzure',
  Asg = 'Asg',
  GoogleCloudFunctions = 'GoogleCloudFunctions',
  AwsLambda = 'AwsLambda',
  AwsSam = 'AWS_SAM'
}

export enum RepositoryFormatTypes {
  Generic = 'generic',
  Docker = 'docker',
  Maven = 'maven',
  NPM = 'npm',
  NuGet = 'nuget',
  Raw = 'raw'
}

export const stageGroupTypes = [StageType.PIPELINE, StageType.PIPELINE_ROLLBACK]

const commonRepoFormatTypes = [
  { label: 'Maven', value: RepositoryFormatTypes.Maven },
  { label: 'NPM', value: RepositoryFormatTypes.NPM },
  { label: 'NuGet', value: RepositoryFormatTypes.NuGet }
]

export const nexus2RepositoryFormatTypes = [...commonRepoFormatTypes]

export const rawRepoFormat = [{ label: 'Raw', value: RepositoryFormatTypes.Raw }]

export const nexus3RepositoryFormatTypes = [...commonRepoFormatTypes, ...rawRepoFormat]

export const k8sRepositoryFormatTypes = [{ label: 'Docker', value: RepositoryFormatTypes.Docker }]

export const repositoryFormats = [
  { label: 'Generic', value: RepositoryFormatTypes.Generic },
  { label: 'Docker', value: RepositoryFormatTypes.Docker }
]

export type ServerlessGCPInfrastructure = Infrastructure & {
  connectorRef: string
  metadata?: string
  stage: string
}

export type ServerlessAzureInfrastructure = Infrastructure & {
  connectorRef: string
  metadata?: string
  stage: string
}
export type ServerlessInfraTypes =
  | ServerlessGCPInfrastructure
  | ServerlessAzureInfrastructure
  | ServerlessAwsLambdaInfrastructure

// ignore these ci keys which are map structure, allowing '' value rather than <+input> re-assigned as the value
const ignoreKeys = ['envVariables', 'settings', 'portBindings', 'buildArgs', 'labels']

export const changeEmptyValuesToRunTimeInput = (inputset: any, propertyKey: string): InputSetDTO => {
  if (inputset) {
    Object.keys(inputset).forEach(key => {
      if (typeof inputset[key] === 'object') {
        changeEmptyValuesToRunTimeInput(inputset[key], key)
      } else if (inputset[key] === '' && ['tags', ...ignoreKeys].indexOf(propertyKey) === -1) {
        inputset[key] = '<+input>'
      }
    })
  }
  return inputset
}

export function isCDStage(node?: GraphLayoutNode): boolean {
  return node?.nodeType === StageType.DEPLOY || node?.module === 'cd' || !isEmpty(node?.moduleInfo?.cd)
}

export function isCIStage(node?: GraphLayoutNode): boolean {
  return node?.nodeType === StageType.BUILD || node?.module === 'ci' || !isEmpty(node?.moduleInfo?.ci)
}

export function hasCDStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('cd') || !isEmpty(pipelineExecution?.moduleInfo?.cd)
}

export function hasIACMStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('iacm') || !isEmpty(pipelineExecution?.moduleInfo?.iacm)
}

export function hasServiceDetail(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('serviceDetail') || false
}

export function hasOverviewDetail(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('overviewPage') || false
}

export function hasCIStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('ci') || !isEmpty(pipelineExecution?.moduleInfo?.ci)
}

export function pipelineHasCIStageWithK8sInfra(pipelineExecution?: PipelineExecutionSummary): boolean {
  const infras: CIInfraDetails[] = get(pipelineExecution, 'moduleInfo.ci.infraDetailsList', [])
  return (
    infras.findIndex(
      (stageInfra: CIInfraDetails) => stageInfra.infraType === CIBuildInfrastructureType.KubernetesDirect
    ) !== -1
  )
}

export function hasSTOStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return (
    pipelineExecution?.modules?.includes('sto') ||
    pipelineExecution?.modules?.includes('ci') ||
    !isEmpty(pipelineExecution?.moduleInfo?.sto)
  )
}

const areMultipleInvalidFieldsPresent = (
  invalidFields: string[],
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false,
  defaultErrorMessage = '',
  entity: any
) => {
  return `${invalidFields.length > 1 ? invalidFields.join(', ') : invalidFields[0]} ${
    invalidFields.length > 1 ? ' are ' : ' is '
  } ${
    defaultErrorMessage
      ? defaultErrorMessage
      : isServerlessDeploymentTypeSelected
      ? getString('pipeline.artifactPathDependencyRequired')
      : getString(entity)
  }`
}
export const getHelperTextString = (
  invalidFields: string[],
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false,
  defaultErrorMessage = ''
): string => {
  return areMultipleInvalidFieldsPresent(
    invalidFields,
    getString,
    isServerlessDeploymentTypeSelected,
    defaultErrorMessage,
    'pipeline.tagDependencyRequired'
  )
}

export const getHelperTextStringForDigest = (
  invalidFields: string[],
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false,
  defaultErrorMessage = ''
): string => {
  return areMultipleInvalidFieldsPresent(
    invalidFields,
    getString,
    isServerlessDeploymentTypeSelected,
    defaultErrorMessage,
    'pipeline.digestDependencyRequired'
  )
}

export const getHelpeTextForTags = (
  fields: {
    imagePath?: string
    artifactPath?: string
    region?: string
    connectorRef: string
    registryHostname?: string
    repository?: string
    repositoryPort?: number
    artifactDirectory?: string
    registry?: string
    subscriptionId?: string
    repositoryName?: string
    package?: string
    project?: string
    repositoryFormat?: RepositoryFormatTypes
    artifactId?: string
    groupId?: string
    packageName?: string
    artifactArrayPath?: string
    versionPath?: string
    feed?: string
  },
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false,
  defaultErrorMessage = ''
): string | undefined => {
  const {
    connectorRef,
    region,
    imagePath,
    artifactPath,
    registryHostname,
    repository,
    repositoryPort,
    artifactDirectory,
    registry,
    subscriptionId,
    repositoryName,
    package: packageVal,
    project,
    repositoryFormat,
    artifactId,
    groupId,
    packageName,
    feed,
    artifactArrayPath,
    versionPath
  } = fields
  const invalidFields: string[] = []
  if (!connectorRef || getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME) {
    invalidFields.push(getString('connector'))
  }
  if (feed !== undefined && (!feed || getMultiTypeFromValue(feed) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.artifactsSelection.feed'))
  }
  if (
    repositoryName !== undefined &&
    (!repositoryName || getMultiTypeFromValue(repositoryName) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('common.repositoryName'))
  }
  if (
    artifactArrayPath !== undefined &&
    (!artifactArrayPath || getMultiTypeFromValue(artifactArrayPath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.artifactsArrayPath'))
  }
  if (
    versionPath !== undefined &&
    (!versionPath || getMultiTypeFromValue(versionPath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.versionPath'))
  }
  if (
    packageName !== undefined &&
    (!packageName || getMultiTypeFromValue(packageName) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.testsReports.callgraphField.package'))
  }
  if (packageVal !== undefined && (!packageVal || getMultiTypeFromValue(packageVal) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.testsReports.callgraphField.package'))
  }
  if (project !== undefined && (!project || getMultiTypeFromValue(project) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('projectLabel'))
  }
  if (region !== undefined && (!region || getMultiTypeFromValue(region) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('regionLabel'))
  }
  if (
    registryHostname !== undefined &&
    (!registryHostname || getMultiTypeFromValue(registryHostname) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('connectors.GCR.registryHostname'))
  }
  if (
    !isServerlessDeploymentTypeSelected &&
    (imagePath === '' || getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.imagePathLabel'))
  }
  if (
    !isServerlessDeploymentTypeSelected &&
    (artifactPath === '' || getMultiTypeFromValue(artifactPath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactPathLabel'))
  }
  if (repository !== undefined && (!repository || getMultiTypeFromValue(repository) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('repository'))
  }
  if (
    repositoryPort !== undefined &&
    (!repositoryPort || getMultiTypeFromValue(repositoryPort) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.repositoryPort'))
  }
  if (
    isServerlessDeploymentTypeSelected &&
    (!artifactDirectory || getMultiTypeFromValue(artifactDirectory) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.artifactDirectory'))
  }

  if (registry !== undefined && (!registry || getMultiTypeFromValue(registry) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.ACR.registry'))
  }

  if (
    repositoryFormat !== undefined &&
    (!repositoryFormat || getMultiTypeFromValue(repositoryFormat) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('common.repositoryFormat'))
  }

  if (artifactId !== undefined && (!artifactId || getMultiTypeFromValue(artifactId) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.artifactsSelection.artifactId'))
  }

  if (groupId !== undefined && (!groupId || getMultiTypeFromValue(groupId) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.artifactsSelection.groupId'))
  }

  if (
    subscriptionId !== undefined &&
    (!subscriptionId || getMultiTypeFromValue(subscriptionId) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.ACR.subscription'))
  }

  const helpText = getHelperTextString(
    invalidFields,
    getString,
    isServerlessDeploymentTypeSelected,
    defaultErrorMessage
  )

  return invalidFields.length > 0 ? helpText : undefined
}

export const getHelperTextForDigest = (
  fields: {
    imagePath?: string
    artifactPath?: string
    region?: string
    connectorRef: string
    registryHostname?: string
    repository?: string
    repositoryPort?: number
    artifactDirectory?: string
    registry?: string
    subscriptionId?: string
    repositoryName?: string
    package?: string
    project?: string
    repositoryFormat?: RepositoryFormatTypes
    artifactId?: string
    groupId?: string
    packageName?: string
    artifactArrayPath?: string
    versionPath?: string
    feed?: string
    tag?: string
    version?: string
  },
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false,
  defaultErrorMessage = ''
): string | undefined => {
  const {
    connectorRef,
    region,
    imagePath,
    artifactPath,
    registryHostname,
    repository,
    repositoryPort,
    artifactDirectory,
    registry,
    subscriptionId,
    repositoryName,
    package: packageVal,
    project,
    repositoryFormat,
    artifactId,
    groupId,
    packageName,
    feed,
    artifactArrayPath,
    versionPath,
    tag,
    version
  } = fields
  const invalidFields: string[] = []
  if (!connectorRef || getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME) {
    invalidFields.push(getString('connector'))
  }
  if (feed !== undefined && (!feed || getMultiTypeFromValue(feed) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.artifactsSelection.feed'))
  }
  if (
    repositoryName !== undefined &&
    (!repositoryName || getMultiTypeFromValue(repositoryName) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('common.repositoryName'))
  }
  if (
    artifactArrayPath !== undefined &&
    (!artifactArrayPath || getMultiTypeFromValue(artifactArrayPath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.artifactsArrayPath'))
  }
  if (
    versionPath !== undefined &&
    (!versionPath || getMultiTypeFromValue(versionPath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.versionPath'))
  }
  if (
    packageName !== undefined &&
    (!packageName || getMultiTypeFromValue(packageName) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.testsReports.callgraphField.package'))
  }
  if (packageVal !== undefined && (!packageVal || getMultiTypeFromValue(packageVal) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.testsReports.callgraphField.package'))
  }
  if (project !== undefined && (!project || getMultiTypeFromValue(project) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('projectLabel'))
  }
  if (region !== undefined && (!region || getMultiTypeFromValue(region) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('regionLabel'))
  }
  if (
    registryHostname !== undefined &&
    (!registryHostname || getMultiTypeFromValue(registryHostname) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('connectors.GCR.registryHostname'))
  }
  if (
    !isServerlessDeploymentTypeSelected &&
    (imagePath === '' || getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.imagePathLabel'))
  }
  if (
    !isServerlessDeploymentTypeSelected &&
    (tag === '' || getMultiTypeFromValue(tag) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push('Tag')
  }

  if (
    !isServerlessDeploymentTypeSelected &&
    (version === '' || getMultiTypeFromValue(version) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push('Version')
  }
  if (
    !isServerlessDeploymentTypeSelected &&
    (artifactPath === '' || getMultiTypeFromValue(artifactPath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactPathLabel'))
  }
  if (repository !== undefined && (!repository || getMultiTypeFromValue(repository) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('repository'))
  }
  if (
    repositoryPort !== undefined &&
    (!repositoryPort || getMultiTypeFromValue(repositoryPort) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.repositoryPort'))
  }
  if (
    isServerlessDeploymentTypeSelected &&
    (!artifactDirectory || getMultiTypeFromValue(artifactDirectory) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.artifactDirectory'))
  }

  if (registry !== undefined && (!registry || getMultiTypeFromValue(registry) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.ACR.registry'))
  }

  if (
    repositoryFormat !== undefined &&
    (!repositoryFormat || getMultiTypeFromValue(repositoryFormat) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('common.repositoryFormat'))
  }

  if (artifactId !== undefined && (!artifactId || getMultiTypeFromValue(artifactId) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.artifactsSelection.artifactId'))
  }

  if (groupId !== undefined && (!groupId || getMultiTypeFromValue(groupId) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('pipeline.artifactsSelection.groupId'))
  }

  if (
    subscriptionId !== undefined &&
    (!subscriptionId || getMultiTypeFromValue(subscriptionId) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.ACR.subscription'))
  }

  const helpText = getHelperTextStringForDigest(
    invalidFields,
    getString,
    isServerlessDeploymentTypeSelected,
    defaultErrorMessage
  )

  return invalidFields.length > 0 ? helpText : undefined
}

export const isServerlessDeploymentType = (deploymentType: string): boolean => {
  return (
    deploymentType === ServiceDeploymentType.ServerlessAwsLambda ||
    deploymentType === ServiceDeploymentType.ServerlessAzureFunctions ||
    deploymentType === ServiceDeploymentType.ServerlessGoogleFunctions ||
    deploymentType === ServiceDeploymentType.AmazonSAM ||
    deploymentType === ServiceDeploymentType.AzureFunctions
  )
}

export const isOnlyOneManifestAllowedForDeploymentType = (deploymentType: ServiceDefinition['type']) => {
  return isServerlessDeploymentType(deploymentType) || deploymentType === ServiceDeploymentType.AwsLambda
}

export const isSSHWinRMDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.WinRm || deploymentType === ServiceDeploymentType.Ssh
}
export const isWinRmDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.WinRm
}

export const isAzureWebAppDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.AzureWebApp
}

export const isElastigroupDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.Elastigroup
}

export const isCustomDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.CustomDeployment
}
export const isNativeHelmDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.NativeHelm
}
export const isEcsDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.ECS
}
export const isAzureWebAppGenericDeploymentType = (deploymentType: string, repo: string | undefined): boolean => {
  if (isAzureWebAppDeploymentType(deploymentType)) {
    // default repository format should be Generic if none is previously selected
    return repo ? repo === RepositoryFormatTypes.Generic : true
  }

  return false
}
export const isAzureWebAppOrSshWinrmGenericDeploymentType = (
  deploymentType: string,
  repo: string | undefined
): boolean => {
  if (isAzureWebAppDeploymentType(deploymentType) || isSSHWinRMDeploymentType(deploymentType)) {
    // default repository format should be Generic if none is previously selected
    return repo ? repo === RepositoryFormatTypes.Generic : true
  }

  return false
}

export const isSshWinRmGenericDeploymentType = (deploymentType: string, repo: string | undefined): boolean => {
  if (isSSHWinRMDeploymentType(deploymentType)) {
    // default repository format should be Generic if none is previously selected
    return repo ? repo === RepositoryFormatTypes.Generic : true
  }

  return false
}

export const isTASDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.TAS
}

export const isCustomDTGenericDeploymentType = (deploymentType: string, repo: string | undefined): boolean => {
  if (isCustomDeploymentType(deploymentType)) {
    // default repository format should be Generic if none is previously selected
    return repo ? repo === RepositoryFormatTypes.Generic : true
  }

  return false
}

export const isTasGenericDeploymentType = (deploymentType: string, repo: string | undefined): boolean => {
  if (isTASDeploymentType(deploymentType)) {
    // default repository format should be Generic if none is previously selected
    return repo ? repo === RepositoryFormatTypes.Generic : true
  }

  return false
}

export const isGoogleCloudFuctionsDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.GoogleCloudFunctions
}

export const isAWSLambdaDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.AwsLambda
}

export const isServiceHooksAllowed = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.Kubernetes || deploymentType === ServiceDeploymentType.NativeHelm
}
export const detailsHeaderName: Record<string, string> = {
  [ServiceDeploymentType.ServerlessAwsLambda]: 'Amazon Web Services Details',
  [ServiceDeploymentType.ServerlessAzureFunctions]: 'Azure Details',
  [ServiceDeploymentType.AzureWebApp]: 'Web App Infrastructure Details',
  [ServiceDeploymentType.ServerlessGoogleFunctions]: 'GCP Details',
  [ServiceDeploymentType.Pdc]: 'Infrastructure definition',
  [ServiceDeploymentType.WinRm]: 'WinRM',
  [ServiceDeploymentType.Elastigroup]: 'Elastigroup Details',
  [ServiceDeploymentType.SshWinRmAws]: 'Amazon Web Services Details',
  [ServiceDeploymentType.SshWinRmAzure]: 'Azure Infrastructure details',
  [ServiceDeploymentType.TAS]: 'Tanzu Application Service Infrastructure Details',
  [ServiceDeploymentType.Asg]: 'AWS Details',
  [ServiceDeploymentType.GoogleCloudFunctions]: 'Google Cloud Provider Details'
}

export const getSelectedDeploymentType = (
  stage: StageElementWrapper<DeploymentStageElementConfig> | undefined,
  getStageFromPipeline: <T extends StageElementConfig = StageElementConfig>(
    stageId: string,
    pipeline?: PipelineInfoConfig
  ) => PipelineStageWrapper<T>,
  isPropagating = false,
  templateServiceData?: TemplateServiceDataType
): ServiceDefinition['type'] => {
  if (isPropagating) {
    const parentStageId = get(stage, 'stage.spec.serviceConfig.useFromStage.stage', null)
    const parentStage = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(parentStageId, ''))
    const parentStageTemplateRef = get(parentStage, 'stage.stage.template.templateRef')
    if (parentStageTemplateRef && templateServiceData) {
      return get(templateServiceData, parentStageTemplateRef)
    }
    return get(parentStage, 'stage.stage.spec.serviceConfig.serviceDefinition.type', null)
  }
  return get(stage, 'stage.spec.serviceConfig.serviceDefinition.type', null)
}

export const getDeploymentTypeWithSvcEnvFF = (
  stage: StageElementWrapper<DeploymentStageElementConfig> | undefined
): ServiceDefinition['type'] => {
  return get(stage, 'stage.spec.deploymentType', null)
}

export const getServiceDefinitionType = (
  selectedStage: StageElementWrapperConfig | undefined,
  getStageFromPipeline: <T extends StageElementConfig = StageElementConfig>(
    stageId: string,
    pipeline?: PipelineInfoConfig
  ) => PipelineStageWrapper<T>,
  isNewServiceEnvEntity: (isSvcEnvEntityEnabled: boolean, stage: DeploymentStageElementConfig) => boolean,
  isSvcEnvEntityEnabled: boolean,
  templateServiceData: TemplateServiceDataType
): GetExecutionStrategyYamlQueryParams['serviceDefinitionType'] => {
  const isPropagating = get(selectedStage, 'stage.spec.serviceConfig.useFromStage', null)
  if (isNewServiceEnvEntity(isSvcEnvEntityEnabled, selectedStage?.stage as DeploymentStageElementConfig)) {
    return getDeploymentTypeWithSvcEnvFF(selectedStage as StageElementWrapper<DeploymentStageElementConfig>)
  }
  return getSelectedDeploymentType(
    selectedStage as StageElementWrapper<DeploymentStageElementConfig>,
    getStageFromPipeline,
    isPropagating,
    templateServiceData
  )
}

export const getStageDeploymentType = (
  pipeline: PipelineInfoConfig,
  stage: StageElementWrapper<DeploymentStageElementConfig>,
  isPropagating = false
): ServiceDefinition['type'] => {
  if (isPropagating) {
    const parentStageId = get(stage, 'stage.spec.serviceConfig.useFromStage.stage', null)
    const parentStage = getStageByPipeline<DeploymentStageElementConfig>(defaultTo(parentStageId, ''), pipeline)
    return get(parentStage, 'stage.stage.spec.serviceConfig.serviceDefinition.type', null)
  }
  return get(stage, 'stage.spec.serviceConfig.serviceDefinition.type', null)
}

export const getRepositoryFormat = (
  pipeline: PipelineInfoConfig,
  stage: StageElementWrapper<DeploymentStageElementConfig>,
  isPropagating = false
): ServiceDefinition['type'] => {
  if (isPropagating) {
    const parentStageId = get(stage, 'stage.spec.serviceConfig.useFromStage.stage', null)
    const parentStage = getStageByPipeline<DeploymentStageElementConfig>(defaultTo(parentStageId, ''), pipeline)
    return get(
      parentStage,
      'stage.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.repositoryFormat',
      null
    )
  }
  return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.repositoryFormat', null)
}

export const getCustomStepProps = (type: string, getString: (key: StringKeys) => string) => {
  switch (type) {
    case ServiceDeploymentType.ServerlessAwsLambda:
      return {
        hasRegion: true,
        formInfo: {
          formName: 'serverlessAWSInfra',
          type: connectorTypes.Aws,
          header: getString('pipelineSteps.awsConnectorLabel'),
          tooltipIds: {
            connector: 'awsInfraConnector',
            region: 'awsRegion',
            stage: 'awsStage'
          }
        }
      }
    case ServiceDeploymentType.ServerlessAzureFunctions:
      return {
        formInfo: {
          formName: 'serverlessAzureInfra',
          // @TODO - (change type to 'azure')
          // this is not being used anywhere currently, once azure support is there we will change it.
          type: connectorTypes.Gcp,
          header: getString('pipelineSteps.awsConnectorLabel'),
          tooltipIds: {
            connector: 'azureInfraConnector',
            region: 'azureRegion',
            stage: 'azureStage'
          }
        }
      }
    case ServiceDeploymentType.ServerlessGoogleFunctions:
      return {
        formInfo: {
          formName: 'serverlessGCPInfra',
          type: connectorTypes.Gcp,
          header: getString('pipelineSteps.gcpConnectorLabel'),
          tooltipIds: {
            connector: 'gcpInfraConnector',
            region: 'gcpRegion',
            stage: 'gcpStage'
          }
        }
      }
    default:
      return { formInfo: {} }
  }
}

export const isArtifactManifestPresent = (stage: DeploymentStageElementConfig): boolean => {
  return (
    !!stage.spec?.serviceConfig &&
    (!!stage.spec?.serviceConfig.serviceDefinition?.spec.artifacts ||
      !!stage.spec?.serviceConfig.serviceDefinition?.spec.manifests)
  )
}

export const isInfraDefinitionPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !!stage.spec?.infrastructure?.infrastructureDefinition
}

export const isConfigFilesPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !!stage.spec?.serviceConfig && !!stage.spec?.serviceConfig.serviceDefinition?.spec.configFiles
}

export const isCustomDeploymentDataPresent = (stage: DeploymentStageElementConfig): boolean => {
  return (
    !!stage.spec?.serviceConfig &&
    !!(stage.spec?.serviceConfig.serviceDefinition?.spec as CustomDeploymentServiceSpec)?.customDeploymentRef
  )
}

export const isServiceEntityPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !!stage.spec?.service?.serviceRef
}

export const isEnvironmentGroupPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !!stage.spec?.environmentGroup?.envGroupRef
}
export const isEnvironmentPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !!stage.spec?.environment?.environmentRef
}

export const isExecutionFieldPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !!(stage.spec?.execution && stage.spec?.execution.steps && stage.spec?.execution.steps?.length > 0)
}

export const isServiceDefinitionSpecDataPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !isEmpty(omit(stage.spec?.serviceConfig?.serviceDefinition?.spec, 'variables', 'environmentType'))
}

export const doesStageContainOtherData = (stage?: DeploymentStageElementConfig): boolean => {
  if (!stage) {
    return false
  }
  return isInfraDefinitionPresent(stage) || isExecutionFieldPresent(stage) || isServiceDefinitionSpecDataPresent(stage)
}

export const hasStageData = (stage?: DeploymentStageElementConfig): boolean => {
  if (!stage) {
    return false
  }
  return (
    isServiceEntityPresent(stage) ||
    isEnvironmentPresent(stage) ||
    isEnvironmentGroupPresent(stage) ||
    isExecutionFieldPresent(stage)
  )
}

export const deleteStageData = (stage?: DeploymentStageElementConfig): void => {
  if (stage) {
    delete stage?.spec?.serviceConfig?.serviceDefinition?.spec.artifacts
    delete stage?.spec?.serviceConfig?.serviceDefinition?.spec.manifests
    delete stage?.spec?.serviceConfig?.serviceDefinition?.spec.configFiles
    delete stage?.spec?.infrastructure?.allowSimultaneousDeployments
    delete stage?.spec?.infrastructure?.infrastructureDefinition
    if (stage?.spec?.execution?.steps) {
      stage.spec.execution.steps.splice(0)
    }
    delete stage?.spec?.execution?.rollbackSteps
  }
}
export const deleteServiceData = (stage?: DeploymentStageElementConfig): void => {
  if (stage) {
    // delete all properties except variables
    set(
      stage,
      'spec.serviceConfig.serviceDefinition.spec',
      pick(get(stage, 'spec.serviceConfig.serviceDefinition.spec'), ['variables', 'environmentType'])
    )
  }
}
//This is to delete stage data in case of new service/ env entity
export const deleteStageInfo = (stage?: DeploymentStageElementConfig): void => {
  if (stage) {
    delete stage?.spec?.service
    delete stage?.spec?.environment
    delete stage?.spec?.environmentGroup
    delete stage?.spec?.customDeploymentRef
    if (stage?.spec?.execution?.steps) {
      stage.spec.execution.steps.splice(0)
    }
    delete stage?.spec?.execution?.rollbackSteps
  }
}

export const infraDefinitionTypeMapping: { [key: string]: string } = {
  ServerlessAwsLambda: StepType.ServerlessAwsInfra,
  ECS: StepType.EcsInfra,
  CustomDeployment: StepType.CustomDeployment,
  TAS: StepType.TasInfra,
  Asg: StepType.AsgInfraSpec,
  GoogleCloudFunctions: StepType.GoogleCloudFunctionsInfra,
  AwsLambda: StepType.AwsLambdaInfra,
  AWS_SAM: StepType.AwsSamInfra
}

export const getStepTypeByDeploymentType = (deploymentType: string): StepType => {
  switch (deploymentType) {
    case ServiceDeploymentType.ServerlessAwsLambda:
      return StepType.ServerlessAwsLambda
    case ServiceDeploymentType.AzureWebApp:
      return StepType.AzureWebAppServiceSpec
    case ServiceDeploymentType.Ssh:
      return StepType.SshServiceSpec
    case ServiceDeploymentType.WinRm:
      return StepType.WinRmServiceSpec
    case ServiceDeploymentType.ECS:
      return StepType.EcsService
    case ServiceDeploymentType.CustomDeployment:
      return StepType.CustomDeploymentServiceSpec
    case ServiceDeploymentType.Elastigroup:
      return StepType.ElastigroupService
    case ServiceDeploymentType.TAS:
      return StepType.TasService
    case ServiceDeploymentType.Asg:
      return StepType.Asg
    case ServiceDeploymentType.GoogleCloudFunctions:
      return StepType.GoogleCloudFunctionsService
    case ServiceDeploymentType.AwsLambda:
      return StepType.AwsLambdaService
    case ServiceDeploymentType.AwsSam:
      return StepType.AwsSamService
    default:
      return StepType.K8sServiceSpec
  }
}

export const STATIC_SERVICE_GROUP_NAME = 'static_service_group'

export const getDefaultBuildDependencies = (serviceDependencies: DependencyElement[]): PipelineGraphState => ({
  id: uuid() as string,
  identifier: STATIC_SERVICE_GROUP_NAME as string,
  name: 'Dependencies',
  type: STATIC_SERVICE_GROUP_NAME,
  nodeType: STATIC_SERVICE_GROUP_NAME,
  icon: '' as IconName,
  data: {
    canDelete: false,
    name: 'Dependencies',
    type: STATIC_SERVICE_GROUP_NAME,
    nodeType: STATIC_SERVICE_GROUP_NAME,
    steps: serviceDependencies.length ? [{ parallel: serviceDependencies.map(d => ({ step: d })) }] : []
  }
})

export const isSshOrWinrmDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.Ssh || deploymentType === ServiceDeploymentType.WinRm
}

export const withoutSideCar = (deploymentType: string): boolean => {
  return isSshOrWinrmDeploymentType(deploymentType)
}

export const getVariablesHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']) => {
  return `${selectedDeploymentType}DeploymentTypeVariables`
}

export const getAllowedRepoOptions = (
  deploymentType: string,
  isTemplateContext?: boolean,
  selectedArtifact?: ArtifactType | null
): SelectOption[] => {
  if (selectedArtifact === 'Nexus3Registry') {
    if (isAWSLambdaDeploymentType(deploymentType)) {
      return [...nexus3RepositoryFormatTypes]
    }
    return [...k8sRepositoryFormatTypes, ...nexus3RepositoryFormatTypes]
  }
  return !!isTemplateContext ||
    isSSHWinRMDeploymentType(deploymentType) ||
    isTASDeploymentType(deploymentType) ||
    isCustomDeploymentType(deploymentType) ||
    isAzureWebAppDeploymentType(deploymentType)
    ? [...k8sRepositoryFormatTypes, ...nexus2RepositoryFormatTypes]
    : k8sRepositoryFormatTypes
}

export const isFixedNonEmptyValue = (value: string): boolean => {
  if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
    return false
  }
  if (typeof value !== 'number') {
    return !isEmpty(value)
  }
  return value !== undefined
}

export function hasChainedPipelineStage(stages?: StageElementWrapperConfig[]): boolean {
  let containsChainedPipelineStage = false
  if (stages) {
    for (const item of stages) {
      if (item?.stage?.type === StageType.PIPELINE) {
        containsChainedPipelineStage = true
      } else if (!containsChainedPipelineStage && item?.parallel) {
        for (const node of item.parallel) {
          if (node?.stage?.type === StageType.PIPELINE) {
            containsChainedPipelineStage = true
          }
          if (containsChainedPipelineStage) break
        }
      }
      if (containsChainedPipelineStage) break
    }
  }
  return containsChainedPipelineStage
}

export const PriorityByStageStatus: Record<ExecutionStatus, number> = {
  Success: 1,
  Running: 2,
  AsyncWaiting: 2,
  TaskWaiting: 2,
  TimedWaiting: 2,
  Failed: 20,
  Errored: 20,
  IgnoreFailed: 20,
  Expired: 18,
  Aborted: 19,
  AbortedByFreeze: 19,
  Discontinuing: 19,
  Suspended: 17,
  Queued: 0,
  NotStarted: 0,
  Paused: 24,
  ResourceWaiting: 25,
  Skipped: 15,
  ApprovalRejected: 22,
  ApprovalWaiting: 26,
  InterventionWaiting: 27,
  Pausing: 23,
  InputWaiting: 0,
  WaitStepRunning: 2,
  QueuedLicenseLimitReached: 0,
  QueuedExecutionConcurrencyReached: 0
}

export enum GoogleCloudFunctionsEnvType {
  GenOne = 'GenOne',
  GenTwo = 'GenTwo'
}
