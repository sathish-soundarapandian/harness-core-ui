/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render } from '@testing-library/react'

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'

import { WaitStep } from '../WaitStep'

jest.mock('services/pm', () => ({}))

describe('Test Wait Step', () => {
  beforeEach(() => {
    factory.registerStep(new WaitStep())
  })

  test('render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.Wait} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('render runtime inputs in edit step', () => {
    const initialValues = {
      name: 'Wait Step',
      identifier: 'WaitStep',
      type: StepType.Wait,
      spec: {
        duration: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Wait} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('render edit view as edit step', () => {
    const initialValues = {
      name: 'Wait Step',
      identifier: 'WaitStep',
      type: StepType.Wait,
      spec: {
        duration: '10s'
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Wait} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('form produces correct data', async () => {
    const onChange = jest.fn()
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          name: '',
          identifier: '',
          type: StepType.Wait,
          spec: {
            duration: '10s'
          }
        }}
        type={StepType.Wait}
        stepViewType={StepViewType.Edit}
        onChange={onChange}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.input(queryByNameAttribute('name')!, { target: { value: 'Wait Step' } })

      fireEvent.input(queryByNameAttribute('spec.duration')!, {
        target: { value: '10m' },
        bubbles: true
      })
    })

    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalledWith({
      name: 'Wait Step',
      identifier: 'Wait_Step',
      type: 'Wait',

      spec: {
        duration: '10m'
      }
    })
  })

  test('renders input sets', () => {
    const onChange = jest.fn()
    const onUpdate = jest.fn()
    const initialValues = {
      name: 'Wait Step',
      identifier: 'WaitStep',
      type: StepType.Wait,
      spec: {
        duration: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.Wait}
        stepViewType={StepViewType.InputSet}
        onChange={onChange}
        onUpdate={onUpdate}
        inputSetData={{
          readonly: false,
          template: {
            spec: {
              duration: RUNTIME_INPUT_VALUE
            }
          } as any,
          path: '/test/path'
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders empty input sets', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.Wait}
        stepViewType={StepViewType.InputSet}
        template={{}}
        path=""
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders deployment form', () => {
    const onChange = jest.fn()
    const onUpdate = jest.fn()
    const initialValues = {
      name: 'Wait Step',
      identifier: 'WaitStep',
      type: StepType.Wait,
      spec: {
        duration: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.Wait}
        stepViewType={StepViewType.DeploymentForm}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('validate policy step input sets', () => {
  test('validates default inputs set correctly', () => {
    const response = new WaitStep().validateInputSet({
      data: {
        name: 'Wait Step',
        identifier: 'WaitStep',
        type: StepType.Wait,
        spec: {
          duration: '10'
        }
      },
      template: {
        name: 'Wait Step',
        identifier: 'WaitStep',
        type: StepType.Wait,
        spec: {
          duration: RUNTIME_INPUT_VALUE
        }
      },
      viewType: StepViewType.DeploymentForm,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })

  test('validates timeout is min 10s', () => {
    const response = new WaitStep().validateInputSet({
      data: {
        name: 'Wait Step',
        identifier: 'WaitStep',
        type: StepType.Wait,
        spec: {
          duration: '10m'
        }
      },
      template: {
        name: 'Wait Step',
        identifier: 'WaitStep',
        type: StepType.Wait,
        spec: {
          duration: RUNTIME_INPUT_VALUE
        }
      },
      viewType: StepViewType.DeploymentForm
    })
    expect(response).toMatchSnapshot()
  })
})
