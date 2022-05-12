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
import { HelmRollback } from '../HelmRollback'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sBlueGreenDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new HelmRollback())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.HelmRollback} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'HelmRollback',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.HelmRollback}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view for inputset', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ type: 'HelmRollback', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        template={{ type: 'HelmRollback', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        allValues={{
          type: 'HelmRollback',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.HelmRollback}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render Variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ type: 'HelmRollback', name: 'Test A', timeout: '10m' }}
        template={{ type: 'HelmRollback', name: 'Test A', timeout: '10m' }}
        allValues={{
          type: 'HelmRollback',
          name: 'Test A',
          timeout: '10m',
          spec: {
            skipDryRun: true
          }
        }}
        type={StepType.HelmRollback}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            name: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.HelmRollback.name',
                localName: 'step.HelmRollback.name'
              }
            }
          },
          variablesData: {
            name: 'Test A',
            identifier: 'HelmRollback',
            type: 'HelmRollback',
            timeout: '10m'
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
  test('on edit view update', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()

    const { container, queryByText } = render(
      <TestStepWidget
        initialValues={{
          name: 'Test A',
          identifier: 'Test A',
          timeout: '5s',
          type: StepType.HelmRollback,
          spec: {
            skipDryRun: false,
            timeout: '10m'
          }
        }}
        type={StepType.HelmRollback}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )

    //change
    fireEvent.change(container.querySelector('input[value="Test A"]') as HTMLElement, { target: { value: 'newName' } })
    fireEvent.change(container.querySelector('input[value="5s"]') as HTMLElement, { target: { value: '1s' } })

    await ref.current?.submitForm()
    expect(onChange).toHaveBeenCalledWith({
      name: 'newName',
      identifier: 'newName',
      timeout: '1s',
      type: StepType.HelmRollback,
      spec: {
        skipDryRun: false,
        timeout: '10m'
      }
    })

    //timeout validation on submit
    fireEvent.change(container.querySelector('input[value="1s"]') as HTMLElement, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
  })

  test('should render edit view for inputset with path', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ type: 'HelmRollback', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        template={{ type: 'HelmRollback', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        path={'/abc'}
        type={StepType.HelmRollback}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container.querySelector('input[name="/abc.timeout"]')).toBeDefined()
  })

  test('Minimum time cannot be less than 10s', () => {
    const data = {
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '5s',
        type: StepType.HelmRollback,
        spec: {
          skipDryRun: false
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: StepType.HelmRollback,
        spec: {
          timeout: '1s',
          skipDryRun: false
        }
      },
      viewType: StepViewType.TriggerForm
    }
    const response = new HelmRollback().validateInputSet(data)
    expect(response).toMatchSnapshot()
  })
})
