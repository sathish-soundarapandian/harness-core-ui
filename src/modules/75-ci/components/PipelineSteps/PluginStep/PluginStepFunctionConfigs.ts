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
    name: 'spec.connectorRef',
    type: TransformValuesTypes.ConnectorRef
  },
  {
    name: 'spec.image',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.privileged',
    type: TransformValuesTypes.Boolean
  },
  {
    name: 'spec.reportPaths',
    type: TransformValuesTypes.ReportPaths
  },
  {
    name: 'spec.entryPoint',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.settings',
    type: TransformValuesTypes.Map
  },
  {
    name: 'spec.imagePullPolicy',
    type: TransformValuesTypes.ImagePullPolicy
  },
  {
    name: 'spec.runAsUser',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.limitMemory',
    type: TransformValuesTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: TransformValuesTypes.LimitCPU
  },
  {
    name: 'timeout',
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
    name: 'spec.connectorRef',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.image',
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: true
  },
  {
    name: 'spec.privileged',
    type: ValidationFieldTypes.Boolean
  },
  {
    name: 'spec.settings',
    type: ValidationFieldTypes.Map
  },
  {
    label: 'entryPointLabel',
    name: 'spec.entryPoint',
    type: ValidationFieldTypes.List
  },
  {
    label: 'pipeline.stepCommonFields.runAsUser',
    name: 'spec.runAsUser',
    type: ValidationFieldTypes.Numeric
  },
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  }
]

export function getInputSetViewValidateFieldsConfig(
  isRequired = true
): Array<{ name: string; type: ValidationFieldTypes; label?: string; isRequired?: boolean }> {
  return [
    {
      name: 'spec.connectorRef',
      type: ValidationFieldTypes.Text,
      label: 'pipelineSteps.connectorLabel',
      isRequired
    },
    {
      name: 'spec.image',
      type: ValidationFieldTypes.Text,
      label: 'imageLabel',
      isRequired
    },
    {
      name: 'spec.privileged',
      type: ValidationFieldTypes.Boolean
    },
    {
      name: 'spec.settings',
      type: ValidationFieldTypes.Map
    },
    {
      name: 'spec.entryPoint',
      type: ValidationFieldTypes.List
    },
    {
      name: 'spec.imagePullPolicy',
      type: ValidationFieldTypes.ImagePullPolicy
    },
    {
      name: 'spec.runAsUser',
      type: ValidationFieldTypes.Numeric
    },
    {
      name: 'spec.resources.limits.memory',
      type: ValidationFieldTypes.LimitMemory
    },
    {
      name: 'spec.resources.limits.cpu',
      type: ValidationFieldTypes.LimitCPU
    },
    {
      name: 'timeout',
      type: ValidationFieldTypes.Timeout
    }
  ]
}
