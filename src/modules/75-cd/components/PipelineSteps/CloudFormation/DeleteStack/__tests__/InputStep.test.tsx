/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import * as cdServices from 'services/cd-ng'
import * as Portal from 'services/portal'
import { DeleteStackTypes, StoreTypes } from '../../CloudFormationInterfaces.types'

import DeleteStackInputStepRef from '../DeleteStackInputSteps'

const initialValues = {
  type: StepType.CloudFormationDeleteStack,
  name: 'test name',
  identifier: 'test_identifier',
  timeout: '10m',
  spec: {
    configuration: {
      type: DeleteStackTypes.Inline,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE,
        connectorRef: 'test',
        region: RUNTIME_INPUT_VALUE,
        roleArn: RUNTIME_INPUT_VALUE,
        stackName: RUNTIME_INPUT_VALUE
      }
    }
  }
}

const template = (spec: any): any => ({
  identifier: 'test_identifier',
  type: StepType.CloudFormationDeleteStack,
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    configuration: {
      type: StoreTypes.Inline,
      spec
    }
  }
})

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
          <DeleteStackInputStepRef
            initialValues={initialValues as any}
            stepType={StepType.CloudFormationDeleteStack}
            stepViewType={StepViewType.InputSet}
            inputSetData={{
              template: template(data)
            }}
            path="test"
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Test cloudformation delete stack input set', () => {
  beforeAll(() => {
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
  })

  test('should render all input variables components', () => {
    jest
      .spyOn(Portal, 'useListAwsRegions')
      .mockImplementation(() => ({ loading: false, error: null, data: regionMock, refetch: jest.fn() } as any))
    const data = {
      provisionerIdentifier: RUNTIME_INPUT_VALUE,
      connectorRef: RUNTIME_INPUT_VALUE,
      region: RUNTIME_INPUT_VALUE,
      roleArn: RUNTIME_INPUT_VALUE,
      stackName: RUNTIME_INPUT_VALUE
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('timeout should be updated', async () => {
    const data = {}
    const { container, getByPlaceholderText } = renderComponent(data)

    const timeoutInput = getByPlaceholderText('Enter w/d/h/m/s/ms')
    act(async () => {
      await userEvent.type(timeoutInput!, '10m')
    })

    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('10m'))
    expect(container).toMatchSnapshot()
  })

  test('provisionerIdentifier should be updated', async () => {
    const data = {
      provisionerIdentifier: RUNTIME_INPUT_VALUE
    }
    const { container } = renderComponent(data)
    const provId = queryByAttribute('name', container, 'test.spec.configuration.spec.provisionerIdentifier')
    await act(async () => {
      await userEvent.type(provId!, 'testID')
    })
    expect(provId).toHaveDisplayValue('testID')
  })

  test('stack name should be updated', async () => {
    const data = {
      stackName: RUNTIME_INPUT_VALUE
    }
    const { container } = renderComponent(data)

    const stackName = queryByAttribute('name', container, 'test.spec.configuration.spec.stackName')
    await act(async () => {
      await userEvent.type(stackName!, 'testStackName')
    })

    expect(stackName).toHaveDisplayValue('testStackName')
    expect(container).toMatchSnapshot()
  })
})
