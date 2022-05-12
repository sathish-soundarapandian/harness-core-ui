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
import * as customDashboardServices from 'services/custom-dashboards'
import UpdateFolder, { UpdateFolderProps } from '../UpdateFolder'

const testFolder: customDashboardServices.FolderModel = {
  id: '1',
  name: 'testName',
  title: 'testTitle',
  type: FolderType.ACCOUNT,
  child_count: 0,
  created_at: '01/01/2022'
}

const defaultProps: UpdateFolderProps = {
  onFormCompleted: jest.fn(),
  folderData: testFolder
}

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)

const { result } = renderHook(() => useStrings(), { wrapper })

const renderComponent = (props: UpdateFolderProps = defaultProps): RenderResult => {
  return render(
    <TestWrapper>
      <UpdateFolder {...props} />
    </TestWrapper>
  )
}

const updateFolderResponse: customDashboardServices.PatchFolderResponse = {
  resource: {
    accountId: '123',
    folderId: '234',
    name: 'new name'
  }
}

const updateUser = function (): Promise<customDashboardServices.PatchFolderResponse> {
  return new Promise(resolve => {
    resolve(updateFolderResponse)
  })
}

describe('UpdateFolder', () => {
  beforeEach(() => {
    jest.spyOn(customDashboardServices, 'usePatchFolder').mockImplementation(() => ({ mutate: updateUser } as any))
  })
  afterEach(() => {
    jest.spyOn(customDashboardServices, 'usePatchFolder').mockReset()
  })

  test('it should trigger onFormCompleted callback upon request success', async () => {
    const onFormCompletedMock = jest.fn()
    const { container } = renderComponent({ ...defaultProps, onFormCompleted: onFormCompletedMock })

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    const saveButton = screen.getByText(result.current.getString('continue'))

    act(() => {
      fireEvent.click(saveButton)
    })

    await waitFor(() => expect(onFormCompletedMock).toHaveBeenCalled())
  })

  test('it should display error message in form if request fails', async () => {
    const updateUserFail = function (): Promise<customDashboardServices.PatchFolderResponse> {
      return new Promise((_resolve, reject) => {
        reject()
      })
    }
    jest.spyOn(customDashboardServices, 'usePatchFolder').mockImplementation(() => ({ mutate: updateUserFail } as any))

    const onFormCompletedMock = jest.fn()
    const { container } = renderComponent({ ...defaultProps, onFormCompleted: onFormCompletedMock })

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    const saveButton = screen.getByText(result.current.getString('continue'))

    act(() => {
      fireEvent.click(saveButton)
    })

    await waitFor(() =>
      expect(screen.getByText(result.current.getString('dashboards.updateFolder.folderUpdateFail'))).toBeInTheDocument()
    )
    expect(onFormCompletedMock).toHaveBeenCalledTimes(0)
  })
})
