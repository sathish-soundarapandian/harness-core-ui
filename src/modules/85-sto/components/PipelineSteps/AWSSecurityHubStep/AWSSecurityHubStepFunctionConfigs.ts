/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import {
  commonFieldsValidationConfig,
  ingestionFieldValidationConfig,
  commonFieldsTransformConfig as transformValuesFieldsConfigValues,
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  authFieldsValidationConfig,
  authFieldsTransformConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { AWSSecurityHubStepData } from './AWSSecurityHubStep'

export const transformValuesFieldsConfig = (data: AWSSecurityHubStepData): Field[] => {
  const config = [...transformValuesFieldsConfigValues(data), ...authFieldsTransformConfig(data)]

  if (data.spec.mode === 'extraction') {
    config.push({
      name: 'spec.auth.access_id',
      type: TransformValuesTypes.Text
    })
  }

  return config
}

const authAccessIdValidation = (data: AWSSecurityHubStepData): InputSetViewValidateFieldsConfig => ({
  name: 'spec.auth.access_id',
  type: ValidationFieldTypes.Text,
  label: 'sto.stepField.authAccessId',
  isRequired: data.spec.mode === 'extraction'
})

export const editViewValidateFieldsConfig = (data: AWSSecurityHubStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
    ...ingestionFieldValidationConfig(data),
    ...authFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigEitView,
    authAccessIdValidation(data)
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: AWSSecurityHubStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...ingestionFieldValidationConfig(data),
    ...additionalFieldsValidationConfigInputSet,
    authAccessIdValidation(data)
  ]

  return inputSetViewValidateFieldsConfig
}
