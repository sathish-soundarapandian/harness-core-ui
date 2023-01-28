/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { StepElementConfig, StepSpecType } from 'services/cd-ng'

export interface PolicyStepData extends StepElementConfig {
  spec: PolicyStepInfo
}

export interface PolicyStepFormData extends StepElementConfig {
  spec: PolicyStepInfo
}

type PolicyStepInfo = StepSpecType & {
  type: string
  policySets?: string[] | typeof RUNTIME_INPUT_VALUE
  policySpec?: PolicySpec
}

interface PolicySpec {
  payload?: string
}
