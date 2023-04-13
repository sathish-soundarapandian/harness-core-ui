/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  authFieldsTransformConfig,
  authFieldsValidationConfig,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  imageFieldsValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { AWSECRStepData } from './AWSECRStep'

const extraAuthFields: InputSetViewValidateFieldsConfig[] = [
  // {
  //   name: 'spec.auth.access_token',
  //   type: ValidationFieldTypes.Text,
  //   label: 'common.getStarted.accessTokenLabel',
  //   isRequired: true
  // },
  {
    name: 'spec.auth.access_id',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.authAccessId',
    isRequired: true
  },
  {
    name: 'spec.auth.region',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.authRegion',
    isRequired: true
  }
]

export const transformValuesFieldsConfig = (data: AWSECRStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...authFieldsTransformConfig(data),
    {
      name: 'spec.image.domain',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.image.type',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.image.name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.image.region',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.image.tag',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.auth.access_id',
      type: TransformValuesTypes.Text,
      label: 'sto.stepField.authAccessId'
    },
    {
      name: 'spec.auth.region',
      type: TransformValuesTypes.Text,
      label: 'sto.stepField.authRegion'
    }
  ]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: AWSECRStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data),
    ...imageFieldsValidationConfig(data, StepViewType.InputSet),
    ...additionalFieldsValidationConfigEitView,
    ...extraAuthFields
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: AWSECRStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data, StepViewType.InputSet),
    ...imageFieldsValidationConfig(data, StepViewType.InputSet),
    ...additionalFieldsValidationConfigInputSet,
    ...extraAuthFields
  ]

  return inputSetViewValidateFieldsConfig
}
