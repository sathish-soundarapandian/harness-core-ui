/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CustomDeploymentNGVariable, StoreConfigWrapper } from 'services/cd-ng'
import type { VariableMergeServiceResponse, PipelineInfoConfig, ShellScriptInlineSource } from 'services/pipeline-ng'

export interface PipelineVariablesData {
  variablesPipeline: PipelineInfoConfig
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

interface InstanceAttributeVariable {
  id?: string
  name?: string
  jsonPath?: string
  description?: string
}

export interface DeploymentInfra {
  variables?: Array<CustomDeploymentNGVariable>
  fetchInstancesScript?: {
    store?: StoreConfigWrapper | ShellScriptInlineSource
  }
  instancesListPath?: string
  instanceAttributes?: Array<InstanceAttributeVariable>
}

export interface DeploymentConfig {
  infrastructure: DeploymentInfra
  execution: {
    stepTemplateRefs: string[]
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
