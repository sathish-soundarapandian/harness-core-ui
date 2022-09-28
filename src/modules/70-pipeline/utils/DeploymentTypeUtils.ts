/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { ServiceDefinition } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'

export type ServiceTypes = ServiceDefinition['type'] & 'KubernetesGitOps'

export const deploymentTypeLabel: Record<ServiceDefinition['type'], StringKeys> = {
  Kubernetes: 'kubernetesText',
  NativeHelm: 'pipeline.nativeHelm',
  Ssh: 'SSH',
  ServerlessAwsLambda: 'pipeline.serviceDeploymentTypes.serverlessAwsLambda',
  WinRm: 'pipeline.serviceDeploymentTypes.winrm',
  AzureWebApp: 'pipeline.serviceDeploymentTypes.azureWebApp',
  ECS: 'pipeline.serviceDeploymentTypes.amazonEcs',
  CustomDeployment: 'pipeline.serviceDeploymentTypes.customDeployment'
}

export const deploymentTypeIcon: Record<ServiceTypes, IconName> = {
  Kubernetes: 'service-kubernetes',
  NativeHelm: 'service-helm',
  ServerlessAwsLambda: 'service-serverless',
  Ssh: 'secret-ssh',
  WinRm: 'command-winrm',
  AzureWebApp: 'azurewebapp',
  KubernetesGitOps: 'gitops-green', //type specific to gitops
  ECS: 'service-amazon-ecs'
}

// this is added for card names in execution strategies
export const executionStrategyTypes: Record<ServiceDefinition['type'], StringKeys> = {
  Kubernetes: 'kubernetesText',
  NativeHelm: 'pipeline.nativeHelm',
  Ssh: 'SSH',
  WinRm: 'pipeline.serviceDeploymentTypes.winrm',
  ServerlessAwsLambda: 'pipeline.serviceDeploymentTypes.serverlessAwsType',
  AzureWebApp: 'pipeline.serviceDeploymentTypes.azureWebApp',
  CustomDeployment: 'pipeline.serviceDeploymentTypes.customDeploy',
  ECS: 'ce.common.containerService'
}
