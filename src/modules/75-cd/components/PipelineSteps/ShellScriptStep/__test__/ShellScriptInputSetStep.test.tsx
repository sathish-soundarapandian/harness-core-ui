/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ShellScriptStep } from '../ShellScriptStep'
import type { ShellScriptData } from '../shellScriptTypes'

const allValuesCommon = {
  type: 'ShellScript',
  identifier: 'ShellScript',
  name: 'SSH',
  timeout: '10m',
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

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

factory.registerStep(new ShellScriptStep())

describe('ShellScriptInputSetStep tests', () => {
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

    const onUpdate = jest.fn()

    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.InputSet}
        template={template}
        allValues={allValuesCommon}
        onUpdate={onUpdate}
      />
    )
    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })

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

  test('when allowed values configured for Timeout, host and workingDirectory, those should be rendered as dropdown', async () => {
    const onUpdate = jest.fn()
    const template = {
      type: StepType.SHELLSCRIPT,
      identifier: 'ShellScript',
      timeout: '<+input>.allowedValues(10m,30m,30s)',
      spec: {
        executionTarget: {
          host: '<+input>.allowedValues(host1,host2,host3)',
          workingDirectory: '<+input>.allowedValues(wd1,wd2,wd3)'
        }
      }
    }

    const { container, getByText } = render(
      <TestStepWidget
        initialValues={allValuesCommon}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.InputSet}
        template={template}
        allValues={allValuesCommon}
        onUpdate={onUpdate}
      />
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    // This icon indicates that field is rendered as dropdown
    const dropDownButtonList = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropDownButtonList.length).toBe(3)
    const timeoutDropdownBtn = dropDownButtonList[0]
    userEvent.click(timeoutDropdownBtn!)
    expect(portalDivs.length).toBe(1)
    const timeoutDropdownPortalDiv = portalDivs[0]
    const timeoutSelectListMenu = timeoutDropdownPortalDiv.querySelector('.bp3-menu')
    const t1Option = await findByText(timeoutSelectListMenu as HTMLElement, '10m')
    expect(t1Option).toBeDefined()
    const t2Option = await findByText(timeoutSelectListMenu as HTMLElement, '30m')
    expect(t2Option).toBeDefined()
    const t3Option = await findByText(timeoutSelectListMenu as HTMLElement, '30s')
    expect(t3Option).toBeDefined()
    userEvent.click(t2Option)

    const hostDropdownBtn = dropDownButtonList[1]
    userEvent.click(hostDropdownBtn!)
    expect(portalDivs.length).toBe(2)
    const hostDropdownPortalDiv = portalDivs[1]
    const hostSelectListMenu = hostDropdownPortalDiv.querySelector('.bp3-menu')
    const host1Option = await findByText(hostSelectListMenu as HTMLElement, 'host1')
    expect(host1Option).toBeDefined()
    const host2Option = await findByText(hostSelectListMenu as HTMLElement, 'host2')
    expect(host2Option).toBeDefined()
    const host3Option = await findByText(hostSelectListMenu as HTMLElement, 'host3')
    expect(host3Option).toBeDefined()
    userEvent.click(host2Option)

    const wdDropdownBtn = dropDownButtonList[2]
    userEvent.click(wdDropdownBtn!)
    expect(portalDivs.length).toBe(3)
    const wdDropdownPortalDiv = portalDivs[2]
    const wdSelectListMenu = wdDropdownPortalDiv.querySelector('.bp3-menu')
    const wd1Option = await findByText(wdSelectListMenu as HTMLElement, 'wd1')
    expect(wd1Option).toBeDefined()
    const wd2Option = await findByText(wdSelectListMenu as HTMLElement, 'wd2')
    expect(wd2Option).toBeDefined()
    const wd3Option = await findByText(wdSelectListMenu as HTMLElement, 'wd3')
    expect(wd3Option).toBeDefined()
    userEvent.click(wd3Option)

    userEvent.click(getByText('Submit'))
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'ShellScript',
        name: 'SSH',
        type: 'ShellScript',
        timeout: '30m',
        spec: {
          shell: 'Bash',
          source: {
            spec: {
              script: 'test script'
            },
            type: 'Inline'
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
          onDelegate: 'targethost',
          executionTarget: {
            connectorRef: 'connectorRef',
            host: 'host2',
            workingDirectory: 'wd3'
          }
        }
      })
    )
  })
})
