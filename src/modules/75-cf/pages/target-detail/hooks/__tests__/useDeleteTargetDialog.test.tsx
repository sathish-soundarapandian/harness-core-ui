/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { Target, useDeleteTarget } from 'services/cf'
import * as cfServices from 'services/cf'
import useDeleteTargetDialog from '../useDeleteTargetDialog'

const WrapperComponent: FC<{ target: Target }> = ({ target }) => {
  const openDeleteTargetDialog = useDeleteTargetDialog(target)

  return <button onClick={() => openDeleteTargetDialog()}>Open dialog</button>
}

const sampleTarget = {
  name: 'SAMPLE TARGET NAME',
  identifier: 'SAMPLE_TARGET_ID'
} as Target

const renderComponent = (): RenderResult => {
  const result = render(
    <TestWrapper>
      <WrapperComponent target={sampleTarget} />
    </TestWrapper>
  )

  userEvent.click(screen.getByRole('button', { name: 'Open dialog' }))

  return result
}

type UseDeleteTargetReturn = ReturnType<typeof useDeleteTarget>

const buildMock = (overrides: Partial<UseDeleteTargetReturn> = {}): UseDeleteTargetReturn => ({
  loading: false,
  error: null,
  mutate: jest.fn(),
  cancel: jest.fn(),
  ...overrides
})

describe('useDeleteTargetDialog', () => {
  const useDeleteTargetMock = jest.spyOn(cfServices, 'useDeleteTarget')

  beforeEach(() => {
    jest.resetAllMocks()
    useDeleteTargetMock.mockReturnValue(buildMock())
  })

  test('it should display the dialog', async () => {
    renderComponent()

    expect(screen.getByText('cf.targets.deleteTarget')).toBeInTheDocument()
    expect(screen.getByText('cf.targets.deleteTargetMessage')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
  })

  test('it should try to delete the target when the delete button is clicked', async () => {
    const mutateMock = jest.fn()
    useDeleteTargetMock.mockReturnValue(buildMock({ mutate: mutateMock }))

    renderComponent()

    expect(mutateMock).not.toHaveBeenCalled()
    expect(screen.queryByText('cf.messages.targetDeleted')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: 'delete' }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(sampleTarget.identifier)
      expect(screen.getByText('cf.messages.targetDeleted')).toBeInTheDocument()
    })
  })

  test('it should display the error message when the api returns an error', async () => {
    const message = 'TEST ERROR MESSAGE'
    let rejectDelete

    const submissionPromise = new Promise((_, reject) => {
      rejectDelete = reject
    })

    useDeleteTargetMock.mockReturnValue({
      mutate: jest.fn().mockReturnValue(submissionPromise)
    } as any)

    renderComponent()

    expect(screen.queryByText(message)).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: 'delete' }))

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    rejectDelete({ message })

    await waitFor(() => expect(screen.getByText(message)).toBeInTheDocument())
  })
})
