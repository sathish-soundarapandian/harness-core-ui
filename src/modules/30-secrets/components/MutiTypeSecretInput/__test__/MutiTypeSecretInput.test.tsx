/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, findByText, act, waitFor } from '@testing-library/react'
import { FormikForm, Formik } from '@harness/uicore'
import { noop } from 'lodash-es'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

import connectorsListMockData from './connectorsListMockdata.json'
import secretsListMockData from './secretsListMockData.json'
import connectorDetailsMockData from './getConnectorMock.json'

import MutiTypeSecretInput from '../MultiTypeSecretInput'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetConnectorList: () => {
    return {
      data: connectorsListMockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: connectorDetailsMockData,
      refetch: jest.fn()
    }
  }
}))

describe('SecretInput', () => {
  test('render', async () => {
    const handleSuccess = jest.fn()

    const { container, getByText } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="TestWrapper">
          {() => {
            return (
              <FormikForm>
                <MutiTypeSecretInput
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
      fireEvent.click(getByText('createOrSelectSecret'))
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
})
