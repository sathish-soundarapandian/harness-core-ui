/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StoreConfigWrapper } from 'services/cd-ng'
import type { VariableMergeServiceResponse, PipelineInfoConfig, ShellScriptInlineSource } from 'services/pipeline-ng'

export interface PipelineVariablesData {
  variablesPipeline: PipelineInfoConfig
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

type CustomDeploymentInfraNGVariable = {
  value?: number | string
  id?: string
  name?: string
  type?: 'String' | 'Secret' | 'Connector'
}

interface InstanceAttributeVariable {
  id?: string
  fieldName?: string
  jsonPath?: string
  description?: string
}

export interface DeploymentInfra {
  variables?: Array<CustomDeploymentInfraNGVariable>
  fetchInstancesScript?: {
    store?: StoreConfigWrapper | ShellScriptInlineSource
  }
  instancesListPath?: string
  instanceAttributes?: Array<InstanceAttributeVariable>
}

export interface DeploymentConfigStepTemplateRefDetails {
  templateRef: string
  versionLabel: string
}

export interface DeploymentConfig {
  infrastructure: DeploymentInfra
  execution: {
    stepTemplateRefs: DeploymentConfigStepTemplateRefDetails[]
  }
}

export interface DeploymentTemplateConfig extends DeploymentConfig {
  description?: string
  identifier: string
  name?: string
  tags?: {
    [key: string]: string
  }
  type?: string
}
