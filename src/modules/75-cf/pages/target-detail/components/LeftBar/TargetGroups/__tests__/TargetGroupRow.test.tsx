/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { TargetDetailSegment } from 'services/cf'
import TargetGroupRow, { TargetGroupRowProps } from '../TargetGroupRow'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => {
  const fullModule = jest.requireActual('react-router-dom')

  return {
    ...fullModule,
    useHistory: jest.fn(() => ({
      push: useHistoryPushMock
    }))
  }
})

const useHistoryPushMock = jest.fn()

const mockTargetDetailSegment: TargetDetailSegment = { identifier: 'tg1', name: 'Target Group 1' }

const renderComponent = (props: Partial<TargetGroupRowProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TargetGroupRow
        targetGroup={mockTargetDetailSegment}
        confirmActionProps={{ title: 'TITLE', message: <span>MESSAGE</span>, action: jest.fn() }}
        {...props}
      />
    </TestWrapper>
  )

describe('TargetGroupRow', () => {
  beforeEach(() => jest.clearAllMocks())

  test('it should display the target group name', async () => {
    renderComponent()

    expect(screen.getByText(mockTargetDetailSegment.name as string)).toBeInTheDocument()
  })

  test('it should display a delete button and trigger the delete modal when clicked', async () => {
    const confirmActionProps: TargetGroupRowProps['confirmActionProps'] = {
      title: 'TEST',
      message: <span data-testid="confirm-action-message">message</span>,
      action: jest.fn()
    }

    renderComponent({ confirmActionProps })

    const deleteBtn = screen.getByRole('button', { name: 'cf.targetDetail.removeSegment' })
    expect(deleteBtn).toBeInTheDocument()

    userEvent.click(deleteBtn)

    await waitFor(() => {
      expect(screen.getByText(confirmActionProps.title as string)).toBeInTheDocument()
      expect(screen.getByTestId('confirm-action-message')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'confirm' })).toBeInTheDocument()
      expect(confirmActionProps.action).not.toHaveBeenCalled()
    })

    userEvent.click(screen.getByRole('button', { name: 'confirm' }))

    await waitFor(() => expect(confirmActionProps.action).toHaveBeenCalled())
  })

  test('it should navigate to the Target Group detail page when clicked', async () => {
    renderComponent()

    expect(useHistoryPushMock).not.toHaveBeenCalledWith(expect.stringContaining('target-management/target-groups'))

    userEvent.click(screen.getByTestId('target-group-row'))

    await waitFor(() => {
      expect(useHistoryPushMock).toHaveBeenCalledWith(expect.stringContaining('target-management/target-groups'))
    })
  })
})
