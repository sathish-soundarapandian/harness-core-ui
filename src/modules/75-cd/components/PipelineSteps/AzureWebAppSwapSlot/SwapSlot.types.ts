/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { SelectedStageType } from '../AzureSlotDeployment/utils'

export interface AzureWebAppSwapSlotStepInfo {
  name: string
  identifier: string
  timeout: string
}

export interface AzureWebAppSwapSlotData {
  type: string
  name: string
  identifier: string
  timeout: string
  spec: {
    targetSlot: string
  }
}

export interface AzureWebAppSwapSlotVariableStepProps {
  initialValues: AzureWebAppSwapSlotData
  originalData?: AzureWebAppSwapSlotData
  stageIdentifier?: string
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData?: AzureWebAppSwapSlotData
  stepType?: string
  selectedStage: SelectedStageType
}

export interface AzureWebAppSwapSlotProps<T = AzureWebAppSwapSlotData> {
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
  selectedStage: SelectedStageType
}
