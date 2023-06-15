/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValueWithFolderChildren } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreContext, FileStoreNodeDTO } from '@filestore/components/FileStoreContext/FileStoreContext'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import StoreExplorer from '../StoreExplorer'

const mockContext = getDummyFileStoreContextValueWithFolderChildren()

describe('StoreExplorer', () => {
  test('should render StoreExplorer component', async () => {
    const { queryByText } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <StoreExplorer fileStore={mockContext.fileStore as FileStoreNodeDTO[]} />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    //search a file in the store explorer
    const file = queryByText('asd12')
    expect(file).toBeInTheDocument()

    //look for new node button in the store explorer
    const newNodeButton = queryByText('Common.new')
    expect(newNodeButton).toBeInTheDocument()
  })
})
