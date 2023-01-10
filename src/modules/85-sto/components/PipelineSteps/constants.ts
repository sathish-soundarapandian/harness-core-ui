/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { InputSetViewValidateFieldsConfig } from './types'

type optionsProps = UseStringsReturn['getString']

export const dividerBottomMargin = 'var(--spacing-6)'

export const logLevelOptions = (getString: optionsProps) => [
  {
    label: getString('sto.Info'),
    value: 'Info'
  },
  {
    label: getString('sto.stepField.optionLabels.logLevel.debug'),
    value: 'Debug'
  },
  {
    label: getString('common.warning'),
    value: 'Warning'
  },
  {
    label: getString('error'),
    value: 'Error'
  }
]

export const severityOptions = (getString: optionsProps) => [
  {
    label: getString('sto.Critical'),
    value: 'critical'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.high'),
    value: 'high'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.medium'),
    value: 'medium'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.low'),
    value: 'low'
  },
  {
    label: getString('none'),
    value: 'none'
  }
]

const specPrivileged = 'spec.privileged'
const specSettings = 'spec.settings'
const specRunAsUser = 'spec.runAsUser'

export const commonFieldsTransformConfig = [
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
    name: 'spec.target.name',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.target.type',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.target.variant',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.target.workspace',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.target.ssl',
    type: TransformValuesTypes.Boolean
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
    name: 'spec.advanced.args.cli',
    type: TransformValuesTypes.Text
  },
  // { // for future implementation
  //   name: 'spec.advanced.args.passthrough',
  //   type: TransformValuesTypes.Text
  // },
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
  }
]

export const commonFieldsValidationConfig: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'spec.mode',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.mode',
    isRequired: true
  },
  {
    name: 'spec.config',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.config',
    isRequired: true
  },
  {
    name: 'spec.target.name',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.name',
    isRequired: true
  },
  {
    name: 'spec.target.type',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.type',
    isRequired: true
  },
  {
    name: 'spec.target.variant',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.variant',
    isRequired: true
  },
  {
    name: 'spec.target.workspace',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.workspace',
    isRequired: true
  },
  {
    name: 'spec.advanced.log.level',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.logLevel'
  },
  {
    name: 'spec.advanced.log.serializer',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.serializer'
  },
  {
    name: 'spec.advanced.args.cli',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.cli'
  },
  {
    name: 'spec.target.ssl',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.ssl',
    isRequired: true
  },
  // { // for future implementation
  //   name: 'spec.advanced.args.passthrough',
  //   type: ValidationFieldTypes.Text,
  //   label: 'sto.stepField.advanced.passthrough'
  // },
  {
    name: 'spec.advanced.fail_on_severity',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.failOnSeverity'
  },
  {
    name: 'spec.advanced.include_raw',
    type: ValidationFieldTypes.Boolean,
    label: 'sto.stepField.advanced.includeRaw'
  },
  {
    name: specSettings,
    type: ValidationFieldTypes.Map
  },
  {
    name: specRunAsUser,
    type: ValidationFieldTypes.Numeric
  },
  {
    name: specPrivileged,
    type: ValidationFieldTypes.Boolean
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  }
]
