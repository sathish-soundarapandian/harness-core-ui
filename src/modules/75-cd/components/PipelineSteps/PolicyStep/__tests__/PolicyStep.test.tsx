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

import { PolicyStep } from '../PolicyStep'

jest.mock('services/pm', () => ({
  useGetPolicySet: jest.fn().mockImplementation(() => {
    return {
      data: {
        name: 'test',
        policies: ['ptest1']
      },
      loading: false,
      error: {}
    }
  })
}))

describe('Test Policy Step', () => {
  beforeEach(() => {
    factory.registerStep(new PolicyStep())
  })

  test('render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.Policy} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('render runtime inputs in edit step', () => {
    const initialValues = {
      name: 'Policy Step',
      identifier: 'PolicyStep',
      type: StepType.Policy,
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        policySets: ['acc.pol1', 'org.pol2', 'pol3'],
        type: 'Custom',
        policySpec: {
          payload: RUNTIME_INPUT_VALUE
        }
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Policy} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('render edit view as edit step', () => {
    const initialValues = {
      name: 'Policy Step',
      identifier: 'PolicyStep',
      type: StepType.Policy,
      timeout: '10m',
      spec: {
        policySets: ['acc.pol1', 'org.pol2', 'pol3'],
        type: 'Custom',
        policySpec: {
          payload: 'Some Custom input'
        }
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Policy} stepViewType={StepViewType.Edit} />
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
          type: StepType.Policy,
          timeout: '10m',
          spec: {
            policySets: ['acc.test'],
            type: 'Custom',
            policySpec: {
              payload: 'Input'
            }
          }
        }}
        type={StepType.Policy}
        stepViewType={StepViewType.Edit}
        onChange={onChange}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.input(queryByNameAttribute('name')!, { target: { value: 'Policy Step' } })
      fireEvent.input(queryByNameAttribute('timeout')!, { target: { value: '20m' } })
      fireEvent.input(queryByNameAttribute('spec.policySpec.payload')!, {
        target: { value: 'Test Input' },
        bubbles: true
      })
    })

    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalledWith({
      name: 'Policy Step',
      identifier: 'Policy_Step',
      type: 'Policy',
      timeout: '20m',
      spec: {
        policySets: ['acc.test'],
        type: 'Custom',
        policySpec: {
          payload: 'Test Input'
        }
      }
    })
  })

  test('renders input sets', () => {
    const onChange = jest.fn()
    const onUpdate = jest.fn()
    const initialValues = {
      name: 'Policy Step',
      identifier: 'PolicyStep',
      type: StepType.Policy,
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        policySets: ['acc.pol1', 'org.pol2', 'pol3'],
        type: 'Custom',
        policySpec: {
          payload: RUNTIME_INPUT_VALUE
        }
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.Policy}
        stepViewType={StepViewType.InputSet}
        onChange={onChange}
        onUpdate={onUpdate}
        inputSetData={{
          readonly: false,
          template: {
            timeout: RUNTIME_INPUT_VALUE,
            spec: {
              policySets: RUNTIME_INPUT_VALUE,
              policySpec: {
                payload: RUNTIME_INPUT_VALUE
              }
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
        type={StepType.Policy}
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
      name: 'Policy Step',
      identifier: 'PolicyStep',
      type: StepType.Policy,
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        policySets: RUNTIME_INPUT_VALUE,
        type: 'Custom',
        policySpec: {
          payload: RUNTIME_INPUT_VALUE
        }
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.Policy}
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
    const response = new PolicyStep().validateInputSet({
      data: {
        name: 'Policy Step',
        identifier: 'PolicyStep',
        timeout: '1',
        type: StepType.Policy,
        spec: {
          type: 'Custom',
          policySpec: {
            payload: ''
          }
        }
      },
      template: {
        name: 'Policy Step',
        identifier: 'PolicyStep',
        timeout: RUNTIME_INPUT_VALUE,
        type: StepType.Policy,
        spec: {
          type: 'Custom',
          policySets: RUNTIME_INPUT_VALUE,
          policySpec: {
            payload: RUNTIME_INPUT_VALUE
          }
        }
      },
      viewType: StepViewType.DeploymentForm,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })

  test('validates timeout is min 10s', () => {
    const response = new PolicyStep().validateInputSet({
      data: {
        name: 'Policy Step',
        identifier: 'PolicyStep',
        timeout: '1s',
        type: StepType.Policy,
        spec: {
          type: 'Custom',
          policySpec: {
            payload: ''
          }
        }
      },
      template: {
        name: 'Policy Step',
        identifier: 'PolicyStep',
        timeout: RUNTIME_INPUT_VALUE,
        type: StepType.Policy,
        spec: {
          type: 'Custom',
          policySets: RUNTIME_INPUT_VALUE,
          policySpec: {
            payload: RUNTIME_INPUT_VALUE
          }
        }
      },
      viewType: StepViewType.DeploymentForm
    })
    expect(response).toMatchSnapshot()
  })
})
