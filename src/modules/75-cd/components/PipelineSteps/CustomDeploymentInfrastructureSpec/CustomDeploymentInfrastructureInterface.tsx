/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import * as Yup from 'yup'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { CustomDeploymentInfrastructure } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { UseStringsReturn } from 'framework/strings'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { variableSchema } from '../ShellScriptStep/shellScriptTypes'

export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    variables: variableSchema(getString)
  })
}

export type CustomDeploymentInfrastructureStep = Omit<CustomDeploymentInfrastructure, 'customDeploymentRef'>
export interface CustomDeploymentInfrastructureSpecEditableProps {
  initialValues: CustomDeploymentInfrastructureStep
  allValues?: CustomDeploymentInfrastructureStep
  onUpdate?: (data: CustomDeploymentInfrastructureStep) => void
  stepViewType?: StepViewType
  readonly?: boolean
  factory?: AbstractStepFactory
  template?: CustomDeploymentInfrastructureStep
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: CustomDeploymentInfrastructureStep
  allowableTypes: AllowedTypes
}
