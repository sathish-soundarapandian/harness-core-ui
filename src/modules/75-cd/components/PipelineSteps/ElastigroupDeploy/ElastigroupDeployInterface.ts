/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ElastigroupDeployStepInfo } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface ElastigroupDeployStepEditProps {
  initialValues: ElastigroupDeployStepInfo
  onUpdate?: (data: ElastigroupDeployStepInfo) => void
  stepViewType?: StepViewType
  onChange?: (data: ElastigroupDeployStepInfo) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  formikFormName: string
}

export interface ElastigroupDeployVariableStepProps {
  initialValues: ElastigroupDeployStepInfo
  stageIdentifier: string
  onUpdate?(data: ElastigroupDeployStepInfo): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ElastigroupDeployStepInfo
}
