/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { Button } from '@harness/uicore'
import { fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { useUnsavedConfirmation } from '../useUnsavedConfirmation'
const mockContext = getDummyFileStoreContextValue()

jest.mock('@common/exports', () => ({
  useConfirmationDialog: jest.fn().mockImplementation(async ({ onCloseDialog }) => {
    await onCloseDialog(true)
  })
}))

const defaultProps = {
  callback: jest.fn()
}

function wrapper(props: any): JSX.Element {
  const { children } = props || {}

  return (
    <TestWrapper>
      <FileStoreContext.Provider value={mockContext}>{children}</FileStoreContext.Provider>
    </TestWrapper>
  )
}

function TestComponent(): React.ReactElement {
  const { handleUnsavedConfirmation } = useUnsavedConfirmation(defaultProps)
  const openDialog = (): void => {
    handleUnsavedConfirmation()
  }
  return (
    <div>
      <Button onClick={() => openDialog()} text="openDialog" />
    </div>
  )
}

describe('Define useUnsavedConfirmation hook', () => {
  test('should call useUnsavedConfirmation hook', async () => {
    const { result } = renderHook(() => useUnsavedConfirmation(defaultProps), { wrapper })
    expect(Object.keys(result.current).indexOf('handleUnsavedConfirmation')).not.toBe(-1)
  })

  test('should render useUnsavedConfirmation dialog', async () => {
    const { container } = render(
      <TestWrapper>
        <FileStoreContext.Provider value={mockContext}>
          <TestComponent />
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const btn = queryByText(container, 'openDialog')
    fireEvent.click(btn!)

    await waitFor(() => {
      expect(document.body.querySelector('.bp3-dialog')).toBeDefined()
    })
  })
})
