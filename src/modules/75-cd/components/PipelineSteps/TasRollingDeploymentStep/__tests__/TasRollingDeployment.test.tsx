/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { TasRollingDeploymentStep } from '../TasRollingDeploymentStep'

factory.registerStep(new TasRollingDeploymentStep())

const existingInitialValues = {
  name: 'Tas Rolling Deploy',
  identifier: 'rollingDeploy',
  timeout: '10m',
  type: StepType.TasRollingDeploy,
  spec: {
    additionalRoutes: ['addRoute1']
  }
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('TASRollingDeploymentStepStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.TasRollingDeploy}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'Rolling Deployment Step')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Rolling Deployment Step'))
    expect(getByText('Rolling_Deployment_Step')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '10m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('10m'))

    await act(() => ref.current?.submitForm()!)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Rolling_Deployment_Step',
        name: 'Rolling Deployment Step',
        timeout: '10m',
        type: StepType.TasRollingDeploy,
        spec: {}
      })
    )
  })

  test('Edit view with runtime timeout', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          name: 'RollingDeployment',
          identifier: 'RollingDeployment',
          type: StepType.TasRollingDeploy,
          timeout: RUNTIME_INPUT_VALUE
        }}
        type={StepType.TasRollingDeploy}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )
    const runtimeInputIcon = container.querySelector('span[data-icon="runtime-input"]')
    fireEvent.click(runtimeInputIcon!)
    fireEvent.click(getByText('Fixed value'))
    userEvent.type(queryByNameAttribute('timeout', container)!, '10m')

    await act(() => ref.current?.submitForm()!)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'RollingDeployment',
        name: 'RollingDeployment',
        timeout: '10m',
        type: StepType.TasRollingDeploy,
        spec: {}
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'TAS_Rolling_Deployment_Step',
          name: 'Rolling Deployment Step',
          timeout: '',
          type: StepType.TasRollingDeploy,
          spec: {
            additionalRoutes: RUNTIME_INPUT_VALUE
          }
        }}
        template={{
          identifier: 'TAS_Rolling_Deployment_Step',
          name: 'Rolling Deployment Step',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.TasRollingDeploy,
          spec: {
            additionalRoutes: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.TasRollingDeploy}
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
      identifier: 'TAS_Rolling_Deployment_Step',
      name: 'Rolling Deployment Step',
      timeout: '10m',
      type: StepType.TasRollingDeploy,
      spec: {
        additionalRoutes: RUNTIME_INPUT_VALUE
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.TasRollingDeploy}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'testStage',
          variablesData: {
            ...existingInitialValues,
            spec: {
              additionalRoutes: 'addRoute1'
            }
          },
          metadataMap: {
            'Rolling Deployment Stepback': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.execution.steps.RollingDeployment.name',
                localName: 'step.RollingDeploymentStep.name'
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.execution.steps.RollingDeployment.timeout',
                localName: 'step.RollingDeployment.timeout'
              }
            },
            addRoute1: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.spec.additionalRoutes',
                localName: 'execution.steps.CanaryAppSetup.spec.additionalRoutes',
                variableName: 'additionalRoutes',
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
