/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ScopeTypes } from '../../AzureBlueprintTypes.types'

import AzureBlueprintInputStep from '../InputSteps'

const initialValues = {
  type: StepType.AzureBlueprint,
  name: 'test name',
  identifier: 'test_identifier',
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

const renderComponent = (data: any) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        <FormikForm>
          <AzureBlueprintInputStep
            initialValues={initialValues as any}
            stepType={StepType.AzureBlueprint}
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

describe('Test Azure Blueprint template input set', () => {
  test('should render with no data', () => {
    const data = {
      type: StepType.AzureBlueprint,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: '',
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: undefined
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render with timeout data', () => {
    const data = {
      type: StepType.AzureBlueprint,
      name: 'testCreate',
      identifier: 'testID',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        configuration: {
          connectorRef: 'testRef',
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    }
    const { getByPlaceholderText } = renderComponent(data)
    expect(getByPlaceholderText('Enter w/d/h/m/s/ms')).toBeTruthy()
  })

  test('should edit timeout data', async () => {
    const data = {
      type: StepType.AzureBlueprint,
      name: 'testCreate',
      identifier: 'testID',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        configuration: {
          connectorRef: '',
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    }
    const { getByPlaceholderText } = renderComponent(data)

    const timeout = getByPlaceholderText('Enter w/d/h/m/s/ms')
    await act(() => userEvent.type(timeout, '10m'))
    await expect(timeout).toHaveDisplayValue('10m')
  })

  test('should render with connectorRef data and make connector api request', () => {
    const data = {
      type: StepType.AzureBlueprint,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: RUNTIME_INPUT_VALUE,
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    }
    const { getByTestId } = renderComponent(data)
    expect(getByTestId('cr-field-test.spec.configuration.connectorRef')).toBeTruthy()
  })

  test('should render with assignmentName data', async () => {
    const data = {
      type: StepType.AzureBlueprint,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: '',
          assignmentName: RUNTIME_INPUT_VALUE,
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    }
    const { container } = renderComponent(data)
    expect(queryByAttribute('name', container, 'test.spec.configuration.assignmentName')).toBeTruthy()
  })

  test('should render and edit assignmentName data', async () => {
    const data = {
      type: StepType.AzureBlueprint,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: '',
          assignmentName: RUNTIME_INPUT_VALUE,
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    }
    const { container } = renderComponent(data)

    const assignmentName = queryByAttribute('name', container, 'test.spec.configuration.assignmentName')
    await act(() => userEvent.type(assignmentName!, 'test name'))
    await expect(assignmentName).toHaveDisplayValue('test name')
  })

  test('should render template data', async () => {
    const data = {
      type: StepType.AzureBlueprint,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: '',
          assignmentName: '',
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
    const { getByText } = renderComponent(data)

    const header = getByText('cd.cloudFormation.templateFile')
    expect(header).toBeInTheDocument()

    const gitConnectorRef = getByText('common.repo_provider.githubLabel connector')
    expect(gitConnectorRef).toBeInTheDocument()

    const branch = getByText('pipelineSteps.deploy.inputSet.branch')
    expect(branch).toBeInTheDocument()
  })
})
