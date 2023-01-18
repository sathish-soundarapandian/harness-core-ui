/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TerragruntPlan } from '../TerragruntPlan'

const mockData = {
  type: 'TerragruntPlan',
  name: 'Test A',
  identifier: 'Test_A',
  timeout: '10m',
  spec: {
    provisionerIdentifier: 'test',
    delegateSelectors: ['anyonefive'],
    configuration: {
      command: 'Apply',
      secretManagerRef: {
        label: 'secret-1',
        value: 'sercet-1',
        scope: 'account'
      },
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
      ],
      exportTerragruntPlanJson: true
    }
  }
}

const initialData = {
  type: 'TerragruntPlan',
  name: 'Test A',
  identifier: 'Test_A',
  timeout: '',
  spec: {
    provisionerIdentifier: '',
    configuration: {
      command: 'Apply',
      workspace: '',
      secretManagerRef: '',
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

const templateData = {
  type: 'TerragruntPlan',
  name: 'Test A',
  identifier: 'Test_A',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    configuration: {
      command: 'Apply',
      workspace: RUNTIME_INPUT_VALUE,
      secretManagerRef: RUNTIME_INPUT_VALUE,
      moduleConfig: {
        terragruntRunType: 'RunModule',
        path: RUNTIME_INPUT_VALUE
      },
      configFiles: {
        store: {
          spec: {
            branch: RUNTIME_INPUT_VALUE,
            folderPath: RUNTIME_INPUT_VALUE,
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
          content: RUNTIME_INPUT_VALUE
        }
      }
    },
    targets: RUNTIME_INPUT_VALUE,
    environmentVariables: RUNTIME_INPUT_VALUE
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

jest.mock('@common/components/MonacoEditor/MonacoEditor')

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('Test TerragruntPlan', () => {
  beforeEach(() => {
    factory.registerStep(new TerragruntPlan())
  })

  describe('Terragrunt edit view test', () => {
    test('should render edit view as new step', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.TerragruntPlan} stepViewType={StepViewType.Edit} />
      )
      expect(container).toMatchSnapshot()
    })

    test('Basic functions - edit stage view validations', async () => {
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { queryByText, getByText } = render(
        <TestStepWidget
          initialValues={initialData}
          type={StepType.TerragruntPlan}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={ref}
        />
      )
      // Submit with empty form
      await act(() => ref.current?.submitForm()!)
      expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
      expect(getByText('common.validation.provisionerIdentifierIsRequired')).toBeTruthy()
    })

    test('Submit form for Terragrunt plan', async () => {
      const ref = React.createRef<StepFormikRef<unknown>>()
      render(
        <TestStepWidget
          type={StepType.TerragruntPlan}
          stepViewType={StepViewType.Edit}
          ref={ref}
          onUpdate={onUpdate}
          initialValues={mockData}
        />
      )
      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).toHaveBeenCalledWith({
        type: 'TerragruntPlan',
        name: 'Test A',
        identifier: 'Test_A',
        timeout: '10m',
        spec: {
          provisionerIdentifier: 'test',
          delegateSelectors: ['anyonefive'],
          configuration: {
            command: 'Apply',
            secretManagerRef: {
              label: 'secret-1',
              value: 'sercet-1',
              scope: 'account'
            },
            workspace: 'testa',
            moduleConfig: {
              terragruntRunType: 'RunModule',
              path: './d'
            },
            configFiles: {
              store: {
                spec: {
                  connectorRef: 'test',
                  gitFetchType: 'Branch'
                },
                type: 'Git'
              }
            },
            backendConfig: {
              spec: {
                content: 'test-content'
              },
              type: 'Inline'
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
            ],
            exportTerragruntPlanJson: true
          }
        }
      })
    })
  })

  describe('Terragrunt inputset/deployment view test', () => {
    test('Basic snapshot- InputSet mode', () => {
      const { container } = render(
        <TestStepWidget
          path={'test'}
          initialValues={initialData}
          template={templateData}
          allValues={templateData}
          type={StepType.TerragruntPlan}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
          onChange={onChange}
        />
      )
      expect(container).toMatchSnapshot()
    })

    test('Terragrunt Input step view with no runtime field', () => {
      const { container } = render(
        <TestStepWidget
          path={'test'}
          initialValues={initialData}
          inputSetData={{
            path: 'test'
          }}
          onUpdate={onUpdate}
          onChange={onChange}
          allValues={mockData}
          type={StepType.TerragruntPlan}
          stepViewType={StepViewType.InputSet}
        />
      )
      expect(container).toMatchSnapshot()
    })

    test('Input set view validation for timeout', () => {
      const response = new TerragruntPlan().validateInputSet({
        data: {
          name: 'TerragruntPlan',
          identifier: 'TerragruntPlan',
          timeout: '1s',
          type: 'TerragruntPlan',
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

    test('Deploymentform mode - readonly', () => {
      const { container } = render(
        <TestStepWidget
          path={'test'}
          initialValues={mockData}
          inputSetData={{
            path: 'test',
            template: templateData,
            readonly: true
          }}
          type={StepType.TerragruntPlan}
          template={templateData}
          stepViewType={StepViewType.DeploymentForm}
          onUpdate={onUpdate}
          onChange={onChange}
        />
      )
      expect(container).toMatchSnapshot()
    })
  })

  describe('Terragrunt inputvariable view test', () => {
    test('Baisc snapshot- InputVariable view', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={mockData}
          onUpdate={onUpdate}
          customStepProps={{
            stageIdentifier: 'qaStage',
            metadataMap: {
              'step-name': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.terragruntPlan.name',
                  localName: 'step.terragruntPlan.name'
                }
              },

              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.terragruntPlan.timeout',
                  localName: 'step.terragruntPlan.timeout'
                }
              },
              'step-delegateSelectors': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.terragruntPlan.delegateSelectors',
                  localName: 'step.terragruntPlan.delegateSelectors'
                }
              },
              'step-provisionerIdentifier': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.terragruntPlan.provisionerIdentifier',
                  localName: 'step.terragruntPlan.provisionerIdentifier'
                }
              }
            },
            variablesData: {
              type: 'TerragruntPlan',
              name: 'step-name',
              identifier: 'Test_A',
              timeout: 'step-timeout',

              spec: {
                provisionerIdentifier: 'test',
                configuration: {
                  command: 'Apply',
                  configFiles: {
                    store: {
                      spec: {
                        gitFetchType: 'Branch',
                        branch: 'test-branch',
                        connectorRef: 'test'
                      }
                    }
                  },
                  workspace: 'testa',
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
                  ],
                  backendConfig: {
                    spec: {
                      content: 'test-content'
                    }
                  },
                  targets: ['test-1'],
                  environmentVariables: [{ name: 'test', type: 'String', value: 'abc' }]
                }
              }
            }
          }}
          type={StepType.TerragruntPlan}
          stepViewType={StepViewType.InputVariable}
        />
      )
      expect(container).toMatchSnapshot()
    })
  })

  test('Test config file opening and closing file store', async () => {
    render(
      <TestStepWidget
        initialValues={{
          type: 'TerragruntPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10s',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'provisionerIdentifier',
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {}
                }
              },
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    spec: {
                      content: 'test'
                    }
                  }
                }
              ]
            }
          }
        }}
        type={StepType.TerragruntPlan}
        stepViewType={StepViewType.Edit}
      />
    )

    const configPlaceholder = screen.getByText('cd.configFilePlaceHolder')
    expect(configPlaceholder).toBeInTheDocument()
    fireEvent.click(configPlaceholder)

    const closeButton = screen.getByTestId('close-wizard')
    expect(closeButton).toBeInTheDocument()
    fireEvent.click(closeButton)
  })

  test('Renders remote backend config ', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerragruntPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10s',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'provisionerIdentifier',
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {}
                }
              },
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    spec: {
                      content: 'test'
                    }
                  }
                }
              ],
              backendConfig: {
                type: 'Remote',
                spec: {
                  store: {
                    type: 'Github',
                    spec: {
                      gitFetchType: 'Branch',
                      repoName: '',
                      branch: 'master',
                      folderPath: ['test-path'],
                      connectorRef: 'test'
                    }
                  }
                }
              }
            }
          }
        }}
        type={StepType.TerragruntPlan}
        stepViewType={StepViewType.Edit}
      />
    )

    fireEvent.click(getByText('common.optionalConfig')!)

    expect(getByText('cd.backendConfigurationFile')!).toBeInTheDocument()
    expect(getByText('/test-path')!).toBeInTheDocument()
  })

  test('Renders config file info with defined file path', async () => {
    render(
      <TestStepWidget
        initialValues={{
          type: 'TerragruntPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  type: 'Git',
                  spec: {
                    folderPath: './path'
                  }
                }
              },
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    spec: {
                      content: 'test'
                    }
                  }
                }
              ]
            }
          }
        }}
        type={StepType.TerragruntPlan}
        stepViewType={StepViewType.Edit}
      />
    )
    const configFileName = await screen.findByTestId('./path')
    expect(configFileName).toBeInTheDocument()
  })

  test('Terragrunt varfile list deletion and editing test', async () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }
    const { getByText, container } = render(
      <Provider value={responseState as any}>
        <DragDropContext onDragEnd={jest.fn()}>
          <Droppable droppableId="test">
            {provided => (
              <div ref={provided.innerRef}>
                <TestStepWidget
                  initialValues={{
                    type: 'TerragruntPlan',
                    name: 'Test A',
                    identifier: 'Test_A',
                    timeout: '10s',
                    delegateSelectors: ['test-1', 'test-2'],
                    spec: {
                      provisionerIdentifier: 'provisionerIdentifier',
                      configuration: {
                        command: 'Apply',
                        configFiles: {
                          store: {
                            spec: {}
                          }
                        },
                        varFiles: [
                          {
                            varFile: {
                              identifier: 'test',
                              type: 'Remote',
                              store: {
                                spec: {
                                  connectorRef: 'test',
                                  branch: 'testBranch',
                                  gitFetchType: 'Branch',
                                  paths: ['./abc']
                                }
                              }
                            }
                          },
                          {
                            varFile: {
                              identifier: 'test2',
                              type: 'Inline',
                              spec: {
                                content: 'content'
                              }
                            }
                          }
                        ]
                      }
                    }
                  }}
                  type={StepType.TerragruntPlan}
                  stepViewType={StepViewType.Edit}
                />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Provider>
    )
    fireEvent.click(getByText('common.optionalConfig')!)
    const scrollableContainer = container.querySelector('[class*="Accordion--details"]')
    await act(async () => {
      fireEvent.scroll(scrollableContainer!, { target: { scrollY: 10 } })
    })
    const editVarfile = container.querySelectorAll('[data-icon="Edit"]')[0]
    expect(editVarfile).toBeDefined()

    const deleteVarfile = container.querySelector('[data-icon="main-trash"]') as Element
    expect(deleteVarfile).toBeDefined()
    fireEvent.click(deleteVarfile)
  })
})
