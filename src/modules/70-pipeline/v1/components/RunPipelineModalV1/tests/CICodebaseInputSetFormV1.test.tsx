/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Form } from 'formik'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { CICodebaseInputSetFormV1 } from '../CICodebaseInputSetFormV1'
import { getCICodebaseInputSetFormInitialValues, getCICodebaseInputSetFormProps, gitConnectorMock } from './mocks'

jest.mock('services/cd-ng', () => ({
  getListOfBranchesByRefConnectorV2Promise: jest.fn(() => Promise.resolve({})),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: gitConnectorMock.data, refetch: jest.fn() }
  })
}))

describe('CICodebaseInputSetFormV1 tests', () => {
  describe('Run Pipeline Form ', () => {
    test('Initial Render', () => {
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={getCICodebaseInputSetFormInitialValues()} onSubmit={jest.fn()}>
            {formik => (
              <Form>
                <CICodebaseInputSetFormV1
                  {...getCICodebaseInputSetFormProps({ formik })}
                  viewType={StepViewType.DeploymentForm}
                />
              </Form>
            )}
          </Formik>
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })

    test('Re-Run Pipeline Render with Connector Repo URL Type', async () => {
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={getCICodebaseInputSetFormInitialValues()} onSubmit={jest.fn()}>
            {formik => (
              <Form>
                <CICodebaseInputSetFormV1
                  {...getCICodebaseInputSetFormProps({ formik })}
                  connectorRef={'githubrepo'}
                  viewType={StepViewType.DeploymentForm}
                />
              </Form>
            )}
          </Formik>
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
