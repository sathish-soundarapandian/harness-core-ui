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
import { createResponseMock } from './mock'
import NewFileModalForm from '../views/NewFileModalForm'

const createFuncMock = jest.fn().mockImplementation(() => Promise.resolve(createResponseMock))
const editFuncMock = jest.fn().mockImplementation(() => Promise.resolve(createResponseMock))

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getNode: jest.fn(),
  useDownloadFile: jest.fn().mockImplementation(() => ({ data: null, loading: false })),
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
      <NewFileModalForm
        close={jest.fn()}
        fileStoreContext={context}
        parentIdentifier="Root"
        handleError={jest.fn()}
        {...props}
        onSubmit={jest.fn()}
        currentNode={context.currentNode}
      />
    </TestWrapper>
  )
}

describe('Define file details', () => {
  const context = getDummyFileStoreContextValue() || {}
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('Should render new File modal, create case', async () => {
    const { container } = render(<WrapperComponent context={context} />)
    const btn = container.querySelector('[type=submit]')
    const nameField = container.querySelector('input[name="name"]')
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'test123' } })
    expect(nameField).toBeInTheDocument()

    expect(btn).toBeInTheDocument()
    expect(container).toBeTruthy()
    await act(() => {
      fireEvent.click(btn!)
    })
    await waitFor(() => Promise.resolve())
    expect(createFuncMock).toHaveBeenCalled()
  })
  test('Should render edit modal, edit case', async () => {
    const { container } = render(<WrapperComponent context={context} editMode={true} />)
    const btn = container.querySelector('[type=submit]')
    const nameField = container.querySelector('input[name="name"]')
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'te12' } })
    expect(nameField).toBeInTheDocument()

    expect(btn).toBeInTheDocument()
    expect(container).toBeTruthy()
    await act(() => {
      fireEvent.click(btn!)
    })
    await waitFor(() => Promise.resolve())
    expect(editFuncMock).toHaveBeenCalled()
  })
  test('Should render new File modal, Search case', async () => {
    const { container } = render(
      <WrapperComponent
        context={{
          ...context,
          currentNode: {
            ...context.currentNode,
            identifier: 'SEARCH'
          }
        }}
      />
    )
    const btn = container.querySelector('[type=submit]')

    await act(() => {
      fireEvent.click(btn!)
    })
    await waitFor(() => Promise.resolve())
    expect(createFuncMock).toHaveBeenCalled()
  })
})
