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
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import * as Portal from 'services/portal'

import ParameterFileInputs from '../ParameterInputs'

const initialValues = {
  type: StepType.CloudFormationCreateStack,
  name: 'test name',
  identifier: 'test_identifier',
  timeout: '10m',
  spec: {
    provisionerIdentifier: 'test',
    configuration: {
      stackName: 'testName',
      connectorRef: 'test_ref',
      region: 'test region',
      templateFile: {
        type: 'Remote',
        spec: {}
      },
      parameters: []
    }
  }
}

const regionMock = {
  resource: [
    {
      name: 'GovCloud (US-West)',
      value: 'us-gov-west-1'
    },
    {
      name: 'GovCloud (US-East)',
      value: 'us-gov-east-1'
    }
  ]
}

const renderComponent = (data: any) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        <FormikForm>
          <ParameterFileInputs
            initialValues={initialValues as any}
            stepType={StepType.CloudFormationCreateStack}
            stepViewType={StepViewType.InputSet}
            inputSetData={{
              template: data
            }}
            path="test"
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Test cloudformation create stack parameters input set', () => {
  test('should render remote parameters with region request', async () => {
    jest
      .spyOn(Portal, 'useListAwsRegions')
      .mockImplementation(() => ({ loading: false, error: null, data: regionMock, refetch: jest.fn() } as any))
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'id',
        configuration: {
          stackName: 'name',
          connectorRef: 'testRef',
          templateFile: {
            type: 'Remote',
            spec: {}
          },
          parameters: [
            {
              store: {
                type: 'S3Url',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  urls: RUNTIME_INPUT_VALUE,
                  region: RUNTIME_INPUT_VALUE
                }
              }
            }
          ]
        }
      }
    }
    const { container, getByPlaceholderText, getByText } = renderComponent(data)
    const input = getByPlaceholderText('pipeline.regionPlaceholder')
    userEvent.click(input)

    const label = getByText('GovCloud (US-West)')
    userEvent.click(label)

    expect(input).toHaveValue('GovCloud (US-West)')
    expect(container).toMatchSnapshot()
  })

  test('should render remote parameters add/remove new url path', async () => {
    jest
      .spyOn(Portal, 'useListAwsRegions')
      .mockImplementation(() => ({ loading: false, error: null, data: regionMock, refetch: jest.fn() } as any))
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'id',
        configuration: {
          stackName: 'name',
          connectorRef: 'testRef',
          templateFile: {
            type: 'Remote',
            spec: {}
          },
          parameters: [
            {
              store: {
                type: 'S3Url',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  urls: RUNTIME_INPUT_VALUE,
                  region: RUNTIME_INPUT_VALUE
                }
              }
            }
          ]
        }
      }
    }
    const { container, getByText, getByTestId } = renderComponent(data)
    const addLabel = getByText('cd.addTFVarFileLabel')
    userEvent.click(addLabel)

    const input = queryByAttribute('name', container, 'test.spec.configuration.parameters[0].store.spec.urls[0]')
    userEvent.type(input!, 'test')
    expect(input).toHaveValue('test')

    const removeLabel = getByTestId('remove-header-0')
    userEvent.click(removeLabel)
    expect(input).toHaveValue('')
    expect(container).toMatchSnapshot()
  })

  test('should render remote parameters with github params', async () => {
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'id',
        configuration: {
          stackName: 'name',
          connectorRef: 'testRef',
          templateFile: {
            type: 'Remote',
            spec: {}
          },
          parameters: [
            {
              store: {
                type: 'Github',
                spec: {
                  connectorRef: 'testRef',
                  repoName: RUNTIME_INPUT_VALUE,
                  commitId: RUNTIME_INPUT_VALUE,
                  branch: RUNTIME_INPUT_VALUE,
                  paths: RUNTIME_INPUT_VALUE
                }
              }
            }
          ]
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })
})
