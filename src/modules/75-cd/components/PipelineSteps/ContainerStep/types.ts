/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeSelectOption
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StepElementConfig } from 'services/cd-ng'
import type { ContainerStepInfo, VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface ContainerStepData extends StepElementConfig {
  spec: Omit<ContainerStepInfo, 'outputVariables' | 'shell'> & {
    outputVariables?: MultiTypeListUIType | MultiTypeListType | Array<{ id?: string; value?: string; name?: string }>
    shell?: MultiTypeSelectOption
  }
}
export interface ContainerStepProps {
  initialValues: ContainerStepData
  template?: ContainerStepData
  path?: string
  readonly?: boolean
  stepViewType: StepViewType
  isNewStep?: boolean
  onUpdate?: (data: ContainerStepData) => void
  onChange?: (data: ContainerStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export interface ContainerStepVariableProps {
  initialValues: StepElementConfig
  stageIdentifier: string
  onUpdate?(data: StepElementConfig): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: StepElementConfig
}
