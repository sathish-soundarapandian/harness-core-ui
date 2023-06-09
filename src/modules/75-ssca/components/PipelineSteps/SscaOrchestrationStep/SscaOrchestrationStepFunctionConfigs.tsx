/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

export const transformValuesFieldsConfig = (stepType?: StepType) => [
  {
    name: 'identifier',
    type: TransformValuesTypes.Text
  },
  {
    name: 'name',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.tool.type',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.tool.spec.format',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.attestation.type',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.attestation.spec.privateKey',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.attestation.spec.password',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.source.type',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.source.spec.connector',
    type: TransformValuesTypes.ConnectorRef
  },
  {
    name: 'spec.source.spec.image',
    type: TransformValuesTypes.Text
  },
  ...(stepType === StepType.CdSscaOrchestration
    ? [
        {
          name: 'spec.infrastructure.type',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.infrastructure.spec.connectorRef',
          type: TransformValuesTypes.ConnectorRef
        },
        {
          name: 'spec.infrastructure.spec.namespace',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.infrastructure.spec.resources.limits.memory',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.infrastructure.spec.resources.limits.cpu',
          type: TransformValuesTypes.Text
        }
      ]
    : []),
  {
    name: 'timeout',
    type: TransformValuesTypes.Text
  }
]

export const editViewValidateFieldsConfig = (stepType: StepType) => [
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
    name: 'spec.sbom.tool',
    type: ValidationFieldTypes.List,
    label: 'ssca.orchestrationStep.sbomTool',
    isRequired: true
  },
  {
    name: 'spec.sbom.format',
    type: ValidationFieldTypes.List,
    label: 'ssca.orchestrationStep.sbomFormat',
    isRequired: true
  },
  {
    name: 'spec.source.type',
    type: ValidationFieldTypes.List,
    label: 'pipeline.artifactsSelection.artifactType',
    isRequired: true
  },
  {
    name: 'spec.attestation.spec.privateKey',
    type: ValidationFieldTypes.Text,
    label: 'connectors.serviceNow.privateKey',
    isRequired: true
  },
  {
    name: 'spec.attestation.spec.password',
    type: ValidationFieldTypes.Text,
    label: 'password',
    isRequired: true
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  },
  {
    name: 'spec.source.spec.connector',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.source.spec.image',
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: true
  },
  ...(stepType === StepType.CdSscaOrchestration
    ? [
        {
          name: 'spec.infrastructure.type',
          type: ValidationFieldTypes.Text
        },
        {
          name: 'spec.infrastructure.spec.connectorRef',
          type: ValidationFieldTypes.Text,
          label: 'connector',
          isRequired: true
        },
        {
          name: 'spec.infrastructure.spec.namespace',
          type: ValidationFieldTypes.Text,
          label: 'common.namespace',
          isRequired: true
        },
        {
          name: 'spec.infrastructure.spec.resources.limits.memory',
          type: ValidationFieldTypes.LimitMemory,
          label: 'pipelineSteps.limitMemoryLabel',
          isRequired: true
        },
        {
          name: 'spec.infrastructure.spec.resources.limits.cpu',
          type: ValidationFieldTypes.LimitCPU,
          label: 'pipelineSteps.limitCPULabel',
          isRequired: true
        }
      ]
    : [])
]

export const getInputSetViewValidateFieldsConfig =
  (stepType: StepType) =>
  (isRequired = true): Array<{ name: string; type: ValidationFieldTypes; label?: string; isRequired?: boolean }> => {
    return [
      {
        name: 'spec.sbom.tool',
        type: ValidationFieldTypes.List,
        label: 'ssca.orchestrationStep.sbomTool',
        isRequired
      },
      {
        name: 'spec.sbom.format',
        type: ValidationFieldTypes.List,
        label: 'ssca.orchestrationStep.sbomFormat',
        isRequired
      },
      {
        name: 'spec.source.type',
        type: ValidationFieldTypes.List,
        label: 'pipeline.artifactsSelection.artifactType',
        isRequired
      },
      {
        name: 'spec.attestation.spec.privateKey',
        type: ValidationFieldTypes.Text,
        label: 'connectors.serviceNow.privateKey',
        isRequired
      },
      {
        name: 'spec.attestation.spec.password',
        type: ValidationFieldTypes.Text,
        label: 'password',
        isRequired
      },
      {
        name: 'timeout',
        type: ValidationFieldTypes.Timeout
      },
      {
        name: 'spec.source.spec.connector',
        type: ValidationFieldTypes.Text,
        label: 'pipelineSteps.connectorLabel',
        isRequired
      },
      {
        name: 'spec.source.spec.image',
        type: ValidationFieldTypes.Text,
        label: 'imageLabel',
        isRequired
      },
      ...(stepType === StepType.CdSscaOrchestration
        ? [
            {
              name: 'spec.infrastructure.type',
              type: ValidationFieldTypes.Text
            },
            {
              name: 'spec.infrastructure.spec.connectorRef',
              type: ValidationFieldTypes.Text,
              label: 'connector',
              isRequired: true
            },
            {
              name: 'spec.infrastructure.spec.namespace',
              type: ValidationFieldTypes.Namespace,
              label: 'common.namespace',
              isRequired: true
            },
            {
              name: 'spec.infrastructure.spec.resources.limits.memory',
              type: ValidationFieldTypes.LimitMemory,
              label: 'pipelineSteps.limitMemoryLabel',
              isRequired: true
            },
            {
              name: 'spec.infrastructure.spec.resources.limits.cpu',
              type: ValidationFieldTypes.LimitCPU,
              label: 'pipelineSteps.limitCPULabel',
              isRequired: true
            }
          ]
        : [])
    ]
  }
