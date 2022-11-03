/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { FolderType } from '@dashboards/constants/FolderType'
import { TestWrapper } from '@common/utils/testUtils'
import { useStrings } from 'framework/strings'
import type { FolderModel } from 'services/custom-dashboards'
import DashboardForm, { DashboardFormProps } from '../DashboardForm'

const mockFolderOne: FolderModel = {
  id: '1',
  name: 'testName',
  title: 'testTitle',
  type: FolderType.ACCOUNT,
  child_count: 0,
  created_at: '01/01/2022'
}

const defaultProps: DashboardFormProps = {
  editableFolders: [mockFolderOne],
  title: '',
  loading: false,
  onComplete: jest.fn(),
  setModalErrorHandler: jest.fn(),
  mode: 'CREATE'
}

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)

const { result } = renderHook(() => useStrings(), { wrapper })

const renderComponent = (props: DashboardFormProps): RenderResult => {
  return render(
    <TestWrapper>
      <DashboardForm {...props} />
    </TestWrapper>
  )
}

describe('DashboardForm', () => {
  test('it should display a Dashboard Form with continue button', () => {
    renderComponent(defaultProps)

    const saveButton = screen.getByText(result.current.getString('continue'))
    waitFor(() => expect(saveButton).toBeInTheDocument())
  })

  test('it should display the formData as the initial form values', () => {
    const formData = {
      description: 'tag_one,tag_two',
      folderId: '1',
      name: 'dashboard name'
    }

    renderComponent({ formData: formData, ...defaultProps })

    expect(screen.getByDisplayValue('dashboard name')).toBeInTheDocument()
    expect(screen.getByText('tag_one')).toBeInTheDocument()
    expect(screen.getByText('tag_two')).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockFolderOne.name)).toBeInTheDocument()
  })
})
