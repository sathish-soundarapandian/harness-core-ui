/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { FSErrosType } from '@filestore/utils/constants'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from './mock'

import WrongFormatView from '../WrongFormatView'

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <WrongFormatView />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define <WrongFormatView />', () => {
  test('should render wrong format view ', async () => {
    const { getByText } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue()
        }}
        error={FSErrosType.DELETED_NODE}
      />
    )

    expect(getByText('filestore.errors.cannotRender')).toBeInTheDocument()
  })
  test('should wrong format error message in modal view', async () => {
    const { getByText } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue(),
          isModalView: true
        }}
      />
    )

    expect(getByText('filestore.errors.cannotRender')).toBeInTheDocument()
  })
})
