/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { queryByNameAttribute } from '@common/utils/testUtils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TerragruntDestroy } from '../TerragruntDestroy'

const mockData = {
  type: 'TerragruntDestroy',
  name: 'Test A',
  identifier: 'Test_A',
  timeout: '10m',
  spec: {
    provisionerIdentifier: 'test',
    configuration: {
      type: 'Inline',
      spec: {
        workspace: 'testa',
        moduleConfig: {
          terragruntRunType: 'RunModule',
          path: './d'
        },
        configFiles: {
          store: {
            spec: {
              connectorRef: {
                label: 'test',
                value: 'test',
                scope: 'account',
                connector: { type: 'Git' }
              }
            }
          }
        },
        backendConfig: {
          spec: {
            content: 'test-content'
          }
        },
        targets: ['test-1'],
        environmentVariables: [{ name: 'test', type: 'String', value: 'abc' }],
        varFiles: [
          {
            varFile: {
              type: 'Inline',
              spec: {
                content: 'test'
              }
            }
          },
          {
            varFile: {
              type: 'Remote',
              connectorRef: 'test',
              branch: 'testBranch',
              gitFetchType: 'Branch'
            }
          }
        ]
      }
    }
  }
}

const initialData = {
  type: 'TerragruntDestroy',
  name: 'Test A',
  identifier: 'Test_A',
  timeout: '',
  spec: {
    provisionerIdentifier: '',
    configuration: {
      type: 'Inline',
      spec: {
        workspace: '',
        moduleConfig: {
          terragruntRunType: 'RunModule',
          path: ''
        },
        configFiles: {
          store: {
            spec: {
              branch: '',
              folderPath: '',
              connectorRef: {
                label: 'test',
                Scope: 'Account',
                value: 'test',
                connector: {
                  type: 'GIT',
                  spec: {
                    val: 'test'
                  }
                }
              }
            }
          }
        },
        backendConfig: {
          spec: {
            content: ''
          }
        }
      },
      targets: '',
      environmentVariables: {}
    }
  }
}

const mockGetCallFunction = jest.fn()
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

