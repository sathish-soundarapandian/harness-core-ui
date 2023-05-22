/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { DeployCloudFunctionStepGenOne } from '../DeployCloudFunctionStepGenOne'

factory.registerStep(new DeployCloudFunctionStepGenOne())

const existingInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    updateFieldMask: ''
  },
  timeout: '20m',
  type: StepType.DeployCloudFunctionGenOne
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('DeployCloudFunctionGenOne  tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.DeployCloudFunctionGenOne}
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

    const fieldInput = queryByNameAttribute('spec.updateFieldMask', container)
    userEvent.clear(fieldInput!)
    userEvent.type(fieldInput!, 'AbcD')
    await waitFor(() => expect(fieldInput).toHaveDisplayValue('AbcD'))

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '30m',
        spec: {
          updateFieldMask: 'AbcD'
        },
        type: StepType.DeployCloudFunctionGenOne
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          spec: { updateFieldMask: '' },
          timeout: '',
          type: StepType.DeployCloudFunctionGenOne
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            updateFieldMask: RUNTIME_INPUT_VALUE
          },
          type: StepType.DeployCloudFunctionGenOne
        }}
        type={StepType.DeployCloudFunctionGenOne}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const submitBtn = getByText('Submit')

    const timeoutInput = queryByNameAttribute('timeout', container)
    const fieldInput = queryByNameAttribute('spec.updateFieldMask', container)

    expect(timeoutInput).toBeVisible()
    expect(fieldInput).toBeVisible()

    userEvent.type(timeoutInput!, '20m')
    userEvent.type(fieldInput!, 'AbcD')

    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      spec: { updateFieldMask: 'AbcD' },
      type: StepType.DeployCloudFunctionGenOne
    })
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.DeployCloudFunctionGenOne}
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
                fqn: 'pipeline.stages.qaStage.execution.steps.DeployCloudFunctionGenOne.name',
                localName: 'step.DeployCloudFunctionGenOne.name'
              }
            },
            '20m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.DeployCloudFunctionGenOne.timeout',
                localName: 'step.DeployCloudFunctionGenOne.timeout'
              }
            }
          }
        }}
      />
    )
    expect(getByText('name')).toBeVisible()
    expect(getByText('Step 1')).toBeVisible()
    expect(getByText('timeout')).toBeVisible()
    expect(getByText('20m')).toBeVisible()
  })
})
