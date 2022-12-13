/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ElastigroupSetupStep } from '../ElastigroupSetupStep'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const queryByNameAttribute = (container: HTMLElement, name: string): HTMLElement | null =>
  queryByAttribute('name', container, name)

const initialValuesFixed = {
  type: 'ElastigroupSetup',
  name: 'elastigrpStepName',
  identifier: 'elastigrpStepName',
  spec: {
    name: 'elastigrpAppName',
    instances: {
      type: 'Fixed',
      spec: {
        desired: 2,
        max: 3,
        min: 1
      }
    }
  },
  timeout: '10m'
}

const runtimeValuesFixedOpt = {
  type: 'ElastigroupSetup',
  name: 'elastigrpStepName',
  identifier: 'elastigrpStepName',
  spec: {
    name: '<+input>',
    instances: {
      type: 'Fixed',
      spec: {
        desired: '<+input>',
        max: '<+input>',
        min: '<+input>'
      }
    }
  },
  timeout: '<+input>'
}

const customProps = {
  stageIdentifier: 'StageName',
  metadataMap: {
    'mF96Tc2eR7GLfy1tP-pzRQ': {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.elastigrpSetup.description',
        localName: 'execution.steps.elastigrpSetup.description',
        variableName: 'description',
        aliasFQN: '',
        visible: true
      }
    },
    _arGMNTsQUuW6yYOXYTA5Q: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.elastigrpSetup.name',
        localName: 'execution.steps.elastigrpSetup.name',
        variableName: 'name',
        aliasFQN: '',
        visible: true
      }
    },
    elastigrpAppName: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.elastigrpSetup.spec.name',
        localName: 'execution.steps.elastigrpSetup.spec.name',
        variableName: 'spec.name',
        aliasFQN: '',
        visible: true
      }
    },
    2: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.elastigrpSetup.spec.instances.spec.desired',
        localName: 'execution.steps.elastigrpSetup.spec.instances.spec.desired',
        variableName: 'desired',
        aliasFQN: '',
        visible: true
      }
    },
    1: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.elastigrpSetup.spec.instances.spec.min',
        localName: 'execution.steps.elastigrpSetup.spec.instances.spec.min',
        variableName: 'min',
        aliasFQN: '',
        visible: true
      }
    },
    3: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.elastigrpSetup.spec.instances.spec.max',
        localName: 'execution.steps.elastigrpSetup.spec.instances.spec.max',
        variableName: 'max',
        aliasFQN: '',
        visible: true
      }
    },
    lVkXFFEUTLi4PzQzS7OhKw: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.elastigrpSetup.timeout',
        localName: 'execution.steps.elastigrpSetup.timeout',
        variableName: 'timeout',
        aliasFQN: '',
        visible: true
      }
    },
    c6WYnnqnSj6Bi5paKrGMqg: {
      yamlExtraProperties: {
        properties: [
          {
            fqn: 'pipeline.stages.StageName.spec.execution.steps.elastigrpSetup.spec.instances.type',
            localName: 'execution.steps.elastigrpSetup.spec.instances.type',
            variableName: 'type',
            aliasFQN: '',
            visible: true
          }
        ],
        outputproperties: []
      }
    }
  },
  variablesData: {
    type: 'ElastigroupSetup',
    identifier: 'elastigrpSetup',
    name: '_arGMNTsQUuW6yYOXYTA5Q',
    description: 'mF96Tc2eR7GLfy1tP-pzRQ',
    timeout: 'lVkXFFEUTLi4PzQzS7OhKw',
    __uuid: '_Z743f4iRrS07-QndMuIbQ',
    spec: {
      name: 'elastigrpAppName',
      instances: {
        type: 'Fixed',
        spec: {
          desired: 2,
          max: 3,
          min: 1
        }
      }
    }
  }
}

