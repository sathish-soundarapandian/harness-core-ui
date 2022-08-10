/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, act, queryByAttribute, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import * as cdServices from 'services/cd-ng'
import { AzureBlueprintStep } from '../AzureBluePrint'
import { ScopeTypes } from '../AzureBluePrintTypes.types'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
})

describe('Test Cloudformation create stack', () => {
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
      type: StepType.AzureBlueprint,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    })
    const { container } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as new step with data', () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: 'azure blueprint',
      identifier: 'azure_blueprint',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    })
    const { container } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should open remote template modal', async () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: 'azure blueprint',
      identifier: 'azure_blueprint',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    })
    const { container, getByTestId } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        onChange={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    await waitFor(() => expect(getByTestId('azureTemplate')).toBeTruthy())
    userEvent.click(getByTestId('azureTemplate'))

    expect(container).toMatchSnapshot()
  })

  test('should be able to edit inputs', async () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: 'azure blueprint',
      identifier: 'azure_blueprint',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'azure blueprint',
        configuration: {
          connectorRef: '',
          assignmentName: 'test name',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    })
    const { container } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    const stepName = queryByAttribute('name', container, 'name')
    userEvent.type(stepName!, ' new name')
    expect(stepName).toHaveDisplayValue(['azure blueprint new name'])

    const timeout = queryByAttribute('name', container, 'timeout')
    userEvent.clear(timeout!)
    userEvent.type(timeout!, '20m')
    expect(timeout).toHaveDisplayValue('20m')

    const provisionerIdentifier = queryByAttribute('name', container, 'spec.provisionerIdentifier')
    userEvent.clear(provisionerIdentifier!)
    userEvent.type(provisionerIdentifier!, 'newID')
    expect(provisionerIdentifier).toHaveDisplayValue('newID')

    const assignmentName = queryByAttribute('name', container, 'spec.configuration.assignmentName')
    userEvent.clear(assignmentName!)
    userEvent.type(assignmentName!, 'new name')
    expect(assignmentName).toHaveDisplayValue('new name')
  })

  test('should error on submit with invalid data', async () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: '',
      identifier: '',
      timeout: '',
      spec: {
        provisionerIdentifier: '',
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
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)

    const templateFileError = getByText('cd.cloudFormation.errors.templateRequired')
    expect(templateFileError).toBeInTheDocument()

    const connectorError = getByText('pipelineSteps.build.create.connectorRequiredError')
    expect(connectorError).toBeInTheDocument()

    const provIDError = getByText('common.validation.provisionerIdentifierIsRequired')
    expect(provIDError).toBeInTheDocument()

    const timeoutError = getByText('validation.timeout10SecMinimum')
    expect(timeoutError).toBeInTheDocument()

    const nameError = getByText('pipelineSteps.stepNameRequired')
    expect(nameError).toBeInTheDocument()

    const assignmentName = getByText('cd.azureBlueprint.assignmentNameError')
    expect(assignmentName).toBeInTheDocument()
  })

  test('should error on submit with empty harness store', async () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: '',
      identifier: '',
      timeout: '',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: {
            store: {
              type: 'Harness',
              spec: {
                files: ''
              }
            }
          }
        }
      }
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)

    const templateFileError = getByText('cd.cloudFormation.errors.templateRequired')
    expect(templateFileError).toBeInTheDocument()

    const connectorError = getByText('pipelineSteps.build.create.connectorRequiredError')
    expect(connectorError).toBeInTheDocument()

    const provIDError = getByText('common.validation.provisionerIdentifierIsRequired')
    expect(provIDError).toBeInTheDocument()

    const timeoutError = getByText('validation.timeout10SecMinimum')
    expect(timeoutError).toBeInTheDocument()

    const nameError = getByText('pipelineSteps.stepNameRequired')
    expect(nameError).toBeInTheDocument()

    const assignmentName = getByText('cd.azureBlueprint.assignmentNameError')
    expect(assignmentName).toBeInTheDocument()
  })

  test('should be able to submit', async () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: 'azure blueprint',
      identifier: 'azure_blueprint',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'testProv',
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
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)

    expect(container).toMatchSnapshot()
  })

  test('should render runtime components', async () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: 'azure blueprint',
      identifier: 'azure_blueprint',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE,
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
    })
    const { container } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render input view', async () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: 'azure blueprint',
      identifier: 'azure_blueprint',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE,
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
    })
    const { container } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.InputVariable}
        initialValues={initialValues()}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render variable view', async () => {
    const initialValues = () => ({
      type: StepType.AzureBlueprint,
      name: 'azure blueprint',
      identifier: 'azure_blueprint',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE,
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
    })
    const { container } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.AzureBlueprint}
        stepViewType={StepViewType.InputSet}
        initialValues={initialValues()}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
