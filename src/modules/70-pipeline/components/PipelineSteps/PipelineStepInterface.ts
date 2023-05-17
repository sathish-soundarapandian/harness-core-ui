/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { PipelineInfrastructure } from 'services/cd-ng'

export enum StepType {
  GitOpsSync = 'GitOpsSync',
  StageRuntimeInput = 'StageRuntimeInput',
  HTTP = 'Http',
  SHELLSCRIPT = 'ShellScript',
  Container = 'Container',
  GitOpsUpdateReleaseRepo = 'GitOpsUpdateReleaseRepo',
  GitOpsFetchLinkedApps = 'GitOpsFetchLinkedApps',
  Command = 'Command',
  Email = 'Email',
  CustomApproval = 'CustomApproval',
  Barrier = 'Barrier',
  Queue = 'Queue',
  K8sRollingRollback = 'K8sRollingRollback',
  K8sBlueGreenDeploy = 'K8sBlueGreenDeploy',
  K8sCanaryDeploy = 'K8sCanaryDeploy',
  K8sBGSwapServices = 'K8sBGSwapServices',
  K8sScale = 'K8sScale',
  K8sApply = 'K8sApply',
  K8sCanaryDelete = 'K8sCanaryDelete',
  K8sDelete = 'K8sDelete',
  K8sDryRun = 'K8sDryRun',
  StepGroup = 'StepGroup',
  DeployServiceEntity = 'DeployServiceEntity',
  DeployService = 'DeployService',
  DeployEnvironment = 'DeployEnvironment',
  DeployEnvironmentGroup = 'DeployEnvironmentGroup',
  DeployEnvironmentEntity = 'DeployEnvironmentEntity',
  DeployInfrastructure = 'DeployInfrastructure',
  DeployInfrastructureEntity = 'DeployInfrastructureEntity',
  DeployClusterEntity = 'DeployClusterEntity',
  InlineEntityFilters = 'InlineEntityFilters',
  KubernetesDirect = 'KubernetesDirect',
  K8sServiceSpec = 'K8sServiceSpec',
  K8sRollingDeploy = 'K8sRollingDeploy',
  K8sBlueGreenStageScaleDownStep = 'K8sBlueGreenStageScaleDownStep',
  CustomVariable = 'CustomVariable',
  ServerlessAwsLambda = 'ServerlessAwsLambda',
  ServerlessGCP = 'ServerlessGCP',
  ServerlessAzure = 'ServerlessAzure',
  Dependency = 'Service',
  Plugin = 'Plugin',
  GHAPlugin = 'Action',
  BitrisePlugin = 'Bitrise',
  GitClone = 'GitClone',
  Run = 'Run',
  GCR = 'BuildAndPushGCR',
  ACR = 'BuildAndPushACR',
  PDC = 'Pdc',
  SshWinRmAws = 'SshWinRmAws',
  ECR = 'BuildAndPushECR',
  SaveCacheGCS = 'SaveCacheGCS',
  RestoreCacheGCS = 'RestoreCacheGCS',
  SaveCacheS3 = 'SaveCacheS3',
  RestoreCacheS3 = 'RestoreCacheS3',
  SaveCacheHarness = 'SaveCacheHarness',
  RestoreCacheHarness = 'RestoreCacheHarness',
  DockerHub = 'BuildAndPushDockerRegistry',
  GCS = 'GCSUpload',
  S3 = 'S3Upload',
  JFrogArtifactory = 'ArtifactoryUpload',
  RunTests = 'RunTests',
  HelmDeploy = 'HelmDeploy',
  HelmRollback = 'HelmRollback',
  HarnessApproval = 'HarnessApproval',
  JiraApproval = 'JiraApproval',
  ServiceNowApproval = 'ServiceNowApproval',
  ServiceNowCreate = 'ServiceNowCreate',
  ServiceNowUpdate = 'ServiceNowUpdate',
  ServiceNowImportSet = 'ServiceNowImportSet',
  Verify = 'Verify',
  JiraCreate = 'JiraCreate',
  JiraUpdate = 'JiraUpdate',
  TerraformRollback = 'TerraformRollback',
  TerraformDestroy = 'TerraformDestroy',
  TerraformPlan = 'TerraformPlan',
  TerraformApply = 'TerraformApply',
  TerragruntRollback = 'TerragruntRollback',
  TerragruntDestroy = 'TerragruntDestroy',
  TerragruntPlan = 'TerragruntPlan',
  TerragruntApply = 'TerragruntApply',
  InfraProvisioning = 'InfraProvisioning',
  KubernetesGcp = 'KubernetesGcp',
  ResourceConstraint = 'ResourceConstraint',
  FlagConfiguration = 'FlagConfiguration',
  Template = 'Template',
  Policy = 'Policy',
  ZeroNorth = 'Security',
  KubernetesAzure = 'KubernetesAzure',
  SshWinRmAzure = 'SshWinRmAzure',
  AzureWebApp = 'AzureWebApp',
  AzureWebAppServiceSpec = 'AzureWebAppServiceSpec',
  ServerlessAwsLambdaDeploy = 'ServerlessAwsLambdaDeploy',
  ServerlessAwsLambdaRollback = 'ServerlessAwsLambdaRollback',
  ServerlessAwsInfra = 'ServerlessAwsInfra',
  CloudFormationRollbackStack = 'RollbackStack',
  CloudFormationDeleteStack = 'DeleteStack',
  CloudFormationCreateStack = 'CreateStack',
  SshServiceSpec = 'SshServiceSpec',
  WinRmServiceSpec = 'WinRmServiceSpec',
  CreatePR = 'CreatePR',
  MergePR = 'MergePR',
  AzureWebAppsRollback = 'AzureWebAppRollback',
  AzureSlotDeployment = 'AzureSlotDeployment',
  JenkinsBuild = 'JenkinsBuild',
  BambooBuild = 'BambooBuild',
  AzureTrafficShift = 'AzureTrafficShift',
  AzureSwapSlot = 'AzureSwapSlot',
  EcsInfra = 'EcsInfra',
  EcsService = 'EcsService',
  EcsRollingDeploy = 'EcsRollingDeploy',
  EcsRollingRollback = 'EcsRollingRollback',
  EcsCanaryDeploy = 'EcsCanaryDeploy',
  EcsCanaryDelete = 'EcsCanaryDelete',
  AzureArmRollback = 'AzureARMRollback',
  Background = 'Background',
  AzureBlueprint = 'AzureCreateBPResource',
  EcsRunTask = 'EcsRunTask',
  EcsBlueGreenCreateService = 'EcsBlueGreenCreateService',
  EcsBlueGreenSwapTargetGroups = 'EcsBlueGreenSwapTargetGroups',
  EcsBlueGreenRollback = 'EcsBlueGreenRollback',
  CreateAzureARMResource = 'AzureCreateARMResource',
  CustomDeploymentServiceSpec = 'CustomDeploymentServiceSpec',
  CustomDeployment = 'CustomDeployment',
  FetchInstanceScript = 'FetchInstanceScript',
  Wait = 'Wait',
  ShellScriptProvision = 'ShellScriptProvision',
  ChaosExperiment = 'Chaos',
  Elastigroup = 'Elastigroup',
  ElastigroupService = 'ElastigroupService',
  ElastigroupRollback = 'ElastigroupRollback',
  ElastigroupSetup = 'ElastigroupSetup',
  TasService = 'TasService',
  TasInfra = 'TAS',
  AppRollback = 'AppRollback',
  SwapRoutes = 'SwapRoutes',
  SwapRollback = 'SwapRollback',
  TanzuCommand = 'TanzuCommand',
  BasicAppSetup = 'BasicAppSetup',
  BGAppSetup = 'BGAppSetup',
  CanaryAppSetup = 'CanaryAppSetup',
  AppResize = 'AppResize',
  TasRollingDeploy = 'TasRollingDeploy',
  TasRollingRollback = 'TasRollingRollback',
  RouteMapping = 'RouteMapping',
  Asg = 'ASGServiceSpec',
  AsgInfraSpec = 'AsgInfraSpec',
  Aquatrivy = 'AquaTrivy',
  Bandit = 'Bandit',
  BlackDuck = 'BlackDuck',
  Burp = 'Burp',
  Snyk = 'Snyk',
  Sysdig = 'Sysdig',
  Grype = 'Grype',
  Gitleaks = 'Gitleaks',
  Sonarqube = 'Sonarqube',
  Zap = 'Zap',
  CodeQL = 'CodeQL',
  AsgCanaryDelete = 'AsgCanaryDelete',
  ElastigroupDeploy = 'ElastigroupDeploy',
  ElastigroupSwapRoute = 'ElastigroupSwapRoute',
  ElastigroupBGStageSetup = 'ElastigroupBGStageSetup',
  AsgCanaryDeploy = 'AsgCanaryDeploy',
  AsgRollingRollback = 'AsgRollingRollback',
  AsgRollingDeploy = 'AsgRollingDeploy',
  PrismaCloud = 'PrismaCloud',
  GoogleCloudFunctionsService = 'GoogleCloudFunctionsService',
  GoogleCloudFunctionsInfra = 'GoogleCloudFunctionsInfra',
  DeployCloudFunction = 'DeployCloudFunction',
  DeployCloudFunctionGenOne = 'DeployCloudFunctionGenOne',
  CloudFunctionRollback = 'CloudFunctionRollback',
  RollbackCloudFunctionGenOne = 'RollbackCloudFunctionGenOne',
  DeployCloudFunctionWithNoTraffic = 'DeployCloudFunctionWithNoTraffic',
  CloudFunctionTrafficShift = 'CloudFunctionTrafficShift',
  Checkmarx = 'Checkmarx',
  Mend = 'Mend',
  AsgBlueGreenRollback = 'AsgBlueGreenRollback',
  AsgBlueGreenSwapService = 'AsgBlueGreenSwapService',
  AsgBlueGreenDeploy = 'AsgBlueGreenDeploy',
  AwsLambdaService = 'AwsLambdaService',
  AwsLambdaInfra = 'AwsLambdaInfra',
  AwsLambdaDeploy = 'AwsLambdaDeploy',
  AwsLambdaRollback = 'AwsLambdaRollback',
  TerraformCloudRun = 'TerraformCloudRun',
  TerraformCloudRollback = 'TerraformCloudRollback',
  SscaOrchestration = 'SscaOrchestration',
  CdSscaOrchestration = 'CdSscaOrchestration',
  SscaEnforcement = 'SscaEnforcement',
  CustomIngest = 'CustomIngest',
  AWSSecurityHub = 'AWSSecurityHub',
  AWSECR = 'AWSECR',
  Nikto = 'Nikto',
  Nmap = 'Nmap',
  Owasp = 'Owasp',
  Prowler = 'Prowler',
  Sniper = 'Sniper',
  Metasploit = 'Metasploit',
  Brakeman = 'Brakeman',
  KubernetesAws = 'KubernetesAws'
}

export interface PipelineInfrastructureV2 extends PipelineInfrastructure {
  environmentOrEnvGroupRef?: SelectOption
  environmentGroup?: any
  environmentRef2?: SelectOption
  infrastructureRef?: SelectOption
}
