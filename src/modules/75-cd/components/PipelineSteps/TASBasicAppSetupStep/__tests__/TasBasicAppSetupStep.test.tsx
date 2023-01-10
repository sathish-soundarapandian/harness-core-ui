/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import userEvent from '@testing-library/user-event'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TASBasicAppSetupStep } from '../TASBasicAppSetupStep'
import { InstancesType } from '../TASBasicAppSetupTypes'
import { initialValues, runtimeValues, variableCustomStepProps } from './mocks'

const queryByNameAttribute = (container: HTMLElement, name: string): HTMLElement | null =>
  queryByAttribute('name', container, name)

factory.registerStep(new TASBasicAppSetupStep())
describe('Test TAS Setup Steps', () => {
  test('should render edit view as new step - with initial snapshot', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.BasicAppSetup} stepViewType={StepViewType.Edit} />
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
        type={StepType.BasicAppSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(async () => {
      fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'Step1' } })
      fireEvent.change(queryByNameAttribute(container, 'timeout')!, { target: { value: '10m' } })

      fireEvent.input(queryByNameAttribute(container, 'spec.existingVersionToKeep')!, {
        target: { value: '4' }
      })

      await act(() => ref.current?.submitForm()!)
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      type: 'BasicAppSetup',
      timeout: '10m',
      spec: { tasInstanceCountType: InstancesType.FromManifest, existingVersionToKeep: 4 }
    })
  })

  test('should render edit view as edit step with MatchRunningInstances and submit form', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.BasicAppSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'Step1' } })
    fireEvent.change(queryByNameAttribute(container, 'timeout')!, { target: { value: '10m' } })

    const instancesOption = container.querySelectorAll('input[type="radio"]')
    expect((instancesOption[0] as HTMLInputElement).value).toBe(InstancesType.FromManifest)
    expect((instancesOption[1] as HTMLInputElement).value).toBe(InstancesType.MatchRunningInstances)
    expect(instancesOption[0] as HTMLInputElement).toBeChecked()
    const currentRunningBtn = instancesOption[1] as HTMLInputElement
    currentRunningBtn.click()
    expect(instancesOption[1] as HTMLInputElement).toBeChecked()
    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      spec: { tasInstanceCountType: InstancesType.MatchRunningInstances, existingVersionToKeep: 3 },
      timeout: '10m',
      type: 'BasicAppSetup'
    })
  })

  test('edit view validation test', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          ...initialValues,
          spec: { tasInstanceCountType: InstancesType.FromManifest, existingVersionToKeep: '' }
        }}
        type={StepType.BasicAppSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    // Clear input and update value
    const versionInput = queryByNameAttribute(container, 'spec.existingVersionToKeep')!
    userEvent.clear(versionInput)

    await act(() => ref.current?.submitForm()!)

    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(1)
      expect(getByText('cd.ElastigroupStep.valueCannotBe')).toBeTruthy()
    })

    // validate negative value error
    fireEvent.input(versionInput!, {
      target: { value: '-1' }
    })

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(getByText('pipeline.approvalStep.validation.minimumCountOne')).toBeTruthy()
    })
  })
})

describe('TAS BasicAppSetupStep - runtime view and validation test', () => {
  test('should submit runtime values', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.BasicAppSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'TASBasicAppSetup',
      name: 'TASBasicAppSetup',
      spec: {
        tasInstanceCountType: InstancesType.FromManifest,
        existingVersionToKeep: RUNTIME_INPUT_VALUE,
        additionalRoutes: RUNTIME_INPUT_VALUE
      },
      timeout: RUNTIME_INPUT_VALUE,
      type: 'BasicAppSetup'
    })
  })
  test('runtime view inputSet view', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.BasicAppSetup}
        stepViewType={StepViewType.DeploymentForm}
        template={runtimeValues}
      />
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('input[placeholder="cd.steps.tas.typeAndEnterForRouteAdd"]')).toBeTruthy()
  })
  test('Input set view validation for timeout', () => {
    const response = new TASBasicAppSetupStep().validateInputSet({
      data: {
        name: 'TASBasicAppSetup',
        identifier: 'TASBasicAppSetup',
        timeout: '1s',
        type: 'BasicAppSetup',
        spec: {
          tasInstanceCountType: InstancesType.FromManifest,
          existingVersionToKeep: '',
          additionalRoutes: ''
        }
      } as any,
      template: {
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          tasInstanceCountType: InstancesType.FromManifest,
          existingVersionToKeep: RUNTIME_INPUT_VALUE,
          additionalRoutes: RUNTIME_INPUT_VALUE
        }
      } as any,
      getString: jest.fn(),
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })
})

describe('TAS Basic Setup Step variable view ', () => {
  test('validate default inputVariables section', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.BasicAppSetup}
        stepViewType={StepViewType.InputVariable}
        customStepProps={variableCustomStepProps}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
