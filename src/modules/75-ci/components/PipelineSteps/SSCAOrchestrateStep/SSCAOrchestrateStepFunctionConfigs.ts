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
    name: 'spec.step.type',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.sbom.tool',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.sbom.format',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.sbomTarget.type',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.attestation.type',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.attestation.tool',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.attestation.privateKey',
    type: TransformValuesTypes.Secret
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
    name: 'spec.step.type',
    type: ValidationFieldTypes.List,
    label: 'stepType',
    isRequired: true
  },
  {
    name: 'spec.sbom.tool',
    type: ValidationFieldTypes.List,
    label: 'ci.ssca.sbomTool',
    isRequired: true
  },
  {
    name: 'spec.sbom.format',
    type: ValidationFieldTypes.List,
    label: 'ci.ssca.sbomFormat',
    isRequired: true
  },
  {
    name: 'spec.sbomTarget.type',
    type: ValidationFieldTypes.List,
    label: 'pipeline.artifactsSelection.artifactType',
    isRequired: true
  },
  {
    name: 'spec.attestation.type',
    type: ValidationFieldTypes.List,
    label: 'typeLabel',
    isRequired: true
  },
  {
    name: 'spec.attestation.tool',
    type: ValidationFieldTypes.List,
    label: 'sss.tool',
    isRequired: true
  },
  {
    name: 'spec.attestation.privateKey',
    type: ValidationFieldTypes.Secret,
    label: 'connectors.serviceNow.privateKey',
    isRequired: true
  }
]

export function getInputSetViewValidateFieldsConfig(
  isRequired = true
): Array<{ name: string; type: ValidationFieldTypes; label?: string; isRequired?: boolean }> {
  return [
    {
      name: 'identifier',
      type: ValidationFieldTypes.Identifier,
      label: 'identifier',
      isRequired
    },
    {
      name: 'name',
      type: ValidationFieldTypes.Name,
      label: 'pipelineSteps.stepNameLabel',
      isRequired
    },
    {
      name: 'spec.step.type',
      type: ValidationFieldTypes.List,
      label: 'stepType',
      isRequired: true
    },
    {
      name: 'spec.sbom.tool',
      type: ValidationFieldTypes.List,
      label: 'ci.ssca.sbomTool',
      isRequired: true
    },
    {
      name: 'spec.sbom.format',
      type: ValidationFieldTypes.List,
      label: 'ci.ssca.sbomFormat',
      isRequired: true
    },
    {
      name: 'spec.sbomTarget.type',
      type: ValidationFieldTypes.List,
      label: 'pipeline.artifactsSelection.artifactType',
      isRequired: true
    },
    {
      name: 'spec.attestation.type',
      type: ValidationFieldTypes.List,
      label: 'typeLabel',
      isRequired: true
    },
    {
      name: 'spec.attestation.tool',
      type: ValidationFieldTypes.List,
      label: 'ci.ssca.attestaion.tool',
      isRequired: true
    },
    {
      name: 'spec.attestation.privateKey',
      type: ValidationFieldTypes.Secret,
      label: 'connectors.serviceNow.privateKey',
      isRequired: true
    }
  ]
}
