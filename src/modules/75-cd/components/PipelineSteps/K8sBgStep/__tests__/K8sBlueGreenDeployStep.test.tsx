/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sBlueGreenDeployStep } from '../K8sBlueGreenDeployStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sBlueGreenDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sBlueGreenDeployStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sBlueGreenDeploy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sBlueGreenDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render null for StepviewType.template', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sBlueGreenDeploy} stepViewType={StepViewType.Template} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render input with no path', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={{
          identifier: 'Test_A',
          type: 'K8sBlueGreenDeploy',
          timeout: RUNTIME_INPUT_VALUE,
          spec: { skipDryRun: RUNTIME_INPUT_VALUE }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ identifier: 'Test_A', type: 'K8sBlueGreenDeploy', spec: { skipDryRun: false } }}
        template={{
          identifier: 'Test_A',
          type: 'K8sBlueGreenDeploy',
          timeout: RUNTIME_INPUT_VALUE,
          spec: { skipDryRun: RUNTIME_INPUT_VALUE }
        }}
        path={'/abc'}
        allValues={{
          type: 'K8sBlueGreenDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sBlueGreenDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sBlueGreenDeploy.name',
                localName: 'step.k8sBlueGreenDeploy.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sBlueGreenDeploy.timeout',
                localName: 'step.k8sBlueGreenDeploy.timeout'
              }
            },
            'step-skip': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sBlueGreenDeploy.skipDryRun',
                localName: 'step.k8sBlueGreenDeploy.skipDryRun'
              }
            }
          },
          variablesData: {
            name: 'step-name',
            identifier: 'k8sBlueGreenDeploy',
            type: 'K8sBlueGreenDeploy',
            spec: {
              timeout: 'step-timeout',
              skipDryRun: 'step-skip'
            }
          }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step with all runtime inputs', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sBlueGreenDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new K8sBlueGreenDeployStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '5s',
        type: 'K8sBlueGreen',
        spec: {
          skipDryRun: false
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: 'K8sBlueGreen',
        spec: {
          skipDryRun: false
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot()
  })
  test('on edit view update/change', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()

    const { container, queryByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sBlueGreenDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '1s',
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )

    //change
    fireEvent.change(container.querySelector('input[value="Test A"]') as HTMLElement, { target: { value: 'newName' } })
    fireEvent.change(container.querySelector('input[value="1s"]') as HTMLElement, { target: { value: '5s' } })

    await ref.current?.submitForm()
    expect(onChange).toHaveBeenCalledWith({
      type: 'K8sBlueGreenDeploy',
      name: 'newName',
      identifier: 'newName',
      timeout: '5s',
      spec: {
        skipDryRun: RUNTIME_INPUT_VALUE
      }
    })

    //timeout validation on submit
    fireEvent.change(container.querySelector('input[value="5s"]') as HTMLElement, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
  })
})
