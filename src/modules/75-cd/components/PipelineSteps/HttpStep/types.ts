/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { HttpStepInfo, StepElementConfig, HttpHeaderConfig, StringNGVariable } from 'services/pipeline-ng'

export interface HttpStepHeaderConfig extends HttpHeaderConfig {
  id: string
}

export interface HttpStepOutputVariable extends StringNGVariable {
  id: string
}

export interface HttpStepData extends StepElementConfig {
  spec: Omit<HttpStepInfo, 'header' | 'outputVariables'> & {
    header?: HttpHeaderConfig[] | string
    outputVariables?: StringNGVariable[] | string
  }
}

export interface HttpStepFormData extends StepElementConfig {
  spec: Omit<HttpStepInfo, 'method' | 'header' | 'outputVariables'> & {
    method: SelectOption | string
    header?: HttpStepHeaderConfig[] | string
    outputVariables?: HttpStepOutputVariable[] | string
  }
}
