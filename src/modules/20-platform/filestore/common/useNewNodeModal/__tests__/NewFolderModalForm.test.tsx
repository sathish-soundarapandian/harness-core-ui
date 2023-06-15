/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { createResponseFolderMock } from './mock'
import NewFolderModalForm from '../views/NewFolderModalForm'

const defaultProps = {
  close: jest.fn(),
  parentIdentifier: 'Root',
  handleError: jest.fn(),
  onSubmit: jest.fn()
}

const createFuncMock = jest.fn().mockImplementation(() => Promise.resolve(createResponseFolderMock))
const editFuncMock = jest.fn().mockImplementation(() => Promise.resolve(createResponseFolderMock))

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useCreate: jest.fn().mockImplementation(() => ({
    mutate: createFuncMock,
    loading: false
  })),
  useUpdate: jest.fn().mockImplementation(() => ({ mutate: editFuncMock, loading: false }))
}))

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <NewFolderModalForm {...props} fileStoreContext={context} currentNode={context.currentNode} />
    </TestWrapper>
  )
}

describe('Define <NewFolderModalForm />', () => {
  const context = getDummyFileStoreContextValue() || {}
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('Should render new Folder modal form, create case', async () => {
    const { container } = render(<WrapperComponent context={context} {...defaultProps} />)
    const btn = container.querySelector('[type=submit]')
    const nameField = container.querySelector('input[name="name"]')
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'testfolder123' } })
    expect(nameField).toBeInTheDocument()

    expect(btn).toBeInTheDocument()
    expect(container).toBeTruthy()
    act(() => {
      fireEvent.click(btn!)
    })
    await waitFor(() => {
      Promise.resolve()
    })
    expect(createFuncMock).toHaveBeenCalled()
  })
  test('Should render edit folder form modal, edit case', async () => {
    const { container } = render(<WrapperComponent context={context} editMode={true} {...defaultProps} />)
    const btn = container.querySelector('[type=submit]')
    const nameField = container.querySelector('input[name="name"]')
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'test123' } })
    expect(nameField).toBeInTheDocument()

    expect(btn).toBeInTheDocument()
    expect(container).toBeTruthy()
    act(() => {
      fireEvent.click(btn!)
    })
    await waitFor(() => Promise.resolve())
    expect(editFuncMock).toHaveBeenCalled()
  })
  test('Should render new Folder modal, edit mode case, search parent id', async () => {
    const { container } = render(
      <WrapperComponent
        context={{
          ...context,
          currentNode: {
            ...context.currentNode,
            type: 'FOLDER',
            identifier: 'SEARCH'
          }
        }}
        editMode={true}
        notCurrentNode={false}
        {...defaultProps}
      />
    )
    const btn = container.querySelector('[type=submit]')

    await act(() => {
      fireEvent.click(btn!)
    })
    await waitFor(() => Promise.resolve())
    expect(editFuncMock).toHaveBeenCalled()
  })
})
