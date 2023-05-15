/*
 * Copyright 2022 Harness Inc. All rights reserved.
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
import { SwapRollbackStep } from '../SwapRollback'

factory.registerStep(new SwapRollbackStep())

const existingInitialValues = {
  type: StepType.SwapRollback,
  name: 'Swap Route Step Default',
  identifier: 'Swap_Route_Step_Default',
  timeout: '10m',
  spec: {
    upsizeInActiveApp: false
  }
}

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('SwapRollbackStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SwapRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    await userEvent.type(nameInput!, 'Swap Route Step')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Swap Route Step'))
    expect(getByText('Swap_Route_Step')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    await userEvent.clear(timeoutInput!)
    await userEvent.type(timeoutInput!, '20m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('20m'))

    const enableUpsizeInActiveAppCheckbox = queryByNameAttribute('spec.upsizeInActiveApp', container)
    await waitFor(() => expect(enableUpsizeInActiveAppCheckbox).not.toBeChecked())

    await act(() => ref.current?.submitForm()!)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Swap_Route_Step',
        name: 'Swap Route Step',
        timeout: '20m',
        type: StepType.SwapRollback,
        spec: {
          upsizeInActiveApp: false
        }
      })
    )
  })

  test('should render edit view as edit step with all runtime inputs', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.SwapRollback,
          name: 'Swap Route Step Default',
          identifier: 'Swap_Route_Step_Default',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            upsizeInActiveApp: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.SwapRollback}
        stepViewType={StepViewType.Edit}
        readonly
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Swap_Route_Step',
          name: 'Swap Route Step',
          timeout: '',
          type: StepType.SwapRollback,
          spec: {
            upsizeInActiveApp: RUNTIME_INPUT_VALUE
          }
        }}
        template={{
          identifier: 'Swap_Route_Step',
          name: 'Swap Route Step',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.SwapRollback,
          spec: {
            upsizeInActiveApp: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.SwapRollback}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        inputSetData={{ path: '', readonly: true }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    await userEvent.type(timeoutInput!, '10m')
    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Swap_Route_Step',
      name: 'Swap Route Step',
      timeout: '10m',
      type: StepType.SwapRollback,
      spec: {
        upsizeInActiveApp: RUNTIME_INPUT_VALUE
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.SwapRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'testStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Swap Route Step Default': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.spec.execution.steps.SwapRollback_1.name',
                localName: 'execution.steps.SwapRollback_1.name',
                variableName: 'name',
                aliasFQN: '',
                visible: true
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.spec.execution.steps.SwapRollback_1.timeout',
                localName: 'execution.steps.SwapRollback_1.timeout',
                variableName: 'timeout',
                aliasFQN: '',
                visible: true
              }
            },
            upsizeInActiveApp: {
              fqn: 'pipeline.stages.testStage.spec.execution.steps.SwapRollback_1.spec.upsizeInActiveApp',
              localName: 'execution.steps.SwapRollback_1.spec.upsizeInActiveApp',
              variableName: 'upsizeInActiveApp',
              aliasFQN: '',
              visible: true
            }
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
