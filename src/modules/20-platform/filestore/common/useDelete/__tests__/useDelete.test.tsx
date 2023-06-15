/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { FileStoreActionTypes } from '@filestore/utils/constants'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'

import useDelete from '../useDelete'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useDeleteFile: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false }))
}))

jest.useFakeTimers()

const mockContext = getDummyFileStoreContextValue()

function wrapper(props: any): JSX.Element {
  const { children, context = mockContext } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>{children}</FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define useDelete hook', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should call useDelete hook', async () => {
    const { result } = renderHook(() => useDelete('test1', 'test1', 'FILE', false), { wrapper })

    act(() => {
      result.current.onClick()
    })
    expect(Object.keys(result.current).indexOf('onClick')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('identifier')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('actionType')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('label')).not.toBe(-1)
    expect(result.current.actionType).toEqual(FileStoreActionTypes.DELETE_NODE)
    expect(result.current.identifier).toEqual('test1')
    expect(result.current.label).toEqual('delete')
  })
  test('should call useDelete hook not current node', async () => {
    const { result } = renderHook(() => useDelete('SEARCH', 'test1', 'FILE', true), {
      wrapper
    })

    expect(Object.keys(result.current).indexOf('actionType')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('label')).not.toBe(-1)
    expect(result.current.label).toEqual('delete')
    expect(result.current.identifier).toEqual('SEARCH')
  })
  test('should call useDelete hook not current node , search', async () => {
    const contextWrapper = ({ children }: any): JSX.Element => (
      <TestWrapper>
        <FileStoreContext.Provider
          value={{
            ...mockContext,
            currentNode: {
              ...mockContext.currentNode,
              identifier: 'SEARCH'
            }
          }}
        >
          {children}
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    const { result } = renderHook(() => useDelete('test2', 'test1', 'FILE', true), {
      wrapper: contextWrapper
    })

    expect(Object.keys(result.current).indexOf('identifier')).not.toBe(-1)
    expect(result.current.identifier).toEqual('test2')
  })
})
