/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  commonFieldsValidationConfig,
  ingestionFieldValidationConfig,
  commonFieldsTransformConfig as transformValuesFieldsConfigValues
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { CustomIngestionStepData } from './CustomIngestionStep'
const nonIngestionOnlyFields = ['spec.target.workspace']

export const transformValuesFieldsConfig = (data: CustomIngestionStepData): Field[] =>
  transformValuesFieldsConfigValues(data).filter(field => !nonIngestionOnlyFields.includes(field.name))

export const editViewValidateFieldsConfig = (data: CustomIngestionStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig.filter(field => !nonIngestionOnlyFields.includes(field.name)),
    ...ingestionFieldValidationConfig(data),
    {
      name: 'spec.limitMemory',
      type: ValidationFieldTypes.LimitMemory
    },
    {
      name: 'spec.limitCPU',
      type: ValidationFieldTypes.LimitCPU
    }
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: CustomIngestionStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig.filter(field => !nonIngestionOnlyFields.includes(field.name)),
    ...ingestionFieldValidationConfig(data),
    {
      name: 'spec.resources.limits.memory',
      type: ValidationFieldTypes.LimitMemory
    },
    {
      name: 'spec.resources.limits.cpu',
      type: ValidationFieldTypes.LimitCPU
    }
  ]

  return inputSetViewValidateFieldsConfig
}
