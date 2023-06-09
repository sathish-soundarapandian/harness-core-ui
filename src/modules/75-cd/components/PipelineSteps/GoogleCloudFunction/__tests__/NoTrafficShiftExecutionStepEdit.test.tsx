/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { NoTrafficShiftExecutionStepEditRef } from '../NoTrafficShiftExecutionStepEdit'
import { DeployCloudFunctionNoTrafficShiftStep } from '../GenTwo/DeployCloudFunctionNoTrafficShiftStep/DeployCloudFunctionNoTrafficShiftStep'

factory.registerStep(new DeployCloudFunctionNoTrafficShiftStep())

const existingInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    updateFieldMask: ''
  },
  timeout: '20m',
  type: StepType.DeployCloudFunctionWithNoTraffic
}

const emptyInitialValues = {
  identifier: '',
  name: '',
  spec: {
    updateFieldMask: ''
  },
  timeout: '',
  type: StepType.DeployCloudFunctionWithNoTraffic
}

const onUpdate = jest.fn()
const onChange = jest.fn()
const allowableTypes = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
] as AllowedTypesWithRunTime[]

describe('NoTrafficShiftExecutionStepEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Checking validations for fields and Submitting Form', async () => {
    const formikRef = React.createRef<StepFormikRef<unknown>>()

    const { container, getByText, findByText } = render(
      <TestWrapper>
        <NoTrafficShiftExecutionStepEditRef
          initialValues={existingInitialValues}
          formikFormName=""
          allowableTypes={allowableTypes}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.clear(nameInput!)
    userEvent.type(nameInput!, 'No Traffic Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('No Traffic Step 1'))
    expect(getByText('No_Traffic_Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '10')
    fireEvent.keyDown(timeoutInput!, { key: 'enter', keyCode: 13 })
    const invalidSyntaxError = await findByText('Invalid syntax provided')
    expect(invalidSyntaxError).toBeInTheDocument()

    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '5s')
    fireEvent.keyDown(timeoutInput!, { key: 'enter', keyCode: 13 })
    const minimumTimeoutError = await findByText('Value must be greater than or equal to "10s"')
    expect(minimumTimeoutError).toBeInTheDocument()

    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '10s')

    const fieldMaskInput = queryByNameAttribute('spec.updateFieldMask', container)
    userEvent.clear(fieldMaskInput!)
    userEvent.type(fieldMaskInput!, 'abcd')

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'No_Traffic_Step_1',
        name: 'No Traffic Step 1',
        timeout: '10s',
        spec: {
          updateFieldMask: 'abcd'
        },
        type: StepType.DeployCloudFunctionWithNoTraffic
      })
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const formikRef = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestWrapper>
        <NoTrafficShiftExecutionStepEditRef
          formikFormName=""
          initialValues={emptyInitialValues}
          allowableTypes={allowableTypes}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )
    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()
  })

  test('onUpdate should not be called if it is not passed as prop', async () => {
    const formikRef = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestWrapper>
        <NoTrafficShiftExecutionStepEditRef
          formikFormName=""
          initialValues={existingInitialValues}
          allowableTypes={allowableTypes}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )
    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
  })

  test('Saving updateFieldMask as Runtime Input', async () => {
    const formikRef = React.createRef<StepFormikRef<unknown>>()

    const { container, getByText } = render(
      <TestWrapper>
        <NoTrafficShiftExecutionStepEditRef
          initialValues={existingInitialValues}
          formikFormName=""
          allowableTypes={allowableTypes}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const updateFieldMaskInput = container.querySelectorAll('span[data-icon="fixed-input"]')
    fireEvent.click(updateFieldMaskInput[1]!)
    fireEvent.click(getByText('Runtime input'))

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '20m',
        spec: {
          updateFieldMask: RUNTIME_INPUT_VALUE
        },
        type: StepType.DeployCloudFunctionWithNoTraffic
      })
    )
  })
})
