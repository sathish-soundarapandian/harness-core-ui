/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import { act, findByText, findAllByText, fireEvent, render, waitFor } from '@testing-library/react'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import {
  entityTypeResponseMock,
  fetchedFilterResponseMock,
  rootMock,
  useGetCreatedByListMock
} from '@filestore/pages/filestore/__tests__/mock'
import useFileStoreModal from '../FileStoreComponent'
const mockContext = getDummyFileStoreContextValue()

const defaultProps = {
  applySelected: jest.fn()
}

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

function TestComponent(): React.ReactElement {
  const { openFileStoreModal, closeFileStoreModal } = useFileStoreModal(defaultProps)
  const openDialog = (): void => {
    openFileStoreModal()
  }
  const closeDialog = (): void => {
    closeFileStoreModal()
  }
  return (
    <div>
      <Button onClick={() => openDialog()} text="openDialog" />
      <Button onClick={() => closeDialog()} text="closeDialog" />
    </div>
  )
}

describe('Define FileStoreComponent hook', () => {
  test('should render useFileStoreModal', async () => {
    const { queryByText } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <TestComponent />
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const openBtn = queryByText('openDialog')
    await act(async () => {
      fireEvent.click(openBtn!)
    })

    const modal = findDialogContainer()
    await waitFor(() => expect(modal).toBeTruthy())

    const accountTab = await findByText(modal!, 'account')
    act(() => {
      fireEvent.click(accountTab)
    })

    const applySelectedBtn = await findByText(modal!, 'entityReference.apply')
    act(() => {
      fireEvent.click(applySelectedBtn)
    })

    const accountContent = await findAllByText(modal!, 't2confiog')
    expect(accountContent[0]).toBeDefined()
  })
})
