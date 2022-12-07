import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { AllowedTypes } from '@harness/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  StepElementConfig,
  TerragruntApplyStepInfo,
  TerragruntDestroyStepInfo,
  TerragruntPlanExecutionData,
  TerragruntPlanStepInfo,
  TerragruntRollbackStepInfo
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface TGDataSpec {
  configFiles?: {
    store?: {
      type?: string
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
  }
  moduleConfig?: {
    path?: string
    terragruntRunType: 'RunAll' | 'RunModule'
  }
}

export interface TerragruntData extends StepElementConfig {
  spec?: {
    provisionerIdentifier?: string
    configuration?: {
      type?: 'Inline' | 'InheritFromPlan' | 'InheritFromApply'
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
}

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

export interface TGFormData extends StepElementConfig {
  spec?: TerragruntApplyStepInfo
}

export interface TGDestroyData extends StepElementConfig {
  spec?: TerragruntDestroyStepInfo
}

export interface TGPlanFormData extends StepElementConfig {
  spec?: TerragruntPlanStepInfo
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
}
