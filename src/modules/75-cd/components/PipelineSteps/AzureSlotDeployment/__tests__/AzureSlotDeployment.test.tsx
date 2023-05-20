/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { AzureSlotDeployment } from '../AzureSlotDeployment'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Azure Slot Deployment step', () => {
  beforeEach(() => {
    factory.registerStep(new AzureSlotDeployment())
  })

  test('Should render edit view as new step', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const { container, getByPlaceholderText, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.AzureSlotDeployment}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(container).toMatchSnapshot()

    const name = container.querySelector('input[name="name"]')
    await act(async () => await userEvent.type(name!, 'New azure slot deployment'))
    expect(name).toHaveDisplayValue('New azure slot deployment')

    const id = getByText('New_azure_slot_deployment')
    expect(id!).toBeDefined()

    const timeout = getByPlaceholderText('Enter w/d/h/m/s/ms')
    await act(async () => await userEvent.clear(timeout!))
    await act(async () => await userEvent.type(timeout!, '10s'))
    expect(timeout).toHaveDisplayValue('10s')

    const webApp = getByPlaceholderText('Specify web app name')
    await act(async () => await userEvent.type(webApp!, 'New azure web App Name'))
    expect(webApp).toHaveDisplayValue('New azure web App Name')

    const deploymentSlot = getByPlaceholderText('Specify deployment slot')
    await act(async () => await userEvent.type(deploymentSlot!, 'New azure deployment Slot'))
    expect(deploymentSlot).toHaveDisplayValue('New azure deployment Slot')

    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalled()
  })

  test('Should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'AzureSlotDeployment',
          name: 'AzureSlot test',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            webApp: 'WebApp_test',
            deploymentSlot: 'DeplpymentSlot_test'
          }
        }}
        type={StepType.AzureSlotDeployment}
        stepViewType={StepViewType.Edit}
        isNewStep={false}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render edit view as edit step with runtime fields', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'AzureSlotDeployment',
          name: 'AzureSlot test',
          identifier: 'Test_A',
          timeout: '<+input>',
          spec: {
            webApp: '<+input>',
            deploymentSlot: '<+input>'
          }
        }}
        type={StepType.AzureSlotDeployment}
        stepViewType={StepViewType.Edit}
        isNewStep={false}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render input set view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{ identifier: 'AzureSlot_test', type: 'AzureSlotDeployment' }}
        template={{
          identifier: 'AzureSlot_test',
          type: 'AzureSlotDeployment',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            webApp: RUNTIME_INPUT_VALUE,
            deploymentSlot: RUNTIME_INPUT_VALUE
          }
        }}
        allValues={{
          type: 'AzureSlotDeployment',
          name: 'AzureSlot test',
          identifier: 'AzureSlot_test',
          timeout: '<+input>',
          spec: {
            webApp: '<+input>',
            deploymentSlot: '<+input>'
          }
        }}
        type={StepType.AzureSlotDeployment}
        stepViewType={StepViewType.InputSet}
        formikRef={ref}
        path={'/abc'}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'AzureSlotDeployment',
          name: 'AzureSlot test',
          identifier: 'AzureSlot_test',
          timeout: '10s'
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AzureSlot_test.timeout',
                localName: 'step.AzureSlot_test.timeout'
              }
            },
            'step-identifier': {
              yamlExtraProperties: {
                properties: [
                  {
                    fqn: 'pipeline.stages.qaStage.execution.steps.AzureSlot_test.identifier',
                    localName: 'step.AzureSlot_test.identifier',
                    variableName: 'identifier'
                  }
                ]
              }
            },
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AzureSlot_test.name',
                localName: 'step.AzureSlot_test.name'
              }
            }
          },
          variablesData: {
            name: 'step-name',
            __uuid: 'step-identifier',
            identifier: 'AzureSlot_test',
            type: 'AzureSlotDeployment',
            timeout: 'step-timeout'
          }
        }}
        type={StepType.AzureSlotDeployment}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
