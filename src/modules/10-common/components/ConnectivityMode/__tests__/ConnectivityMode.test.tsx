/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Form } from 'formik'
import { render } from '@testing-library/react'
import { Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import ConnectivityMode, { ConnectivityModeForm, ConnectivityModeType } from '../ConnectivityMode'

describe('Test ConnectivityMode', () => {
  test('should render default state for ConnectivityMode', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik<ConnectivityModeForm>
          formName="test-form"
          initialValues={{ connectivityMode: undefined }}
          onSubmit={jest.fn()}
        >
          {formik => (
            <Form>
              <ConnectivityMode onChange={jest.fn()} formik={formik} />
            </Form>
          )}
        </Formik>
      </TestWrapper>
    )
    expect(getByText('common.connectThroughPlatform')).not.toBeNull()
    expect(getByText('common.connectThroughDelegateInfo')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('should render manager state for ConnectivityMode', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik<ConnectivityModeForm>
          formName="test-form"
          initialValues={{ connectivityMode: ConnectivityModeType.Manager }}
          onSubmit={jest.fn()}
        >
          {formik => (
            <Form>
              <ConnectivityMode onChange={jest.fn()} formik={formik} />
            </Form>
          )}
        </Formik>
      </TestWrapper>
    )
    expect(getByText('common.connectThroughPlatform')).not.toBeNull()

    expect(getByText('Change')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('should render delegate state for ConnectivityMode', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik<ConnectivityModeForm>
          formName="test-form"
          initialValues={{ connectivityMode: ConnectivityModeType.Delegate }}
          onSubmit={jest.fn()}
        >
          {formik => (
            <Form>
              <ConnectivityMode onChange={jest.fn()} formik={formik} />
            </Form>
          )}
        </Formik>
      </TestWrapper>
    )
    expect(getByText('common.connectThroughDelegate')).not.toBeNull()
    expect(getByText('common.connectThroughDelegateInfo')).not.toBeNull()

    expect(getByText('Change')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })
})
