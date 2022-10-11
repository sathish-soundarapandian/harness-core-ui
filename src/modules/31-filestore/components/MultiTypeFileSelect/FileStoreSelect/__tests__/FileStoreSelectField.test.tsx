/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, waitFor, queryByText, queryAllByText } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'

import { TestWrapper } from '@common/utils/testUtils'
import { rootMock, useGetCreatedByListMock, entityTypeResponseMock } from './mock'
import { getDummyFileStoreContextValue } from './contextFSMock'

import FileStoreSelectField from '../FileStoreSelectField'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetFolderNodes: jest.fn().mockImplementation(() => {
    return {
      ...rootMock,
      refetch: jest.fn(),
      error: null,
      loading: false,
      mutate: jest.fn().mockImplementation(() => Promise.resolve(rootMock))
    }
  }),
  useGetCreatedByList: jest.fn().mockImplementation(() => {
    return {
      data: useGetCreatedByListMock,
      loading: false,
      error: null
    }
  }),
  useGetEntityTypes: jest.fn().mockImplementation(() => {
    return {
      data: entityTypeResponseMock
    }
  }),
  setCurrentNodeState: jest.fn(),
  useListFilesWithFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(), loading: false }
  }),
  usePostFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdateFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  fileStoreValue: jest.fn().mockReturnValue('account:/test'),
  prepareFileStoreValue: jest.fn().mockReturnValue('account:/test'),
  getNode: jest.fn(),
  useDownloadFile: jest.fn().mockImplementation(() => ({ data: null })),
  useCreate: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { initialValues, initialErrors } = props || {}
  const fsContext = getDummyFileStoreContextValue()
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={fsContext}>
        <Formik
          initialErrors={initialErrors}
          initialValues={initialValues}
          onSubmit={() => undefined}
          formName="TestWrapper"
        >
          {formikProps => (
            <FormikForm>
              <FileStoreSelectField name={'test'} {...formikProps} {...props} />
            </FormikForm>
          )}
        </Formik>
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

describe('Define file store select field', () => {
  test('should render select field, with label', async () => {
    const { container, getByTestId } = render(
      <WrapperComponent
        initialValues={{ test: 'account:/' }}
        name="test"
        label="test-label"
        tooltipProps={{ dataTooltipId: 'asd' }}
      />
    )
    const fieldContainer = await getByTestId('file-store-select')
    expect(fieldContainer).toBeInTheDocument()
    const fieldSelect = await getByTestId('container-fs')
    expect(fieldSelect).toBeInTheDocument()
    const label = container.querySelector('label')
    expect(label).toBeInTheDocument()
    await act(() => {
      fireEvent.click(fieldSelect)
    })
    await waitFor(() => expect(queryByText(document.body, 'entityReference.apply')).toBeInTheDocument())
    const nodeItem = queryAllByText(document.body, 't2confiog')[0]
    act(() => {
      fireEvent.click(nodeItem)
    })
    const applyButton = queryByText(document.body, 'entityReference.apply')
    expect(applyButton).toBeTruthy()
    act(() => {
      fireEvent.click(applyButton as HTMLElement)
    })
    expect(queryByText(document.body, 'entityReference.apply')).not.toBeInTheDocument()
  })
  test('should render select field, without label', async () => {
    const { container } = render(<WrapperComponent name="test" initialErrors={{ test: 'error' }} />)
    const label = container.querySelector('label')
    expect(label).not.toBeInTheDocument()
  })
})
