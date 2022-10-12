/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryAllByAttribute, queryByAttribute, render } from '@testing-library/react'

import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { findPopoverContainer } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ShellScriptProvisionStep } from '../ShellScriptProvisionStep'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const queryByNameAttribute = (container: HTMLElement, name: string): HTMLElement | null =>
  queryByAttribute('name', container, name)

const variableInitivalues = {
  type: 'ShellScriptProvision',
  name: 'SshNameFile',
  identifier: 'SshNameFile',
  spec: {
    source: {
      type: 'Harness',
      spec: {
        file: 'account:/provisionFile',
        script: ''
      }
    },
    environmentVariables: [
      {
        name: 'Key',
        type: 'String',
        value: 'value'
      },
      {
        name: 'key2',
        type: 'String',
        value: '<+input>'
      }
    ]
  },
  timeout: '10m',
  failureStrategies: []
}

const customProps = {
  stageIdentifier: 'StageName',
  metadataMap: {
    'mF96Tc2eR7GLfy1tP-pzRQ': {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.shellName.description',
        localName: 'execution.steps.shellName.description',
        variableName: 'description',
        aliasFQN: '',
        visible: true
      }
    },
    _arGMNTsQUuW6yYOXYTA5Q: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.shellName.name',
        localName: 'execution.steps.shellName.name',
        variableName: 'name',
        aliasFQN: '',
        visible: true
      }
    },
    script: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.shellName.spec.source.spec.script',
        localName: 'execution.steps.shellName.spec.source.spec.script',
        variableName: 'script',
        aliasFQN: '',
        visible: true
      }
    },
    '0w15WLu8QaKko7ByEZaK1A': {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.shellName.spec.environmentVariables.EnvKey',
        localName: 'execution.steps.shellName.spec.environmentVariables.EnvKey',
        variableName: '',
        aliasFQN: '',
        visible: true
      }
    },
    lVkXFFEUTLi4PzQzS7OhKw: {
      yamlProperties: {
        fqn: 'pipeline.stages.StageName.spec.execution.steps.shellName.timeout',
        localName: 'execution.steps.shellName.timeout',
        variableName: 'timeout',
        aliasFQN: '',
        visible: true
      }
    },
    c6WYnnqnSj6Bi5paKrGMqg: {
      yamlExtraProperties: {
        properties: [
          {
            fqn: 'pipeline.stages.StageName.spec.execution.steps.shellName.spec.source.type',
            localName: 'execution.steps.shellName.spec.source.type',
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
    type: 'ShellScriptProvision',
    identifier: 'shellName',
    name: '_arGMNTsQUuW6yYOXYTA5Q',
    description: 'mF96Tc2eR7GLfy1tP-pzRQ',
    timeout: 'lVkXFFEUTLi4PzQzS7OhKw',
    __uuid: '_Z743f4iRrS07-QndMuIbQ',
    spec: {
      source: {
        type: 'Inline',
        spec: {
          script: 'script',
          type: 'Inline'
        },
        __uuid: 'c6WYnnqnSj6Bi5paKrGMqg'
      },
      environmentVariables: [
        {
          type: 'String',
          name: 'EnvKey',
          value: '0w15WLu8QaKko7ByEZaK1A',
          required: false,
          __uuid: 'R-PDPJ1STgC-dqFKU6I1EA',
          currentValue: '0w15WLu8QaKko7ByEZaK1A'
        }
      ],
      __uuid: 'yLC4YKckSSiDI-NvgdBrbw',
      'source.spec.script': 'script',
      'environmentVariables[0].value': '0w15WLu8QaKko7ByEZaK1A'
    }
  }
}
describe('Test Shell Script Provision Step', () => {
  beforeEach(() => {
    factory.registerStep(new ShellScriptProvisionStep())
  })

  test('should render edit view as new step', () => {
    const { container, getByText } = render(
      <TestStepWidget initialValues={{}} type={StepType.ShellScriptProvision} stepViewType={StepViewType.Edit} />
    )

    expect(getByText('pipelineSteps.stepNameLabel')).toBeDefined()
    expect(getByText('pipelineSteps.timeoutLabel')).toBeDefined()

    //by default Inline should be checked
    expect((queryAllByAttribute('name', container, 'spec.source.type')[0] as HTMLInputElement).checked).toBeTruthy()
    expect((queryAllByAttribute('name', container, 'spec.source.type')[1] as HTMLInputElement).checked).toBeFalsy()
  })

  test('should render edit view as edit step - Inline', () => {
    const initialValues = {
      type: 'ShellScriptProvision',
      identifier: 'Step1',
      name: 'Step1',
      spec: {
        source: {
          type: 'Inline',
          spec: {
            script: 'echo "hello"'
          }
        },
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'Test_A'
          },
          {
            name: 'testInput2',
            type: 'String',
            value: 'Test_B'
          }
        ]
      }
    }
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()

    const fixedInput = container.querySelectorAll('[data-icon="fixed-input"]')
    fireEvent.click(fixedInput[1])
    let findPopover = findPopoverContainer()
    expect(findPopover).toBeTruthy()
    fireEvent.click(getByText('Expression'))

    fireEvent.change(queryByNameAttribute(container, 'spec.source.spec.script')!, {
      target: { value: '<+testExpression>' }
    })
    expect(getByText('<+testExpression>')).toBeVisible()

    fireEvent.click(container.querySelector('[data-icon="expression-input"]')!)
    findPopover = findPopoverContainer()
    expect(findPopover).toBeTruthy()
    fireEvent.click(getByText('Runtime input'))
  })

  test('should render edit view as edit step - Harness File Store', async () => {
    const initValues = {
      type: 'ShellScriptProvision',
      identifier: 'Step1',
      name: 'Step1',
      spec: {
        source: {
          type: 'Harness',
          spec: {
            file: '/provision'
          }
        },
        environmentVariables: []
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={initValues}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('form produces correct data for fixed inputs - Inline', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, queryByTestId } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await act(async () => {
      fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'Step1' } })
      await fireEvent.click(getByText('inline'))
      fireEvent.change(queryByNameAttribute(container, 'timeout')!, { target: { value: '10m' } })
      fireEvent.input(queryByNameAttribute(container, 'spec.source.spec.script')!, {
        target: { value: 'script test' },
        bubbles: true
      })

      await fireEvent.click(getByText('common.optionalConfig'))
      await fireEvent.click(getByText('addInputVar'))

      fireEvent.change(queryByNameAttribute(container, 'spec.environmentVariables[0].name')!, {
        target: { value: 'testInput1' }
      })
      fireEvent.change(queryByNameAttribute(container, 'spec.environmentVariables[0].value')!, {
        target: { value: 'testInputValue' }
      })
      fireEvent.change(queryByNameAttribute(container, 'spec.environmentVariables[0].type')!, {
        target: { value: 'String' }
      })

      await fireEvent.click(getByText('addInputVar'))

      fireEvent.change(queryByNameAttribute(container, 'spec.environmentVariables[1].name')!, {
        target: { value: 'testInput2' }
      })
      fireEvent.change(queryByNameAttribute(container, 'spec.environmentVariables[1].value')!, {
        target: { value: 'testInputValue2' }
      })
      fireEvent.change(queryByNameAttribute(container, 'spec.environmentVariables[1].type')!, {
        target: { value: 'String' }
      })

      const deleteEnvVariable = queryByTestId('remove-environmentVar-1')
      expect(deleteEnvVariable).not.toBeNull()
      await fireEvent.click(deleteEnvVariable as HTMLElement)

      await ref.current?.submitForm()
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      spec: {
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'testInputValue'
          }
        ],
        source: {
          spec: {
            script: 'script test'
          },
          type: 'Inline'
        }
      },
      timeout: '10m',
      type: 'ShellScriptProvision'
    })
  })

  test('form produces correct data for fixed inputs - Harness File Store', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const initValues = {
      type: 'ShellScriptProvision',
      identifier: 'Step1',
      name: 'Step1',
      spec: {
        source: {
          type: 'Inline',
          spec: {
            script: 'Script'
          }
        },
        environmentVariables: []
      },
      timeout: '<+input>'
    }
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={initValues}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await fireEvent.click(getByText('cd.steps.commands.locationFileStore'))

    fireEvent.click(container.querySelector('[data-icon="fixed-input"]') as HTMLElement)
    let findPopover = findPopoverContainer()
    expect(findPopover).toBeTruthy()
    fireEvent.click(getByText('Expression'))

    //saving empty to trigger validation
    await ref.current?.submitForm()
    expect(getByText('common.validation.fieldIsRequired')).toBeVisible()

    fireEvent.change(queryByNameAttribute(container, 'spec.source.spec.file')!, {
      target: { value: '<+testExpression>' }
    })

    //changing to runtime
    fireEvent.click(container.querySelector('[data-icon="expression-input"]') as HTMLElement)
    findPopover = findPopoverContainer()
    expect(findPopover).toBeTruthy()
    fireEvent.click(getByText('Runtime input'))

    const runtimeInput = queryByNameAttribute(container, 'spec.source.spec.file') as HTMLInputElement
    expect(runtimeInput.value).toEqual('<+input>')
  })

  test('runtime view - Inline', () => {
    const initialValues = {
      type: 'ShellScriptProvision',
      identifier: 'Step1',
      name: 'Step1',
      timeout: '10m',
      spec: {
        source: {
          type: 'Inline',
          spec: {
            script: '<+input>'
          }
        }
      }
    }
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.DeploymentForm}
        template={initialValues}
      />
    )

    const scriptInput = queryByNameAttribute(container, 'spec.source.spec.script') as HTMLInputElement
    expect(scriptInput.value).toEqual('<+input>')

    fireEvent.click(container.querySelector('[data-icon="runtime-input"]') as HTMLElement)
    const findPopover = findPopoverContainer()
    expect(findPopover).toBeTruthy()
    fireEvent.click(getByText('Expression'))
  })

  test('runtime view - Harness file store', () => {
    const initialValues = {
      type: 'ShellScriptProvision',
      identifier: 'Step1',
      name: 'Step1',
      timeout: '<+input>',
      spec: {
        source: {
          type: 'Harness',
          spec: {
            file: '<+input>'
          }
        },
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: '<+input>'
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.DeploymentForm}
        template={initialValues}
        path={'test'}
      />
    )

    let runtimeInput = queryByNameAttribute(container, 'test.spec.environmentVariables[0].value') as HTMLInputElement
    expect(runtimeInput.value).toEqual('')

    runtimeInput = queryByNameAttribute(container, 'test.timeout') as HTMLInputElement
    expect(runtimeInput.value).toEqual('')
  })

  test('runtime view empty', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.DeploymentForm}
        template={{}}
      />
    )
    expect(getByText('Errors')).toBeDefined()
  })

  test('Basic snapshot - input variable view - Inline', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={variableInitivalues}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.InputVariable}
        customStepProps={customProps}
      />
    )

    expect(getByText('EnvKey')).toBeDefined()
    expect(getByText('script')).toBeDefined()
    expect(getByText('value')).toBeDefined()
  })

  test('Basic snapshot - input variable view - Harness file store', () => {
    const customVariableProps = {
      ...customProps,
      variablesData: {
        ...customProps.variablesData,
        spec: {
          ...customProps.variablesData.spec,
          source: {
            type: 'Harness',
            spec: {
              file: '/provision',
              type: 'Harness'
            },
            __uuid: 'c6WYnnqnSj6Bi5paKrGMqg'
          },
          'source.spec.file': '/provision'
        }
      }
    }
    const { getByText } = render(
      <TestStepWidget
        initialValues={variableInitivalues}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.InputVariable}
        customStepProps={customVariableProps}
      />
    )

    expect(getByText('EnvKey')).toBeDefined()
    expect(getByText('value')).toBeDefined()
  })

  test('renders empty inputVariables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.ShellScriptProvision}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{}}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Minimum time cannot be less than 10s - Inline', () => {
    const response = new ShellScriptProvisionStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'ShellScriptProvision',
        spec: {
          source: {
            type: 'Inline',
            spec: {
              script: ''
            }
          },
          environmentVariables: []
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })
  test('Minimum time cannot be less than 10s - Harness file store', () => {
    const response = new ShellScriptProvisionStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'ShellScriptProvision',
        spec: {
          source: {
            type: 'Harness',
            spec: {
              file: ''
            }
          },
          environmentVariables: [
            {
              name: 'testInput1',
              type: 'String',
              value: ''
            }
          ]
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: 'ShellScriptProvision',
        spec: {
          source: {
            type: 'Harness',
            spec: {
              file: '<+input>'
            }
          },
          environmentVariables: [
            {
              name: 'testInput1',
              type: 'String',
              value: '<+input>'
            }
          ]
        }
      },
      getString: jest.fn(),
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })
})
