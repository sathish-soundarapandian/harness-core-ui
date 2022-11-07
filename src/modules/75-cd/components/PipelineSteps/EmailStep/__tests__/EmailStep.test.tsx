/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import type { EmailStepData } from '../emailStepTypes'
import { EmailStep } from '../EmailStep'
import {
  getRuntimeInputValues,
  getFixedInputValues,
  getErrorInputValues,
  getTimeoutErrorInputValues
} from './testUtils'

describe('Email Step Test', () => {
  beforeEach(() => {
    factory.registerStep(new EmailStep())
  })

  test('should render edit view as new step with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.Email} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render runtime inputs', () => {
    const { container } = render(
      <TestStepWidget initialValues={getRuntimeInputValues()} type={StepType.Email} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget initialValues={getFixedInputValues()} type={StepType.Email} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should call onChange if valid values entered', async () => {
    const onChangeHandler = jest.fn()
    const onSubmitHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={getFixedInputValues()}
        template={getFixedInputValues()}
        allValues={getFixedInputValues()}
        type={StepType.Email}
        stepViewType={StepViewType.Edit}
        onChange={onChangeHandler}
        onUpdate={onSubmitHandler}
        ref={ref}
      />
    )

    await act(async () => {
      const nameInput = container.querySelector('[placeholder="pipeline.stepNamePlaceholder"]')
      fireEvent.change(nameInput!, { target: { value: 'email changed' } })
    })

    await waitFor(() =>
      expect(onChangeHandler).toHaveBeenCalledWith({
        ...getFixedInputValues(),
        name: 'email changed',
        identifier: 'email_changed'
      })
    )

    await act(() => ref.current?.submitForm()!)

    await waitFor(() => expect(onSubmitHandler).toBeCalled())
    expect(onSubmitHandler).toHaveBeenCalledWith({
      ...getFixedInputValues(),
      name: 'email changed',
      identifier: 'email_changed'
    })
  })

  test('should render empty inputVariables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.Email}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{}}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render empty input sets', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.Email}
        stepViewType={StepViewType.InputSet}
        template={{}}
        path=""
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render deployment form', () => {
    const onChange = jest.fn()
    const onUpdate = jest.fn()

    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={getRuntimeInputValues()}
        type={StepType.Email}
        stepViewType={StepViewType.DeploymentForm}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Test EmailStep - Inputset', () => {
  test('validates default inputs set correctly', () => {
    const response = new EmailStep().validateInputSet({
      data: getFixedInputValues(),
      template: getRuntimeInputValues(),
      viewType: StepViewType.DeploymentForm,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })

  test('validates error in inputs set', () => {
    const response = new EmailStep().validateInputSet({
      data: getErrorInputValues(),
      template: getRuntimeInputValues(),
      viewType: StepViewType.DeploymentForm,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })

  test('validates timeout is min 1d', () => {
    const response = new EmailStep().validateInputSet({
      data: { ...getTimeoutErrorInputValues() } as EmailStepData,
      template: { ...getTimeoutErrorInputValues() } as EmailStepData,
      viewType: StepViewType.TriggerForm,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })
})
