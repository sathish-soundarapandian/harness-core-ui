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

import DeletedView from '../DeletedView'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any)
}))

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { error, context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <DeletedView error={error} />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define <DeletedView />', () => {
  test('should render error message', async () => {
    const { getByText } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue()
        }}
        error={FSErrosType.DELETED_NODE}
      />
    )

    expect(getByText('errorTitle')).toBeInTheDocument()
  })
  test('should render error message in modal view', async () => {
    const { getByText } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue(),
          isModalView: true
        }}
      />
    )

    expect(getByText('errorTitle')).toBeInTheDocument()
  })
})
