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
  {
    name: 'spec.verifyAttestation.type',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.verifyAttestation.spec.publicKey',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.policy.store.type',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.policy.store.spec.file',
    type: TransformValuesTypes.Text
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
    name: 'spec.verifyAttestation.spec.publicKey',
    type: ValidationFieldTypes.Text,
    label: 'ssca.publicKey',
    isRequired: true
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  },
  {
    name: 'spec.source.type',
    type: ValidationFieldTypes.List,
    label: 'pipeline.artifactsSelection.artifactType',
    isRequired: true
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
  {
    name: 'spec.policy.store.spec.file',
    type: ValidationFieldTypes.Text,
    label: 'common.git.filePath',
    isRequired: true
  }
]

export const getInputSetViewValidateFieldsConfig = (
  // Called only with required
  /* istanbul ignore next */
  isRequired = true
): Array<{ name: string; type: ValidationFieldTypes; label?: string; isRequired?: boolean }> => {
  return [
    {
      name: 'spec.sbom.tool',
      type: ValidationFieldTypes.List,
      label: 'ssca.EnforcementStep.sbomTool',
      isRequired
    },
    {
      name: 'spec.sbom.format',
      type: ValidationFieldTypes.List,
      label: 'ssca.EnforcementStep.sbomFormat',
      isRequired
    },
    {
      name: 'spec.verifyAttestation.spec.publicKey',
      type: ValidationFieldTypes.Text,
      label: 'ssca.publicKey',
      isRequired
    },
    {
      name: 'timeout',
      type: ValidationFieldTypes.Timeout
    },
    {
      name: 'spec.source.type',
      type: ValidationFieldTypes.List,
      label: 'pipeline.artifactsSelection.artifactType',
      isRequired
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
    {
      name: 'spec.policy.store.spec.file',
      type: ValidationFieldTypes.Text,
      label: 'common.git.filePath',
      isRequired
    }
  ]
}
