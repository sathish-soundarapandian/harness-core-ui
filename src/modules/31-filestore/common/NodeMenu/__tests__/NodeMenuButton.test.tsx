/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'

import { TestWrapper } from '@common/utils/testUtils'

import NodeMenuButton from '../NodeMenuButton'

const defaultProps = {
  items: [
    { node: '<div>test</div>', identifier: 'test1', actionType: 'CREATE_NODE', label: 'save', onClick: jest.fn() },
    '-'
  ],
  position: 'bottom',
  isReadonly: false
}

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <NodeMenuButton {...props} />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define <NodeMenuButton />', () => {
  test('should render node menu button ', async () => {
    const { container } = render(
      <WrapperComponent
        {...defaultProps}
        context={{
          ...getDummyFileStoreContextValue()
        }}
      />
    )

    const menuBtn = container.querySelector('.bp3-minimal') as HTMLElement
    act(() => {
      fireEvent.click(menuBtn)
    })
    expect(menuBtn).toBeInTheDocument()

    const menuOption = document.querySelectorAll('.bp3-menu-item')[0]
    act(() => {
      fireEvent.click(menuOption)
    })
    expect(menuOption).toBeInTheDocument()
  })
})
