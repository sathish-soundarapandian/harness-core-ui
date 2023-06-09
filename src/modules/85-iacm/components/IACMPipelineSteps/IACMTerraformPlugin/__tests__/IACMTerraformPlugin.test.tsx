/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { IACMTerraformPluginStep } from '../index'

const renderComponent = (data: any, stepType = StepViewType.Edit) =>
  render(<TestStepWidget {...data} type={StepType.IACMTerraformPlugin} stepViewType={stepType} />)

describe('Test Azure IACM terraform plugin', () => {
  beforeEach(() => {
    factory.registerStep(new IACMTerraformPluginStep())
  })

  test('should render rollback stack view', () => {
    const data = {
      initialValues: {
        type: StepType.IACMTerraformPlugin,
        name: 'iacm terraform',
        timeout: '10m',
        identifier: 'iacm_terraform',
        spec: {
          command: 'test_id'
        }
      }
    }
    const { getByText } = renderComponent(data)

    const nameInput = getByText('name')
    expect(nameInput).toBeInTheDocument()

    const timeoutInput = getByText('pipelineSteps.timeoutLabel')
    expect(timeoutInput).toBeInTheDocument()

    const command = getByText('commandLabel')
    expect(command).toBeInTheDocument()
  })

  test('should submit form', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const data = {
      initialValues: {
        type: StepType.IACMTerraformPlugin,
        name: 'iacm terraform',
        timeout: '10m',
        identifier: 'iacm_terraform',
        spec: {
          command: 'test_id'
        }
      },
      ref,
      onUpdate
    }
    renderComponent(data)
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalled()
  })

  test('should error on submit', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const data = {
      initialValues: {
        type: StepType.IACMTerraformPlugin,
        name: 'iacm terraform',
        timeout: '10m',
        identifier: 'iacm_terraform',
        spec: {
          command: ''
        }
      },
      ref,
      onUpdate
    }
    const { getByText } = renderComponent(data)
    await act(() => ref.current?.submitForm()!)

    const error = getByText('iacm.pipelineSteps.required')
    expect(error).toBeInTheDocument()
  })

  test('should update field values', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const data = {
      initialValues: {
        type: StepType.IACMTerraformPlugin,
        name: 'iacm terraform',
        timeout: '',
        identifier: 'iacm_terraform',
        spec: {
          command: ''
        }
      },
      ref,
      onUpdate
    }
    const { container, getByPlaceholderText } = renderComponent(data)
    const timeout = getByPlaceholderText('Enter w/d/h/m/s/ms')
    userEvent.type(timeout, '10m')
    expect(timeout).toHaveDisplayValue('10m')
    const command = queryByAttribute('name', container, 'spec.command')
    userEvent.click(command!)
    userEvent.type(command!, 'destroy')
    expect(command).toHaveDisplayValue('destroy')
  })
})
