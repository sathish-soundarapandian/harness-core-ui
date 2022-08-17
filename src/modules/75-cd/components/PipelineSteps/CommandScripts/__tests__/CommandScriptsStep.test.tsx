/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { queryByNameAttribute } from '@common/utils/testUtils'
import { CommandScriptsStep } from '../CommandScriptsStep'
import { name, commandUnits, environmentVariables, outputVariables, timeout } from './Props'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Command Scripts step', () => {
  beforeEach(() => {
    factory.registerStep(new CommandScriptsStep())
  })

  test('Should render edit view as new step', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.Command}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, name)
    await waitFor(() => expect(nameInput).toHaveDisplayValue(name))
    expect(getByText(getIdentifierFromName(name))).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, timeout)
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue(timeout))

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: getIdentifierFromName(name),
        name,
        spec: {
          environmentVariables: [],
          onDelegate: false,
          outputVariables: []
        },
        strategy: {
          repeat: { items: '<+stage.output.hosts>' }
        },
        timeout,
        type: StepType.Command
      })
    )
  })

  test('Should render edit view with initial values', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const { container, getByText, getByDisplayValue, getByTestId } = render(
      <TestStepWidget
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        initialValues={{
          name,
          timeout,
          identifier: getIdentifierFromName(name),
          spec: {
            onDelegate: false,
            environmentVariables,
            commandUnits,
            outputVariables
          }
        }}
        type={StepType.Command}
        stepViewType={StepViewType.Edit}
        isNewStep={false}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    expect(nameInput).toHaveDisplayValue(name)
    getByText(getIdentifierFromName(name))

    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toHaveDisplayValue(timeout)

    commandUnits.forEach(commandUnit => {
      getByText(commandUnit.name)
    })

    const optionalConfiguration = getByTestId('optional-config-summary')
    userEvent.click(optionalConfiguration)

    await waitFor(() => {
      environmentVariables.forEach(envVar => {
        expect(getByDisplayValue(envVar.name)).toBeInTheDocument()
      })
      outputVariables.forEach(opVar => {
        expect(getByDisplayValue(opVar.name)).toBeInTheDocument()
      })
    })

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: getIdentifierFromName(name),
        name,
        spec: {
          onDelegate: false,
          commandUnits,
          environmentVariables,
          outputVariables
        },
        strategy: {
          repeat: { items: '<+stage.output.hosts>' }
        },
        timeout,
        type: StepType.Command
      })
    )
  })

  test('Should render input set view', () => {
    const { container, getByTestId } = render(
      <TestStepWidget
        initialValues={{
          name,
          timeout: '',
          identifier: getIdentifierFromName(name)
        }}
        template={{
          identifier: getIdentifierFromName(name),
          type: StepType.Command,
          timeout: RUNTIME_INPUT_VALUE
        }}
        type={StepType.Command}
        stepViewType={StepViewType.InputSet}
      />
    )

    expect(queryByNameAttribute('timeout', container)).toBeVisible()
    expect(getByTestId('command-scripts-input-set-form')).toBeVisible()
  })

  test('validating timeout when stepViewType is DeploymentForm', async () => {
    render(
      <TestStepWidget
        initialValues={{
          name,
          timeout: '',
          identifier: getIdentifierFromName(name),
          spec: {
            environmentVariables: [
              {
                name: 'iv',
                type: 'String',
                value: ''
              }
            ],
            outputVariables: [
              {
                name: 'ov',
                type: 'String',
                value: ''
              }
            ]
          }
        }}
        template={{
          identifier: getIdentifierFromName(name),
          type: StepType.Command,
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            environmentVariables: [
              {
                name: 'iv',
                type: 'String',
                value: RUNTIME_INPUT_VALUE
              }
            ],
            outputVariables: [
              {
                name: 'ov',
                type: 'String',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        }}
        type={StepType.Command}
        stepViewType={StepViewType.DeploymentForm}
      />
    )

    userEvent.click(screen.getByText(/submit/i))
    expect(await screen.findByText('validation.timeout10SecMinimum')).toBeInTheDocument()
  })

  test('should validate environment, output variables when stepViewType is DeploymentForm', async () => {
    render(
      <TestStepWidget
        initialValues={{
          name,
          identifier: getIdentifierFromName(name),
          spec: {
            environmentVariables: [
              {
                name: 'iv',
                type: 'String',
                value: ''
              }
            ],
            outputVariables: [
              {
                name: 'ov',
                type: 'String',
                value: ''
              }
            ]
          }
        }}
        template={{
          identifier: getIdentifierFromName(name),
          type: StepType.Command,
          spec: {
            environmentVariables: [
              {
                name: 'iv',
                type: 'String',
                value: RUNTIME_INPUT_VALUE
              }
            ],
            outputVariables: [
              {
                name: 'ov',
                type: 'String',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        }}
        type={StepType.Command}
        stepViewType={StepViewType.DeploymentForm}
      />
    )

    userEvent.click(screen.getByText(/submit/i))
    expect(await screen.findAllByText('common.validation.valueIsRequired')).toHaveLength(2)
  })

  test('timeout validation when stepViewType is InputSet', async () => {
    render(
      <TestStepWidget
        initialValues={{
          name,
          timeout: '10',
          identifier: getIdentifierFromName(name),
          spec: {
            outputVariables: [
              {
                name: 'ov',
                type: 'String',
                value: ''
              }
            ]
          }
        }}
        template={{
          identifier: getIdentifierFromName(name),
          type: StepType.Command,
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            outputVariables: [
              {
                name: 'ov',
                type: 'String',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        }}
        type={StepType.Command}
        stepViewType={StepViewType.InputSet}
      />
    )

    userEvent.click(screen.getByText(/submit/i))
    expect(await screen.findByText(/^invalid syntax provided$/i)).toBeInTheDocument()
  })

  test('should render variables view', () => {
    const { getByText } = render(
      <TestStepWidget
        stepViewType={StepViewType.InputVariable}
        type={StepType.Command}
        initialValues={{
          type: 'Command',
          name,
          identifier: getIdentifierFromName(name),
          spec: {
            onDelegate: false,
            environmentVariables: [
              {
                name: 'iv',
                type: 'String',
                value: '<+input>'
              }
            ],
            outputVariables: [],
            commandUnits: [
              {
                identifier: 'copy_command',
                name: 'copy command',
                type: 'Copy',
                spec: {
                  sourceType: 'Artifact',
                  destinationPath: 'dest-path'
                }
              }
            ]
          }
        }}
        customStepProps={{
          stageIdentifier: 's1',
          metadataMap: {
            'cP-sOQt-SU6M8zpAELT6Fw': {
              yamlProperties: {
                fqn: 'pipeline.stages.s1.spec.execution.steps.commandstep.spec.commandUnits.copy_command.name',
                localName: 'execution.steps.commandstep.spec.commandUnits.copy_command.name',
                variableName: 'name',
                aliasFQN: '',
                visible: true
              },
              yamlOutputProperties: null,
              yamlExtraProperties: null
            },
            yZnjXDeESlagHkNUSmzz_w: {
              yamlProperties: {
                fqn: 'pipeline.stages.s1.spec.execution.steps.commandstep.spec.commandUnits.copy_command.spec.destinationPath',
                localName: 'execution.steps.commandstep.spec.commandUnits.copy_command.spec.destinationPath',
                variableName: 'destinationPath',
                aliasFQN: '',
                visible: true
              },
              yamlOutputProperties: null,
              yamlExtraProperties: null
            },
            LCvYwr_RSzGdPYVhfGqUKg: {
              yamlProperties: {
                fqn: 'pipeline.stages.s1.spec.execution.steps.commandstep.spec.environmentVariables.iv',
                localName: 'execution.steps.commandstep.spec.environmentVariables.iv',
                variableName: '',
                aliasFQN: '',
                visible: true
              },
              yamlOutputProperties: null,
              yamlExtraProperties: null
            },
            E5rdLKXCQHSqgmBvRcw_VA: {
              yamlProperties: {
                fqn: 'pipeline.stages.s1.spec.execution.steps.commandstep.spec.onDelegate',
                localName: 'execution.steps.commandstep.spec.onDelegate',
                variableName: 'onDelegate',
                aliasFQN: '',
                visible: true
              },
              yamlOutputProperties: null,
              yamlExtraProperties: null
            }
          },
          variablesData: {
            type: 'Command',
            identifier: 'commandstep',
            name: 'FyubBMzYQaypeVqdJN-W_w',
            description: 'vG1dZZx_RsmPS7neHax_OA',
            timeout: 'IPQUv4szR8awDslpsbocGw',
            __uuid: 'ZS5dAHtwTMyxObCDL_0djg',
            strategy: {
              __uuid: 'bdyEluRTSSCiEq5TJATi3w',
              repeat: {
                items: '<+stage.output.hosts>'
              }
            },
            spec: {
              onDelegate: 'E5rdLKXCQHSqgmBvRcw_VA',
              delegateSelectors: '06o0hHAtQZqTp_GKp97clg',
              commandUnits: [
                {
                  __uuid: 'HHv2lYiQTc-8UuDm3gOZHA',
                  identifier: 'copy_command',
                  type: 'Copy',
                  name: 'cP-sOQt-SU6M8zpAELT6Fw',
                  spec: {
                    __uuid: 'YpWfKecxQG6IxZ5fRaMNrQ',
                    destinationPath: 'yZnjXDeESlagHkNUSmzz_w',
                    sourceType: 'Artifact',
                    type: 'Copy'
                  }
                }
              ],
              host: 'ae2ibgObQv2qSiBCGJ51hQ',
              environmentVariables: [
                {
                  type: 'String',
                  name: 'iv',
                  value: 'LCvYwr_RSzGdPYVhfGqUKg',
                  required: false,
                  __uuid: '4ebMJXJOQT6BFQdOCIinsg',
                  currentValue: 'LCvYwr_RSzGdPYVhfGqUKg'
                }
              ],
              outputVariables: [],
              __uuid: '-D0fS28mR2GbdUsWbgENsA'
            }
          }
        }}
      />
    )

    expect(getByText('name')).toBeInTheDocument()
    expect(getByText('copy command')).toBeInTheDocument()
    expect(getByText('onDelegate')).toBeInTheDocument()
    expect(getByText('destinationPath')).toBeInTheDocument()
    expect(getByText('dest-path')).toBeInTheDocument()
    expect(getByText('iv')).toBeInTheDocument()
  })
})
