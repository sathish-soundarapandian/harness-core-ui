import type { AllowedTypes } from '@harness/uicore'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  StepElementConfig,
  TerragruntPlanExecutionData,
  TerragruntPlanStepInfo,
  TerragruntBackendConfig,
  TerragruntRollbackStepInfo,
  RemoteTerragruntBackendConfigSpec,
  InlineTerragruntBackendConfigSpec,
  TerragruntVarFileWrapper
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { CommonData, CommonProps, CommonVariableStepProps } from '../Terraform/TerraformInterfaces'

interface StoreSpec {
  type?: any
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
    terragruntRunType: 'RunAll' | 'RunModule'
  }
  workspace?: string
  backendConfig?: TerragruntCustomBackendConfig
  targets?: any
  environmentVariables?: any
  varFiles?: TerragruntVarFileWrapper[]
  exportTerragruntPlanJson?: boolean
}

export type TerragruntData = CommonData<TGDataSpec>

export type TerragruntProps = CommonProps<TerragruntData>

export type TerragruntVariableStepProps = CommonVariableStepProps<TerragruntData>

export interface Connector {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: {
    type: string
    identifier: string
    name: string
    spec: { val: string; url: string; connectionType?: string; type?: string }
  }
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

export type TerragruntPlanProps = CommonProps<TGPlanFormData>

export type TerragruntPlanVariableStepProps = CommonVariableStepProps<TGPlanFormData>
