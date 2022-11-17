/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikState } from 'formik'
import type { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { StepElementConfig, StepSpecType } from 'services/cd-ng'

export interface FeatureFlagConfigurationInstruction {
  identifier: string
  type: string
  spec: StepSpecType
}

export interface FeatureFlagConfigurationSpec {
  feature: string
  environment: string
  instructions?: typeof RUNTIME_INPUT_VALUE | FeatureFlagConfigurationInstruction[]
}

export interface FlagConfigurationStepData extends StepElementConfig {
  spec: FeatureFlagConfigurationSpec
}

export enum CFPipelineInstructionType {
  SET_FEATURE_FLAG_STATE = 'SetFeatureFlagState',
  SET_DEFAULT_VARIATIONS = 'SetDefaultVariations',
  SET_DEFAULT_ON_VARIATION = 'SetOnVariation',
  SET_DEFAULT_OFF_VARIATION = 'SetOffVariation',
  ADD_RULE = 'AddRule',
  ADD_TARGETS_TO_VARIATION_TARGET_MAP = 'AddTargetsToVariationTargetMap',
  ADD_SEGMENT_TO_VARIATION_TARGET_MAP = 'AddSegmentToVariationTargetMap'
}

export type FlagConfigurationStepFormDataValues = FormikState<FlagConfigurationStepData>['values']
