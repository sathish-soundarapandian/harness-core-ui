/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  InlineTerragruntBackendConfigSpec,
  RemoteTerragruntBackendConfigSpec,
  StepElementConfig,
  TerragruntBackendConfig,
  TerragruntModuleConfig,
  TerragruntPlanExecutionData,
  TerragruntPlanStepInfo,
  TerragruntRollbackStepInfo,
  TerragruntStepConfiguration,
  TerragruntVarFileWrapper
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { Connector } from '../ConfigFileStore/ConfigFileStoreHelper'

interface StoreSpec {
  type: any
  spec?: {
    gitFetchType?: string
    branch?: string
    commitId?: string
    folderPath?: string
    connectorRef?: string | Connector
    repositoryName?: string
    artifactPaths?: string
  }
}
interface RemoteTerragruntCustomBackendConfigSpec extends Omit<RemoteTerragruntBackendConfigSpec, 'store'> {
  store?: StoreSpec
}
interface TerragruntCustomBackendConfig extends Omit<TerragruntBackendConfig, 'spec'> {
  spec?: InlineTerragruntBackendConfigSpec | RemoteTerragruntCustomBackendConfigSpec
}

export interface TGDataSpec {
  configFiles?: {
    store?: StoreSpec
  }
  moduleConfig?: {
    path?: string
    terragruntRunType: TerragruntModuleConfig['terragruntRunType']
  }
  workspace?: string
  backendConfig?: TerragruntCustomBackendConfig
  targets?: any
  environmentVariables?: any
  varFiles?: TerragruntVarFileWrapper[]
  exportTerragruntPlanJson?: boolean
}

export interface TerragruntData extends StepElementConfig {
  spec: {
    provisionerIdentifier: string
    configuration: {
      type: TerragruntStepConfiguration['type']
      spec?: TGDataSpec
    }
  }
}

export interface TerragruntVariableStepProps {
  initialValues: TerragruntData
  originalData?: TerragruntData
  stageIdentifier?: string
  onUpdate?(data: TerragruntData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData?: TerragruntData
  stepType?: string
}

export interface TerragruntProps<T = TerragruntData> {
  initialValues: T
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: T
    path?: string
  }
  readonly?: boolean
  path?: string
  stepType?: string
  gitScope?: GitFilterScope
  allValues?: T
  isBackendConfig?: boolean
}

export interface TGRollbackData extends StepElementConfig {
  spec: TerragruntRollbackStepInfo
}

export interface TerragruntRollbackProps {
  initialValues: TGRollbackData
  onUpdate?: (data: TGRollbackData) => void
  onChange?: (data: TGRollbackData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: TGRollbackData
    path?: string
  }
  readonly?: boolean
}

export interface TerragruntRollbackVariableStepProps {
  initialValues: TGRollbackData
  stageIdentifier: string
  onUpdate?(data: TGRollbackData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TGRollbackData
}
export interface TGPlanFormData extends StepElementConfig {
  spec: Omit<TerragruntPlanStepInfo, 'configuration'> & {
    configuration: Omit<TerragruntPlanExecutionData, 'environmentVariables' | 'targets'> & {
      targets?: Array<{ id: string; value: string }> | string[] | string
      environmentVariables?: Array<{ key: string; id: string; value: string }> | string
    }
  }
}

export interface TerragruntPlanProps {
  initialValues: TGPlanFormData
  onUpdate?: (data: TGPlanFormData) => void
  onChange?: (data: TGPlanFormData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: TGPlanFormData
    path?: string
  }
  path?: string
  readonly?: boolean
  gitScope?: GitFilterScope
  stepType?: string
  allValues?: TGPlanFormData
  isBackendConfig?: boolean
}

export interface TerragruntPlanVariableStepProps {
  initialValues: TGPlanFormData
  originalData?: TGPlanFormData
  stageIdentifier?: string
  onUpdate?(data: TGPlanFormData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TGPlanFormData
}
