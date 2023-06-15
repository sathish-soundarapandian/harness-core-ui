/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'

import { TestWrapper } from '@common/utils/testUtils'

import { FooterRenderer } from '../ModalComponents'

const defaultProps = {
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  confirmText: 'save',
  cancelText: 'cancel',
  type: 'submit',
  loading: false
}

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <FooterRenderer {...props} />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define <FooterRenderer />', () => {
  test('should render buttons ', async () => {
    const { findByText } = render(
      <WrapperComponent
        {...defaultProps}
        context={{
          ...getDummyFileStoreContextValue()
        }}
      />
    )
    const saveBtn = await findByText('save')
    expect(saveBtn).toBeInTheDocument()
    const cancelBtn = await findByText('cancel')
    expect(cancelBtn).toBeInTheDocument()
  })
})
