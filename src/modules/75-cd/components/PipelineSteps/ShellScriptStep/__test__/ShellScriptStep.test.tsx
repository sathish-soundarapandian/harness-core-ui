/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ShellScriptStep } from '../ShellScriptStep'
import type { ShellScriptData } from '../shellScriptTypes'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test Shell Script Step', () => {
  beforeEach(() => {
    factory.registerStep(new ShellScriptStep())
  })

  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.SHELLSCRIPT} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders runtime inputs', () => {
    const initialValues = {
      type: 'ShellScript',
      identifier: 'ShellScript',
      name: 'SSH',
      spec: {
        shell: 'Bash',
        executionTarget: {
          host: RUNTIME_INPUT_VALUE,
          connectorRef: RUNTIME_INPUT_VALUE,
          workingDirectory: RUNTIME_INPUT_VALUE
        },
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: RUNTIME_INPUT_VALUE
          },
          {
            name: 'testInput2',
            type: 'String',
            value: RUNTIME_INPUT_VALUE
          }
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: RUNTIME_INPUT_VALUE
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: RUNTIME_INPUT_VALUE
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.SHELLSCRIPT} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step', () => {
    const initialValues = {
      type: 'ShellScript',
      identifier: 'ShellScript',
      name: 'SSH',
      spec: {
        shell: 'Bash',
        executionTarget: {
          host: 'targethost',
          connectorRef: 'connectorRef',
          workingDirectory: './temp'
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
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'Test_C'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'Test_D'
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.SHELLSCRIPT} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render edit view', () => {
    const initialValues = {
      type: 'ShellScript',
      identifier: 'ShellScript',
      name: 'SSH',
      spec: {
        shell: 'Bash',
        onDelegate: 'targethost',
        source: {
          type: 'Inline',
          spec: {
            script: 'test script'
          }
        },
        executionTarget: {
          host: 'targethost',
          connectorRef: 'connectorRef',
          workingDirectory: './temp'
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
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'Test_C'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'Test_D'
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.SHELLSCRIPT} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render edit view', () => {
    const initialValues = {
      type: 'ShellScript',
      identifier: 'ShellScript',
      name: 'SSH',
      spec: {
        shell: 'Bash',
        onDelegate: 'targethost',
        source: {
          type: 'Inline',
          spec: {
            script: 'test script'
          }
        },
        executionTarget: {
          host: 'targethost',
          connectorRef: 'connectorRef',
          workingDirectory: './temp'
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
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'Test_C'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'Test_D'
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.SHELLSCRIPT} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('form produces correct data for fixed inputs', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'SSH' } })
      fireEvent.change(queryByNameAttribute('spec.shell')!, { target: { value: 'Bash' } })
      fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '10m' } })
      fireEvent.input(queryByNameAttribute('spec.source.spec.script')!, {
        target: { value: 'script test' },
        bubbles: true
      })

      await fireEvent.click(getByText('common.optionalConfig'))
      await fireEvent.click(getByText('addInputVar'))

      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].name')!, { target: { value: 'testInput1' } })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].value')!, {
        target: { value: 'testInputValue' }
      })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].type')!, { target: { value: 'String' } })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].name')!, { target: { value: 'testOutput1' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].value')!, {
        target: { value: 'response.message' }
      })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].name')!, { target: { value: 'testOutput2' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].value')!, {
        target: { value: 'response.message' }
      })

      await ref.current?.submitForm()
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'SSH',
      name: 'SSH',
      timeout: '10m',
      type: 'ShellScript',
      spec: {
        shell: 'Bash',
        onDelegate: true,
        source: {
          type: 'Inline',
          spec: {
            script: 'script test'
          }
        },
        executionTarget: {},
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'testInputValue'
          }
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'response.message'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'response.message'
          }
        ]
      }
    })
  })

  test('form produces correct data for fixed inputs for delegate as false', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'SSH' } })
      fireEvent.change(queryByNameAttribute('spec.shell')!, { target: { value: 'Bash' } })
      fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '10m' } })
      fireEvent.input(queryByNameAttribute('spec.source.spec.script')!, {
        target: { value: 'script test' },
        bubbles: true
      })

      await fireEvent.click(getByText('common.optionalConfig'))
      await fireEvent.click(getByText('addInputVar'))

      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].name')!, { target: { value: 'testInput1' } })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].value')!, { target: { value: 'testInput2' } })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].type')!, { target: { value: 'String' } })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].name')!, { target: { value: 'testOutput1' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].value')!, {
        target: { value: 'response.message' }
      })

      await fireEvent.click(getByText('addOutputVar'))

      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].name')!, { target: { value: 'testOutput2' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].value')!, {
        target: { value: 'response.message' }
      })

      const radioButtons = container.querySelectorAll('input[type="radio"]')

      await fireEvent.click(radioButtons[0])

      const connectorRef = getByText('sshConnector')
      expect(connectorRef).toBeDefined()

      fireEvent.change(queryByNameAttribute('spec.executionTarget.host')!, { target: { value: 'targethost' } })
      fireEvent.change(queryByNameAttribute('spec.executionTarget.workingDirectory')!, { target: { value: './temp' } })

      await ref.current?.submitForm()
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'SSH',
      name: 'SSH',
      timeout: '10m',
      type: 'ShellScript',
      spec: {
        shell: 'Bash',
        onDelegate: false,
        source: {
          type: 'Inline',
          spec: {
            script: 'script test'
          }
        },
        executionTarget: {
          host: 'targethost',
          connectorRef: undefined,
          workingDirectory: './temp'
        },
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'testInput2'
          }
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'response.message'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'response.message'
          }
        ]
      }
    })
  })

  test('renders input sets', () => {
    const onUpdate = jest.fn()
    const initialValues = {
      identifier: 'SSH',
      name: 'SSH',
      spec: {
        source: {
          spec: {
            script: RUNTIME_INPUT_VALUE
          }
        },
        executionTarget: {
          host: RUNTIME_INPUT_VALUE,
          connectorRef: RUNTIME_INPUT_VALUE,
          workingDirectory: RUNTIME_INPUT_VALUE
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
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'Test_C'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'Test_D'
          }
        ]
      },
      timeout: RUNTIME_INPUT_VALUE
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders empty input sets', () => {
    const initialValues = {
      identifier: 'SSH',
      name: 'SSH',
      source: {
        spec: {
          script: RUNTIME_INPUT_VALUE
        }
      },
      spec: {
        executionTarget: {
          host: RUNTIME_INPUT_VALUE,
          connectorRef: RUNTIME_INPUT_VALUE,
          workingDirectory: RUNTIME_INPUT_VALUE
        }
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.SHELLSCRIPT} stepViewType={StepViewType.InputSet} />
    )

    expect(container).toMatchSnapshot()
  })

  test('input sets should not render', () => {
    const template = {
      type: StepType.SHELLSCRIPT,
      identifier: 'ShellScript'
    }
    const allValues = {
      type: 'ShellScript',
      identifier: 'ShellScript',
      name: 'SSH',
      spec: {
        shell: 'Bash',
        onDelegate: 'targethost',
        source: {
          type: 'Inline',
          spec: {
            script: 'test script'
          }
        },
        executionTarget: {
          host: 'targethost',
          connectorRef: 'connectorRef',
          workingDirectory: './temp'
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
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'Test_C'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'Test_D'
          }
        ],
        timeout: '10m'
      }
    }

    const onUpdate = jest.fn()

    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.InputSet}
        template={template}
        allValues={allValues}
        onUpdate={onUpdate}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render inputSet view and test validation', async () => {
    const template = {
      type: StepType.SHELLSCRIPT,
      identifier: 'ShellScript'
    }
    const allValues = {
      type: 'ShellScript',
      identifier: 'ShellScript',
      name: 'SSH',
      spec: {
        shell: 'Bash',
        onDelegate: 'targethost',
        source: {
          type: 'Inline',
          spec: {
            script: 'test script'
          }
        },
        executionTarget: {
          host: 'targethost',
          connectorRef: 'connectorRef',
          workingDirectory: './temp'
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
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'Test_C'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'Test_D'
          }
        ],
        timeout: '10m'
      }
    }

    const onUpdate = jest.fn()

    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.InputSet}
        template={template}
        allValues={allValues}
        onUpdate={onUpdate}
      />
    )
    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })

    expect(container).toMatchSnapshot()
  })

  test('renders empty inputVariables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{}}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('validates timeout is min 10s', () => {
    const props = {
      name: 'ShellScript Step',
      identifier: 'ShellScriptStep',
      timeout: '1s',
      type: StepType.SHELLSCRIPT,
      spec: {
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'Test_A'
          }
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'Test_C'
          }
        ],
        source: {
          type: 'Inline',
          spec: {
            script: 'test script'
          }
        }
      }
    }
    const response = new ShellScriptStep().validateInputSet({
      data: { ...props } as ShellScriptData,
      template: { ...props } as ShellScriptData,
      viewType: StepViewType.TriggerForm,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })

  test('empty validate input', () => {
    const props = {
      name: 'ShellScript Step',
      identifier: 'ShellScriptStep',
      timeout: '<+input>',
      type: StepType.SHELLSCRIPT,
      spec: {}
    }
    const response = new ShellScriptStep().validateInputSet({
      data: { ...props } as ShellScriptData,
      template: { ...props } as ShellScriptData,
      viewType: StepViewType.Edit,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })

  test('set error validateInputset', () => {
    const response = new ShellScriptStep().validateInputSet({
      data: {
        name: 'ShellScript Step',
        identifier: 'ShellScriptStep',
        timeout: '1s',
        type: StepType.SHELLSCRIPT,
        spec: {
          source: {
            spec: {
              script: ''
            }
          },
          executionTarget: {
            host: '',
            connectorRef: '',
            workingDirectory: ''
          }
        }
      },
      template: {
        name: 'ShellScript Step',
        identifier: 'ShellScriptStep',
        timeout: '<+input>',
        type: StepType.SHELLSCRIPT,
        spec: {
          source: {
            type: 'Inline',
            spec: {
              script: RUNTIME_INPUT_VALUE
            }
          },
          executionTarget: {
            host: RUNTIME_INPUT_VALUE,
            connectorRef: RUNTIME_INPUT_VALUE,
            workingDirectory: RUNTIME_INPUT_VALUE
          }
        }
      },
      viewType: StepViewType.DeploymentForm
    })
    expect(response).toMatchSnapshot()
  })
})
