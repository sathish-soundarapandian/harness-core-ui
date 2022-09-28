/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

export interface RollbackStackData {
  type: string
  name: string
  identifier: string
  spec: {
    provisionerIdentifier: string
  }
  timeout: string
}

export interface RollbackStackStepInfo {
  spec: {
    provisionerIdentifier: string
  }
  name: string
  identifier: string
  timeout: string
  type: string
}

export interface RollbackVariableStepProps {
  initialValues: RollbackStackData
  originalData?: RollbackStackData
  stageIdentifier?: string
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData?: RollbackStackData
  stepType?: string
}

export interface RollbackStackProps<T = RollbackStackData> {
  initialValues: T
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: T
    path?: string
  }
  readonly?: boolean
  path?: string
  stepType?: string
  allValues?: T
}
