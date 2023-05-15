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
import type { Segment, useDeleteSegment } from 'services/cf'
import * as cfServices from 'services/cf'
import * as cfUtils from '@cf/utils/CFUtils'
import useDeleteTargetGroupDialog from '../useDeleteTargetGroupDialog'

const WrapperComponent: FC<{ targetGroup: Segment }> = ({ targetGroup }) => {
  const openDeleteTargetGroupDialog = useDeleteTargetGroupDialog(targetGroup)

  return <button onClick={() => openDeleteTargetGroupDialog()}>Open dialog</button>
}

const sampleTargetGroup = {
  name: 'SAMPLE TARGET GROUP NAME',
  identifier: 'SAMPLE_TARGET_GROUP_ID'
} as Segment

const renderComponent = (): RenderResult => {
  const result = render(
    <TestWrapper>
      <WrapperComponent targetGroup={sampleTargetGroup} />
    </TestWrapper>
  )

  return result
}

type UseDeleteSegmentReturn = ReturnType<typeof useDeleteSegment>

const buildMock = (overrides: Partial<UseDeleteSegmentReturn> = {}): UseDeleteSegmentReturn => ({
  loading: false,
  error: null,
  mutate: jest.fn(),
  cancel: jest.fn(),
  ...overrides
})

describe('useDeleteTargetGroupDialog', () => {
  const useDeleteSegmentMock = jest.spyOn(cfServices, 'useDeleteSegment')
  const showToasterMock = jest.spyOn(cfUtils, 'showToaster')

  beforeEach(() => {
    jest.resetAllMocks()
    useDeleteSegmentMock.mockReturnValue(buildMock())
  })

  test('it should display the dialog', async () => {
    renderComponent()

    await userEvent.click(screen.getByRole('button', { name: 'Open dialog' }))

    expect(screen.getByText('cf.segments.delete.title')).toBeInTheDocument()
    expect(screen.getByText('cf.segments.delete.message')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
  })

  test('it should try to delete the target group when the delete button is clicked', async () => {
    const mutateMock = jest.fn()
    useDeleteSegmentMock.mockReturnValue(buildMock({ mutate: mutateMock }))

    renderComponent()

    await userEvent.click(screen.getByRole('button', { name: 'Open dialog' }))

    expect(mutateMock).not.toHaveBeenCalled()
    expect(showToasterMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(sampleTargetGroup.identifier)
      expect(showToasterMock).toHaveBeenCalledWith('cf.messages.segmentDeleted')
    })
  })
})
