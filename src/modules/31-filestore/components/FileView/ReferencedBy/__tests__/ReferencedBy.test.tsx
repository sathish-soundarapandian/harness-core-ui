/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { referencedByResponse } from './mock'
import ReferencedBy from '../ReferencedBy'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getNode: jest.fn(),
  useGetReferencedBy: jest.fn().mockImplementation(() => ({ data: referencedByResponse, loading: false }))
}))

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <ReferencedBy />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define referenced by component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render referenced list view', async () => {
    const context = getDummyFileStoreContextValue() || {}
    const { container } = render(
      <WrapperComponent
        context={{
          ...context,
          isCachedNode: jest.fn().mockReturnValue(false)
        }}
      />
    )
    expect(container).toBeDefined()
  })
})
