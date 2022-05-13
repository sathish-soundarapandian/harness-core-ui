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
import { K8sBGSwapServices } from '../K8sBGSwapServices'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sBlueGreenDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sBGSwapServices())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sBGSwapServices} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sBGSwapServices',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.K8sBGSwapServices}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view for inputset', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ type: 'K8sBGSwapServices', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        template={{ type: 'K8sBGSwapServices', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        allValues={{
          type: 'K8sBGSwapServices',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE
          }
        }}
        path={'/abc'}
        type={StepType.K8sBGSwapServices}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render Variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ type: 'K8sBGSwapServices', name: 'Test A', timeout: '10m' }}
        template={{ type: 'K8sBGSwapServices', name: 'Test A', timeout: '10m' }}
        allValues={{
          type: 'K8sBGSwapServices',
          name: 'Test A',
          timeout: '10m',
          spec: {
            skipDryRun: true
          }
        }}
        type={StepType.K8sBGSwapServices}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            name: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sBGSwapServices.name',
                localName: 'step.k8sBGSwapServices.name'
              }
            }
          },
          variablesData: {
            name: 'Test A',
            identifier: 'k8sBGSwapServices',
            type: 'k8sBGSwapServices',
            timeout: '10m'
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
  test('Minimum time cannot be less than 10s', () => {
    const response = new K8sBGSwapServices().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'K8sBGSwapService',
        spec: {
          skipDryRun: false
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: 'K8sBGSwapService',
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
          name: 'Test A',
          identifier: 'Test A',
          timeout: '1s',
          type: 'K8sBGSwapService',
          spec: {
            skipDryRun: false
          }
        }}
        type={StepType.K8sBGSwapServices}
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
      name: 'newName',
      identifier: 'newName',
      timeout: '5s',
      type: 'K8sBGSwapService',
      spec: {
        skipDryRun: false
      }
    })

    //timeout validation on submit
    fireEvent.change(container.querySelector('input[value="5s"]') as HTMLElement, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
  })
  test('should render null for StepviewType.template', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sBGSwapServices} stepViewType={StepViewType.Template} />
    )
    expect(container).toMatchSnapshot()
  })
})
