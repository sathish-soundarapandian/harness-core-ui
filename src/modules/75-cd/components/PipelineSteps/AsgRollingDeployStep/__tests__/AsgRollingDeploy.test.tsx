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
import { AsgRollingDeploy } from '../AsgRollingDeployStep'

factory.registerStep(new AsgRollingDeploy())

const existingInitialValues = {
  identifier: 'Step_AsgRollingDeploy',
  name: 'Step AsgRollingDeploy',
  timeout: '10m',
  type: StepType.AsgRollingDeploy
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('Asg Canary Delete Step tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.AsgRollingDeploy}
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
    userEvent.type(timeoutInput!, '20m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('20m'))

    const instancesCheckbox = queryByNameAttribute('spec.useAlreadyRunningInstances', container)
    expect(instancesCheckbox!).not.toBeChecked()

    const instanceRefreshAccordian = getByText('cd.instanceRefresh')
    userEvent.click(instanceRefreshAccordian!)

    await waitFor(() => expect(queryByNameAttribute('spec.minimumHealthyPercentage', container)).toBeInTheDocument())

    const minimumHealthyPercentage = queryByNameAttribute('spec.minimumHealthyPercentage', container)
    userEvent.clear(minimumHealthyPercentage!)
    userEvent.type(minimumHealthyPercentage!, '100')
    await waitFor(() => expect(minimumHealthyPercentage).toHaveDisplayValue('100'))

    const instanceWarmup = queryByNameAttribute('spec.instanceWarmup', container)
    userEvent.clear(instanceWarmup!)
    userEvent.type(instanceWarmup!, '100')
    await waitFor(() => expect(instanceWarmup).toHaveDisplayValue('100'))

    const skipMatching = queryByNameAttribute('spec.skipMatching', container)
    expect(skipMatching!).toBeChecked()

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '20m',
        type: StepType.AsgRollingDeploy,
        spec: {
          useAlreadyRunningInstances: false,
          minimumHealthyPercentage: 100,
          instanceWarmup: 100,
          skipMatching: true
        }
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_AsgRollingDeploy',
          name: 'Step Asg Canary Delete',
          timeout: '',
          type: StepType.AsgRollingDeploy
        }}
        template={{
          identifier: 'Step_AsgRollingDeploy',
          name: 'Step Asg Canary Delete',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.AsgRollingDeploy,
          spec: {
            useAlreadyRunningInstances: RUNTIME_INPUT_VALUE,
            minimumHealthyPercentage: RUNTIME_INPUT_VALUE,
            instanceWarmup: RUNTIME_INPUT_VALUE,
            skipMatching: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.AsgRollingDeploy}
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

    const minimumHealthyPercentage = queryByNameAttribute('spec.minimumHealthyPercentage', container)
    userEvent.clear(minimumHealthyPercentage!)
    userEvent.type(minimumHealthyPercentage!, '-1')
    userEvent.click(submitBtn)
    await waitFor(() => expect(queryByText('cd.minimumHealthyPercentageMinLimit')).toBeInTheDocument())

    userEvent.clear(minimumHealthyPercentage!)
    userEvent.type(minimumHealthyPercentage!, '1000')
    userEvent.click(submitBtn)

    await waitFor(() => expect(queryByText('cd.minimumHealthyPercentageMaxLimit')).toBeInTheDocument())

    userEvent.clear(minimumHealthyPercentage!)
    userEvent.type(minimumHealthyPercentage!, '100')

    const instanceWarmup = queryByNameAttribute('spec.instanceWarmup', container)
    userEvent.clear(instanceWarmup!)
    userEvent.type(instanceWarmup!, '-1')
    userEvent.click(submitBtn)
    await waitFor(() => expect(queryByText('cd.instanceWarmupError')).toBeInTheDocument())

    userEvent.clear(instanceWarmup!)
    userEvent.type(instanceWarmup!, '10')

    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_AsgRollingDeploy',
      name: 'Step Asg Canary Delete',
      timeout: '20m',
      type: StepType.AsgRollingDeploy,
      spec: {
        minimumHealthyPercentage: 100,
        instanceWarmup: 10
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AsgRollingDeploy}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Step AsgRollingDeploy': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AsgRollingDeploy.name',
                localName: 'step.AsgRollingDeploy.name'
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AsgRollingDeploy.timeout',
                localName: 'step.AsgRollingDeploy.timeout'
              }
            }
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
