/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'

import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'

import { NodeSortMenu } from '../NodeSortMenu'

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <NodeSortMenu {...props} />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define <NodeSortMenu />', () => {
  test('should render sort menu ', async () => {
    const { getAllByTestId } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue()
        }}
      />
    )
    await waitFor(() => getAllByTestId('dropdown-button'))
    const scopeButton = getAllByTestId('dropdown-button')[0]
    act(() => {
      fireEvent.click(scopeButton)
    })
    const popover = findPopoverContainer() as HTMLElement
    await waitFor(() => popover)

    const menuItems = popover.querySelectorAll('[class*="menuItem"]')
    act(() => {
      fireEvent.click(menuItems[2])
    })
    expect(menuItems?.length).toBe(6)
  })
})
