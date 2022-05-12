/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ServerlessLambdaRollbackStep } from '../ServerlessLambdaRollback'
import { initialValuesMock, metaDataMapMock, variablesDataMock } from './mock'

const getRuntimeInputsValues = () => ({
  name: 'name',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    skipDryRun: RUNTIME_INPUT_VALUE
  },
  path: ''
})

const getInitialValues = () => ({
  name: 'name',
  timeout: '10s',
  spec: {
    skipDryRun: false
  },
  type: StepType.ServerlessAwsLambdaRollback
})

describe('Test ServerlessLambdaRollbackStep - Edit view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessLambdaRollbackStep())
  })

  test('Serverless AWS Lambda Rollback Step rendering properly with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.ServerlessAwsLambdaRollback} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('Serverless AWS Lambda Rollback Step rendering properly with initial values', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Serverless AWS Lambda Rollback Step rendering properly with runtime initial values', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getRuntimeInputsValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should call onChange if valid values entered', async () => {
    const onChangeHandler = jest.fn()
    const onSubmitHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getInitialValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
        onChange={onChangeHandler}
        ref={ref}
        onUpdate={onSubmitHandler}
      />
    )

    await act(async () => {
      const nameInput = container.querySelector('[placeholder="pipeline.stepNamePlaceholder"]')
      fireEvent.change(nameInput!, { target: { value: 'name changed' } })
    })

    await waitFor(() =>
      expect(onChangeHandler).toHaveBeenCalledWith({
        ...getInitialValues(),
        ...{ name: 'name changed', identifier: 'name_changed' }
      })
    )

    ref.current?.submitForm()
    await waitFor(() => expect(onSubmitHandler).toBeCalled())
    expect(onSubmitHandler).toHaveBeenCalledWith({
      ...getInitialValues(),
      name: 'name changed',
      identifier: 'name_changed'
    })
  })

  test('should not call onChange if valid values entered but onChange is undefined', async () => {
    const onChangeHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getInitialValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    await act(async () => {
      const nameInput = container.querySelector('[placeholder="pipeline.stepNamePlaceholder"]')
      fireEvent.change(nameInput!, { target: { value: 'name changed' } })
    })

    await waitFor(() => expect(onChangeHandler).not.toHaveBeenCalled())
  })
})

describe('Test ServerlessLambdaRollbackStep - InputSet view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessLambdaRollbackStep())
  })

  test('Serverless AWS Lambda Rollback Step when template is not passed', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should call onUpdate if valid values entered and template is passed', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('should render skipDryRun checkbox field when skipDryRun is made runtime', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { findByLabelText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputSet}
        ref={ref}
      />
    )
    const labelText = await findByLabelText('pipelineSteps.skipDryRun')
    expect(labelText).toBeTruthy()
  })

  test('when path under inputSetData is NOT empty', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputSet}
        ref={ref}
        path="stage.execution.spec.steps[0].step"
      />
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Test ServerlessLambdaRollbackStep - InputVariable view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessLambdaRollbackStep())
  })

  test('Variables list table is rendering properly', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputVariable}
        onUpdate={onUpdateHandler}
        customStepProps={{
          variablesData: variablesDataMock,
          metadataMap: metaDataMapMock,
          initialValues: initialValuesMock
        }}
      />
    )
    expect(container.getElementsByClassName('variablesListTable')).toBeTruthy()
  })
})
