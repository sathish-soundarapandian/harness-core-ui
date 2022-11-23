/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByTestId } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'

import { TestWrapper } from '@common/utils/testUtils'

import { NewFileButton } from '../NewFile'

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <NewFileButton parentIdentifier="Root" />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define <NewFileButton />', () => {
  test('should render element ', async () => {
    const { container } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue()
        }}
      />
    )
    const btn = await findByTestId(container, 'newFileButton')
    expect(btn).toBeInTheDocument()
  })
})
