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
import { ECSRollingDeployStep } from '../ECSRollingDeployStep'

factory.registerStep(new ECSRollingDeployStep())

const existingInitialValues = { identifier: 'Step_1', name: 'Step 1', timeout: '20m', type: StepType.EcsRollingDeploy }
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('ECSRollingDeployStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.EcsRollingDeploy}
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

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'spec.sameAsAlreadyRunningInstances',
      container
    ) as HTMLInputElement
    userEvent.click(sameAsAlreadyRunningInstancesCheckbox)

    const forceNewDeploymentCheckbox = queryByNameAttribute('spec.forceNewDeployment', container) as HTMLInputElement
    userEvent.click(forceNewDeploymentCheckbox)

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '30m',
        spec: {
          sameAsAlreadyRunningInstances: true,
          forceNewDeployment: true
        },
        type: StepType.EcsRollingDeploy
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
          spec: {
            sameAsAlreadyRunningInstances: false,
            forceNewDeployment: false
          },
          type: StepType.EcsRollingDeploy
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            sameAsAlreadyRunningInstances: RUNTIME_INPUT_VALUE,
            forceNewDeployment: RUNTIME_INPUT_VALUE
          },
          type: StepType.EcsRollingDeploy
        }}
        type={StepType.EcsRollingDeploy}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    userEvent.type(timeoutInput!, '20m')

    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      type: StepType.EcsRollingDeploy,
      spec: {
        sameAsAlreadyRunningInstances: false,
        forceNewDeployment: false
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.EcsRollingDeploy}
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
                fqn: 'pipeline.stages.qaStage.execution.steps.EcsRollingDeploy.name',
                localName: 'step.EcsRollingDeploy.name'
              }
            },
            '20m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.EcsRollingDeploy.timeout',
                localName: 'step.EcsRollingDeploy.timeout'
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
