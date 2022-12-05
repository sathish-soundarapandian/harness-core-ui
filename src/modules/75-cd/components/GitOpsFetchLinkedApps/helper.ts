/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { StepElementConfig } from 'services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

export interface GitOpsFetchLinkedAppsProps {
  initialValues: StepElementConfig
  onUpdate?: (data: StepElementConfig) => void
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  isNewStep?: boolean
  inputSetData?: {
    template?: StepElementConfig
    path?: string
    readonly?: boolean
  }
  onChange?: (data: StepElementConfig) => void
  readonly?: boolean
}
