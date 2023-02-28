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
  specPrivileged,
  specRunAsUser,
  specSettings
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { CustomIngestionStepData } from './CustomIngestionStep'

export const transformValuesFieldsConfig = (): Field[] => {
  return [
    {
      name: 'identifier',
      type: TransformValuesTypes.Text
    },
    {
      name: 'name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'description',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.mode',
      type: TransformValuesTypes.Map
    },
    {
      name: 'spec.config',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.type',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.ingestion.file',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.log.level',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.log.serializer',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.fail_on_severity',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.include_raw',
      type: TransformValuesTypes.Text
    },
    {
      name: specSettings,
      type: TransformValuesTypes.Map
    },
    {
      name: 'spec.limitMemory',
      type: TransformValuesTypes.LimitMemory
    },
    {
      name: 'spec.limitCPU',
      type: TransformValuesTypes.LimitCPU
    },
    {
      name: 'timeout',
      type: TransformValuesTypes.Text
    },
    {
      name: specPrivileged,
      type: TransformValuesTypes.Boolean
    },
    {
      name: specRunAsUser,
      type: TransformValuesTypes.Boolean
    },
    {
      name: 'spec.imagePullPolicy',
      type: TransformValuesTypes.ImagePullPolicy
    }
  ]
}

export const editViewValidateFieldsConfig = (data: CustomIngestionStepData) => {
  const nonIngestionOnlyFields = ['spec.target.name', 'spec.target.variant', 'spec.target.workspace']
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
