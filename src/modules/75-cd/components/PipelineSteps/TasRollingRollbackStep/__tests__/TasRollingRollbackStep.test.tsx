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
import { TASRollingRollbackStep } from '../TasRollingRollbackStep'

factory.registerStep(new TASRollingRollbackStep())

const existingInitialValues = {
  identifier: 'TAS_Rolling_Rollback_Stepback',
  name: 'TAS Rolling Rollback Stepback',
  timeout: '10m',
  type: StepType.TasRollingRollback
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('TASRollingRollbackStepStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.TasRollingRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    await userEvent.type(nameInput!, 'TAS Rolling Rollback Step')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('TAS Rolling Rollback Step'))
    expect(getByText('TAS_Rolling_Rollback_Step')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    await userEvent.clear(timeoutInput!)
    await userEvent.type(timeoutInput!, '10m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('10m'))

    await act(() => ref.current?.submitForm()!)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'TAS_Rolling_Rollback_Step',
        name: 'TAS Rolling Rollback Step',
        timeout: '10m',
        type: StepType.TasRollingRollback
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'TAS_Rolling_Rollback_Step',
          name: 'TAS Rolling Rollback Step',
          timeout: '',
          type: StepType.TasRollingRollback
        }}
        template={{
          identifier: 'TAS_Rolling_Rollback_Step',
          name: 'TAS Rolling Rollback Step',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.TasRollingRollback
        }}
        type={StepType.TasRollingRollback}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
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
      identifier: 'TAS_Rolling_Rollback_Step',
      name: 'TAS Rolling Rollback Step',
      timeout: '10m',
      type: StepType.TasRollingRollback
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.TasRollingRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'testStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'TAS Rolling Rollback Stepback': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.spec.execution.steps.RollingRollback.name',
                localName: 'execution.steps.RollingRollback.name',
                variableName: 'name',
                aliasFQN: '',
                visible: true
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.spec.execution.steps.RollingRollback.timeout',
                localName: 'execution.steps.RollingRollback.timeout',
                variableName: 'timeout',
                aliasFQN: '',
                visible: true
              }
            }
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
