/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type {
  DeploymentStageConfig,
  EnvironmentGroupResponseDTO,
  InfrastructureDefinitionConfig,
  NGEnvironmentInfoConfig,
  ServiceDefinition,
  TemplateLinkConfig
} from 'services/cd-ng'

export interface DeployEnvironmentEntityConfig extends Omit<DeploymentStageConfig, 'execution'> {
  environment?: DeploymentStageConfig['environment']
  environments?: DeploymentStageConfig['environments']
  environmentGroup?: DeploymentStageConfig['environmentGroup']
}

export interface DeployEnvironmentEntityFormState {
  environment?: string
  environments?: SelectOption[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  environmentInputs?: Record<string, any>
  parallel?: boolean
  infrastructure?: string
  infrastructures?: Record<string, SelectOption[]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infrastructureInputs?: Record<string, Record<string, any>>
  // ? Check if required
  deployToAllInfrastructures?: boolean
  environmentGroup?: string
  deployToAllEnvironments?: boolean
  gitOpsEnabled?: DeploymentStageConfig['gitOpsEnabled']
}

export interface DeployEnvironmentEntityCustomStepProps {
  stageIdentifier?: string
  deploymentType?: ServiceDefinition['type']
  gitOpsEnabled?: boolean
  customDeploymentRef?: TemplateLinkConfig
}
// Environments

export interface EnvironmentData {
  environment: NGEnvironmentInfoConfig & { yaml: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  environmentInputs?: any
}

export interface EnvironmentWithInputs {
  environments: SelectOption[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  environmentInputs: Record<string, any>
  parallel?: boolean
}

// Infrastructures

// TODO: Update this type
export interface InfrastructureYaml {
  description?: string
  identifier: string
  name: string
  tags?: {
    [key: string]: string
  }
  deploymentType: InfrastructureDefinitionConfig['deploymentType']
}

export interface InfrastructureData {
  infrastructureDefinition: InfrastructureYaml & { yaml: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infrastructureInputs?: any
}

export interface InfrastructureWithInputs {
  infrastructures: Record<string, SelectOption[]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infrastructureInputs: Record<string, any>
  deployToAllInfrastructures?: boolean
}

export interface EnvironmentGroupConfig extends EnvironmentGroupResponseDTO {
  name: string
  identifier: string
}

export interface EnvironmentGroupData {
  envGroup?: EnvironmentGroupConfig
}
