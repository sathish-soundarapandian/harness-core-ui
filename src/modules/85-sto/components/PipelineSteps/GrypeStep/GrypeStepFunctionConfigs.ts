/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  imageFieldsValidationConfig,
  ingestionFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { GrypeStepData } from './GrypeStep'

export const transformValuesFieldsConfig = (data: GrypeStepData): Field[] => {
  const transformValuesFieldsConfigValues = [...commonFieldsTransformConfig(data)]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: GrypeStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigEitView
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: GrypeStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigInputSet
  ]

  return inputSetViewValidateFieldsConfig
}
