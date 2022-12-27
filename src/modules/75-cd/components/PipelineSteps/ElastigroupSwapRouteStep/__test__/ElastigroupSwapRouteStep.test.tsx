/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor, fireEvent, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE, MultiTypeInputType } from '@harness/uicore'

import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ElastigroupSwapRouteStep, ElastigroupSwapRouteStepValues } from '../ElastigroupSwapRouteStep'
import { ElastigroupSwapRouteStepEditRef } from '../ElastigroupSwapRouteStepEdit'

factory.registerStep(new ElastigroupSwapRouteStep())

const existingInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  timeout: '20m',
  type: StepType.ElastigroupSwapRoute
}

const emptyInitialValues: ElastigroupSwapRouteStepValues = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.ElastigroupSwapRoute,
  spec: {
    downsizeOldElastigroup: false
  }
}

const existingValues: ElastigroupSwapRouteStepValues = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: '30m',
  type: StepType.ElastigroupSwapRoute,
  spec: {
    downsizeOldElastigroup: true
  }
}

const onUpdate = jest.fn()
const onChange = jest.fn()
const formikRef = React.createRef<StepFormikRef<ElastigroupSwapRouteStepValues>>()

describe('ElastigroupSwapRouteStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.ElastigroupSwapRoute}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '30m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('30m'))

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '30m',
        type: StepType.ElastigroupSwapRoute,
        spec: {
          downsizeOldElastigroup: false
        }
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          type: StepType.ElastigroupSwapRoute
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.ElastigroupSwapRoute
        }}
        type={StepType.ElastigroupSwapRoute}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    userEvent.type(timeoutInput!, '20m')
    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      type: StepType.ElastigroupSwapRoute
    })
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.ElastigroupSwapRoute}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Step 1': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.ElastigroupSwapRoute.name',
                localName: 'step.ElastigroupSwapRoute.name'
              }
            },
            '20m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.ElastigroupSwapRoute.timeout',
                localName: 'step.ElastigroupSwapRoute.timeout'
              }
            }
          }
        }}
      />
    )

    expect(getByText('name')).toBeVisible()
    expect(getByText('timeout')).toBeVisible()
    expect(getByText('Step 1')).toBeVisible()
    expect(getByText('20m')).toBeVisible()
  })
})

describe('Elastigroup Edit', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test(`renders fine for empty values and values can be changed`, async () => {
    const { container } = render(
      <TestWrapper>
        <ElastigroupSwapRouteStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const queryByNameAttributeTest = (name: string) => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttributeTest('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    act((): void => {
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
    })
    expect(nameInput.value).toBe('Test Name')
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '',
        type: StepType.ElastigroupSwapRoute,
        spec: {
          downsizeOldElastigroup: false
        }
      })
    )

    const timeoutInput = queryByNameAttributeTest('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    const downsizeOldElastigroupCheckbox = queryByNameAttributeTest('spec.downsizeOldElastigroup') as HTMLInputElement
    userEvent.click(downsizeOldElastigroupCheckbox)

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '20m',
        spec: {
          downsizeOldElastigroup: true
        },
        type: StepType.ElastigroupSwapRoute
      })
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const { container } = render(
      <TestWrapper>
        <ElastigroupSwapRouteStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
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
    render(
      <TestWrapper>
        <ElastigroupSwapRouteStepEditRef
          initialValues={existingValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
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
