/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, fireEvent } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'

import { FileStoreNodeTypes } from '@filestore/interfaces/FileStore'
import { FileStore } from '@filestore/pages/filestore/FileStorePage'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'

import {
  rootMock,
  useGetCreatedByListMock,
  entityTypeResponseMock,
  fetchedFilterResponseMock
} from '@filestore/pages/filestore/__tests__/mock'

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

function WrapperComponent(props: any): JSX.Element {
  const { contextProps, children } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={{ ...getDummyFileStoreContextValue(), ...contextProps }} {...props}>
        <FileStore onNodeChange={jest.fn()}>{children}</FileStore>
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define useUpload hook', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should call useUpload hook, with upload new file', async () => {
    const { findByTestId } = render(<WrapperComponent />)
    const btn = await findByTestId('newFileButton')
    const inputUpload = document.body.querySelectorAll('[name="file"]')[0]
    act(() => {
      fireEvent.click(btn)
    })
    const options = document.body.querySelectorAll('.bp3-menu-item')[2] as HTMLElement

    act(() => {
      fireEvent.click(options)
    })
    const file = new File(['dummy content'], 'test.txt', {
      type: 'plain/text'
    })
    act(() => {
      fireEvent.change(inputUpload, { target: { files: [file] } })
    })
    expect(inputUpload).toBeInTheDocument()
  })
  test('should call useUpload hook, with upload new file, current node folder type', async () => {
    const { findAllByTestId } = render(
      <WrapperComponent
        contextProps={{
          currentNode: {
            ...mockContext.currentNode,
            type: FileStoreNodeTypes.FOLDER,
            children: []
          }
        }}
      />
    )
    const btn = await findAllByTestId('newFileButton')
    const inputUpload = document.body.querySelectorAll('[name="file"]')[0]
    act(() => {
      fireEvent.click(btn[0])
    })
    const options = document.body.querySelectorAll('.bp3-menu-item')[2] as HTMLElement

    act(() => {
      fireEvent.click(options)
    })
    const file = new File(['dummy content'], 'test.txt', {
      type: 'plain/text'
    })
    await act(async () => {
      fireEvent.change(inputUpload, { target: { files: [file] } })
    })
    expect(inputUpload).toBeInTheDocument()
  })
})
