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
import { ConfigFilesMap } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
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
        type: ConfigFilesMap.Harness,
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
              type: 'Harness'
            }
          }
        }
      })
    )
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
                type: ConfigFilesMap.Harness,
                spec: {
                  files: [RUNTIME_INPUT_VALUE]
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
                type: ConfigFilesMap.Harness,
                spec: {
                  files: [RUNTIME_INPUT_VALUE]
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
                type: ConfigFilesMap.Harness,
                spec: {
                  files: [RUNTIME_INPUT_VALUE]
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
            type: ConfigFilesMap.Harness,
            spec: {
              files: [RUNTIME_INPUT_VALUE]
            }
          }
        }
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
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
            TanzuCommand: {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.execution.steps.TanzuCommandStep.name',
                localName: 'step.TanzuCommandStep.name'
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.execution.steps.TanzuCommandStep.timeout',
                localName: 'step.TanzuCommand.timeout'
              }
            }
          }
        }}
      />
    )

    expect(getByText('name')).toBeVisible()
    expect(getByText('TanzuCommand')).toBeVisible()
    expect(getByText('timeout')).toBeVisible()
    expect(getByText('10m')).toBeVisible()
  })
})
