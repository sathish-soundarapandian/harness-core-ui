/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, findAllByText, fireEvent, render, waitFor, queryAllByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@harness/uicore'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { SELECT_FILES_TYPE } from '@filestore/utils/constants'
import {
  entityTypeResponseMock,
  fetchedFilterResponseMock,
  rootMock,
  useGetCreatedByListMock
} from '@filestore/pages/filestore/__tests__/mock'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import FileStoreList from '../FileStoreList'

const mockContext = getDummyFileStoreContextValue()

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetFolderNodes: jest.fn().mockImplementation(() => {
    return {
      ...rootMock,
      refetch: jest.fn(),
      error: null,
      loading: false,
      mutate: jest.fn().mockImplementation(() => Promise.resolve(rootMock))
    }
  }),
  useGetCreatedByList: jest.fn().mockImplementation(() => {
    return {
      data: useGetCreatedByListMock,
      loading: false,
      error: null
    }
  }),
  useGetEntityTypes: jest.fn().mockImplementation(() => {
    return {
      data: entityTypeResponseMock
    }
  }),
  setCurrentNodeState: jest.fn(),
  useListFilesWithFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(), loading: false, data: fetchedFilterResponseMock }
  }),
  usePostFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdateFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  fileStoreValue: jest.fn().mockReturnValue('account:/test'),
  prepareFileStoreValue: jest.fn().mockReturnValue('account:/test'),
  getNode: jest.fn(),
  useDownloadFile: jest.fn().mockImplementation(() => ({ data: null })),
  useCreate: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.useFakeTimers({ advanceTimers: true })

describe('FileStoreList', () => {
  test('should render FileStoreList component', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <FileStoreList name="filestorelist" type={SELECT_FILES_TYPE.FILE_STORE} />
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const selectBtn = container.querySelector('span[icon="chevron-down"]')
    expect(selectBtn).toBeDefined()

    if (selectBtn) {
      await act(async () => {
        fireEvent.click(selectBtn)
      })
    }

    const modal = findDialogContainer()
    await waitFor(() => expect(modal).toBeTruthy())
  })

  test('should select file from filestore', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <FileStoreList name="filestorelist" type={SELECT_FILES_TYPE.FILE_STORE} />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const selectBtn = container.querySelector('span[icon="chevron-down"]')
    await act(async () => {
      fireEvent.click(selectBtn!)
    })

    const modal = findDialogContainer()
    await waitFor(() => expect(modal).toBeTruthy())

    const accountTab = await findByText(modal!, 'account')
    act(() => {
      fireEvent.click(accountTab)
    })

    const files = await findAllByText(modal!, 't2confiog')
    //Chose a file
    await act(async () => {
      fireEvent.click(files[0]!)
    })

    const applyBtn = document.body.querySelector('button[aria-label="entityReference.apply"]')
    await userEvent.click(applyBtn!)

    await waitFor(() => expect(getByText('/t2confiog')).toBeInTheDocument())
  })

  test('should add and delete a filestore select field', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <FileStoreList name="filestorelist" type={SELECT_FILES_TYPE.FILE_STORE} />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const addBtn = document.body.querySelector('button[aria-label="plusAdd"]')
    await act(async () => {
      fireEvent.click(addBtn!)
    })

    expect(queryAllByAttribute('data-testid', container, 'file-store-select').length).toBe(2)
    const deleteBtn = container.querySelector('[data-testid="remove-filestorelist-[0]"]')

    await act(async () => {
      fireEvent.click(deleteBtn!)
    })
    expect(queryAllByAttribute('data-testid', container, 'file-store-select').length).toBe(1)
  })
})
