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
import { TerraformDestroy } from '../TerraformDestroy'

const mockGetCallFunction = jest.fn()
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
})

describe('Test TerraformDestroy', () => {
  beforeEach(() => {
    factory.registerStep(new TerraformDestroy())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.TerraformDestroy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step - inheritfromplan', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step - inheritfromplan', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'InheritFromApply'
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step - Inline', () => {
    const { container, getByText, getByTestId } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                workspace: 'testworkspace',
                varFiles: [
                  {
                    type: 'Remote',
                    store: {
                      type: 'Git',
                      spec: {
                        gitFetchType: 'Branch',
                        branch: 'main',
                        paths: ['test-1', 'test-2'],
                        connectorRef: 'test-connectore'
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('common.optionalConfig'))
    fireEvent.click(getByTestId('add-tfvar-file'))
    expect(container).toMatchSnapshot()
  })

  test('expand backend Spec config', () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            //data.spec?.configuration?.spec?.targets
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                backendConfig: {
                  type: 'Inline',
                  spec: {
                    content: 'test'
                  }
                },
                targets: ['test1', 'test2'],
                environmentVariables: [
                  {
                    key: 'test',
                    value: 'abc'
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('common.optionalConfig'))
    expect(container).toMatchSnapshot()
  })

  test('add new terraform var file', () => {
    const { container, getByText, getByTestId } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                workspace: 'testworkspace',
                varFiles: [
                  {
                    type: 'Inline',
                    store: {
                      type: 'Git',
                      spec: {
                        content: 'Test Content'
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('common.optionalConfig'))
    fireEvent.click(getByTestId('add-tfvar-file'))
    expect(container).toMatchSnapshot()
  })

  test('should submit form for inheritfromplan config', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('should render inputSet View', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,

          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        template={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          },
          path: 'test'
        }}
        allValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.InputSet}
        inputSetData={{
          template: {
            type: 'TerraformDestroy',
            name: 'Test A',
            identifier: 'Test_A',
            timeout: RUNTIME_INPUT_VALUE,
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
        path="test"
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'Inline',
              spec: {
                workspace: 'testworkspace',
                configFiles: {
                  store: {
                    type: 'Git',
                    spec: {
                      gitFetchType: 'Branch',
                      repoName: 'test',
                      branch: 'main',
                      folderPath: 'config/my-configs/',
                      connectorRef: 'myTfConnector'
                    }
                  }
                }
              }
            }
          }
        }}
        template={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'Inline',
              spec: {
                workspace: 'testworkspace',
                configFiles: {
                  store: {
                    type: 'Git',
                    spec: {
                      gitFetchType: 'Branch',
                      repoName: 'test',
                      branch: 'main',
                      folderPath: 'config/my-configs/',
                      connectorRef: 'myTfConnector'
                    }
                  }
                }
              }
            }
          }
        }}
        allValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'Inline',
              spec: {
                workspace: 'testworkspace',
                configFiles: {
                  store: {
                    type: 'Git',
                    spec: {
                      gitFetchType: 'Branch',
                      repoName: 'test',
                      branch: 'main',
                      folderPath: 'config/my-configs/',
                      connectorRef: 'myTfConnector'
                    }
                  }
                }
              }
            }
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.name',
                localName: 'step.terraformDestroy.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.timeout',
                localName: 'step.terraformDestroy.timeout'
              }
            },
            'step-delegateSelectors': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.delegateSelectors',
                localName: 'step.terraformDestroy.delegateSelectors'
              }
            },
            'step-provisionerIdentifier': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.spec.provisionerIdentifier',
                localName: 'step.terraformDestroy.spec.provisionerIdentifier'
              }
            },
            'step-configurationWorkspace': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.configuration.spec.workspace',
                localName: 'step.terraformDestroy.configuration.spec.workspace'
              }
            },
            'step-configBranch': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.configuration.spec.configFiles.store.spec.branch',
                localName: 'step.terraformDestroy.configuration.spec.configFiles.store.spec.branch'
              }
            }
          },
          variablesData: {
            type: 'TerraformDestroy',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',

            delegateSelectors: ['test-1', 'test-2'],
            spec: {
              provisionerIdentifier: 'step-provisionerIdentifier',
              configuration: {
                type: 'Inline',
                spec: {
                  workspace: 'step-configurationWorkspace',
                  configFiles: {
                    store: {
                      type: 'Git',
                      spec: {
                        gitFetchType: 'Branch',
                        repoName: 'test',
                        branch: 'step-configBranch',
                        folderPath: 'config/my-configs/',
                        connectorRef: 'myTfConnector'
                      }
                    }
                  }
                }
              }
            }
          }
        }}
        path="test"
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
