import type { AllowedTypes } from '@harness/uicore'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ElastigroupServiceSpec, ServiceDefinition } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface ElastigroupServiceStep extends ElastigroupServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: Record<string, any>
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}
export interface ElastigroupServiceSpecFormProps {
  initialValues: ElastigroupServiceStep
  onUpdate?: ((data: ElastigroupServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ElastigroupServiceSpec
  allValues?: ElastigroupServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  formik?: any
  serviceIdentifier?: string
  allowableTypes: AllowedTypes
}

export interface ElastigroupInputSetFormProps {
  initialValues: ElastigroupServiceStep
  onUpdate?: ((data: ElastigroupServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ElastigroupServiceSpec
  allValues?: ElastigroupServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  serviceIdentifier?: string
  formik?: any
  allowableTypes: AllowedTypes
}

export interface ElastigroupServiceSpecVariablesFormProps {
  initialValues: ElastigroupServiceSpec
  stepsFactory: AbstractStepFactory
  stageIdentifier: string
  serviceIdentifier?: string
  onUpdate?(data: ElastigroupServiceSpec): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ElastigroupServiceSpec
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
}
