/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import {
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  authFieldsTransformConfig,
  authFieldsValidationConfig,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  imageFieldsValidationConfig,
  ingestionFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { PrismaCloudStepData } from './PrismaCloudStep'

const toolFieldsTransformConfig = (data: PrismaCloudStepData) =>
  data.spec.mode === 'extraction'
    ? [
        {
          name: 'spec.tool.image_name',
          type: TransformValuesTypes.Text
        }
      ]
    : []

const toolFieldsValidationConfig = (data: PrismaCloudStepData): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === 'extraction'
    ? [
        {
          name: 'spec.tool.image_name',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.tool.imageName',
          isRequired: true
        }
      ]
    : []

const extraAuthFieldsTransformConfig = (data: PrismaCloudStepData) =>
  data.spec.mode === 'orchestration'
    ? [
        {
          name: 'spec.auth.access_id',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.domain',
          type: TransformValuesTypes.Text
        }
      ]
    : []
const extraAuthFieldsValidationConfig = (data: PrismaCloudStepData): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === 'orchestration'
    ? [
        {
          name: 'spec.auth.access_id',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authAccessId',
          isRequired: true
        },
        {
          name: 'spec.auth.domain',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authAccessId',
          isRequired: true
        }
      ]
    : []

export const transformValuesFieldsConfig = (data: PrismaCloudStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...authFieldsTransformConfig(data),
    ...extraAuthFieldsTransformConfig(data),
    ...toolFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: PrismaCloudStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data),
    ...extraAuthFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...toolFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigEitView
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: PrismaCloudStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data),
    ...extraAuthFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...toolFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigInputSet
  ]

  return inputSetViewValidateFieldsConfig
}
