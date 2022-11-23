/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreNodeTypes } from '@filestore/interfaces/FileStore'
import { FileStoreActionTypes } from '@filestore/utils/constants'

import useNewNodeModal from '../useNewNodeModal'

const mockContext = getDummyFileStoreContextValue()

const defaultProps = {
  type: FileStoreNodeTypes.FILE,
  editMode: false,
  fileStoreContext: mockContext,
  notCurrentNode: true,
  parentIdentifier: 'Root',
  currentNode: mockContext.currentNode
}

function wrapper(props: any): JSX.Element {
  const { children } = props || {}
  return <TestWrapper>{children}</TestWrapper>
}

describe('Define useNewNodeModal hook', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should call useNewNodeModal hook, with file type', async () => {
    const { result } = renderHook(() => useNewNodeModal(defaultProps), { wrapper })

    expect(Object.keys(result.current).indexOf('onClick')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('identifier')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('actionType')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('label')).not.toBe(-1)

    expect(result.current.label).toEqual('filestore.newFile')
    expect(result.current.actionType).toEqual(FileStoreActionTypes.CREATE_NODE)
    expect(result.current.identifier).toEqual('Root')
  })
  test('should call useNewNodeModal hook, with folder type', async () => {
    const { result } = renderHook(() => useNewNodeModal({ ...defaultProps, type: FileStoreNodeTypes.FOLDER }), {
      wrapper
    })

    act(() => {
      result.current.onClick()
    })

    expect(result.current.label).toEqual('filestore.newFolder')
    expect(result.current.actionType).toEqual(FileStoreActionTypes.CREATE_NODE)
    expect(result.current.identifier).toEqual('Root')
  })
  test('should call useNewNodeModal hook, with file type, edit mode', async () => {
    const { result } = renderHook(() => useNewNodeModal({ ...defaultProps, editMode: true }), {
      wrapper
    })

    expect(result.current.label).toEqual('edit')
    expect(result.current.actionType).toEqual(FileStoreActionTypes.UPDATE_NODE)
    expect(result.current.identifier).toEqual('Root')
  })

  test('should call useNewNodeModal hook, with file type, edit mode', async () => {
    const { result } = renderHook(
      () => useNewNodeModal({ ...defaultProps, type: FileStoreNodeTypes.FOLDER, editMode: true }),
      {
        wrapper
      }
    )

    expect(result.current.label).toEqual('edit')
    expect(result.current.actionType).toEqual(FileStoreActionTypes.UPDATE_NODE)
    expect(result.current.identifier).toEqual('Root')
  })
})
