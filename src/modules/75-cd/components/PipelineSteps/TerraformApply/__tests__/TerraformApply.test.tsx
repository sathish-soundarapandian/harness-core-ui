/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'

import { TerraformApply } from '../TerraformApply'

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

describe('Test TerraformApply', () => {
  beforeEach(() => {
    factory.registerStep(new TerraformApply())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.TerraformApply} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step - Inheritfromplan', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
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
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should submit form for inheritfromplan config', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
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
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('should be able to edit inline config', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { findByTestId } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
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
                      store: {
                        spec: {
                          connectorRef: 'test connector ref',
                          branch: 'test-brancg',
                          folderPath: 'testfolder'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
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
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                configFiles: {
                  store: {
                    spec: {
                      folderPath: 'test',
                      connectorRef: {
                        label: 'test',
                        value: 'test',
                        scope: 'account',

                        connector: { type: 'Git' }
                      }
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
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      store: {
                        spec: {
                          connectorRef: 'test',
                          branch: 'test-brancg',
                          folderPath: 'testfolder'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('rendering more than one varfile', async () => {
    const { container, getByText, findByTestId } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
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
                      store: {
                        spec: {
                          connectorRef: 'test',
                          branch: 'test-brancg',
                          folderPath: 'testfolder'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
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
    const addFile = await findByTestId('add-tfvar-file')
    expect(addFile).toBeInTheDocument()
  })

  test('expand backend Spec config', () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                backendConfig: {
                  type: 'Inline',
                  spec: {
                    content: 'test'
                  }
                }
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
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('common.optionalConfig'))
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as inline', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
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
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        path="test"
        initialValues={{
          type: 'TerraformApply',
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
            type: 'TerraformApply',
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
          type: 'TerraformApply',
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
          type: 'TerraformApply',
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
        type={StepType.TerraformApply}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
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
        template={{
          type: 'TerraformDestroy',
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
          type: 'TerraformDestroy',
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
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.provisionerIdentifier',
                localName: 'step.terraformDestroy.provisionerIdentifier'
              }
            }
          },
          variablesData: {
            type: 'TerraformDestroy',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',

            delegateSSelectors: ['test-1', 'test-2'],
            spec: {
              provisionerIdentifier: 'step-provisionerIdentifier',
              configuration: {
                type: 'InheritFromPlan'
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should trigger validation error for fixed value', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: '',
            configuration: {
              type: 'Inline',
              spec: {
                configFiles: {
                  store: {
                    spec: {
                      folderPath: 'test',
                      connectorRef: {
                        label: 'test',
                        value: 'test',
                        scope: 'account',

                        connector: { type: 'Git' }
                      }
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
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      store: {
                        spec: {
                          connectorRef: 'test',
                          branch: 'test-brancg',
                          folderPath: 'testfolder'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    const errMsg = getByText('common.validation.provisionerIdentifierIsRequired')
    expect(errMsg).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should trigger validation error for invalid fixed value', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: '$%',
            configuration: {
              type: 'Inline',
              spec: {
                configFiles: {
                  store: {
                    spec: {
                      folderPath: 'test',
                      connectorRef: {
                        label: 'test',
                        value: 'test',
                        scope: 'account',

                        connector: { type: 'Git' }
                      }
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
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      store: {
                        spec: {
                          connectorRef: 'test',
                          branch: 'test-brancg',
                          folderPath: 'testfolder'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    const errMsg = getByText('common.validation.provisionerIdentifierPatternIsNotValid')
    expect(errMsg).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should trigger validation error for expression value', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container, getByText, getByPlaceholderText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: '<+service.test.id>',
            configuration: {
              type: 'Inline',
              spec: {
                configFiles: {
                  store: {
                    spec: {
                      folderPath: 'test',
                      connectorRef: {
                        label: 'test',
                        value: 'test',
                        scope: 'account',

                        connector: { type: 'Git' }
                      }
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
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      store: {
                        spec: {
                          connectorRef: 'test',
                          branch: 'test-brancg',
                          folderPath: 'testfolder'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    const input = getByPlaceholderText('<+expression>')
    fireEvent.change(input!, { target: { value: '' } })
    await act(() => ref.current?.submitForm()!)
    const errMsg = getByText('common.validation.provisionerIdentifierIsRequired')
    expect(errMsg).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders remote backend config', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: '<+service.test.id>',
            configuration: {
              type: 'Inline',
              spec: {
                configFiles: {
                  store: {
                    spec: {
                      folderPath: 'test',
                      connectorRef: {
                        label: 'test',
                        value: 'test',
                        scope: 'account',

                        connector: { type: 'Git' }
                      }
                    }
                  }
                },
                varFiles: [
                  {
                    varFile: {
                      type: 'Inline',
                      content: 'test'
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
                        connectorRef: 'jelenaterraformtest'
                      }
                    }
                  }
                }
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
    )

    fireEvent.click(getByText('common.optionalConfig')!)

    expect(getByText('cd.backendConfigurationFile')!).toBeInTheDocument()
    expect(getByText('/test-path')!).toBeInTheDocument()
  })
})
