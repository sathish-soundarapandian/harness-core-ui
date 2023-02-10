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
    name: 'spec.generationType',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.artifactType',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.sbomGenerationTool',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.sbomFormat',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.signed',
    type: TransformValuesTypes.Boolean
  },
  {
    name: 'spec.publicKey',
    type: ValidationFieldTypes.Secret
  },
  {
    name: 'spec.abort.signatureVerificaionFailure',
    type: ValidationFieldTypes.Boolean
  },
  {
    name: 'spec.abort.sbomPartOfDenyList',
    type: ValidationFieldTypes.Boolean
  },
  {
    name: 'spec.abort.sbomComponentPartOfDenyList',
    type: ValidationFieldTypes.Boolean
  },
  {
    name: 'spec.abort.sourceNotPartOfAllowList',
    type: ValidationFieldTypes.Boolean
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
    name: 'spec.publicKey',
    type: ValidationFieldTypes.Secret,
    label: 'connectors.serviceNow.privateKey',
    isRequired: true
  },
  {
    name: 'spec.abort.signatureVerificaionFailure',
    type: ValidationFieldTypes.Boolean,
    label: 'ci.sscs.abort.signatureVerificaionFailure'
  },
  {
    name: 'spec.abort.sbomPartOfDenyList',
    type: ValidationFieldTypes.Boolean,
    label: 'ci.sscs.abort.sbomPartOfDenyList'
  },
  {
    name: 'spec.abort.sbomComponentPartOfDenyList',
    type: ValidationFieldTypes.Boolean,
    label: 'ci.sscs.abort.sbomComponentPartOfDenyList'
  },
  {
    name: 'spec.abort.sourceNotPartOfAllowList',
    type: ValidationFieldTypes.Boolean,
    label: 'ci.sscs.abort.sourceNotPartOfAllowList'
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
      name: 'spec.publicKey',
      type: ValidationFieldTypes.Secret,
      label: 'connectors.serviceNow.privateKey',
      isRequired: true
    },
    {
      name: 'spec.abort.signatureVerificaionFailure',
      type: ValidationFieldTypes.Boolean,
      label: 'ci.sscs.abort.signatureVerificaionFailure'
    },
    {
      name: 'spec.abort.sbomPartOfDenyList',
      type: ValidationFieldTypes.Boolean,
      label: 'ci.sscs.abort.sbomPartOfDenyList'
    },
    {
      name: 'spec.abort.sbomComponentPartOfDenyList',
      type: ValidationFieldTypes.Boolean,
      label: 'ci.sscs.abort.sbomComponentPartOfDenyList'
    },
    {
      name: 'spec.abort.sourceNotPartOfAllowList',
      type: ValidationFieldTypes.Boolean,
      label: 'ci.sscs.abort.sourceNotPartOfAllowList'
    }
  ]
}
