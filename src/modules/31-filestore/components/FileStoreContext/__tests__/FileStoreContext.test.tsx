/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent } from '@testing-library/react'
import { Button } from '@wings-software/uicore'
import { FileStoreContext, FileStoreContextProvider } from '@filestore/components/FileStoreContext/FileStoreContext'
import { FileStoreNodeTypes } from '@filestore/interfaces/FileStore'
import { FILE_STORE_ROOT } from '@filestore/utils/constants'
import { FileStore } from '@filestore/pages/filestore/FileStorePage'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetCreatedByListMock,
  entityTypeResponseMock
} from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/__tests__/mock'
import { getDummyFileStoreContextValue, responseGetFoldersNodesMock, newNodeMock } from './mock'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getNode: jest.fn(),
  useGetFolderNodes: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => Promise.resolve(responseGetFoldersNodesMock))
  })),
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
    return { mutate: jest.fn(), loading: false }
  }),
  usePostFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdateFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  fileStoreValue: jest.fn().mockReturnValue('account:/test'),
  prepareFileStoreValue: jest.fn().mockReturnValue('account:/test'),
  useDownloadFile: jest.fn().mockImplementation(() => ({ data: null })),
  useCreate: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  return (
    <TestWrapper>
      <FileStoreContextProvider>{props.children}</FileStoreContextProvider>
    </TestWrapper>
  )
}
interface TestComponentProps {
  handlerName: string
  config?: any
}

const TEST_ACTION_FS = {
  UPDATE_SET_CURRENT_NODE: 'UPDATE_SET_CURRENT_NODE',
  GET_FOLDER_NODES: 'GET_FOLDER_NODES'
}
const TestComponent = (props: TestComponentProps): JSX.Element => {
  const { handlerName, config } = props
  const {
    setCurrentNode,
    updateCurrentNode,
    updateFileStore,
    updateTempNodes,
    getNode,
    addDeletedNode,
    removeFromTempNodes
  } = React.useContext(FileStoreContext)
  const { currentNode } = getDummyFileStoreContextValue()

  const rootProps = {
    identifier: FILE_STORE_ROOT,
    name: FILE_STORE_ROOT,
    type: FileStoreNodeTypes.FOLDER
  }
  const getHandler = (handlerType: string): any => {
    switch (handlerType) {
      case TEST_ACTION_FS.UPDATE_SET_CURRENT_NODE:
        return () => {
          setCurrentNode(currentNode)
          updateCurrentNode(currentNode)
          updateFileStore([])
          updateTempNodes(currentNode, true)
          updateTempNodes({ ...currentNode, identifier: 'asdqwe' })
          addDeletedNode('testid')
          removeFromTempNodes('testid')
        }
      case TEST_ACTION_FS.GET_FOLDER_NODES:
        return () => {
          getNode(rootProps, config)
        }
      default:
        return () => {
          setCurrentNode(currentNode)
        }
    }
  }
  const handler = getHandler(handlerName)
  return <Button onClick={() => handler()}>test</Button>
}

describe('Define File store context', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('Call set/update current node', async () => {
    const { findByText } = render(
      <WrapperComponent>
        <TestComponent handlerName={TEST_ACTION_FS.UPDATE_SET_CURRENT_NODE} />
      </WrapperComponent>
    )
    const btn = await findByText('test')
    act(() => {
      fireEvent.click(btn!)
    })
    expect(btn).toBeDefined()
  })
  test('Get folder nodes', async () => {
    const { findByText } = render(
      <WrapperComponent>
        <TestComponent handlerName={TEST_ACTION_FS.GET_FOLDER_NODES} />
      </WrapperComponent>
    )
    const btn = await findByText('test')
    act(() => {
      fireEvent.click(btn!)
    })
    expect(btn).toBeDefined()
  })
  test('Get folder nodes with configs folder case', async () => {
    const { findByText } = render(
      <WrapperComponent>
        <TestComponent
          handlerName={TEST_ACTION_FS.GET_FOLDER_NODES}
          config={{ newNode: newNodeMock, type: FileStoreNodeTypes.FOLDER, switchNode: 'switch' }}
        />
      </WrapperComponent>
    )
    const btn = await findByText('test')
    act(() => {
      fireEvent.click(btn!)
    })
    expect(btn).toBeDefined()
  })
  test('Get folder nodes with configs file case', async () => {
    const { findByText } = render(
      <WrapperComponent>
        <TestComponent
          handlerName={TEST_ACTION_FS.GET_FOLDER_NODES}
          config={{ newNode: newNodeMock, type: FileStoreNodeTypes.FILE, identifier: 'asd122' }}
        />
      </WrapperComponent>
    )
    const btn = await findByText('test')
    act(() => {
      fireEvent.click(btn!)
    })
    expect(btn).toBeDefined()
  })
  test('Get folder nodes with configs file store component', async () => {
    const { container } = render(
      <WrapperComponent>
        <FileStore />
      </WrapperComponent>
    )
    expect(container).toBeTruthy()
  })
})
