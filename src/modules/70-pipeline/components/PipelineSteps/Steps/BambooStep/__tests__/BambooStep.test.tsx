/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import {
  getBambooStepDeploymentModeProps,
  getBambooStepEditModeProps,
  getBambooStepEditModePropsWithConnectorId,
  getBambooStepEditModePropsWithValues,
  getBambooStepInputVariableModeProps,
  mockConnectorResponse,
  mockPlansResponse
} from './BambooStepTestHelper'
import { BambooStep } from '../BambooStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetPlansKey: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockPlansResponse
      })
    }),
    refetch: jest.fn(),
    error: null
  }))
}))
describe('Bamboo Step', () => {
  beforeEach(() => {
    factory.registerStep(new BambooStep())
  })
  test('renders normally', () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getBambooStepEditModePropsWithConnectorId()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Bamboo step tests', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    // useGetJiraProjects.mockImplementation(() => mockProjectsResponse)
  })
  beforeEach(() => {
    factory.registerStep(new BambooStep())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getBambooStepDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )

    const planNameField = queryByAttribute('name', container, 'spec.planName')
    planNameField?.focus()
    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getBambooStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('deploymentform mode - readonly', async () => {
    const props = getBambooStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getBambooStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        template={props.inputSetData?.template}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - input variable view', () => {
    const props = getBambooStepInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('input variable view')
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getBambooStepEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    await act(() => ref.current?.submitForm()!)
    expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'bamboo step' } })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
  })

  test('Edit stage - readonly', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getBambooStepEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )

    expect(container).toMatchSnapshot('edit stage view readonly')
  })

  test('Open a saved bamboo step - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getBambooStepEditModePropsWithValues()
    const { container, queryByDisplayValue, debug } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    debug(container)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'bamboo step' } })
    expect(queryByDisplayValue('10m')).toBeTruthy()

    expect(queryByDisplayValue('<+input>')).toBeTruthy()
    expect(queryByDisplayValue('x')).toBeTruthy()

    expect(queryByDisplayValue('10')).toBeTruthy()

    await act(() => ref.current?.submitForm()!)
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'bamboo_step',
      timeout: '10m',
      type: StepType.BambooBuild,
      spec: {
        connectorRef: 'cid1',
        planParameter: [
          {
            name: 'x',
            type: 'String',
            value: '10',
            id: 'f842f927-2ce7-41f5-8753-24f153eb3663'
          }
        ],
        delegateSelectors: [],
        unstableStatusAsSuccess: false,
        useConnectorUrlForJobExecution: false,
        planName: '<+input>'
      },
      name: 'bamboo step'
    })
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new BambooStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: StepType.BambooBuild,
        spec: {
          connectorRef: '',
          planName: '',
          planParameter: [],
          delegateSelectors: []
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: StepType.BambooBuild,
        spec: {
          connectorRef: '',
          planName: '',
          planParameter: [],
          delegateSelectors: []
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })
})
