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
import { InstanceScriptTypes } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraUtils'
import { TanzuCommandStep } from '../TanzuCommand'

factory.registerStep(new TanzuCommandStep())

const existingInitialValues = {
  type: StepType.TanzuCommand,
  name: 'Tanzu Command Step',
  identifier: 'Tanzu_Command_Step',
  timeout: '10m',
  spec: {
    script: {
      store: {
        type: InstanceScriptTypes.FileStore,
        spec: {
          files: ['filePath']
        }
      }
    }
  }
}

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('TanzuCommandStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.TanzuCommand}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.clear(nameInput!)
    userEvent.type(nameInput!, 'Tanzu Command Step')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Tanzu Command Step'))
    expect(getByText('Tanzu_Command_Step')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '20m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('20m'))

    fireEvent.click(container.querySelector('[data-icon="fixed-input"]') as HTMLElement)

    await act(() => ref.current?.submitForm()!)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Tanzu_Command_Step',
        name: 'Tanzu Command Step',
        timeout: '20m',
        type: StepType.TanzuCommand,
        spec: {
          script: {
            store: {
              spec: {
                files: ['filePath']
              },
              type: InstanceScriptTypes.FileStore
            }
          }
        }
      })
    )
  })

  test('should show error on submit with invalid data with fileStorea', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const initialValuesFS = () => ({
      type: StepType.TanzuCommand,
      name: '',
      identifier: '',
      timeout: '',
      spec: {
        script: {
          store: {
            type: InstanceScriptTypes.FileStore,
            spec: {}
          }
        }
      }
    })

    const { container, getByText, getByTestId } = render(
      <TestStepWidget
        initialValues={initialValuesFS}
        type={StepType.TanzuCommand}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )
    await act(() => ref.current?.submitForm()!)
    // expect(container).toMatchSnapshot()
    const timeoutError = getByText('validation.timeout10SecMinimum')
    expect(timeoutError).toBeInTheDocument()

    const nameError = getByText('pipelineSteps.stepNameRequired')
    expect(nameError).toBeInTheDocument()

    const fileSelectError = getByText('common.validation.fieldIsRequired')
    expect(fileSelectError).toBeInTheDocument()

    const scriptTypeDropdown = getByTestId('templateOptions')
    expect((getByText('resourcePage.fileStore') as HTMLOptionElement).selected).toBeTruthy()
    fireEvent.click(scriptTypeDropdown!)

    act(() => {
      userEvent.selectOptions(scriptTypeDropdown, 'inline')
    })
    expect(container).toMatchSnapshot()
  })
  test('should show error on submit with invalid data with inline script', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()

    const initialValuesInline = () => ({
      type: StepType.TanzuCommand,
      name: '',
      identifier: '',
      timeout: '',
      spec: {
        script: {
          store: {
            type: InstanceScriptTypes.Inline,
            spec: {}
          }
        }
      }
    })

    const { container, getByText } = render(
      <TestStepWidget
        initialValues={initialValuesInline}
        type={StepType.TanzuCommand}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(container).toMatchSnapshot()
    const timeoutError = getByText('validation.timeout10SecMinimum')
    expect(timeoutError).toBeInTheDocument()

    const nameError = getByText('pipelineSteps.stepNameRequired')
    expect(nameError).toBeInTheDocument()

    const fileSelectError = getByText('common.validation.fieldIsRequired')
    expect(fileSelectError).toBeInTheDocument()
  })

  test('should render edit view as edit step with all runtime inputs', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.TanzuCommand,
          name: 'Tanzu Command Step Default',
          identifier: 'Tanzu_Command_Step_Default',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            script: {
              store: {
                type: InstanceScriptTypes.FileStore,
                spec: {
                  files: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }}
        type={StepType.TanzuCommand}
        stepViewType={StepViewType.Edit}
        readonly
      />
    )
    expect(container).toMatchSnapshot()

    const { container: containerInlineScript } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.TanzuCommand,
          name: 'Tanzu Command Step Default',
          identifier: 'Tanzu_Command_Step_Default',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            script: {
              store: {
                type: InstanceScriptTypes.Inline,
                spec: {
                  content: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }}
        type={StepType.TanzuCommand}
        stepViewType={StepViewType.Edit}
        readonly
      />
    )
    expect(containerInlineScript).toMatchSnapshot()
  })

  test('InputSet view renders errors', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Tanzu_Command_Step',
          name: 'Tanzu Command Step',
          timeout: '',
          type: StepType.TanzuCommand,
          spec: {
            script: {
              store: {
                type: InstanceScriptTypes.FileStore,
                spec: {
                  files: ''
                }
              }
            }
          }
        }}
        template={{
          identifier: 'Tanzu_Command_Step',
          name: 'Tanzu Command Step',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.TanzuCommand,
          spec: {
            script: {
              store: {
                type: InstanceScriptTypes.FileStore,
                spec: {
                  files: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }}
        type={StepType.TanzuCommand}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        inputSetData={{ path: '', readonly: true }}
      />
    )

    const submitBtn = getByText('Submit')
    userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(getByText('fieldRequired')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
  })

  test('InputSet view inline script validation', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Tanzu_Command_Step',
          name: 'Tanzu Command Step',
          timeout: '',
          type: StepType.TanzuCommand,
          spec: {
            script: {
              store: {
                type: InstanceScriptTypes.Inline,
                spec: {
                  content: ''
                }
              }
            }
          }
        }}
        template={{
          identifier: 'Tanzu_Command_Step',
          name: 'Tanzu Command Step',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.TanzuCommand,
          spec: {
            script: {
              store: {
                type: InstanceScriptTypes.Inline,
                spec: {
                  content: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }}
        type={StepType.TanzuCommand}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        inputSetData={{ path: '', readonly: true }}
      />
    )
    const submitBtn = getByText('Submit')
    userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('fieldRequired')).toBeInTheDocument())
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Tanzu_Command_Step',
          name: 'Tanzu Command Step',
          timeout: '',
          type: StepType.TanzuCommand,
          spec: {
            script: {
              store: {
                type: InstanceScriptTypes.FileStore,
                spec: {
                  files: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }}
        template={{
          identifier: 'Tanzu_Command_Step',
          name: 'Tanzu Command Step',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.TanzuCommand,
          spec: {
            script: {
              store: {
                type: InstanceScriptTypes.FileStore,
                spec: {
                  files: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }}
        type={StepType.TanzuCommand}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        inputSetData={{ path: '', readonly: true }}
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
      identifier: 'Tanzu_Command_Step',
      name: 'Tanzu Command Step',
      timeout: '10m',
      type: StepType.TanzuCommand,
      spec: {
        script: {
          store: {
            type: InstanceScriptTypes.FileStore,
            spec: {
              files: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.TanzuCommand}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'testStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Tanzu Command Step': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.spec.execution.steps.TanzuCommand_1.name',
                localName: 'execution.steps.TanzuCommand_1.name',
                variableName: 'name',
                aliasFQN: '',
                visible: true
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.spec.execution.steps.TanzuCommand_1.timeout',
                localName: 'execution.steps.TanzuCommand_1.timeout',
                variableName: 'timeout',
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
