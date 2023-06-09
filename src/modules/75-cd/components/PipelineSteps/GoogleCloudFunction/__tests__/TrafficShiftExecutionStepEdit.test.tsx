/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { DeployCloudFunctionTrafficShiftStep } from '../GenTwo/DeployCloudFunctionTrafficShiftStep/DeployCloudFunctionTrafficShiftStep'
import { TrafficShiftExecutionStepEditRef } from '../TrafficShiftExecutionStepEdit'

factory.registerStep(new DeployCloudFunctionTrafficShiftStep())

const existingInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    trafficPercent: 2
  },
  timeout: '20m',
  type: StepType.CloudFunctionTrafficShift
}

const emptyInitialValues = {
  identifier: '',
  name: '',
  spec: {
    trafficPercent: 0
  },
  timeout: '',
  type: StepType.CloudFunctionTrafficShift
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
        <TrafficShiftExecutionStepEditRef
          initialValues={existingInitialValues}
          formikFormName=""
          allowableTypes={allowableTypes}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          isNewStep={true}
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

    const trafficPercentInput = queryByNameAttribute('spec.trafficPercent', container)
    userEvent.clear(trafficPercentInput!)
    userEvent.type(trafficPercentInput!, '5')

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'No_Traffic_Step_1',
        name: 'No Traffic Step 1',
        timeout: '10s',
        spec: {
          trafficPercent: 5
        },
        type: StepType.CloudFunctionTrafficShift
      })
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const formikRef = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestWrapper>
        <TrafficShiftExecutionStepEditRef
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
        <TrafficShiftExecutionStepEditRef
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
})
