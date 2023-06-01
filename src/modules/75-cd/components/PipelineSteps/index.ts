/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'

import { AzureInfrastructureSpec } from './AzureInfrastructureStep/AzureInfrastructureStep'
import { AzureWebAppInfrastructureSpec } from './AzureWebAppInfrastructureStep/AzureWebAppInfrastructureStep'
import { HttpStep } from './HttpStep/HttpStep'
import { K8RolloutDeployStep } from './K8sRolloutDeployStep/K8sRolloutDeployStep'
import { ShellScriptStep } from './ShellScriptStep/ShellScriptStep'
import { KubernetesInfraSpec } from './KubernetesInfraSpec/KubernetesInfraSpec'
import { GenericServiceSpec } from './K8sServiceSpec/K8sServiceSpec'
import { K8sBlueGreenDeployStep } from './K8sBgStep/K8sBlueGreenDeployStep'
import { K8sCanaryDeployStep } from './K8sCanaryDeploy/K8sCanaryDeployStep'
import { K8sBGSwapServices } from './K8sBGSwapServices/K8sBGSwapServices'
import { K8sScaleStep } from './K8sScale/K8sScaleStep'
import { K8sRollingRollbackStep } from './K8sRollingRollback/K8sRollingRollback'
import { K8sCanaryDeleteStep } from './K8sCanaryDelete/K8sCanaryDeleteStep'
import { K8sApplyStep } from './K8sApply/K8sApplyStep'
import { K8sDeleteStep } from './K8sDelete/K8sDeleteStep'
import { DeployEnvironmentStep } from './DeployEnvStep/DeployEnvStep'
import { DeployEnvironmentEntityStep } from './DeployEnvironmentEntityStep/DeployEnvironmentEntityStep'
import { DeployEnvironmentGroupStep } from './DeployEnvironmentGroupStep/DeployEnvironmentGroupStep'
import { DeployInfrastructureEntityStep } from './DeployInfrastructureEntityStep/DeployInfrastructureEntityStep'
import { DeployClusterEntityStep } from './DeployClusterEntityStep/DeployClusterEntityStep'
import { InlineEntityFiltersStep } from './DeployEnvironmentEntityStep/components/InlineEntityFilters/InlineEntityFiltersStep'
import { DeployServiceStep } from './DeployServiceStep/DeployServiceStep'
import { HelmDeploy } from './HelmDeploy/HelmDeploy'
import { HelmRollback } from './HelmRollback/HelmRollback'
import { TerraformRollback } from './TerraformRollback/TerraformRollback'
import { TerraformDestroy } from './TerraformDestroy/TerraformDestroy'
import { TerraformPlan } from './TerraformPlan/TerraformPlan'
import { TerraformApply } from './TerraformApply/TerraformApply'
import { TerragruntRollback } from './TerragruntRollback/TerragruntRollback'
import { TerragruntPlan } from './TerragruntPlan/TerragruntPlan'
import { TerragruntDestroy } from './TerragruntDestroy/TerragruntDestroy'
import { TerragruntApply } from './TerragruntApply/TerragruntApply'
import { InfraProvisioning } from './InfraProvisioning/InfraProvisioning'
import { GcpInfrastructureSpec } from './GcpInfrastructureSpec/GcpInfrastructureSpec'
import { PDCInfrastructureSpec } from './PDCInfrastructureSpec/PDCInfrastructureSpec'
import { SshWinRmAwsInfrastructureSpec } from './SshWinRmAwsInfrastructureSpec/SshWinRmAwsInfrastructureSpec'
import { SshWinRmAzureInfrastructureSpec } from './SshWinRmAzureInfrastructureSpec/SshWinRmAzureInfrastructureSpec'
import { PolicyStep } from './PolicyStep/PolicyStep'
import { ServerlessLambdaDeployStep } from './ServerlessLambdaDeploy/ServerlessLambdaDeploy'
import { ServerlessLambdaRollbackStep } from './ServerlessLambdaRollback/ServerlessLambdaRollback'
import { ServerlessAwsLambdaSpec } from './ServerlessAWSLambda/ServerlessAwsLambdaSpec'
import { ServerlessAzureSpec } from './ServerlessAzure/ServerlessAzureSpec'
import { ServerlessGCPSpec } from './ServerlessGCP/ServerlessGCPSpec'
import { ServerlessAwsLambdaServiceSpec } from './ServerlessAwsLambdaServiceSpec/ServerlessAwsLambdaServiceSpec'
import { CFRollbackStack } from './CloudFormation/RollbackStack/RollbackStack'
import { CFDeleteStack } from './CloudFormation/DeleteStack/DeleteStack'
import { CFCreateStack } from './CloudFormation/CreateStack/CreateStack'
import { SshServiceSpec } from './SshServiceSpec/SshServiceSpec'
import { WinRmServiceSpec } from './WinRmServiceSpec/WinRmServiceSpec'
import { CreatePr } from './CreatePrStep/CreatePrStep'
import { MergePR } from './MergePrStep/MergePrStep'
import { FetchInstanceScript } from './FetchInstanceScriptStep/FetchInstanceScriptStep'
import { AzureWebAppRollback } from './AzureWebAppRollback/AzureWebAppRollback'
import { CommandScriptsStep } from './CommandScripts/CommandScriptsStep'
import { AzureSlotDeployment } from './AzureSlotDeployment/AzureSlotDeployment'
import { AzureTrafficShift } from './AzureTrafficShift/AzureTrafficShift'
import { AzureSwapSlot } from './AzureWebAppSwapSlot/AzureWebAppSwapSlot'
import { AzureWebAppServiceSpec } from './AzureWebAppServiceSpec/AzureWebAppServiceSpec'
import { ASGServiceSpec } from './ASGServiceSpec/ASGServiceSpec'
import { ECSInfraSpec } from './ECSInfraSpec/ECSInfraSpec'
import { AsgInfraSpec } from './AsgInfraSpec/AsgInfraSpec'
import { ECSServiceSpec } from './ECSServiceSpec/ECSServiceSpec'
import { ECSRollingDeployStep } from './ECSRollingDeployStep/ECSRollingDeployStep'
import { ECSRollingRollbackStep } from './ECSRollingRollbackStep/ECSRollingRollbackStep'
import { ECSCanaryDeployStep } from './ECSCanaryDeployStep/ECSCanaryDeployStep'
import { ECSCanaryDeleteStep } from './ECSCanaryDeleteStep/ECSCanaryDeleteStep'
import { AzureArmRollback } from './AzureArmRollback/AzureArmRollback'
import { AzureBlueprintStep } from './AzureBlueprint/AzureBlueprint'
import { ECSBlueGreenCreateServiceStep } from './ECSBlueGreenCreateServiceStep/ECSBlueGreenCreateServiceStep'
import { ECSBlueGreenSwapTargetGroupsStep } from './ECSBlueGreenSwapTargetGroupsStep/ECSBlueGreenSwapTargetGroupsStep'
import { ECSBlueGreenRollbackStep } from './ECSBlueGreenRollbackStep/ECSBlueGreenRollbackStep'
import { DeployServiceEntityStep } from './DeployServiceEntityStep/DeployServiceEntityStep'
import { ECSRunTaskStep } from './ECSRunTaskStep/ECSRunTaskStep'
import { AzureArmStep } from './AzureArm/AzureArm'
import { CustomDeploymentServiceSpec } from './CustomDeploymentServiceSpec/CustomDeploymentServiceSpec'
import { CustomDeploymentInfrastructureSpec } from './CustomDeploymentInfrastructureSpec/CustomDeploymentInfrastructureStep'
import { UpdateReleaseRepo } from '../UpdateReleaseRepo/UpdateReleaseRepo'
import { GitOpsFetchLinkedApps } from '../GitOpsFetchLinkedApps/GitOpsFetchLinkedApps'
import { ShellScriptProvisionStep } from './ShellScriptProvision/ShellScriptProvisionStep'
import { ElastigroupInfrastructureSpec } from './ElastigroupInfraSpec/ElastigroupInfraSpec'
import { ElastigroupServiceSpec } from './ElastigroupServiceSpec/ElastigroupServiceSpec'
import { EmailStep } from './EmailStep/EmailStep'
import { ElastigroupRollbackStep } from './ElastigroupRollbackStep/ElastigroupRollbackStep'
import { ElastigroupSetupStep } from './ElastigroupSetupStep/ElastigroupSetupStep'
import { TasServiceSpec } from './TasServiceSpec/TasServiceSpec'
import { TASInfrastructureSpec } from './TASInfrastructureStep/TASInfrastructureStep'
import { SwapRollbackStep } from './SwapRollbackStep/SwapRollback'
import { SwapRouteStep } from './SwapRouteStep/SwapRouteStep'
import { TASRollbackStep } from './TasRollbackStep/TasRollbackStep'
import { TanzuCommandStep } from './TanzuCommandStep/TanzuCommand'
import { ElastigroupDeploy } from './ElastigroupDeploy/ElastigroupDeploy'
import { ElastigroupSwapRouteStep } from './ElastigroupSwapRouteStep/ElastigroupSwapRouteStep'
import { ElastigroupBGStageSetupStep } from './ElastigroupBGStageSetupStep/ElastigroupBGStageSetupStep'
import { AppResizeStep } from './AppResizeStep/AppResizeStep'
import { TASBasicAppSetupStep } from './TASBasicAppSetupStep/TASBasicAppSetupStep'
import { TasBGAppSetupStep } from './TasBGAppSetup/TasBGAppSetup'
import { TasCanaryAppSetupStep } from './TasCanaryAppSetup/TasCanaryAppSetup'
import { AsgCanaryDeleteStep } from './AsgCanaryDeleteStep/AsgCanaryDeleteStep'
import { AsgCanaryDeployStep } from './AsgCanaryDeploy/AsgCanaryDeployStep'
import { AsgRollingRollbackStep } from './AsgRollingRollbackStep/AsgRollingRollbackStep'
import { AsgRollingDeploy } from './AsgRollingDeployStep/AsgRollingDeployStep'
import { ContainerStep } from './ContainerStep/ContainerStep'
import { GoogleCloudFunctionServiceSpec } from './GoogleCloudFunction/GoogleCloudFunctionServiceSpec/GoogleCloudFunctionServiceSpec'
import { GoogleCloudFunctionInfraSpec } from './GoogleCloudFunction/GoogleCloudFunctionInfraSpec/GoogleCloudFunctionInfraSpec'
import { DeployCloudFunctionStep } from './GoogleCloudFunction/GenTwo/DeployCloudFunctionStep/DeployCloudFunctionStep'
import { DeployCloudFunctionRollbackStep } from './GoogleCloudFunction/GenTwo/DeployCloudFunctionRollbackStep/DeployCloudFunctionRollbackStep'
import { DeployCloudFunctionNoTrafficShiftStep } from './GoogleCloudFunction/GenTwo/DeployCloudFunctionNoTrafficShiftStep/DeployCloudFunctionNoTrafficShiftStep'
import { DeployCloudFunctionTrafficShiftStep } from './GoogleCloudFunction/GenTwo/DeployCloudFunctionTrafficShiftStep/DeployCloudFunctionTrafficShiftStep'
import { TASRollingRollbackStep } from './TasRollingRollbackStep/TasRollingRollbackStep'
import { TasRollingDeploymentStep } from './TasRollingDeploymentStep/TasRollingDeploymentStep'
import { K8sDryRunStep } from './K8sDryRunStep/K8sDryRunStep'
import { AsgSwapService } from './AsgSwapServiceStep/AsgSwapServiceStep'
import { AsgBlueGreenRollbackStep } from './AsgBlueGreenRollbackStep/AsgBlueGreenRollbackStep'
import { AsgBlueGreenDeployStep } from './AsgBlueGreenDeployStep/AsgBlueGreenDeployStep'
import { AwsLambdaServiceSpec } from './AwsLambda/AwsLambdaServiceSpec/AwsLambdaServiceSpec'
import { AwsLambdaInfraSpec } from './AwsLambda/AwsLambdaInfraSpec/AwsLambdaInfraSpec'
import { AwsLambdaDeployStep } from './AwsLambda/AwsLambdaDeployStep/AwsLambdaDeployStep'
import { AwsLambdaRollbackStep } from './AwsLambda/AwsLambdaRollbackStep/AwsLambdaRollbackStep'
import { TerraformCloudRun } from './TerraformCloudRunStep/TerraformCloudRun'
import { TerraformCloudRollback } from './TerraformCloudRollbackStep/TerraformCloudRollback'
import { RouteMappingStep } from './RouteMappingStep/RouteMappingStep'
import { K8sAwsInfrastructureSpec } from './K8sAwsInfrastructureSpec/K8sAwsInfrastructureSpec'
import { DeployCloudFunctionStepGenOne } from './GoogleCloudFunction/GenOne/DeployCloudFunctionStepGenOne'
import { DeployCloudFunctionRollbackStepGenOne } from './GoogleCloudFunction/GenOne/DeployCloudFunctionRollbackStepGenOne'
import { AwsSamDeployStep } from './AwsSam/AwsSamDeployStep/AwsSamDeployStep'
import { AwsSamBuildStep } from './AwsSam/AwsSamBuildStep/AwsSamBuildStep'
import { K8sBlueGreenStageScaleDown } from './K8sBlueGreenStageScaleDown/K8sBlueGreenStageScaleDown'
import { AwsSamServiceSpec } from './AwsSam/AwsSamServiceSpec/AwsSamServiceSpec'
import { AwsSamInfraSpec } from './AwsSam/AwsSamInfraSpec/AwsSamInfraSpec'

