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
import type { SonarqubeStepData } from './SonarqubeStep'

const toolFieldsTransformConfig = (data: SonarqubeStepData) =>
  data.spec.mode === 'orchestration'
    ? [
        {
          name: 'spec.tool.include',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.tool.java.libraries',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.tool.java.binaries',
          type: TransformValuesTypes.Text
        }
      ]
    : []

const toolFieldsValidationConfig = (data: SonarqubeStepData): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === 'orchestration'
    ? [
        {
          name: 'spec.tool.include',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.toolInclude'
        },
        {
          name: 'spec.tool.java.libraries',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.tool.javaLibraries'
        },
        {
          name: 'spec.tool.java.binaries',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.tool.javaBinaries'
        }
      ]
    : []

const extraAuthFieldsTransformConfig = (data: SonarqubeStepData) =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.auth.domain',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.ssl',
          type: TransformValuesTypes.Boolean
        }
      ]
    : []

const extraAuthFieldsValidationConfig = (data: SonarqubeStepData): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.auth.domain',
          type: ValidationFieldTypes.Text,
          label: 'secrets.winRmAuthFormFields.domain'
        },
        {
          name: 'spec.auth.ssl',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authSsl'
        }
      ]
    : []

export const transformValuesFieldsConfig = (data: SonarqubeStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...authFieldsTransformConfig(data),
    ...extraAuthFieldsTransformConfig(data),
    ...toolFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: SonarqubeStepData) => {
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
    ...imageFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigEitView,
    ...toolFieldsValidationConfig(data)
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: SonarqubeStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data),
    ...extraAuthFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigInputSet,
    ...toolFieldsValidationConfig(data)
  ]

  return inputSetViewValidateFieldsConfig
}
