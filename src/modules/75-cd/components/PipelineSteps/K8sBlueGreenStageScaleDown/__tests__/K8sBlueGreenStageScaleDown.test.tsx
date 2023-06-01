/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { queryByNameAttribute } from '@common/utils/testUtils'
import { K8sBlueGreenStageScaleDown } from '../K8sBlueGreenStageScaleDown'
import { initialValues, runtimeValues, variableCustomStepProps } from './mocks'

factory.registerStep(new K8sBlueGreenStageScaleDown())
describe('Test K8sBlueGreenStageScaleDown', () => {
  test('should render edit view as new step - with initial snapshot', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sBlueGreenStageScaleDown} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render in edit view and submit with initial values', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.K8sBlueGreenStageScaleDown}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(async () => {
      fireEvent.change(queryByNameAttribute('name', container)!, { target: { value: 'Step1' } })
      fireEvent.change(queryByNameAttribute('timeout', container)!, { target: { value: '1m' } })
      await act(() => ref.current?.submitForm()!)
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      type: 'K8sBlueGreenStageScaleDown',
      timeout: '1m',
      spec: {}
    })
  })
  test('should not render identifier for StepviewType.template', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.K8sBlueGreenStageScaleDown}
        stepViewType={StepViewType.Template}
      />
    )
    const nameField = container.querySelector('input[name="name"]')
    const timeoutField = container.querySelector('input[name="timeout"]')
    expect(nameField).not.toBeInTheDocument()
    expect(timeoutField).toBeInTheDocument()
  })
  test('edit view validation test', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          ...initialValues,
          timeout: '',
          spec: {}
        }}
        type={StepType.K8sBlueGreenStageScaleDown}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(1)
      expect(getByText('validation.timeout10SecMinimum')).toBeTruthy()
    })
  })
})
describe('K8sBlueGreenStageScaleDown - runtime view and validation test', () => {
  test('should submit runtime values', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.K8sBlueGreenStageScaleDown}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'K8sBlueGreenStageScaleDown',
      name: 'K8sBlueGreenStageScaleDown',
      spec: {},
      timeout: RUNTIME_INPUT_VALUE,
      type: 'K8sBlueGreenStageScaleDown'
    })
  })

  test('runtime view inputSet view', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.K8sBlueGreenStageScaleDown}
        stepViewType={StepViewType.DeploymentForm}
        template={runtimeValues}
      />
    )
    const timeoutInput = queryByNameAttribute('timeout', container) as HTMLInputElement
    expect(timeoutInput.value).toBe('<+input>')
  })

  test('Input set view validation for timeout', () => {
    const response = new K8sBlueGreenStageScaleDown().validateInputSet({
      data: {
        name: 'K8sBlueGreenStageScaleDown',
        identifier: 'K8sBlueGreenStageScaleDown',
        timeout: '1s',
        type: 'K8sBlueGreenStageScaleDown',
        spec: {}
      } as any,
      template: {
        timeout: RUNTIME_INPUT_VALUE,
        spec: {}
      } as any,
      getString: jest.fn(),
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })
})

describe(' K8sBlueGreenStageScaleDown Step variable view ', () => {
  test('validate default inputVariables section', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.K8sBlueGreenStageScaleDown,
          name: 'K8sBlueGreenStageScaleDown',
          identifier: 'K8sBlueGreenStageScaleDown',
          description: 'sample description',
          timeout: '10m',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE }
        }}
        type={StepType.K8sBlueGreenStageScaleDown}
        stepViewType={StepViewType.InputVariable}
        customStepProps={variableCustomStepProps}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
