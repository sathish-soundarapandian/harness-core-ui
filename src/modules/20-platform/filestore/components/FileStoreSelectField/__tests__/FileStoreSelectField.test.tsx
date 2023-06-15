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
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import FileStoreSelectField from '../FileStoreSelectField'

const mockContext = getDummyFileStoreContextValue()

describe('FileStoreSelectField', () => {
  test('should render FileStoreSelectField component', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <FileStoreSelectField name="testname" />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const selectBtn = container.querySelector('span[icon="chevron-down"]')
    expect(selectBtn).toBeDefined()
  })
})
