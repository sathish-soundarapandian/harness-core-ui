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

import IACMTerraformPluginInputStep from '../IACMTerraformPluginInputStep'

const initialValues = {
  type: StepType.IACMTerraformPlugin,
  name: 'test name',
  identifier: 'test_identifier',
  timeout: '10m',
  spec: {
    command: 'init'
  }
}

const renderComponent = (data: any, rest?: any) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        <FormikForm>
          <IACMTerraformPluginInputStep
            initialValues={initialValues}
            stepType={StepType.IACMTerraformPlugin}
            stepViewType={StepViewType.InputSet}
            inputSetData={{
              template: data,
              ...rest
            }}
            path="test"
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Test iacm terraform plugin input step', () => {
  test('should render all input variables components', () => {
    const data = {
      type: StepType.IACMTerraformPlugin,
      name: 'test name',
      identifier: 'test_identifier',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        command: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = renderComponent(data, { path: undefined })
    const command = queryByAttribute('name', container, 'spec.command')
    expect(command).toBeInTheDocument()
    const timeout = queryByAttribute('name', container, 'timeout')
    expect(timeout).toBeInTheDocument()
  })

  test('should render all input variables components with inputSetData path', () => {
    const data = {
      type: StepType.IACMTerraformPlugin,
      name: 'test name',
      identifier: 'test_identifier',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        command: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = renderComponent(data, { path: 'testPath' })
    const command = queryByAttribute('name', container, 'testPath.spec.command')
    expect(command).toBeInTheDocument()
    const timeout = queryByAttribute('name', container, 'testPath.timeout')
    expect(timeout).toBeInTheDocument()
  })

  test('timeout should be updated', () => {
    const data = {
      type: StepType.IACMTerraformPlugin,
      name: 'test name',
      identifier: 'test_identifier',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        command: RUNTIME_INPUT_VALUE
      }
    }
    const { getByPlaceholderText } = renderComponent(data)

    const timeout = getByPlaceholderText('Enter w/d/h/m/s/ms')
    userEvent.type(timeout, '10m')
    expect(timeout).toHaveDisplayValue('10m')
  })
})
