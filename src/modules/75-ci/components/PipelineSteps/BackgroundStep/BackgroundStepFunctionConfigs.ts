/*
 * Copyright 2022 Harness Inc. All rights reserved.
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
    name: 'spec.shell',
    type: TransformValuesTypes.Shell
  },
  {
    name: 'spec.command',
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
    name: 'spec.envVariables',
    type: TransformValuesTypes.Map
  },
  {
    name: 'spec.entrypoint',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.portBindings',
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

export const getEditViewValidateFieldsConfig = (isBuildInfrastructureTypeVM: boolean) => [
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
    isRequired: !isBuildInfrastructureTypeVM
  },
  {
    name: 'spec.image',
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: !isBuildInfrastructureTypeVM
  },
  {
    name: 'spec.shell',
    type: ValidationFieldTypes.Text,
    label: 'common.shell',
    isRequired: true
  },
  {
    name: 'spec.command',
    type: ValidationFieldTypes.Text,
    label: 'commandLabel'
  },
  {
    name: 'spec.privileged',
    label: 'pipeline.buildInfra.privileged',
    type: ValidationFieldTypes.Boolean
  },
  {
    name: 'spec.reportPaths',
    type: ValidationFieldTypes.List
  },
  {
    name: 'spec.envVariables',
    type: ValidationFieldTypes.Map
  },
  {
    name: 'spec.entrypoint',
    type: ValidationFieldTypes.List
  },
  {
    name: 'spec.portBindings',
    type: ValidationFieldTypes.KeyValue,
    label: 'ci.portBindings'
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

export function getInputSetViewValidateFieldsConfig(isRequired = true): Array<{
  name: string
  type: ValidationFieldTypes
  label?: string
  isRequired?: boolean
  allowNumericKeys?: boolean
}> {
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
      name: 'spec.shell',
      type: ValidationFieldTypes.Shell
    },
    {
      name: 'spec.command',
      type: ValidationFieldTypes.Text,
      label: 'commandLabel',
      isRequired
    },
    {
      name: 'spec.reports.spec.paths',
      type: ValidationFieldTypes.List
    },
    {
      name: 'spec.envVariables',
      type: ValidationFieldTypes.Map
    },
    {
      name: 'spec.entrypoint',
      type: ValidationFieldTypes.List
    },
    {
      name: 'spec.portBindings',
      label: 'ci.portBindings',
      type: ValidationFieldTypes.Map,
      allowNumericKeys: true
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
