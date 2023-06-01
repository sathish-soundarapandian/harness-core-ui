/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

export interface IACMTerraformPluginData {
  type: string
  name: string
  identifier: string
  timeout: string
  spec: {
    command: string
  }
}

export interface IACMTerraformPluginStepInfo {
  spec: {
    command: string
  }
  name: string
  identifier: string
  type: string
}

export interface IACMTerraformPluginStepProps {
  initialValues: IACMTerraformPluginData
  originalData?: IACMTerraformPluginData
  stageIdentifier?: string
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData?: IACMTerraformPluginData
  stepType?: string
}

export interface IACMTerraformPluginProps<T = IACMTerraformPluginData> {
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

export enum CommandTypes {
  INIT = 'init',
  PLAN = 'plan',
  DESTROY = 'destroy',
  PLANDESTROY = 'plan-destroy',
  APPLY = 'apply'
}
