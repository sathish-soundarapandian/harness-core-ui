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
  EXTRACTION_SCAN_MODE,
  INGESTION_SCAN_MODE,
  ORCHESTRATION_SCAN_MODE,
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  authFieldsTransformConfig,
  authFieldsValidationConfig,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  ingestionFieldValidationConfig,
  instanceFieldsTransformConfig,
  instanceFieldsValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { BurpStepData } from './BurpStep'

const extraAuthFieldsTransformConfig = (data: BurpStepData) =>
  data.spec.mode !== INGESTION_SCAN_MODE.value
    ? [
        {
          name: 'spec.auth.domain',
          type: TransformValuesTypes.Text
        }
      ]
    : []

const toolFieldsTransformConfig = (data: BurpStepData) =>
  data.spec.mode === EXTRACTION_SCAN_MODE.value
    ? [
        {
          name: 'spec.tool.site_id',
          type: TransformValuesTypes.Text
        }
        // {
        //   name: 'spec.tool.scan_id',
        //   type: TransformValuesTypes.Text
        // }
      ]
    : []

const extraInstanceFieldsTransformConfig = (data: BurpStepData) =>
  data.spec.mode === ORCHESTRATION_SCAN_MODE.value
    ? [
        {
          name: 'spec.instance.username',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.instance.password',
          type: TransformValuesTypes.Text
        }
      ]
    : []

export const transformValuesFieldsConfig = (data: BurpStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...authFieldsTransformConfig(data),
    ...commonFieldsTransformConfig(data),
    ...instanceFieldsTransformConfig(data),
    ...toolFieldsTransformConfig(data),
    ...extraAuthFieldsTransformConfig(data),
    ...extraInstanceFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

const toolFieldsValidationConfig = (
  data: BurpStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === EXTRACTION_SCAN_MODE.value || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.tool.site_id',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.tool.siteId',
          isRequired: true
        }
        // TODO get feedback on multiple having multiple ways to extract burp data
        // {
        //   name: 'spec.tool.scan_id',
        //   type: ValidationFieldTypes.Text,
        //   label: 'sto.stepField.tool.scanId',
        //   isRequired: true
        // }
      ]
    : []

const extraAuthFieldsValidationConfig = (
  data: BurpStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode !== INGESTION_SCAN_MODE.value || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.auth.domain',
          type: ValidationFieldTypes.Text,
          label: 'secrets.winRmAuthFormFields.domain',
          isRequired: true
        }
      ]
    : []

const extraInstanceFieldsValidationConfig = (
  data: BurpStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === ORCHESTRATION_SCAN_MODE.value || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.instance.username',
          type: ValidationFieldTypes.Text,
          label: 'username'
        },
        {
          name: 'spec.instance.password',
          type: ValidationFieldTypes.Text,
          label: 'password'
        }
      ]
    : []

export const editViewValidateFieldsConfig = (data: BurpStepData) => {
  const editViewValidationConfig = [
    ...authFieldsValidationConfig(data),
    ...toolFieldsValidationConfig(data),
    ...extraAuthFieldsValidationConfig(data),
    ...commonFieldsValidationConfig,
    ...ingestionFieldValidationConfig(data),
    ...additionalFieldsValidationConfigEitView,
    ...instanceFieldsValidationConfig(data),
    ...extraInstanceFieldsValidationConfig(data)
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: BurpStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data, StepViewType.InputSet),
    ...toolFieldsValidationConfig(data, StepViewType.InputSet),
    ...extraAuthFieldsValidationConfig(data, StepViewType.InputSet),
    ...ingestionFieldValidationConfig(data, StepViewType.InputSet),
    ...additionalFieldsValidationConfigInputSet,
    ...instanceFieldsValidationConfig(data, StepViewType.InputSet),
    ...extraInstanceFieldsValidationConfig(data, StepViewType.InputSet)
  ]

  return inputSetViewValidateFieldsConfig
}
