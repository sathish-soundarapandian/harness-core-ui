/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ReactElement } from 'react'
import type { PopoverProps } from '@harness/uicore/dist/components/Popover/Popover'
import type { IconName } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

export const deploymentIconMap: Record<string, IconName> = {
  [ServiceDeploymentType.AmazonSAM]: 'service-aws-sam',
  [ServiceDeploymentType.AzureFunctions]: 'service-azure-functions',
  [ServiceDeploymentType.AzureWebApp]: 'azurewebapp',
  [ServiceDeploymentType.ECS]: 'service-amazon-ecs',
  [ServiceDeploymentType.Kubernetes]: 'service-kubernetes',
  [ServiceDeploymentType.KubernetesGitops]: 'kubernetes-gitops',
  [ServiceDeploymentType.NativeHelm]: 'service-helm',
  [ServiceDeploymentType.Pdc]: 'pdc',
  [ServiceDeploymentType.ServerlessAwsLambda]: 'service-serverless-aws',
  [ServiceDeploymentType.ServerlessAzureFunctions]: 'service-serverless-azure',
  [ServiceDeploymentType.ServerlessGoogleFunctions]: 'gcp',
  [ServiceDeploymentType.Ssh]: 'secret-ssh',
  [ServiceDeploymentType.WinRm]: 'command-winrm',
  [ServiceDeploymentType.amazonAmi]: 'main-service-ami',
  [ServiceDeploymentType.awsCodeDeploy]: 'app-aws-code-deploy',
  [ServiceDeploymentType.awsLambda]: 'service-aws-lamda',
  [ServiceDeploymentType.TAS]: 'tas',
  [ServiceDeploymentType.CustomDeployment]: 'CustomDeployment',
  [ServiceDeploymentType.Elastigroup]: 'elastigroup',
  [ServiceDeploymentType.Asg]: 'aws-asg',
  [ServiceDeploymentType.GoogleCloudFunctions]: 'service-google-functions',
  [ServiceDeploymentType.AwsLambda]: 'service-aws-native-lambda',
  [ServiceDeploymentType.AwsSam]: 'service-aws-sam'
}

export interface DeploymentTypeItem {
  label: StringKeys
  icon: IconName
  value: string
  disabled?: boolean
  tooltip?: ReactElement | string
  tooltipProps?: PopoverProps
}

export interface GetNgSupportedDeploymentTypesProps {
  NG_SVC_ENV_REDESIGN?: boolean
  CDS_ASG_NG?: boolean
  CDS_GOOGLE_CLOUD_FUNCTION?: boolean
  CDP_AWS_SAM?: boolean
}

