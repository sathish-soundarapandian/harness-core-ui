/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import * as cdServices from 'services/cd-ng'
import * as Portal from 'services/portal'
import { StoreTypes } from '../../CloudFormationInterfaces.types'

import CreateStackInputStepRef from '../InputSteps/InputStep'

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
      }
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
const rolesMock = {
  'arn:aws:iam::role/Test': 'TestRole',
  'arn:aws:iam::role/AnotherTest': 'AnotherTestRole'
}

const renderComponent = (data: any) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        <FormikForm>
          <CreateStackInputStepRef
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

describe('Test cloudformation create stack input set', () => {
  test('should render with no data', () => {
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          stackName: '',
          connectorRef: '',
          region: '',
          templateFile: {
            type: 'Remote',
            spec: {}
          }
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render with basic data', () => {
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'testID',
        configuration: {
          stackName: 'testName',
          connectorRef: 'testRef',
          region: 'Ireland',
          templateFile: {
            type: 'Remote',
            spec: {}
          }
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render with runtime data', () => {
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: 'testCreate',
      identifier: 'testID',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE,
        configuration: {
          stackName: RUNTIME_INPUT_VALUE,
          connectorRef: 'testRef',
          region: 'Ireland',
          templateFile: {
            type: 'Remote',
            spec: {}
          }
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render with runtime data and make connector api request', () => {
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'id',
        configuration: {
          stackName: 'name',
          connectorRef: RUNTIME_INPUT_VALUE,
          region: 'Ireland',
          templateFile: {
            type: 'Remote',
            spec: {}
          }
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render with runtime data and make region api request', () => {
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
          region: RUNTIME_INPUT_VALUE,
          templateFile: {
            type: 'Remote',
            spec: {}
          }
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render with runtime data and make role api request', () => {
    jest
      .spyOn(cdServices, 'useGetIamRolesForAws')
      .mockReturnValue({ loading: false, error: null, data: rolesMock, refetch: jest.fn() } as any)
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'id',
        configuration: {
          stackName: 'testName',
          connectorRef: 'testRef',
          region: 'Ireland',
          templateFile: {
            type: 'Remote',
            spec: {}
          },
          roleArn: RUNTIME_INPUT_VALUE
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render with runtime data and make capabilities api request', () => {
    jest
      .spyOn(cdServices, 'useCFCapabilitiesForAws')
      .mockReturnValue({ loading: false, error: null, data: rolesMock, refetch: jest.fn() } as any)
    const data = {
      type: StepType.CloudFormationCreateStack,
      name: 'testCreate',
      identifier: 'testID',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'id',
        configuration: {
          stackName: 'testName',
          connectorRef: 'testRef',
          region: 'Ireland',
          templateFile: {
            type: 'Remote',
            spec: {}
          },
          capabilities: RUNTIME_INPUT_VALUE
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })
})
