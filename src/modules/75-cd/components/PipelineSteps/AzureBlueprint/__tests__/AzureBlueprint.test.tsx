/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, act, queryByAttribute } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import * as cdServices from 'services/cd-ng'
import { AzureBlueprintStep } from '../AzureBlueprint'
import { ScopeTypes } from '../AzureBlueprintTypes.types'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const renderComponent = (props: any, stepViewType = StepViewType.Edit) => {
  return render(
    <TestStepWidget onUpdate={jest.fn()} type={StepType.AzureBlueprint} stepViewType={stepViewType} {...props} />
  )
}

describe('Test Azure Blueprint step', () => {
  beforeEach(() => {
    factory.registerStep(new AzureBlueprintStep())
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render azure blueprint view as new step', () => {
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: '',
        identifier: '',
        timeout: '10m',
        spec: {
          configuration: {
            connectorRef: '',
            assignmentName: '',
            scope: ScopeTypes.Subscription,
            template: {}
          }
        }
      }
    })
    const { container } = renderComponent(initialValues())
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as new step with data', () => {
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: '10m',
        spec: {
          configuration: {
            connectorRef: '',
            assignmentName: 'testName',
            scope: ScopeTypes.Subscription,
            template: {}
          }
        }
      }
    })
    const { getByText, getByPlaceholderText, getByDisplayValue } = renderComponent(initialValues())

    const name = getByText('azure_blueprint')
    expect(name).toBeInTheDocument()

    const assignmentName = getByDisplayValue('testName')
    expect(assignmentName).toBeInTheDocument()

    const timeout = getByPlaceholderText('Enter w/d/h/m/s/ms')
    expect(timeout).toHaveDisplayValue('10m')
  })

  test('should open remote template modal', async () => {
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: '',
        identifier: '',
        timeout: '10m',
        spec: {
          configuration: {
            connectorRef: '',
            assignmentName: '',
            scope: ScopeTypes.Subscription,
            template: {}
          }
        }
      }
    })
    const { getByTestId, getByText } = renderComponent(initialValues())
    const scriptWizard = getByTestId('azureBlueprintFileStore')
    userEvent.click(scriptWizard)

    const gitlab = getByText('GitLab')
    expect(gitlab).toBeInTheDocument()

    const bitbucket = getByText('Bitbucket')
    expect(bitbucket).toBeInTheDocument()

    const harness = getByText('Harness')
    expect(harness).toBeInTheDocument()

    const github = getByText('Github')
    expect(github).toBeInTheDocument()

    const git = getByText('Git')
    expect(git).toBeInTheDocument()
  })

  test('should be able to edit inputs', async () => {
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: '10m',
        spec: {
          configuration: {
            connectorRef: '',
            assignmentName: 'test name',
            scope: ScopeTypes.Subscription,
            template: {}
          }
        }
      }
    })
    const { container } = renderComponent(initialValues())
    const stepName = queryByAttribute('name', container, 'name')
    userEvent.type(stepName!, ' new name')
    expect(stepName).toHaveDisplayValue(['azure blueprint new name'])

    const timeout = queryByAttribute('name', container, 'timeout')
    userEvent.clear(timeout!)
    userEvent.type(timeout!, '20m')
    expect(timeout).toHaveDisplayValue('20m')

    const assignmentName = queryByAttribute('name', container, 'spec.configuration.assignmentName')
    userEvent.clear(assignmentName!)
    userEvent.type(assignmentName!, 'new name')
    expect(assignmentName).toHaveDisplayValue('new name')
  })

  test('should error on submit with invalid data', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: '',
        identifier: '',
        timeout: '',
        spec: {
          configuration: {
            connectorRef: '',
            assignmentName: '',
            scope: ScopeTypes.Subscription,
            template: {
              store: {
                spec: {
                  connectorRef: ''
                }
              }
            }
          }
        }
      },
      ref: ref
    })

    const { getByText } = renderComponent(initialValues())
    await act(() => ref.current?.submitForm()!)

    const templateFileError = getByText('cd.cloudFormation.errors.templateRequired')
    expect(templateFileError).toBeInTheDocument()

    const connectorError = getByText('pipelineSteps.build.create.connectorRequiredError')
    expect(connectorError).toBeInTheDocument()

    const timeoutError = getByText('validation.timeout10SecMinimum')
    expect(timeoutError).toBeInTheDocument()

    const nameError = getByText('pipelineSteps.stepNameRequired')
    expect(nameError).toBeInTheDocument()

    const assignmentName = getByText('cd.azureBlueprint.assignmentNameError')
    expect(assignmentName).toBeInTheDocument()
  })

  test('should submit with harness store', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: '10m',
        spec: {
          configuration: {
            connectorRef: RUNTIME_INPUT_VALUE,
            assignmentName: 'testName',
            scope: ScopeTypes.Subscription,
            template: {
              store: {
                type: 'Harness',
                spec: {
                  files: 'account:testFile'
                }
              }
            }
          }
        }
      },
      ref: ref,
      onUpdate: onUpdate,
      onChange: onChange
    })
    renderComponent(initialValues())
    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalled()
  })

  test('should submit with secret files harness store', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: '10m',
        spec: {
          configuration: {
            connectorRef: RUNTIME_INPUT_VALUE,
            assignmentName: 'testName',
            scope: ScopeTypes.Subscription,
            template: {
              store: {
                type: 'Harness',
                spec: {
                  secretFiles: 'account:testFile'
                }
              }
            }
          }
        }
      },
      ref: ref,
      onUpdate: onUpdate,
      onChange: onChange
    })
    renderComponent(initialValues())
    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalled()
  })

  test('should be able to submit', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: '10m',
        spec: {
          configuration: {
            connectorRef: RUNTIME_INPUT_VALUE,
            assignmentName: 'testName',
            scope: ScopeTypes.Subscription,
            template: {
              store: {
                type: 'Github',
                spec: {
                  gitFetchType: 'Branch',
                  connectorRef: 'repoRef',
                  branch: 'main',
                  path: ['test/file/path']
                }
              }
            }
          }
        }
      },
      ref: ref,
      onUpdate: onUpdate,
      onChange: onChange
    })
    renderComponent(initialValues())
    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalled()
  })

  test('should render runtime components', async () => {
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          configuration: {
            connectorRef: RUNTIME_INPUT_VALUE,
            assignmentName: RUNTIME_INPUT_VALUE,
            scope: ScopeTypes.Subscription,
            template: {
              store: {
                type: 'Github',
                spec: {
                  gitFetchType: 'Branch',
                  connectorRef: RUNTIME_INPUT_VALUE,
                  branch: RUNTIME_INPUT_VALUE,
                  path: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    })
    const { container } = renderComponent(initialValues())

    const assignmentName = queryByAttribute('name', container, 'spec.configuration.assignmentName')
    expect(assignmentName).toHaveDisplayValue(RUNTIME_INPUT_VALUE)

    const connectorRef = queryByAttribute('name', container, 'spec.configuration.connectorRef')
    expect(connectorRef).toHaveDisplayValue(RUNTIME_INPUT_VALUE)

    const timeout = queryByAttribute('name', container, 'timeout')
    expect(timeout).toHaveDisplayValue(RUNTIME_INPUT_VALUE)
  })

  test('should render input view', async () => {
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          configuration: {
            connectorRef: RUNTIME_INPUT_VALUE,
            assignmentName: RUNTIME_INPUT_VALUE,
            scope: ScopeTypes.Subscription,
            template: {
              store: {
                type: 'Github',
                spec: {
                  gitFetchType: 'Branch',
                  connectorRef: RUNTIME_INPUT_VALUE,
                  branch: RUNTIME_INPUT_VALUE,
                  path: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    })
    const { container } = renderComponent(initialValues(), StepViewType.InputSet)
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', async () => {
    const initialValues = () => ({
      initialValues: {
        type: StepType.AzureBlueprint,
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          configuration: {
            connectorRef: RUNTIME_INPUT_VALUE,
            assignmentName: RUNTIME_INPUT_VALUE,
            scope: ScopeTypes.Subscription,
            template: {
              store: {
                type: 'Github',
                spec: {
                  gitFetchType: 'Branch',
                  connectorRef: RUNTIME_INPUT_VALUE,
                  branch: RUNTIME_INPUT_VALUE,
                  path: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    })
    const { container } = renderComponent(initialValues(), StepViewType.InputVariable)
    expect(container).toMatchSnapshot()
  })
})
