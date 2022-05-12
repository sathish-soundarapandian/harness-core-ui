/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ServerlessLambdaDeployStep } from '../ServerlessLambdaDeploy'
import { initialValuesMock, metaDataMapMock, variablesDataMock } from './mock'

const getRuntimeInputsValues = () => ({
  identifier: 'name',
  name: 'name',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    commandOptions: RUNTIME_INPUT_VALUE
  }
})

const getInitialValues = () => ({
  identifier: 'name',
  name: 'name',
  timeout: '10s',
  spec: {
    commandOptions: ''
  },
  type: StepType.ServerlessAwsLambdaDeploy
})

describe('Test ServerlessDeployStep - Edit view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessLambdaDeployStep())
  })

  test('Serverless Deploy Step rendering properly with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.ServerlessAwsLambdaDeploy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Serverless Deploy Step rendering properly as Edit mode when stepViewType is not passed', () => {
    const { container } = render(
      <TestStepWidget initialValues={getInitialValues()} type={StepType.ServerlessAwsLambdaDeploy} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Serverless Deploy Step rendering properly with initial values', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Serverless Deploy Step rendering properly with runtime initial values', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getRuntimeInputsValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
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
        type={StepType.ServerlessAwsLambdaDeploy}
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
        type={StepType.ServerlessAwsLambdaDeploy}
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

  test('make command options runtime input', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onChangeHandler = jest.fn()
    const onSubmit = jest.fn()

    const { findByText, getByTestId } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getInitialValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onSubmit}
        onChange={onChangeHandler}
      />
    )

    const accordionHeder = await findByText('pipelineSteps.optionalConfiguration')
    expect(accordionHeder).toBeTruthy()
    userEvent.click(accordionHeder)
    const commandOptionsDetailsDiv = getByTestId('commandOptions-details')
    const inputTypeBtn = commandOptionsDetailsDiv.getElementsByClassName('MultiTypeInput--FIXED')[0] as HTMLElement
    userEvent.click(inputTypeBtn)
    const runTimeInputOption = getByText(document.body, 'Runtime input')
    await waitFor(() => expect(runTimeInputOption).toBeInTheDocument())
    userEvent.click(runTimeInputOption)

    await waitFor(() =>
      expect(onChangeHandler).toHaveBeenCalledWith({
        ...getInitialValues(),
        spec: {
          commandOptions: RUNTIME_INPUT_VALUE
        }
      })
    )

    ref.current?.submitForm()
    await waitFor(() => expect(onSubmit).toBeCalled())
    expect(onSubmit).toHaveBeenCalledWith({
      ...getInitialValues(),
      spec: {
        commandOptions: RUNTIME_INPUT_VALUE
      }
    })
  })
})

describe('Test ServerlessDeployStep - InputSet view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessLambdaDeployStep())
  })

  test('Serverless Deploy Step rendering properly with initial values', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('when path under inputSetData is NOT empty', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByTestId, findByText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
        stepViewType={StepViewType.InputSet}
        ref={ref}
        path="stage.execution.spec.steps[0].step"
      />
    )
    const accordionHeder = await findByText('pipelineSteps.optionalConfiguration')
    expect(accordionHeder).toBeTruthy()
    userEvent.click(accordionHeder)
    const commandOptionsDetailsDiv = getByTestId('commandOptions-details')
    expect(commandOptionsDetailsDiv).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should call onUpdate if valid values entered', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('should render command options field when command options is made runtime', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { findByText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
        stepViewType={StepViewType.InputSet}
        ref={ref}
      />
    )
    const accordionHeder = await findByText('pipelineSteps.optionalConfiguration')
    expect(accordionHeder).toBeTruthy()
    await act(async () => {
      fireEvent.click(accordionHeder)
    })
  })
})

describe('Test ServerlessDeployStep - InputVariable view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessLambdaDeployStep())
  })

  test('Variables list table is rendering properly', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
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

describe('ServerlessDeploy step tests - DeploymentForm', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessLambdaDeployStep())
  })

  test('should render skipDryRun checkbox field when skipDryRun is made runtime - deploymentform view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { findByText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaDeploy}
        stepViewType={StepViewType.DeploymentForm}
        ref={ref}
      />
    )
    const accordionHeder = await findByText('pipelineSteps.optionalConfiguration')
    expect(accordionHeder).toBeTruthy()
    await act(async () => {
      fireEvent.click(accordionHeder)
    })
  })
})
