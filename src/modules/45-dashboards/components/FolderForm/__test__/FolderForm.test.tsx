/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { FolderType } from '@dashboards/constants/FolderType'
import { useStrings } from 'framework/strings'
import type { FolderModel } from 'services/custom-dashboards'
import FolderForm, { FolderFormProps } from '../FolderForm'

const testFolder: FolderModel = {
  id: '1',
  name: 'testName',
  title: 'testTitle',
  type: FolderType.ACCOUNT,
  child_count: 0,
  created_at: '01/01/2022'
}

const defaultProps: FolderFormProps = {
  onSubmit: jest.fn()
}

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)

const { result } = renderHook(() => useStrings(), { wrapper })

const renderComponent = (props: FolderFormProps): RenderResult => {
  return render(
    <TestWrapper>
      <FolderForm {...props} />
    </TestWrapper>
  )
}

describe('FolderForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should display a Folder Form with continue button', () => {
    renderComponent(defaultProps)

    const saveButton = screen.getByText(result.current.getString('continue'))
    expect(saveButton).toBeInTheDocument()
  })

  test('it should disable save button if validation is not passing', async () => {
    const { container } = renderComponent({ ...defaultProps, initialFolderData: testFolder })

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: '' }
      })
    })

    const saveButton = screen.getByText(result.current.getString('continue'))

    expect(saveButton.closest('button')).toBeDisabled()
  })

  test('it should trigger onSubmit callback when validation succeeds', async () => {
    const onSubmitMock = jest.fn()
    const { container } = renderComponent({ ...defaultProps, onSubmit: onSubmitMock })

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    const saveButton = screen.getByText(result.current.getString('continue'))

    act(() => {
      fireEvent.click(saveButton)
    })

    await waitFor(() => expect(onSubmitMock).toHaveBeenCalled())
  })
})