describe('Test TerragruntDestroy', () => {
  beforeEach(() => {
    factory.registerStep(new TerragruntDestroy())
  })

  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.TerragruntDestroy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { queryByText, getByText, container } = render(
      <TestStepWidget
        initialValues={initialData}
        type={StepType.TerragruntDestroy}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
        onChange={jest.fn()}
        ref={ref}
      />
    )
    // Submit with empty form
    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
    expect(getByText('common.validation.provisionerIdentifierIsRequired')).toBeTruthy()
    act(() => {
      fireEvent.click(getByText('pipelineSteps.provisionerIdentifier'))
    })
    fireEvent.change(queryByNameAttribute('spec.provisionerIdentifier', container)!, { target: { value: '$%' } })
    await act(() => ref.current?.submitForm()!)
    const errMsg = getByText('common.validation.provisionerIdentifierPatternIsNotValid')
    expect(errMsg).toBeInTheDocument()
  })

  test('should render edit view as edit step - InheritFromApply', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'InheritFromApply'
            }
          }
        }}
        type={StepType.TerragruntDestroy}
        stepViewType={StepViewType.Edit}
        isNewStep
      />
    )
    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'Test A')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Test A'))
    expect(getByText(getIdentifierFromName('Test A'))).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '5m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('5m'))
  })

  test('should be able to edit inline config', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { findByTestId } = render(
      <TestStepWidget
        initialValues={mockData}
        type={StepType.TerragruntDestroy}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    const editIcon = await findByTestId('editConfigButton')
    fireEvent.click(editIcon!)

    const gitConnector = await findByTestId('varStore-Git')
    expect(gitConnector).toBeInTheDocument()

    const gitlabConnector = await findByTestId('varStore-GitLab')
    expect(gitlabConnector).toBeInTheDocument()

    const githubbConnector = await findByTestId('varStore-Github')
    expect(githubbConnector).toBeInTheDocument()

    const bitBucketConnector = await findByTestId('varStore-Bitbucket')
    expect(bitBucketConnector).toBeInTheDocument()
  })

  test('should submit form for inline config', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={mockData}
        type={StepType.TerragruntDestroy}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerragruntDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        template={{
          type: 'TerragruntDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        allValues={{
          type: 'TerragruntDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terragruntDestroy.name',
                localName: 'step.terragruntDestroy.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terragruntDestroy.timeout',
                localName: 'step.terragruntDestroy.timeout'
              }
            },

            'step-provisionerIdentifier': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terragruntDestroy.provisionerIdentifier',
                localName: 'step.terragruntDestroy.provisionerIdentifier'
              }
            }
          },
          variablesData: {
            type: 'TerragruntDestroy',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',
            spec: {
              provisionerIdentifier: 'step-provisionerIdentifier',
              configuration: {
                type: 'InheritFromPlan'
              }
            }
          }
        }}
        type={StepType.TerragruntDestroy}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(getByText('provisionerIdentifier')).toBeInTheDocument()
  })

  describe('TerragruntDestroy inputset/deployment view test', () => {
    test('Render InputSet mode', () => {
      const { container } = render(
        <TestStepWidget
          path="test"
          initialValues={{
            type: 'TerragruntDestroy',
            name: 'Test A',
            identifier: 'Test_A',
            timeout: '10m',

            delegateSelectors: ['test-1', 'test-2'],
            spec: {
              provisionerIdentifier: RUNTIME_INPUT_VALUE,
              configuration: {
                type: 'InheritFromPlan'
              }
            }
          }}
          inputSetData={{
            template: {
              type: 'TerragruntDestroy',
              name: 'Test A',
              identifier: 'Test_A',
              timeout: '10m',
              delegateSelectors: ['test-1', 'test-2'],
              spec: {
                provisionerIdentifier: RUNTIME_INPUT_VALUE,
                configuration: {
                  type: 'InheritFromPlan'
                }
              }
            },
            path: 'test'
          }}
          template={{
            type: 'TerragruntDestroy',
            name: 'Test A',
            identifier: 'Test_A',
            timeout: '10m',
            delegateSelectors: ['test-1', 'test-2'],
            spec: {
              provisionerIdentifier: RUNTIME_INPUT_VALUE,
              configuration: {
                type: 'InheritFromPlan'
              }
            }
          }}
          allValues={{
            type: 'TerragruntDestroy',
            name: 'Test A',
            identifier: 'Test_A',
            timeout: '10m',
            delegateSelectors: ['test-1', 'test-2'],
            spec: {
              provisionerIdentifier: RUNTIME_INPUT_VALUE,
              configuration: {
                type: 'InheritFromPlan'
              }
            }
          }}
          type={StepType.TerragruntDestroy}
          stepViewType={StepViewType.InputSet}
        />
      )
      const provisionerId = queryByNameAttribute('test.spec.provisionerIdentifier', container)
      expect(provisionerId).toBeDefined()
    })

    test('Terragrunt Input step view with no runtime field', async () => {
      const { getByText, queryByText } = render(
        <TestStepWidget
          path={'test'}
          initialValues={initialData}
          inputSetData={{
            path: 'test'
          }}
          allValues={mockData}
          type={StepType.TerragruntPlan}
          stepViewType={StepViewType.InputSet}
        />
      )
      fireEvent.click(getByText('Submit'))
      await waitFor(() => queryByText('Errors'))
      expect(getByText('{}')).toBeInTheDocument()
    })

    test('Input set view validation for timeout', () => {
      const response = new TerragruntDestroy().validateInputSet({
        data: {
          name: 'TerragruntDestroy',
          identifier: 'TerragruntDestroy',
          timeout: '1s',
          type: 'TerragruntDestroy',
          spec: {}
        } as any,
        template: {
          timeout: RUNTIME_INPUT_VALUE,
          spec: {}
        } as any,
        getString: jest.fn().mockImplementation(val => val),
        viewType: StepViewType.TriggerForm
      })
      expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
    })
  })
})
