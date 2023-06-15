/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { contextFSMock, getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'

import { TestWrapper } from '@common/utils/testUtils'
import type { FolderNodeDTO } from 'services/cd-ng'
import { RootNodesList } from '../NavNodesList'

const mockContext = getDummyFileStoreContextValue()

describe('NavNodesList', () => {
  test('should render NavNodesList component', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <RootNodesList rootStore={contextFSMock.fileStore as FolderNodeDTO[]} />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    expect(getByText('asd12')).toBeDefined()
  })
})
