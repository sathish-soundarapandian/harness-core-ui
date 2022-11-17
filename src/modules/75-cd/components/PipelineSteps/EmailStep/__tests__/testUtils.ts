/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { EmailStepData } from '../emailStepTypes'

export const getRuntimeInputValues = (): EmailStepData => ({
  type: StepType.Email,
  identifier: 'Email',
  name: 'Email',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    to: RUNTIME_INPUT_VALUE,
    cc: RUNTIME_INPUT_VALUE,
    subject: RUNTIME_INPUT_VALUE,
    body: RUNTIME_INPUT_VALUE
  }
})

export const getFixedInputValues = (): EmailStepData => ({
  name: 'Email',
  identifier: 'Email',
  type: StepType.Email,
  timeout: '1d',
  spec: {
    to: 'abc@test.com, xyz@test.com',
    cc: 'fk@test.com',
    subject: 'Test',
    body: 'Test email'
  }
})

export const getErrorInputValues = (): EmailStepData => ({
  name: 'Email',
  identifier: 'Email',
  timeout: '10m',
  type: StepType.Email,
  spec: {
    to: 'abc@test.c, xyz',
    cc: 'xyz@',
    subject: '',
    body: ''
  }
})

export const getTimeoutErrorInputValues = (): EmailStepData => ({
  name: 'Email',
  identifier: 'Email',
  timeout: '10m',
  type: StepType.Email,
  spec: {
    to: 'abc@test.com, xyz@test.com',
    cc: 'fk@test.com',
    subject: 'Test',
    body: 'Test email'
  }
})