export function getNgSupportedDeploymentTypes(props: GetNgSupportedDeploymentTypesProps): DeploymentTypeItem[] {
  const { NG_SVC_ENV_REDESIGN, CDS_GOOGLE_CLOUD_FUNCTION, CDP_AWS_SAM } = props

  const baseTypes: DeploymentTypeItem[] = [
    {
      label: 'pipeline.serviceDeploymentTypes.kubernetes',
      icon: deploymentIconMap[ServiceDeploymentType.Kubernetes],
      value: ServiceDeploymentType.Kubernetes
    },
    {
      label: 'pipeline.nativeHelm',
      icon: deploymentIconMap[ServiceDeploymentType.NativeHelm],
      value: ServiceDeploymentType.NativeHelm
    },
    {
      label: 'pipeline.serviceDeploymentTypes.serverlessAwsLambda',
      icon: deploymentIconMap[ServiceDeploymentType.ServerlessAwsLambda],
      value: ServiceDeploymentType.ServerlessAwsLambda
    },
    {
      label: 'pipeline.serviceDeploymentTypes.ssh',
      icon: deploymentIconMap[ServiceDeploymentType.Ssh],
      value: ServiceDeploymentType.Ssh
    },
    {
      label: 'pipeline.serviceDeploymentTypes.winrm',
      icon: deploymentIconMap[ServiceDeploymentType.WinRm],
      value: ServiceDeploymentType.WinRm
    },
    {
      label: 'pipeline.serviceDeploymentTypes.asg',
      icon: deploymentIconMap[ServiceDeploymentType.Asg],
      value: ServiceDeploymentType.Asg
    },
    {
      label: 'pipeline.serviceDeploymentTypes.spotElastigroup',
      icon: deploymentIconMap[ServiceDeploymentType.Elastigroup],
      value: ServiceDeploymentType.Elastigroup
    }
  ]

  if (NG_SVC_ENV_REDESIGN) {
    baseTypes.push({
      label: 'pipeline.serviceDeploymentTypes.awsLambda',
      icon: deploymentIconMap[ServiceDeploymentType.AwsLambda],
      value: ServiceDeploymentType.AwsLambda
    })
  }

  if (NG_SVC_ENV_REDESIGN && CDP_AWS_SAM) {
    baseTypes.push({
      label: 'pipeline.serviceDeploymentTypes.awsSAM',
      icon: deploymentIconMap[ServiceDeploymentType.AwsSam],
      value: ServiceDeploymentType.AwsSam
    })
  }

  if (NG_SVC_ENV_REDESIGN && CDS_GOOGLE_CLOUD_FUNCTION) {
    baseTypes.push({
      label: 'pipeline.serviceDeploymentTypes.googleCloudFunctions',
      icon: deploymentIconMap[ServiceDeploymentType.GoogleCloudFunctions],
      value: ServiceDeploymentType.GoogleCloudFunctions
    })
  }

  if (NG_SVC_ENV_REDESIGN) {
    baseTypes.push({
      label: 'pipeline.serviceDeploymentTypes.amazonEcs',
      icon: deploymentIconMap[ServiceDeploymentType.ECS],
      value: ServiceDeploymentType.ECS
    })
  }
  if (NG_SVC_ENV_REDESIGN) {
    baseTypes.push({
      label: 'pipeline.serviceDeploymentTypes.azureWebApp',
      icon: deploymentIconMap[ServiceDeploymentType.AzureWebApp],
      value: ServiceDeploymentType.AzureWebApp
    })
  }
  if (NG_SVC_ENV_REDESIGN) {
    baseTypes.push({
      label: 'pipeline.serviceDeploymentTypes.tas',
      icon: deploymentIconMap[ServiceDeploymentType.TAS],
      value: ServiceDeploymentType.TAS
    })
  }

  return baseTypes
}

export interface GetCgSupportedDeploymentTypesProps {
  NG_SVC_ENV_REDESIGN?: boolean
}

export function getCgSupportedDeploymentTypes(props: GetCgSupportedDeploymentTypesProps): DeploymentTypeItem[] {
  const { NG_SVC_ENV_REDESIGN } = props

  const types: DeploymentTypeItem[] = [
    {
      label: 'pipeline.serviceDeploymentTypes.amazonAmi',
      icon: deploymentIconMap[ServiceDeploymentType.amazonAmi],
      value: ServiceDeploymentType.amazonAmi
    },
    {
      label: 'pipeline.serviceDeploymentTypes.awsCodeDeploy',
      icon: deploymentIconMap[ServiceDeploymentType.awsCodeDeploy],
      value: ServiceDeploymentType.awsCodeDeploy
    },
    {
      label: 'pipeline.serviceDeploymentTypes.awsLambda',
      icon: deploymentIconMap[ServiceDeploymentType.awsLambda],
      value: ServiceDeploymentType.awsLambda
    },
    {
      label: 'pipeline.serviceDeploymentTypes.tas',
      icon: deploymentIconMap[ServiceDeploymentType.TAS],
      value: ServiceDeploymentType.TAS
    },
    {
      label: 'pipeline.serviceDeploymentTypes.ssh',
      icon: deploymentIconMap[ServiceDeploymentType.Ssh],
      value: ServiceDeploymentType.Ssh
    },
    {
      label: 'pipeline.serviceDeploymentTypes.winrm',
      icon: deploymentIconMap[ServiceDeploymentType.WinRm],
      value: ServiceDeploymentType.WinRm
    }
  ]

  if (!NG_SVC_ENV_REDESIGN) {
    types.unshift({
      label: 'pipeline.serviceDeploymentTypes.amazonEcs',
      icon: deploymentIconMap[ServiceDeploymentType.ECS],
      value: ServiceDeploymentType.ECS
    })
  }

  return types
}
