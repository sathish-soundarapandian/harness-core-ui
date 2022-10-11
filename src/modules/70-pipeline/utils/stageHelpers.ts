/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, isEmpty } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@wings-software/uicore'
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
import { connectorTypes } from '@pipeline/utils/constants'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getStageFromPipeline as getStageByPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/helpers'
import type { DependencyElement } from 'services/ci'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import type { InputSetDTO } from './types'
import type { DeploymentStageElementConfig, PipelineStageWrapper, StageElementWrapper } from './pipelineTypes'
import type { TemplateServiceDataType } from './templateUtils'

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
  PARALLELISM = 'PARALLELISM'
}

export enum ServiceDeploymentType {
  Kubernetes = 'Kubernetes',
  NativeHelm = 'NativeHelm',
  amazonAmi = 'amazonAmi',
  awsCodeDeploy = 'awsCodeDeploy',
  WinRm = 'WinRm',
  awsLambda = 'awsLambda',
  pcf = 'pcf',
  Pdc = 'Pdc',
  Ssh = 'Ssh',
  CustomDeployment = 'CustomDeployment',
  ServerlessAwsLambda = 'ServerlessAwsLambda',
  ServerlessAzureFunctions = 'ServerlessAzureFunctions',
  ServerlessGoogleFunctions = 'ServerlessGoogleFunctions',
  AmazonSAM = 'AwsSAM',
  AzureFunctions = 'AzureFunctions',
  AzureWebApp = 'AzureWebApp',
  ECS = 'ECS'
}

export enum RepositoryFormatTypes {
  Generic = 'generic',
  Docker = 'docker',
  Maven = 'maven',
  NPM = 'npm',
  NuGet = 'nuget'
}

export const nexus2RepositoryFormatTypes = [
  { label: 'Maven', value: RepositoryFormatTypes.Maven },
  { label: 'NPM', value: RepositoryFormatTypes.NPM },
  { label: 'NuGet', value: RepositoryFormatTypes.NuGet }
]

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

export function hasServiceDetail(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('serviceDetail') || false
}

export function hasOverviewDetail(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('overviewPage') || false
}

export function hasCIStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('ci') || !isEmpty(pipelineExecution?.moduleInfo?.ci)
}

export function hasSTOStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return (
    pipelineExecution?.modules?.includes('sto') ||
    pipelineExecution?.modules?.includes('ci') ||
    !isEmpty(pipelineExecution?.moduleInfo?.sto)
  )
}

export const getHelperTextString = (
  invalidFields: string[],
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false
): string => {
  return `${invalidFields.length > 1 ? invalidFields.join(', ') : invalidFields[0]} ${
    invalidFields.length > 1 ? ' are ' : ' is '
  } ${
    isServerlessDeploymentTypeSelected
      ? getString('pipeline.artifactPathDependencyRequired')
      : getString('pipeline.tagDependencyRequired')
  }`
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
  },
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false
): string => {
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
    packageName
  } = fields
  const invalidFields: string[] = []
  if (!connectorRef || getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME) {
    invalidFields.push(getString('connector'))
  }
  if (
    repositoryName !== undefined &&
    (!repositoryName || getMultiTypeFromValue(repositoryName) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('common.repositoryName'))
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

  const helpText = getHelperTextString(invalidFields, getString, isServerlessDeploymentTypeSelected)

  return invalidFields.length > 0 ? helpText : ''
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

export const isSSHWinRMDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.WinRm || deploymentType === ServiceDeploymentType.Ssh
}
export const isWinRmDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.WinRm
}

export const isAzureWebAppDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.AzureWebApp
}

export const isCustomDeploymentType = (deploymentType: string): boolean => {
  return deploymentType === ServiceDeploymentType.CustomDeployment
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

export const detailsHeaderName: Record<string, string> = {
  [ServiceDeploymentType.ServerlessAwsLambda]: 'Amazon Web Services Details',
  [ServiceDeploymentType.ServerlessAzureFunctions]: 'Azure Details',
  [ServiceDeploymentType.AzureWebApp]: 'Web App Infrastructure Details',
  [ServiceDeploymentType.ServerlessGoogleFunctions]: 'GCP Details',
  [ServiceDeploymentType.Pdc]: 'Infrastructure definition',
  [ServiceDeploymentType.WinRm]: 'WinRM'
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

export const doesStageContainOtherData = (stage?: DeploymentStageElementConfig): boolean => {
  if (!stage) {
    return false
  }
  return (
    isArtifactManifestPresent(stage) ||
    isInfraDefinitionPresent(stage) ||
    isExecutionFieldPresent(stage) ||
    isConfigFilesPresent(stage) ||
    isCustomDeploymentDataPresent(stage)
  )
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
    const serviceSpec = stage?.spec?.serviceConfig?.serviceDefinition?.spec as Partial<CustomDeploymentServiceSpec>
    delete serviceSpec?.artifacts
    delete serviceSpec?.manifests
    delete serviceSpec?.configFiles
    delete serviceSpec?.customDeploymentRef
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
  CustomDeployment: StepType.CustomDeployment
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
