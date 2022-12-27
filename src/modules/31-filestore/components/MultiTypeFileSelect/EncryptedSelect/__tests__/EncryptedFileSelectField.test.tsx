/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByAttribute, queryByText, render, waitFor } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import EncryptedFileSelectField from '../EncryptedFileSelectField'

import { mockResponse, mockSecret, mockSecretList } from './mock'

const mockContext = getDummyFileStoreContextValue()

jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { data: mockSecretList, refetch: jest.fn() }
  }),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(mockResponse) })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('EncryptedFileSelectField', () => {
  test('should render EncryptedFileSelectField component', async () => {
    const { container, getAllByText } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <EncryptedFileSelectField name="testname" onChange={jest.fn} value="test_secret" />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const secretRefInput = queryByAttribute('data-testid', container, 'testname')
    act(() => {
      fireEvent.click(secretRefInput!)
    })

    await waitFor(() => queryByText(container, 'common.entityReferenceTitle'))
    const selectSecret = queryByText(document.body, 'common.entityReferenceTitle')
    expect(selectSecret).toBeTruthy()

    const secret = queryByText(document.body, 'selected_secret')
    expect(secret).toBeTruthy()
    act(() => {
      fireEvent.click(secret!)
    })

    const applySelected = queryByText(document.body, 'entityReference.apply')
    act(() => {
      fireEvent.click(applySelected!)
    })

    await waitFor(() => expect(getAllByText('test_secret')[0]).toBeTruthy())
  })
})
