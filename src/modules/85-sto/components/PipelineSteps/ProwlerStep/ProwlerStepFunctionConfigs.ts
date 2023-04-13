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
  ingestionFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { ProwlerStepData } from './ProwlerStep'

const extraAuthFieldsTransformConfig = (data: ProwlerStepData) =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.auth.region',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.type',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.access_id',
          type: TransformValuesTypes.Text
        }
      ]
    : []

const extraAuthFieldsValidationConfig = (
  data: ProwlerStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode !== 'ingestion' || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.auth.region',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authRegion',
          isRequired: true
        },
        {
          name: 'spec.auth.type',
          type: ValidationFieldTypes.Text,
          label: 'typeLabel',
          isRequired: true
        },
        {
          name: 'spec.auth.access_id',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authAccessId',
          isRequired: true
        }
      ]
    : []

export const transformValuesFieldsConfig = (data: ProwlerStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...authFieldsTransformConfig(data),
    ...extraAuthFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: ProwlerStepData) => {
  const customAuthDomainConfig = authFieldsValidationConfig(data)

  customAuthDomainConfig.map(obj => {
    if (obj.name === 'spec.auth.domain') {
      obj.isRequired = data.spec.mode !== 'ingestion'
    }
    return obj
  })

  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data),
    ...extraAuthFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...additionalFieldsValidationConfigEitView
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: ProwlerStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data, StepViewType.InputSet),
    ...extraAuthFieldsValidationConfig(data, StepViewType.InputSet),
    ...ingestionFieldValidationConfig(data, StepViewType.InputSet),
    ...additionalFieldsValidationConfigInputSet
  ]

  return inputSetViewValidateFieldsConfig
}