factory.registerStep(new CommandScriptsStep())
factory.registerStep(new EmailStep())
factory.registerStep(new HttpStep())
factory.registerStep(new K8RolloutDeployStep())
factory.registerStep(new K8sRollingRollbackStep())
factory.registerStep(new K8sBlueGreenDeployStep())
factory.registerStep(new K8sCanaryDeployStep())
factory.registerStep(new K8sBGSwapServices())
factory.registerStep(new K8sScaleStep())
factory.registerStep(new K8sCanaryDeleteStep())
factory.registerStep(new K8sApplyStep())
factory.registerStep(new K8sDeleteStep())
factory.registerStep(new K8sDryRunStep())
factory.registerStep(new K8sBlueGreenStageScaleDown())
factory.registerStep(new ShellScriptStep())
factory.registerStep(new ContainerStep())
factory.registerStep(new KubernetesInfraSpec())
factory.registerStep(new GcpInfrastructureSpec())
factory.registerStep(new K8sAwsInfrastructureSpec())
factory.registerStep(new PDCInfrastructureSpec())
factory.registerStep(new SshWinRmAwsInfrastructureSpec())
factory.registerStep(new SshWinRmAzureInfrastructureSpec())
factory.registerStep(new ServerlessAwsLambdaSpec())
factory.registerStep(new ServerlessAzureSpec())
factory.registerStep(new ServerlessGCPSpec())
factory.registerStep(new DeployEnvironmentStep())
factory.registerStep(new DeployEnvironmentEntityStep())
factory.registerStep(new DeployEnvironmentGroupStep())
factory.registerStep(new DeployInfrastructureEntityStep())
factory.registerStep(new DeployClusterEntityStep())
factory.registerStep(new InlineEntityFiltersStep())
factory.registerStep(new DeployServiceStep())
factory.registerStep(new DeployServiceEntityStep())
factory.registerStep(new GenericServiceSpec())
factory.registerStep(new ServerlessAwsLambdaServiceSpec())
factory.registerStep(new AzureWebAppServiceSpec())
factory.registerStep(new HelmDeploy())
factory.registerStep(new HelmRollback())
factory.registerStep(new TerraformRollback())
factory.registerStep(new TerraformDestroy())
factory.registerStep(new TerraformApply())
factory.registerStep(new TerraformPlan())
factory.registerStep(new TerragruntRollback())
factory.registerStep(new TerragruntDestroy())
factory.registerStep(new TerragruntApply())
factory.registerStep(new TerragruntPlan())
factory.registerStep(new InfraProvisioning())
factory.registerStep(new PolicyStep())
factory.registerStep(new ServerlessLambdaDeployStep())
factory.registerStep(new ServerlessLambdaRollbackStep())
factory.registerStep(new AzureInfrastructureSpec())
factory.registerStep(new AzureWebAppInfrastructureSpec())
factory.registerStep(new CFRollbackStack())
factory.registerStep(new CFDeleteStack())
factory.registerStep(new CFCreateStack())
factory.registerStep(new SshServiceSpec())
factory.registerStep(new WinRmServiceSpec())
factory.registerStep(new CreatePr())
factory.registerStep(new UpdateReleaseRepo())
factory.registerStep(new GitOpsFetchLinkedApps())
factory.registerStep(new MergePR())
factory.registerStep(new FetchInstanceScript())
factory.registerStep(new AzureWebAppRollback())
factory.registerStep(new AzureSlotDeployment())
factory.registerStep(new AzureTrafficShift())
factory.registerStep(new AzureSwapSlot())
factory.registerStep(new ECSInfraSpec())
factory.registerStep(new AsgInfraSpec())
factory.registerStep(new ECSServiceSpec())
factory.registerStep(new ECSRollingDeployStep())
factory.registerStep(new ECSRollingRollbackStep())
factory.registerStep(new ECSCanaryDeployStep())
factory.registerStep(new ECSCanaryDeleteStep())
factory.registerStep(new AzureArmRollback())
factory.registerStep(new AzureBlueprintStep())
factory.registerStep(new ECSRunTaskStep())
factory.registerStep(new ECSBlueGreenCreateServiceStep())
factory.registerStep(new ECSBlueGreenSwapTargetGroupsStep())
factory.registerStep(new ECSBlueGreenRollbackStep())
factory.registerStep(new AzureArmStep())
factory.registerStep(new CustomDeploymentServiceSpec())
factory.registerStep(new CustomDeploymentInfrastructureSpec())
factory.registerStep(new ShellScriptProvisionStep())
factory.registerStep(new ElastigroupInfrastructureSpec())
factory.registerStep(new ElastigroupServiceSpec())
factory.registerStep(new ElastigroupRollbackStep())
factory.registerStep(new ElastigroupSetupStep())
factory.registerStep(new TasServiceSpec())
factory.registerStep(new TASInfrastructureSpec())
factory.registerStep(new ASGServiceSpec())
factory.registerStep(new SwapRollbackStep())
factory.registerStep(new SwapRouteStep())
factory.registerStep(new TASRollbackStep())
factory.registerStep(new TanzuCommandStep())
factory.registerStep(new ElastigroupDeploy())
factory.registerStep(new ElastigroupSwapRouteStep())
factory.registerStep(new ElastigroupBGStageSetupStep())
factory.registerStep(new AppResizeStep())
factory.registerStep(new TASBasicAppSetupStep())
factory.registerStep(new TasBGAppSetupStep())
factory.registerStep(new TasCanaryAppSetupStep())
factory.registerStep(new TASRollingRollbackStep())
factory.registerStep(new TasRollingDeploymentStep())
factory.registerStep(new RouteMappingStep())
factory.registerStep(new AsgCanaryDeleteStep())
factory.registerStep(new AsgCanaryDeployStep())
factory.registerStep(new AsgRollingRollbackStep())
factory.registerStep(new AsgRollingDeploy())
factory.registerStep(new GoogleCloudFunctionServiceSpec())
factory.registerStep(new GoogleCloudFunctionInfraSpec())
factory.registerStep(new DeployCloudFunctionStep())
factory.registerStep(new DeployCloudFunctionStepGenOne())
factory.registerStep(new DeployCloudFunctionRollbackStep())
factory.registerStep(new DeployCloudFunctionRollbackStepGenOne())
factory.registerStep(new DeployCloudFunctionNoTrafficShiftStep())
factory.registerStep(new DeployCloudFunctionTrafficShiftStep())
factory.registerStep(new AsgSwapService())
factory.registerStep(new AsgBlueGreenRollbackStep())
factory.registerStep(new AsgBlueGreenDeployStep())
factory.registerStep(new AwsLambdaServiceSpec())
factory.registerStep(new AwsLambdaInfraSpec())
factory.registerStep(new AwsLambdaDeployStep())
factory.registerStep(new AwsLambdaRollbackStep())
factory.registerStep(new TerraformCloudRun())
factory.registerStep(new TerraformCloudRollback())
factory.registerStep(new AwsSamDeployStep())
factory.registerStep(new AwsSamBuildStep())
factory.registerStep(new AwsSamServiceSpec())
factory.registerStep(new AwsSamInfraSpec())
