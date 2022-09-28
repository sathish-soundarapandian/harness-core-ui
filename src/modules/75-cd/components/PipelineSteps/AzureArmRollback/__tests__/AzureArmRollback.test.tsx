/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { AzureArmRollback } from '../AzureArmRollback'

const renderComponent = (data: any, stepType = StepViewType.Edit) =>
  render(<TestStepWidget {...data} type={StepType.AzureArmRollback} stepViewType={stepType} />)

describe('Test Azure ARM rollback stack', () => {
  beforeEach(() => {
    factory.registerStep(new AzureArmRollback())
  })

  test('should render edit view as new step', () => {
    const { container } = renderComponent({ initialValues: {} })
    expect(container).toMatchSnapshot()
  })

  test('should render rollback stack view', () => {
    const data = {
      initialValues: {
        type: StepType.AzureArmRollback,
        name: 'rollback',
        timeout: '10m',
        identifier: 'rollback',
        spec: {
          provisionerIdentifier: 'test_id'
        }
      }
    }
    const { getByText } = renderComponent(data)

    const nameInput = getByText('name')
    expect(nameInput).toBeInTheDocument()

    const timeoutInput = getByText('pipelineSteps.timeoutLabel')
    expect(timeoutInput).toBeInTheDocument()

    const provId = getByText('pipelineSteps.provisionerIdentifier')
    expect(provId).toBeInTheDocument()
  })

  test('should submit rollback form', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const data = {
      initialValues: {
        type: StepType.AzureArmRollback,
        name: 'rollback',
        timeout: '10m',
        identifier: 'rollback',
        spec: {
          provisionerIdentifier: 'test_id'
        }
      },
      ref,
      onUpdate
    }
    const { container } = renderComponent(data)
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('should error on submit', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const data = {
      initialValues: {
        type: StepType.AzureArmRollback,
        name: 'rollback',
        timeout: '10m',
        identifier: 'rollback',
        spec: {
          provisionerIdentifier: ''
        }
      },
      ref,
      onUpdate
    }
    const { getByText } = renderComponent(data)
    await act(() => ref.current?.submitForm()!)

    const error = getByText('common.validation.provisionerIdentifierIsRequired')
    expect(error).toBeInTheDocument()
  })

  test('should show runtime component', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const data = {
      initialValues: {
        type: StepType.AzureArmRollback,
        name: 'rollback',
        timeout: RUNTIME_INPUT_VALUE,
        identifier: 'rollback',
        spec: {
          provisionerIdentifier: RUNTIME_INPUT_VALUE
        }
      },
      ref,
      onUpdate
    }
    const { getAllByText } = renderComponent(data)

    const runtimeSettingsCog = getAllByText('cog')
    expect(runtimeSettingsCog?.length).toBe(2)
  })

  test('should update field values', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const data = {
      initialValues: {
        type: StepType.AzureArmRollback,
        name: 'rollback',
        timeout: '',
        identifier: 'rollback',
        spec: {
          provisionerIdentifier: ''
        }
      },
      ref,
      onUpdate
    }
    const { container, getByPlaceholderText } = renderComponent(data)
    const timeout = getByPlaceholderText('Enter w/d/h/m/s/ms')
    userEvent.type(timeout, '10m')
    expect(timeout).toHaveDisplayValue('10m')
    const provId = queryByAttribute('name', container, 'spec.provisionerIdentifier')
    userEvent.click(provId!)
    userEvent.type(provId!, 'testing')
    expect(provId).toHaveDisplayValue('testing')
  })

  test('should render variable input step', () => {
    const data = {
      initialValues: {
        type: StepType.AzureArmRollback,
        name: 'rollback',
        timeout: '10m',
        identifier: 'rollback',
        spec: {
          provisionerIdentifier: 'test_id'
        }
      }
    }
    const { container } = renderComponent(data, StepViewType.InputSet)
    expect(container).toMatchSnapshot()
  })

  test('should render variable input step', () => {
    const data = {
      initialValues: {
        type: StepType.AzureArmRollback,
        name: 'rollback',
        timeout: '10m',
        identifier: 'rollback',
        spec: {
          provisionerIdentifier: RUNTIME_INPUT_VALUE
        }
      },
      stageIdentifier: 'qaStage',
      onUpdate: jest.fn(),
      metadataMap: {},
      variablesData: {
        type: 'DeleteStack',
        name: 'cleanup',
        identifier: 'cleanup',
        spec: {
          provisionerIdentifier: 'provID'
        },
        timeout: '10m'
      },
      stepType: StepType.AzureArmRollback
    }
    const { container } = renderComponent(data, StepViewType.InputVariable)
    expect(container).toMatchSnapshot()
  })
})
