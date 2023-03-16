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
    name: 'spec.tool.type',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.tool.spec.format',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.source.type',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.attestation.privateKey',
    type: TransformValuesTypes.Text
  },
  {
    name: 'timeout',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.source.spec.connectorRef',
    type: TransformValuesTypes.ConnectorRef
  },
  {
    name: 'spec.source.spec.image',
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
    name: 'spec.tool.type',
    type: ValidationFieldTypes.List,
    label: 'ssca.orchestrationStep.sbomTool',
    isRequired: true
  },
  {
    name: 'spec.tool.spec.format',
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
    name: 'spec.attestation.privateKey',
    type: ValidationFieldTypes.Text,
    label: 'connectors.serviceNow.privateKey',
    isRequired: true
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  },
  {
    name: 'spec.source.spec.connectorRef',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.source.spec.image',
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: true
  }
]

export function getInputSetViewValidateFieldsConfig(
  isRequired = true
): Array<{ name: string; type: ValidationFieldTypes; label?: string; isRequired?: boolean }> {
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
      name: 'spec.attestation.privateKey',
      type: ValidationFieldTypes.Text,
      label: 'connectors.serviceNow.privateKey',
      isRequired
    },
    {
      name: 'timeout',
      type: ValidationFieldTypes.Timeout
    },
    {
      name: 'spec.source.spec.connectorRef',
      type: ValidationFieldTypes.Text,
      label: 'pipelineSteps.connectorLabel',
      isRequired
    },
    {
      name: 'spec.source.spec.image',
      type: ValidationFieldTypes.Text,
      label: 'imageLabel',
      isRequired
    }
  ]
}
