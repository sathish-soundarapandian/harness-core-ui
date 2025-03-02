/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { EntityGitDetails } from 'services/pipeline-ng'
import type { Module as ModuleName } from 'framework/types/ModuleName'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'

export interface AccountPathProps {
  accountId: string
}

export interface OrgPathProps extends AccountPathProps {
  orgIdentifier: string
}

export interface DashboardPathProps extends AccountPathProps {
  folderId: string
}

export interface GitQueryParams {
  branch?: EntityGitDetails['branch']
  repoIdentifier?: EntityGitDetails['repoIdentifier']
  repoName?: StoreMetadata['repoName']
  connectorRef?: StoreMetadata['connectorRef']
  storeType?: StoreMetadata['storeType']
}

export interface InputSetGitQueryParams extends GitQueryParams {
  inputSetBranch?: EntityGitDetails['branch']
  inputSetRepoIdentifier?: EntityGitDetails['repoIdentifier']
  inputSetRepoName?: EntityGitDetails['repoName']
  inputSetConnectorRef?: StoreMetadata['connectorRef']
}
export interface PipelineStudioQueryParams extends GitQueryParams, RunPipelineQueryParams {
  stageId?: string
  stepId?: string
  sectionId?: string
}
export interface RunPipelineQueryParams extends GitQueryParams, InputSetGitQueryParams {
  runPipeline?: boolean
  executionId?: string
  inputSetType?: string
  inputSetLabel?: string
  inputSetValue?: string
  stagesExecuted?: string[]
}

export interface ProjectPathProps extends OrgPathProps {
  projectIdentifier: string
  stageId?: string
  stepId?: string
}

export interface PipelinePathProps extends ProjectPathProps {
  pipelineIdentifier: string
}

export interface PipelineLogsPathProps extends ExecutionPathProps {
  stageIdentifier: string
  stepIndentifier: string
}

export interface GitOpsAppPathProps extends ProjectPathProps {
  applicationId: string
}

export interface GitOpsAppQueryParams {
  agentId?: string // this is query param
}

export type TemplateType =
  | 'Step'
  | 'Stage'
  | 'Pipeline'
  | 'CustomDeployment'
  | 'ArtifactSource'
  | 'Service'
  | 'Infrastructure'
  | 'StepGroup'
  | 'Execution'
  | 'MonitoredService'
  | 'SecretManager'
  | ':templateType(Step)'
  | ':templateType(Stage)'
  | ':templateType(Pipeline)'
  | ':templateType(CustomDeployment)'
  | ':templateType(Service)'
  | ':templateType(Infrastructure)'
  | ':templateType(StepGroup)'
  | ':templateType(Execution)'
  | ':templateType(MonitoredService)'
  | ':templateType(SecretManager)'
  | ':templateType(ArtifactSource)'
  | ':templateType'

export interface TemplateStudioPathProps extends ProjectPathProps {
  templateType: TemplateType
  templateIdentifier: string
}
export interface InputSetPathProps extends PipelinePathProps {
  inputSetIdentifier: string
}
export interface TriggerPathProps extends PipelinePathProps {
  triggerIdentifier: string
  triggerType?: string
  sourceRepo?: string
  artifactType?: string
  manifestType?: string
  scheduleType?: string
}

export interface TriggerQueryParams {
  triggerIdentifier: string
  triggerType?: string
  sourceRepo?: string
  artifactType?: string
  manifestType?: string
  scheduleType?: string
}

export interface ExecutionPathProps extends PipelinePathProps {
  executionIdentifier: string
  source: 'deployments' | 'executions' | 'builds' | ':source(deployments|executions|builds)'
  stage?: string
  step?: string
  stageExecId?: string
}
export interface ExecutionQueryParams {
  stage?: string
  childStage?: string
}

export interface BuildPathProps extends ProjectPathProps {
  buildIdentifier: string
}

export interface ConnectorPathProps {
  connectorId: string
}

export interface VerificationPathProps {
  verificationId: string
}
export interface SecretsPathProps {
  secretId: string
}

export interface VariablesPathProps {
  variableId: string
}
export interface RolePathProps {
  roleIdentifier: string
}
export interface ResourceGroupPathProps {
  resourceGroupIdentifier: string
}
export interface DelegatePathProps {
  delegateIdentifier: string
}

export interface DelegateConfigProps {
  delegateConfigIdentifier: string
}

export interface FeatureFlagPathProps {
  featureFlagIdentifier: string
}

export interface SegmentPathProps {
  segmentIdentifier: string
}
export interface TargetPathProps {
  targetIdentifier: string
}

export interface EnvironmentPathProps {
  environmentIdentifier: string
}

export interface EnvironmentQueryParams {
  sectionId?: 'CONFIGURATION' | 'INFRASTRUCTURE' | 'SERVICE_OVERRIDES' | 'GITOPS' | 'SUMMARY' | 'REFERENCED_BY'
  infrastructureId?: string
  infraDetailsTab?: 'CONFIGURATION' | 'REFERENCEDBY'
}

export interface EnvironmentGroupPathProps {
  environmentGroupIdentifier: string
}

export interface EnvironmentGroupQueryParams {
  sectionId?: 'CONFIGURATION' | 'ENVIRONMENTS'
}

export interface ServiceOverridesQueryParams {
  sectionId?: 'ENVIRONMENT_GLOBAL' | 'ENVIRONMENT_SERVICE_SPECIFIC' | 'INFRA_GLOBAL' | 'INFRA_SERVICE_SPECIFIC'
}

export interface CVDataSourceTypePathProps {
  dataSourceType: string
}

export interface ServicePathProps {
  serviceId: string
}

export type ModuleNameMatch =
  | ':module'
  | ':module(ci)'
  | ':module(cd)'
  | ':module(cf)'
  | ':module(cv)'
  | ':module(ce)'
  | ':module(sto)'
  | ':module(chaos)'
  | ':module(iacm)'
  | ':module(ssca)'
  | ':module(idp)'
  | ':module(dashboards)'
  | ':module(cet)'

export type Module = ModuleName | ModuleNameMatch

export interface ModulePathParams {
  module: Module
}

export type ModuleHomeParams = {
  module: Module
  source?: string
}

export type PipelineType<T> = T & Partial<ModulePathParams>

export type PathFn<T> = (props: AccountPathProps & T) => string

export interface ResourceGroupDetailsPathProps extends ProjectPathProps {
  resourceGroupIdentifier: string
}

export interface UserGroupPathProps {
  userGroupIdentifier: string
}

export interface UserPathProps {
  userIdentifier: string
}

export interface ServiceAccountPathProps {
  serviceAccountIdentifier: string
}

export interface SubscriptionQueryParams {
  moduleCard?: Module
  tab?: 'OVERVIEW' | 'PLANS' | 'BILLING'
}

export interface TemplateStudioQueryParams extends GitQueryParams {
  versionLabel?: string
}

export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>

export interface GovernancePathProps
  extends RequiredField<
    Partial<Pick<ProjectPathProps, 'accountId' | 'orgIdentifier' | 'projectIdentifier'> & ModulePathParams>,
    'accountId'
  > {
  policyIdentifier?: string
  policySetIdentifier?: string
  evaluationId?: string
}

export interface AccountLevelGitOpsPathProps {
  entity: string
}

/**
 * At Account level we have two places for nav links
 * At home dashboard level or account resources(settings) level
 */
export type AccountRoutePlacement = 'settings' | 'dashboard'
