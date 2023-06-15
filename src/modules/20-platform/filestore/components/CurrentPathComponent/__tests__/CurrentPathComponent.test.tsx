/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'

import CurrentPathComponent from '../CurrentPathComponent'

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <CurrentPathComponent />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define file path component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render file path with current node', async () => {
    const { container } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue()
        }}
      />
    )
    const path = await findByText(container, '/asd12')
    expect(path).toBeDefined()
  })
  test('should render search counter', async () => {
    const context = getDummyFileStoreContextValue() || {}
    const { container } = render(
      <WrapperComponent
        context={{
          ...context,
          currentNode: { ...context.currentNode, identifier: 'SEARCH' }
        }}
      />
    )
    const path = await findByText(container, 'filestore.searchResult')
    expect(path).toBeDefined()
  })
})
