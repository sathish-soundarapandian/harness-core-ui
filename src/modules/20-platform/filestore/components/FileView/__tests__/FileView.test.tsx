/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'

import { render, findByText, fireEvent } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import * as cdServices from 'services/cd-ng'
import FileView from '../FileView'

const useUpdate = jest.fn()

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getNode: jest.fn(),
  useDownloadFile: jest.fn().mockImplementation(() => ({ data: null, loading: false })),
  useUpdate: jest.fn().mockImplementation(() => ({ mutate: useUpdate, loading: false }))
}))

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <FileView />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define file view component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render file view', async () => {
    const context = getDummyFileStoreContextValue() || {}
    const { container } = render(
      <WrapperComponent
        context={{
          ...context,
          isCachedNode: jest.fn().mockReturnValue(false)
        }}
      />
    )
    const detailsTab = await findByText(container, 'details')
    expect(detailsTab).toBeDefined()
  })
  test('should render file view error', async () => {
    jest.spyOn(cdServices, 'useDownloadFile').mockImplementation(
      () =>
        ({
          error: { data: { message: 'error-test' }, status: 500 },
          loading: false
        } as any)
    )
    const context = getDummyFileStoreContextValue() || {}
    const { container } = render(
      <WrapperComponent
        context={{
          ...context,
          isCachedNode: jest.fn().mockReturnValue(false)
        }}
      />
    )
    const logTab = await findByText(container, 'activityLog')
    act(() => {
      fireEvent.click(logTab!)
    })
    expect(container).toBeDefined()
  })
  test('should render file view , modal view', async () => {
    const context = getDummyFileStoreContextValue() || {}
    const { container } = render(
      <WrapperComponent
        context={{
          ...context,
          isCachedNode: jest.fn().mockReturnValue(false),
          isModalView: true
        }}
      />
    )
    const saveBtn = await findByText(container, 'save')
    act(() => {
      fireEvent.click(saveBtn!)
    })
    expect(useUpdate).toBeCalledTimes(0)
  })
})
