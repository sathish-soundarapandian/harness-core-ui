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
import { TASRollbackStep } from '../TasRollbackStep'

factory.registerStep(new TASRollbackStep())

const existingInitialValues = {
  identifier: 'TAS_Rollback_Stepback',
  name: 'TAS Rollback Stepback',
  timeout: '10m',
  type: StepType.AppRollback
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('TASRollbackStepStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.AppRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'TAS Rollback Step')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('TAS Rollback Step'))
    expect(getByText('TAS_Rollback_Step')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '10m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('10m'))

    await act(() => ref.current?.submitForm()!)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'TAS_Rollback_Step',
        name: 'TAS Rollback Step',
        timeout: '10m',
        type: StepType.AppRollback
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'TAS_Rollback_Step',
          name: 'TAS Rollback Step',
          timeout: '',
          type: StepType.AppRollback
        }}
        template={{
          identifier: 'TAS_Rollback_Step',
          name: 'TAS Rollback Step',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.AppRollback
        }}
        type={StepType.AppRollback}
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
    userEvent.type(timeoutInput!, '10m')
    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'TAS_Rollback_Step',
      name: 'TAS Rollback Step',
      timeout: '10m',
      type: StepType.AppRollback
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AppRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'testStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'TAS Rollback Stepback': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.spec.execution.steps.AppRollback_1.name',
                localName: 'execution.steps.AppRollback_1.name',
                variableName: 'name',
                aliasFQN: '',
                visible: true
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.spec.execution.steps.AppRollback_1.timeout',
                localName: 'execution.steps.AppRollback_1.timeout',
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
