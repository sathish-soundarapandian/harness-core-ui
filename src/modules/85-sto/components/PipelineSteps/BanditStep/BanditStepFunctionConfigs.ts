/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  commonFieldsTransformConfig as transformValuesFieldsConfigValues,
  commonFieldsValidationConfig,
  ingestionFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { BanditStepData } from './BanditStep'

export const transformValuesFieldsConfig = (data: BanditStepData): Field[] => transformValuesFieldsConfigValues(data)

export const editViewValidateFieldsConfig = (data: BanditStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
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

export function getInputSetViewValidateFieldsConfig(data: BanditStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
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
