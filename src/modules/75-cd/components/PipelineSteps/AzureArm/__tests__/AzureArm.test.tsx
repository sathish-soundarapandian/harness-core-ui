/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { render, act, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { AzureArmStep } from '../AzureArm'
import {
  useGetAzureResourceGroupsBySubscription,
  useGetAzureSubscriptions,
  useGetConnector,
  useGetLocationsBySubscription,
  useGetManagementGroups
} from './ApiRequestMocks'
import { ScopeTypes } from '../AzureArm.types'
import metaData from '../VariableView/__tests__/MetaDataMap'
import variablesData from '../VariableView/__tests__/VariablesData'

describe('Test Azure ARM step', () => {
  beforeEach(() => {
    factory.registerStep(new AzureArmStep())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render azure arm step', () => {
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          template: {},
          scope: {
            type: 'ResourceGroup',
            spec: {
              subscription: '',
              resourceGroup: '',
              mode: ''
            }
          }
        }
      }
    })
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    const timeoutLabel = getByText('pipelineSteps.timeoutLabel')
    expect(timeoutLabel).toBeInTheDocument()
    const provisionerIdentifier = getByText('pipelineSteps.provisionerIdentifier')
    expect(provisionerIdentifier).toBeInTheDocument()
    const azureConnector = getByText('common.azureConnector')
    expect(azureConnector).toBeInTheDocument()
    const templateFile = getByText('cd.azureArm.templateFile')
    expect(templateFile).toBeInTheDocument()
    const specifyParameterFile = getByText('cd.azureArm.specifyParameterFile')
    expect(specifyParameterFile).toBeInTheDocument()
  })

  test('should fail to submit', async () => {
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          template: {},
          scope: {
            type: 'ResourceGroup',
            spec: {
              subscription: '',
              resourceGroup: '',
              mode: ''
            }
          }
        }
      }
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { getByText, getAllByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(getByText('pipelineSteps.stepNameRequired')).toBeTruthy()
    expect(getByText('common.validation.provisionerIdentifierIsRequired')).toBeTruthy()
    expect(getByText('pipelineSteps.build.create.connectorRequiredError')).toBeTruthy()
    expect(getByText('cd.azureArm.specifyTemplateFile')).toBeTruthy()
    expect(getAllByText('cd.azureArm.required').length).toEqual(3)
  })

  test('should be able to edit inputs', async () => {
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          template: {},
          scope: {
            type: 'ResourceGroup',
            spec: {
              subscription: '',
              resourceGroup: '',
              mode: ''
            }
          }
        }
      }
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByPlaceholderText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
        ref={ref}
      />
    )
    const provId = queryByAttribute('name', container, 'spec.provisionerIdentifier')
    userEvent.click(provId!)
    userEvent.type(provId!, 'testingProvId')
    expect(provId).toHaveDisplayValue('testingProvId')

    const name = queryByAttribute('name', container, 'name')
    userEvent.click(name!)
    userEvent.type(name!, 'test_name')
    expect(name).toHaveDisplayValue('test_name')

    const timeout = getByPlaceholderText('Enter w/d/h/m/s/ms')
    userEvent.clear(timeout)
    userEvent.type(timeout, '15m')
    expect(timeout).toHaveDisplayValue('15m')
  })

  test('should be able to render template/parameter files', async () => {
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          template: {
            store: {
              type: 'Github',
              spec: {
                connectorRef: RUNTIME_INPUT_VALUE,
                gitFetchType: 'Branch',
                paths: ['test/file/path'],
                branch: 'branch'
              }
            }
          },
          parameters: {
            store: {
              type: 'Github',
              spec: {
                connectorRef: RUNTIME_INPUT_VALUE,
                gitFetchType: 'Branch',
                paths: ['parameter/file/path'],
                branch: 'branch'
              }
            }
          },
          scope: {
            type: 'ResourceGroup',
            spec: {
              subscription: '',
              resourceGroup: '',
              mode: ''
            }
          }
        }
      }
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
        ref={ref}
      />
    )
    const templateFilePath = getByText('test/file/path')
    expect(templateFilePath).toBeInTheDocument()

    const parameterFilePath = getByText('parameter/file/path')
    expect(parameterFilePath).toBeInTheDocument()
  })

  test('should be able to render template/parameter harness files', async () => {
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          template: {
            store: {
              type: 'Harness',
              spec: {
                files: ['account:/templateTestFile']
              }
            }
          },
          parameters: {
            store: {
              type: 'Harness',
              spec: {
                files: ['account:/parameterTestFile']
              }
            }
          },
          scope: {
            type: 'ResourceGroup',
            spec: {
              subscription: '',
              resourceGroup: '',
              mode: ''
            }
          }
        }
      }
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
        ref={ref}
      />
    )
    const templateFilePath = getByText('account:/templateTestFile')
    expect(templateFilePath).toBeInTheDocument()

    const parameterFilePath = getByText('account:/parameterTestFile')
    expect(parameterFilePath).toBeInTheDocument()
  })

  test('should be able to render template/parameter harness secret files', async () => {
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          template: {
            store: {
              type: 'Harness',
              spec: {
                secretFiles: ['account:/templateSecretFile']
              }
            }
          },
          parameters: {
            store: {
              type: 'Harness',
              spec: {
                secretFiles: ['account:/parameterSecretFile']
              }
            }
          },
          scope: {
            type: 'ResourceGroup',
            spec: {
              subscription: '',
              resourceGroup: '',
              mode: ''
            }
          }
        }
      }
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
        ref={ref}
      />
    )
    const templateFilePath = getByText('account:/templateSecretFile')
    expect(templateFilePath).toBeInTheDocument()

    const parameterFilePath = getByText('account:/parameterSecretFile')
    expect(parameterFilePath).toBeInTheDocument()
  })

  test('should render with scope resource group inputs', () => {
    useGetConnector()
    useGetAzureSubscriptions()
    useGetAzureResourceGroupsBySubscription()
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '<+input>',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: 'testRef',
          parameters: {},
          scope: {
            type: ScopeTypes.ResourceGroup,
            spec: {
              subscription: RUNTIME_INPUT_VALUE,
              resourceGroup: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    })
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    expect(getByText('common.resourceGroupLabel')).toBeTruthy()
    expect(getByText('common.plans.subscription')).toBeTruthy()
  })

  test('should render with scope management group inputs', () => {
    useGetConnector()
    useGetManagementGroups()
    useGetLocationsBySubscription()
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: 'testRef',
          parameters: {},
          scope: {
            type: ScopeTypes.ManagementGroup,
            spec: {
              managementGroupId: RUNTIME_INPUT_VALUE,
              location: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    })
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    expect(getByText('cd.azureArm.location')).toBeTruthy()
    expect(getByText('cd.azureArm.managementGroup')).toBeTruthy()
  })

  test('should render with scope subscription inputs', () => {
    useGetConnector()
    useGetLocationsBySubscription()
    useGetAzureSubscriptions()
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: 'testRef',
          parameters: {},
          scope: {
            type: ScopeTypes.Subscription,
            spec: {
              subscription: RUNTIME_INPUT_VALUE,
              location: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    })
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    expect(getByText('cd.azureArm.location')).toBeTruthy()
    expect(getByText('common.plans.subscription')).toBeTruthy()
  })

  test('should render with scope tenant inputs', () => {
    useGetConnector()
    useGetAzureSubscriptions()
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: 'testRef',
          parameters: {},
          scope: {
            type: ScopeTypes.Tenant,
            spec: {
              location: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    })
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.Edit}
        initialValues={initialValues()}
      />
    )
    expect(getByText('cd.azureArm.location')).toBeTruthy()
  })

  test('should render with input set', () => {
    const initialValues = () => ({
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: 'testRef',
          parameters: {},
          scope: {
            type: ScopeTypes.Tenant,
            spec: {
              location: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    })
    const { getByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.InputSet}
        initialValues={initialValues()}
      />
    )
    const inputPageSubmit = getByText('Submit')
    expect(inputPageSubmit).toBeInTheDocument()
  })

  test('should render with variable inputs', () => {
    const { getByText, getAllByText } = render(
      <TestStepWidget
        onUpdate={jest.fn()}
        type={StepType.CreateAzureARMResource}
        stepViewType={StepViewType.InputVariable}
        initialValues={{
          type: 'AzureCreateARMResource',
          name: 'arm',
          identifier: 'arm',
          spec: {
            provisionerIdentifier: 'arm',
            configuration: {
              connectorRef: 'account.TestAzure',
              template: {
                store: {
                  type: 'Git',
                  spec: {
                    connectorRef: 'account.git9march',
                    gitFetchType: 'Branch',
                    branch: 'main',
                    paths: ['test/path']
                  }
                }
              },
              scope: {
                type: 'ResourceGroup',
                spec: {
                  subscription: '<+input>',
                  resourceGroup: '<+input>',
                  mode: 'Complete'
                }
              },
              parameters: {
                store: {
                  type: 'Github',
                  spec: {
                    connectorRef: 'account.vikyathGithub',
                    gitFetchType: 'Branch',
                    branch: 'main',
                    paths: ['param/path']
                  }
                }
              }
            }
          },
          timeout: '10m'
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: metaData,
          variablesData: variablesData
        }}
      />
    )

    const azureRef = getByText('account.TestAzure')
    expect(azureRef).toBeInTheDocument()

    const gitRef = getByText('account.TestAzure')
    expect(gitRef).toBeInTheDocument()

    const githubRef = getByText('account.vikyathGithub')
    expect(githubRef).toBeInTheDocument()

    const branchName = getAllByText('main')
    expect(branchName.length).toEqual(2)

    const paramPath = getByText('param/path')
    expect(paramPath).toBeInTheDocument()

    const templatePath = getByText('test/path')
    expect(templatePath).toBeInTheDocument()
  })
})