describe('Test Elastigroup Setup Step', () => {
  beforeEach(() => {
    factory.registerStep(new ElastigroupSetupStep())
  })

  test('should render edit view as new step - with initial snapshot', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.ElastigroupSetup} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step - Fixed - Submit', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={initialValuesFixed}
        type={StepType.ElastigroupSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(async () => {
      fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'Step1' } })
      fireEvent.change(queryByNameAttribute(container, 'timeout')!, { target: { value: '10m' } })
      fireEvent.change(queryByNameAttribute(container, 'spec.name')!, { target: { value: 'StepAppName' } })

      fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.max')!, {
        target: { value: '4' }
      })
      fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.desired')!, {
        target: { value: '3' }
      })
      fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.min')!, {
        target: { value: '2' }
      })
      await act(() => ref.current?.submitForm()!)
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      spec: { instances: { spec: { desired: 3, max: 4, min: 2 }, type: 'Fixed' }, name: 'StepAppName' },
      timeout: '10m',
      type: 'ElastigroupSetup'
    })
  })

  test('should render edit view as edit step - Current Running - Submit', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={initialValuesFixed}
        type={StepType.ElastigroupSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'Step1' } })
    fireEvent.change(queryByNameAttribute(container, 'timeout')!, { target: { value: '10m' } })
    fireEvent.change(queryByNameAttribute(container, 'spec.name')!, { target: { value: 'StepAppName' } })

    const instancesOption = container.querySelectorAll('input[type="radio"]')
    expect((instancesOption[0] as HTMLInputElement).value).toBe('CurrentRunning')
    expect((instancesOption[1] as HTMLInputElement).value).toBe('Fixed')
    expect(instancesOption[1] as HTMLInputElement).toBeChecked()
    const currentRunningBtn = instancesOption[0] as HTMLInputElement
    currentRunningBtn.click()
    expect(instancesOption[0] as HTMLInputElement).toBeChecked()
    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      spec: { instances: { spec: {}, type: 'CurrentRunning' }, name: 'StepAppName' },
      timeout: '10m',
      type: 'ElastigroupSetup'
    })
  })

  test('edit view validation test', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={initialValuesFixed}
        type={StepType.ElastigroupSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.max')!, {
      target: { value: '-2' }
    })
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.desired')!, {
      target: { value: '-1' }
    })
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.min')!, {
      target: { value: '-2' }
    })

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(3)
    })

    //validate less than and greater than scenarios
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.max')!, {
      target: { value: '4' }
    })
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.desired')!, {
      target: { value: '1' }
    })
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.min')!, {
      target: { value: '2' }
    })

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(2)
      expect(getByText('cd.ElastigroupStep.valueCannotBeGreaterThan')).toBeTruthy()
      expect(getByText('cd.ElastigroupStep.valueCannotBeLessThan')).toBeTruthy()
    })

    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.max')!, {
      target: { value: '1' }
    })
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.desired')!, {
      target: { value: '2' }
    })

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(3)
    })

    //cannot be string validations
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.max')!, {
      target: { value: '3' }
    })
    fireEvent.input(queryByNameAttribute(container, 'spec.instances.spec.min')!, {
      target: { value: '' }
    })

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(1)
      expect(getByText('cd.ElastigroupStep.valueCannotBe')).toBeTruthy()
    })
  })
})

describe('Elastigroup Setup Step - Variable view test', () => {
  test('renders empty inputVariables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.ElastigroupSetup}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{}}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - input variable view - Fixed', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={initialValuesFixed}
        type={StepType.ElastigroupSetup}
        stepViewType={StepViewType.InputVariable}
        customStepProps={customProps}
      />
    )

    expect(getByText('1')).toBeDefined()
    expect(getByText('2')).toBeDefined()
    expect(getByText('3')).toBeDefined()
    expect(getByText('elastigrpAppName')).toBeDefined()
  })
})

describe('Elastigroup Setup Step - runtime view and validation test', () => {
  test('should submit runtime values', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={runtimeValuesFixedOpt}
        type={StepType.ElastigroupSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'elastigrpStepName',
      name: 'elastigrpStepName',
      spec: {
        instances: { spec: { desired: '<+input>', max: '<+input>', min: '<+input>' }, type: 'Fixed' },
        name: '<+input>'
      },
      timeout: '<+input>',
      type: 'ElastigroupSetup'
    })
  })

  test('runtime view', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={runtimeValuesFixedOpt}
        type={StepType.ElastigroupSetup}
        stepViewType={StepViewType.DeploymentForm}
        template={runtimeValuesFixedOpt}
      />
    )

    expect(container.querySelector('input[placeholder="cd.ElastigroupStep.appName"]')).toBeTruthy()
    expect(container.querySelector('input[placeholder="cd.ElastigroupStep.minInstances"]')).toBeTruthy()
    expect(container.querySelector('input[placeholder="cd.ElastigroupStep.desiredInstances"]')).toBeTruthy()
    expect(container.querySelector('input[placeholder="cd.ElastigroupStep.maxInstances"]')).toBeTruthy()
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new ElastigroupSetupStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'ElastigroupSetup',
        spec: {
          name: '',
          instances: {
            type: 'Fixed',
            spec: {
              desired: '',
              max: '',
              min: ''
            }
          }
        }
      } as any,
      template: {
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          name: RUNTIME_INPUT_VALUE,
          instances: {
            type: 'Fixed',
            spec: {
              desired: RUNTIME_INPUT_VALUE,
              max: RUNTIME_INPUT_VALUE,
              min: RUNTIME_INPUT_VALUE
            }
          }
        }
      } as any,
      getString: jest.fn(),
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })
})
