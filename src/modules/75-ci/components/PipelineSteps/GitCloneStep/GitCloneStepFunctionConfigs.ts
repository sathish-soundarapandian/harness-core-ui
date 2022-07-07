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
    name: 'spec.repoName',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.build.type',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.build.spec.branch',
    // type: TransformValuesTypes.Branch
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.build.spec.tag',
    // type: TransformValuesTypes.Tag
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.build.spec.number',
    // type: TransformValuesTypes.PRNumber
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.limitMemory',
    type: TransformValuesTypes.LimitMemory
  },
  {
    name: 'spec.cloneDirectory',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.limitCPU',
    type: TransformValuesTypes.LimitCPU
  },
  {
    name: 'timeout',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.build',
    type: TransformValuesTypes.BuildType
  }
]

export const getEditViewValidateFieldsConfig = (isConnectorRuntimeInput?: boolean) => [
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
  // {
  //   name: 'spec.build',
  //   type: ValidationFieldTypes.Text,
  //   label: 'pipeline.gitCloneStep.validation.associatedBuildInput',
  //   isRequired: true
  // },
  {
    name: 'spec.build.type',
    type: ValidationFieldTypes.Text,
    label: 'filters.executions.buildType',
    isRequired: isConnectorRuntimeInput ? false : true
  },
  {
    name: 'spec.cloneDirectory',
    type: ValidationFieldTypes.Text,
    label: 'pipeline.gitCloneStep.cloneDirectory',
    isRequired: true
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
