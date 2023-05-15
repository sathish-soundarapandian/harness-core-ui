/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import GitErrorModal, { GitErrorModalProps } from '../GitErrorModal'

const renderComponent = (props: Partial<GitErrorModalProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <GitErrorModal onSubmit={jest.fn()} onClose={jest.fn()} apiError="default api error" {...props} />
    </TestWrapper>
  )
}

describe('GitErrorModal', () => {
  test('it should render correctly', async () => {
    renderComponent()

    await waitFor(() => expect(screen.getByTestId('git-error-modal')).toBeInTheDocument())

    expect(screen.getByTestId('git-error-modal')).toMatchSnapshot()
  })

  test('it should display error message correctly', async () => {
    renderComponent()

    await waitFor(() => expect(screen.getByTestId('git-error-modal')).toBeInTheDocument())

    expect(screen.getByText(/default api error/i)).toBeInTheDocument()
    expect(screen.getByText('cf.gitSync.turnOffGitAndContinue')).toBeInTheDocument()
    expect(screen.getByText('cancel')).toBeInTheDocument()
  })

  test('it should call onSubmit correctly', async () => {
    const onSubmitMock = jest.fn()

    renderComponent({ onSubmit: onSubmitMock })

    await waitFor(() => expect(screen.getByText('cf.gitSync.turnOffGitAndContinue')).toBeInTheDocument())

    await userEvent.click(screen.getByText('cf.gitSync.turnOffGitAndContinue'))

    expect(onSubmitMock).toHaveBeenCalled()
  })

  test('it should call onClose correctly', async () => {
    const onCloseMock = jest.fn()

    renderComponent({ onClose: onCloseMock })

    await waitFor(() => expect(screen.getByText('cancel')).toBeInTheDocument())

    await userEvent.click(screen.getByText('cancel'))

    expect(onCloseMock).toHaveBeenCalled()
  })
})
