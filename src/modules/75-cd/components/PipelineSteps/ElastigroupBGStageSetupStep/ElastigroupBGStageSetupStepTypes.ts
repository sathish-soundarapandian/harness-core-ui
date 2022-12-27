/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type {
  AwsCloudProviderBasicConfig,
  AwsLoadBalancerConfigYaml,
  CloudProvider,
  ElastigroupBGStageSetupStepInfo,
  ElastigroupCurrentRunningInstances,
  ElastigroupFixedInstances,
  LoadBalancer,
  StepElementConfig
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface ElastigroupBGCurrentRunningInstances {
  connectedCloudProvider: CloudProvider & {
    spec: AwsCloudProviderBasicConfig
  }
  loadBalancers: LoadBalancer[] & {
    spec: AwsLoadBalancerConfigYaml
  }
}

export interface ElastigroupBGStageSetupInstances {
  type: 'Fixed' | 'CurrentRunning'
  spec: ElastigroupFixedInstances | ElastigroupCurrentRunningInstances
}

export interface ElastigroupBGStageSetupData extends StepElementConfig {
  spec: ElastigroupBGStageSetupStepInfo & {
    name: string
    instances: ElastigroupBGStageSetupInstances
    connectedCloudProvider: CloudProvider & {
      spec: AwsCloudProviderBasicConfig
    }
    loadBalancers: {
      type: 'AWSLoadBalancerConfig'
      id?: string
      spec: AwsLoadBalancerConfigYaml
    }[]
  }
}

export interface ElastigroupBGStageSetupCustomStepProps {
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ElastigroupBGStageSetupData
  selectedStage: StageElementWrapper<DeploymentStageElementConfig>
  stageIdentifier: string
}

export interface ElastigroupBGStageSetupTemplate {
  identifier: string
  timeout: string
  name: string
  type: StepType.ElastigroupBGStageSetup
  spec: {
    name: string
    instances: {
      type: string
      spec: {
        desired: string
        max: string
        min: string
      }
    }
  }
}
