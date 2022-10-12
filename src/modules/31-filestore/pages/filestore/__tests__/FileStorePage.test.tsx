/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, queryByText } from '@testing-library/react'

import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { FileUsage } from '@filestore/interfaces/FileStore'

import { TestWrapper } from '@common/utils/testUtils'
import { rootMock, useGetCreatedByListMock, entityTypeResponseMock, fetchedFilterResponseMock } from './mock'
import { getDummyFileStoreContextValue } from './context-mock'

import FileStorePage, { FileStore } from '../FileStorePage'

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

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { contextProps } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={{ ...getDummyFileStoreContextValue(), ...contextProps }} {...props}>
        <FileStore onNodeChange={jest.fn()} />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define file store component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  const fsContext = getDummyFileStoreContextValue()

  test('should render filters', async () => {
    const { container } = render(<WrapperComponent isModalView={false} />)
    expect(container).toBeTruthy()

    const filterBtn = container.querySelector('[id="ngfilterbtn"]') as HTMLButtonElement
    await act(() => {
      fireEvent.click(filterBtn!)
    })
    const f1 = queryByText(document.body, 'f1')
    act(() => {
      fireEvent.click(f1!)
    })
    const resetBtn = queryByText(document.body, 'filters.clearAll')
    act(() => {
      fireEvent.click(resetBtn!)
    })
  })
  test('Define filter and reset', async () => {
    const { container } = render(
      <WrapperComponent
        contextProps={{
          isModalView: true,
          isCachedNode: jest.fn().mockReturnValue(true),
          tempNodes: [fsContext.currentNode]
        }}
      />
    )

    expect(container).toBeTruthy()
  })
  test('Should define loading spinner', async () => {
    const { container } = render(
      <WrapperComponent
        contextProps={{
          isModalView: true,
          isCachedNode: jest.fn().mockReturnValue(false),
          unsavedNodes: [fsContext.currentNode]
        }}
      />
    )
    const loadingSpinner = container.querySelector('[data-icon="steps-spinner"]')
    expect(loadingSpinner).toBeFalsy()
  })
})

describe('Define file store page', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('Define file store page', async () => {
    const { container } = render(
      <TestWrapper>
        <FileStorePage
          onNodeChange={jest.fn()}
          isModalView={false}
          handleSetIsUnsaved={() => null}
          fileUsage={FileUsage.MANIFEST_FILE}
        />
      </TestWrapper>
    )
    const filterBtn = container.querySelector('[id="ngfilterbtn"]') as HTMLButtonElement
    await act(() => {
      fireEvent.click(filterBtn!)
    })
    const newFilter = queryByText(document.body, 'f2')
    expect(newFilter).toBeFalsy()
  })
})
