/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepElementConfig } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { validateGenericFields } from '../utils'

const emptyInitialValues: StepElementConfig = { identifier: '', name: '', timeout: '', type: StepType.EcsRollingDeploy }
const template: StepElementConfig = {
  identifier: 'Test_Name',
  name: 'Test Name',
  type: StepType.EcsRollingDeploy,
  timeout: '<+input>'
}
const getString = jest.fn()

describe('NameTimeoutField tests', () => {
  beforeEach(() => {
    getString.mockReset()
  })
  test(`should return error when timeout value is not provided in Runtime view`, () => {
    const errors = validateGenericFields({
      data: emptyInitialValues,
      template: template,
      viewType: StepViewType.DeploymentForm,
      getString
    })
    expect(errors).toStrictEqual({ timeout: 'timeout is a required field' })
  })

  test(`should NOT return error when getString is NOT passed`, () => {
    const errors = validateGenericFields({
      data: emptyInitialValues,
      template: template,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors).toStrictEqual({ timeout: 'timeout is a required field' })
  })

  test(`should NOT return error when timeout value is not provided in NON Runtime view`, () => {
    const errors = validateGenericFields({
      data: emptyInitialValues,
      template: template,
      viewType: StepViewType.Edit,
      getString
    })
    expect(errors).toStrictEqual({})
  })

  test(`should NOT return error when timeout is NOT runtime input in template`, () => {
    delete template.timeout
    const errors = validateGenericFields({
      data: emptyInitialValues,
      template: template,
      viewType: StepViewType.DeploymentForm,
      getString
    })
    expect(errors).toStrictEqual({})
  })

  test(`should NOT return error when template is NOT passed as part of argument`, () => {
    const errors = validateGenericFields({
      data: emptyInitialValues,
      viewType: StepViewType.DeploymentForm,
      getString
    })
    expect(errors).toStrictEqual({})
  })
})
