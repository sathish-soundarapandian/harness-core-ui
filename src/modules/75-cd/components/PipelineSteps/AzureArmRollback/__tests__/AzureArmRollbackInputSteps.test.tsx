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

import AzureArmRollbackInputSteps from '../AzureArmRollbackInputSteps'

const initialValues = {
  type: StepType.AzureArmRollback,
  name: 'test name',
  identifier: 'test_identifier',
  timeout: '10m',
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE
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
          <AzureArmRollbackInputSteps
            initialValues={initialValues as any}
            stepType={StepType.AzureArmRollback}
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

describe('Test azure arm rollback input step', () => {
  test('should render all input variables components', () => {
    const data = {
      type: StepType.AzureArmRollback,
      name: 'test name',
      identifier: 'test_identifier',
      timeout: '10m',
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = renderComponent(data)
    const provId = queryByAttribute('name', container, 'test.spec.provisionerIdentifier')
    expect(provId).toBeInTheDocument()
  })

  test('timeout should be updated', () => {
    const data = {
      type: StepType.AzureArmRollback,
      name: 'test name',
      identifier: 'test_identifier',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE
      }
    }
    const { getByPlaceholderText } = renderComponent(data)

    const timeout = getByPlaceholderText('Enter w/d/h/m/s/ms')
    userEvent.type(timeout, '10m')
    expect(timeout).toHaveDisplayValue('10m')
  })

  test('provisionerIdentifier should be updated', () => {
    const data = {
      type: StepType.AzureArmRollback,
      name: 'test name',
      identifier: 'test_identifier',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = renderComponent(data)
    const provId = queryByAttribute('name', container, 'test.spec.provisionerIdentifier')
    userEvent.type(provId!, 'testID')
    expect(provId).toHaveDisplayValue('testID')
  })
})
