/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render } from '@testing-library/react'
import { Formik, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import AzureArmInputStep from '../InputSteps'
import {
  useGetAzureResourceGroupsBySubscription,
  useGetAzureSubscriptions,
  useGetLocationsBySubscription,
  useGetManagementGroups
} from '../../__tests__/ApiRequestMocks'
import { ScopeTypes } from '../../AzureArm.types'

const initialValues = {
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
}

const renderComponent = (data: any) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        <FormikForm>
          <AzureArmInputStep
            initialValues={initialValues as any}
            stepType={StepType.CreateAzureARMResource}
            stepViewType={StepViewType.InputSet}
            inputSetData={{
              template: data
            }}
            path={'test'}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Test Azure ARM template input set', () => {
  test('should render with basic info', () => {
    const data = {
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE,
        configuration: {
          connectorRef: RUNTIME_INPUT_VALUE,
          template: {},
          scope: {}
        }
      }
    }
    const { getByText, getByPlaceholderText } = renderComponent(data)
    expect(getByPlaceholderText('Enter w/d/h/m/s/ms')).toBeTruthy()
    expect(getByText('pipelineSteps.provisionerIdentifier')).toBeTruthy()
    expect(getByText('common.azureConnector')).toBeTruthy()
  })

  test('should render with template inputs', () => {
    const data = {
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          scope: {},
          template: {
            store: {
              type: 'Git',
              spec: {
                connectorRef: RUNTIME_INPUT_VALUE,
                repoName: RUNTIME_INPUT_VALUE,
                branch: RUNTIME_INPUT_VALUE,
                commitId: RUNTIME_INPUT_VALUE,
                paths: RUNTIME_INPUT_VALUE
              }
            }
          }
        }
      }
    }
    const { getByText } = renderComponent(data)
    expect(getByText('pipeline.manifestType.gitConnectorLabel connector')).toBeTruthy()
    expect(getByText('pipeline.manifestType.gitConnectorLabel connector')).toBeTruthy()
    expect(getByText('pipelineSteps.deploy.inputSet.branch')).toBeTruthy()
    expect(getByText('pipeline.manifestType.commitId')).toBeTruthy()
    expect(getByText('common.git.filePath')).toBeTruthy()
  })

  test('should render with parameter inputs', () => {
    const data = {
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          scope: {},
          parameters: {
            store: {
              type: 'Git',
              spec: {
                connectorRef: RUNTIME_INPUT_VALUE,
                repoName: RUNTIME_INPUT_VALUE,
                branch: RUNTIME_INPUT_VALUE,
                commitId: RUNTIME_INPUT_VALUE,
                paths: RUNTIME_INPUT_VALUE
              }
            }
          }
        }
      }
    }
    const { getByText } = renderComponent(data)
    expect(getByText('pipeline.manifestType.gitConnectorLabel connector')).toBeTruthy()
    expect(getByText('pipeline.manifestType.gitConnectorLabel connector')).toBeTruthy()
    expect(getByText('pipelineSteps.deploy.inputSet.branch')).toBeTruthy()
    expect(getByText('pipeline.manifestType.commitId')).toBeTruthy()
    expect(getByText('common.git.filePath')).toBeTruthy()
  })

  test('should render with scope resource group inputs', () => {
    useGetAzureSubscriptions()
    useGetAzureResourceGroupsBySubscription()
    const data = {
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
            type: ScopeTypes.ResourceGroup,
            spec: {
              subscription: RUNTIME_INPUT_VALUE,
              resourceGroup: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    }
    const { getByText } = renderComponent(data)
    expect(getByText('common.resourceGroupLabel')).toBeTruthy()
    expect(getByText('common.plans.subscription')).toBeTruthy()
  })

  test('should render with scope management group inputs', () => {
    useGetManagementGroups()
    useGetLocationsBySubscription()
    const data = {
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
    }
    const { getByText } = renderComponent(data)
    expect(getByText('cd.azureArm.location')).toBeTruthy()
    expect(getByText('cd.azureArm.managementGroup')).toBeTruthy()
  })

  test('should render with scope subscription inputs', () => {
    useGetLocationsBySubscription()
    useGetAzureSubscriptions()
    const data = {
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
    }
    const { getByText } = renderComponent(data)
    expect(getByText('cd.azureArm.location')).toBeTruthy()
    expect(getByText('common.plans.subscription')).toBeTruthy()
  })

  test('should render with scope tenant inputs', () => {
    useGetAzureSubscriptions()
    const data = {
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
    }
    const { getByText } = renderComponent(data)
    expect(getByText('cd.azureArm.location')).toBeTruthy()
  })

  test('should render with scope errors', () => {
    useGetAzureSubscriptions(true)
    useGetAzureResourceGroupsBySubscription(true)
    useGetLocationsBySubscription(true)
    useGetManagementGroups(true)
    const data = {
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
    }
    const { getByText } = renderComponent(data)
    expect(getByText('useGetAzureSubscriptions error')).toBeTruthy()
    expect(getByText('useGetAzureResourceGroupsBySubscription error')).toBeTruthy()
    expect(getByText('useGetLocationsBySubscription error')).toBeTruthy()
    expect(getByText('useGetManagementGroups error')).toBeTruthy()
  })

  test('should render harness files', () => {
    const data = {
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          scope: {},
          parameters: {
            store: {
              type: 'Harness',
              spec: {
                files: RUNTIME_INPUT_VALUE
              }
            }
          }
        }
      }
    }
    const { container } = renderComponent(data)
    const toolTipId = queryByAttribute(
      'data-tooltip-id',
      container,
      'wrapperComponentTestForm_test.spec.configuration.parameters.store.spec.files[0]'
    )
    expect(toolTipId).toBeInTheDocument()
  })

  test('should render harness secret files', () => {
    const data = {
      type: StepType.CreateAzureARMResource,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          connectorRef: '',
          scope: {},
          parameters: {
            store: {
              type: 'Harness',
              spec: {
                secretFiles: RUNTIME_INPUT_VALUE
              }
            }
          }
        }
      }
    }
    const { getByText } = renderComponent(data)
    expect(getByText('secrets.secret.configureSecret')).toBeInTheDocument()
  })
})
