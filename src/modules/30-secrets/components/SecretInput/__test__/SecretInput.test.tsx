/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, findByText, queryByAttribute, waitFor } from '@testing-library/react'
import { FormikForm, Formik } from '@harness/uicore'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

import secretsListMockData from './secretsListMockData.json'
import mockData from './connectorsListMockdata.json'
import connectorMockData from './getConnectorMock.json'
import secretMockData from './secretMockData.json'

import SecretInput from '../SecretInput'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetConnectorList: () => {
    return {
      data: mockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: connectorMockData,
      refetch: jest.fn()
    }
  },
  useGetSecretV2: () => {
    return {
      data: secretMockData,
      refetch: jest.fn()
    }
  },
  usePutSecret: () => {
    return {
      mutate: jest.fn()
    }
  }
}))

describe('SecretInput', () => {
  test('render and pick a secret', async () => {
    const handleSuccess = jest.fn()

    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="TestWrapper">
          {() => {
            return (
              <FormikForm>
                <SecretInput
                  name="test"
                  label="test"
                  onSuccess={handleSuccess}
                  secretsListMockData={secretsListMockData as any}
                />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(queryByAttribute('data-testid', container, 'test')!)
    })

    const modal = findDialogContainer()

    const secret = await findByText(modal!, 'a1')

    expect(modal).toMatchSnapshot()

    act(() => {
      fireEvent.click(secret)
    })

    const applyBtn = await waitFor(() => findByText(modal!, 'entityReference.apply'))

    act(() => {
      fireEvent.click(applyBtn)
    })

    expect(handleSuccess).toHaveBeenCalled()

    const closeButton = modal?.querySelector('.bp3-dialog-close-button')
    act(() => {
      fireEvent.click(closeButton!)
    })
  })
  test('render and edit secret', async () => {
    const handleSuccess = jest.fn()

    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{ test: { name: 'test', identifier: 'test' } }} onSubmit={noop} formName="testWrapper">
          {() => {
            return (
              <FormikForm>
                <SecretInput
                  name="test"
                  label="test"
                  onSuccess={handleSuccess}
                  secretsListMockData={secretsListMockData as any}
                />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(queryByAttribute('data-testid', container, 'test-edit')!)
    })

    const modal = findDialogContainer()
    const saveBtn = await findByText(modal!, 'save')

    await waitFor(() => expect(modal).toBeTruthy())

    act(() => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => expect(handleSuccess).toHaveBeenCalled())
  })

  test('placeholder text when selection is now allowed', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="TestWrapper">
          {() => {
            return (
              <FormikForm>
                <SecretInput
                  name="test"
                  label="test"
                  allowSelection={false}
                  secretsListMockData={secretsListMockData as any}
                />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )

    const placeHolder = container.querySelector('.containerLinkText')
    expect(placeHolder?.textContent).toEqual('secrets.createSecret')
  })
})
