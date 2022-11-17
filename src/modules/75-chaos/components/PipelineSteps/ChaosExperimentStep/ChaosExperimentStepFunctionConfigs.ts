/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

export const transformValuesFieldsConfig = [
  {
    name: 'identifier',
    type: TransformValuesTypes.Text
  },
  {
    name: 'name',
    type: TransformValuesTypes.Text
  },
  {
    name: 'description',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.experimentRef',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.expectedResilienceScore',
    type: TransformValuesTypes.Numeric
  },
  {
    name: 'spec.assertion',
    type: TransformValuesTypes.Text
  }
]

export const editViewValidateFieldsConfig = [
  {
    name: 'identifier',
    type: ValidationFieldTypes.Identifier,
    label: 'identifier',
    isRequired: true
  },
  {
    name: 'name',
    type: ValidationFieldTypes.Name,
    label: 'pipelineSteps.stepNameLabel',
    isRequired: true
  },
  {
    name: 'spec.experimentRef',
    type: ValidationFieldTypes.Text,
    label: 'chaos.pipelineStep.experimentRefLabel',
    isRequired: true
  },
  {
    name: 'spec.expectedResilienceScore',
    type: ValidationFieldTypes.Numeric,
    label: 'chaos.pipelineStep.expectedResilienceScoreLabel',
    isRequired: true
  },
  {
    name: 'spec.assertion',
    type: ValidationFieldTypes.Text,
    label: 'pipeline.utilitiesStep.assertion',
    isRequired: false
  }
]

export function getInputSetViewValidateFieldsConfig(): Array<{
  name: string
  type: ValidationFieldTypes
  label?: string
  isRequired?: boolean
}> {
  return []
}
