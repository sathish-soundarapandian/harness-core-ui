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
import { useStrings } from 'framework/strings'
import * as customDashboardServices from 'services/custom-dashboards'
import CreateFolder, { CreateFolderProps } from '../CreateFolder'

const defaultProps: CreateFolderProps = {
  onFormCompleted: jest.fn()
}

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)

const { result } = renderHook(() => useStrings(), { wrapper })

const renderComponent = (props: CreateFolderProps = defaultProps): RenderResult => {
  return render(
    <TestWrapper>
      <CreateFolder {...props} />
    </TestWrapper>
  )
}

const createFolderResponse: customDashboardServices.CreateFolderResponse = {
  resource: '1'
}

const createUser = function (): Promise<customDashboardServices.CreateFolderResponse> {
  return new Promise(resolve => {
    resolve(createFolderResponse)
  })
}

describe('CreateFolder', () => {
  beforeEach(() => {
    jest.spyOn(customDashboardServices, 'useCreateFolder').mockImplementation(() => ({ mutate: createUser } as any))
  })
  afterEach(() => {
    jest.spyOn(customDashboardServices, 'useCreateFolder').mockReset()
  })

  test('it should trigger onFormCompleted callback upon request success', async () => {
    const onFormCompletedMock = jest.fn()
    const { container } = renderComponent({ onFormCompleted: onFormCompletedMock })

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
    const createUserFail = function (): Promise<customDashboardServices.CreateFolderResponse> {
      return new Promise((_resolve, reject) => {
        reject()
      })
    }
    jest.spyOn(customDashboardServices, 'useCreateFolder').mockImplementation(() => ({ mutate: createUserFail } as any))

    const onFormCompletedMock = jest.fn()
    const { container } = renderComponent({ onFormCompleted: onFormCompletedMock })

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
      expect(screen.getByText(result.current.getString('dashboards.createFolder.folderSubmitFail'))).toBeInTheDocument()
    )
    expect(onFormCompletedMock).toHaveBeenCalledTimes(0)
  })
})
