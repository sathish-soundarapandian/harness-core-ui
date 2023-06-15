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

import EmptyNodeView from '../EmptyNodeView'

describe('Empty Node View', () => {
  test('should render empty node view', async () => {
    const context = getDummyFileStoreContextValue() || {}
    const { container } = render(
      <TestWrapper>
        <FileStoreContext.Provider value={context}>
          <EmptyNodeView title={'dummy title'} />
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const newButton = await findByText(container, 'dummy title')
    expect(newButton).toBeInTheDocument()
  })
})
