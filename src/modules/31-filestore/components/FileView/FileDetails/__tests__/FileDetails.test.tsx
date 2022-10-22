/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, findAllByText } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import * as cdServices from 'services/cd-ng'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from './mock'

import FileDetails from '../FileDetails'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getNode: jest.fn(),
  useDownloadFile: jest.fn().mockImplementation(() => ({ data: null, loading: false })),
  useCreate: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdate: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false }))
}))

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { initialValues, initialErrors, context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <Formik
          initialErrors={initialErrors}
          initialValues={initialValues}
          onSubmit={() => undefined}
          formName="TestWrapper"
        >
          {formikProps => (
            <FormikForm>
              <FileDetails handleError={jest.fn()} {...formikProps} {...props} />
            </FormikForm>
          )}
        </Formik>
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define file details', () => {
  const { currentNode } = getDummyFileStoreContextValue() || {}
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render select field, with label', async () => {
    const updateNode = jest.fn()
    const { container } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue(),
          isCachedNode: jest.fn().mockReturnValue(true)
        }}
      />
    )
    const btn = container.querySelector('[type=submit]')
    expect(btn).toBeInTheDocument()
    expect(container).toBeTruthy()
    act(() => {
      fireEvent.click(btn!)
    })
    expect(updateNode).not.toHaveBeenCalled()
  })
  test('should loader spinner', async () => {
    jest.spyOn(cdServices, 'useDownloadFile').mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn()
    } as any)
    const { container } = render(<WrapperComponent context={{ ...getDummyFileStoreContextValue() }} />)
    const spinner = container.querySelector('.bp3-spinner')
    expect(spinner).toBeDefined()
  })
  test('error download data', async () => {
    jest.spyOn(cdServices, 'useDownloadFile').mockReturnValue({
      data: null,
      loading: false,
      error: {
        status: 500
      },
      refetch: jest.fn()
    } as any)
    const { container } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue(),
          currentNode: { ...currentNode, parentIdentifier: '' },
          isCachedNode: jest.fn().mockReturnValue(false)
        }}
      />
    )
    expect(container).toBeTruthy()
  })
  test('Disable submit', async () => {
    const { container } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue(),
          currentNode: { ...currentNode, content: '', initialContent: '' }
        }}
      />
    )
    const btn = container.querySelector('[type=submit]')
    expect(btn).toBeDisabled()
  })

  test('Cached node empty content, wrong format', async () => {
    jest.spyOn(cdServices, 'useDownloadFile').mockReturnValue({
      data: 'asd',
      loading: false,

      refetch: jest.fn()
    } as any)
    const { container } = render(
      <WrapperComponent
        context={{
          ...getDummyFileStoreContextValue(),
          isCachedNode: jest.fn().mockReturnValue(true),
          currentNode: { ...currentNode, mimeType: 'jpg', fileUsage: '' }
        }}
      />
    )
    const wrongFormat = await findAllByText(container, 'filestore.errors.cannotRender')
    expect(wrongFormat[0]).toBeDefined()
  })
})
