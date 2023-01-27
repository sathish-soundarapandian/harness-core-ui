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
import type { MendStepData } from './MendStep'

const toolFieldsTransformConfig = (data: MendStepData) => {
  if (data.spec.mode === 'ingestion') return []

  // orchestration
  const config = [
    {
      name: 'spec.tool.project_token',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.tool.project_name',
      type: TransformValuesTypes.Text
    }
  ]

  // extraction || orchestration
  if (data.spec.mode === 'extraction') {
    config.push(
      {
        name: 'spec.tool.include',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.tool.product_token',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.tool.product_name',
        type: TransformValuesTypes.Text
      }
    )
  }

  return config
}

const toolFieldsValidationConfig = (data: MendStepData): InputSetViewValidateFieldsConfig[] => {
  if (data.spec.mode === 'ingestion') return []

  return [
    {
      name: 'spec.tool.project_token',
      type: ValidationFieldTypes.Text,
      label: 'sto.stepField.tool.projectToken',
      isRequired: data.spec.mode === 'extraction' && data.spec.tool?.product_lookup_type === 'byTokens'
    },
    {
      name: 'spec.tool.project_name',
      type: ValidationFieldTypes.Text,
      label: 'projectCard.projectName',
      isRequired: data.spec.mode === 'extraction' && data.spec.tool?.product_lookup_type === 'byNames'
    },
    {
      name: 'spec.tool.include',
      type: ValidationFieldTypes.Text
    },
    {
      name: 'spec.tool.product_token',
      type: ValidationFieldTypes.Text,
      label: 'token',
      isRequired:
        data.spec.tool?.product_lookup_type === 'byTokens' ||
        data.spec.tool?.product_lookup_type === 'appendToProductByToken'
    },
    {
      name: 'spec.tool.product_name',
      type: ValidationFieldTypes.Text,
      label: 'name',
      isRequired:
        data.spec.tool?.product_lookup_type === 'byNames' ||
        data.spec.tool?.product_lookup_type === 'appendToProductByName'
    }
  ]
}

const extraAuthFieldsTransformConfig = (data: MendStepData) =>
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

const extraAuthFieldsValidationConfig = (data: MendStepData): InputSetViewValidateFieldsConfig[] =>
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

export const transformValuesFieldsConfig = (data: MendStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...authFieldsTransformConfig(data),
    ...extraAuthFieldsTransformConfig(data),
    ...toolFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: MendStepData) => {
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

export function getInputSetViewValidateFieldsConfig(data: MendStepData): InputSetViewValidateFieldsConfig[] {
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
