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
import type { CheckmarxStepData } from './CheckmarxStep'

const toolFieldsTransformConfig = (data: CheckmarxStepData) =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.tool.team_name',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.tool.project_name',
          type: TransformValuesTypes.Text
        }
      ]
    : []

const toolFieldsValidationConfig = (data: CheckmarxStepData): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.tool.team_name',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.toolInclude'
        },
        {
          name: 'spec.tool.project_name',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.tool.javaLibraries'
        }
      ]
    : []

const extraAuthFieldsTransformConfig = (data: CheckmarxStepData) =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.auth.access_id',
          type: TransformValuesTypes.Text
        },
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

const extraAuthFieldsValidationConfig = (data: CheckmarxStepData): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode !== 'ingestion'
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
          label: 'sto.stepField.authDomain',
          isRequired: true
        },
        {
          name: 'spec.auth.ssl',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authSsl'
        }
      ]
    : []

export const transformValuesFieldsConfig = (data: CheckmarxStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...authFieldsTransformConfig(data),
    ...extraAuthFieldsTransformConfig(data),
    ...toolFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: CheckmarxStepData) => {
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

export function getInputSetViewValidateFieldsConfig(data: CheckmarxStepData): InputSetViewValidateFieldsConfig[] {
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
