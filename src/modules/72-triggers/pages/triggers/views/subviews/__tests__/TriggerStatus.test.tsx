/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { TriggerStatus } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import TriggerStatusCell from '../TriggerStatusCell'

describe('Test case for trigger status rendering and behavior', () => {
  test('should render SUCCESS status properly', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'SUCCESS', detailMessages: [] }
    const { getByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} />
      </TestWrapper>
    )

    expect(getByText('success')).toBeDefined()
  })

  test('should render FAILED status properly', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'FAILED', detailMessages: [] }
    const { getByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} />
      </TestWrapper>
    )

    expect(getByText('failed')).toBeDefined()
  })

  test('should render UNKNOWN status properly', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'UNKNOWN', detailMessages: [] }
    const { getByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} />
      </TestWrapper>
    )

    expect(getByText('common.unknown')).toBeDefined()
  })

  test('should render without crash if data is not provided', async () => {
    const triggerStatusMock: TriggerStatus = {}
    const { container } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render without crash if errors are not provided', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'FAILED' }
    const { findByText, getByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} />
      </TestWrapper>
    )

    fireEvent.mouseEnter(getByText('failed'))
    expect(await findByText('common.viewErrorDetails')).toBeDefined()
  })

  test('should show popover on mouse over on FAILED status', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'FAILED', detailMessages: ['error 1'] }
    const { getByText, findByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} />
      </TestWrapper>
    )

    fireEvent.mouseEnter(getByText('failed'))

    expect(await findByText('error 1')).toBeDefined()
    expect(await findByText('common.viewErrorDetails')).toBeDefined()
  })

  test('shoud open (and close) modal with error messages', async () => {
    const detailMessages = ['error 1', 'error 2']
    const triggerStatusMock: TriggerStatus = { status: 'FAILED', detailMessages }
    const { getByText, findByText, findByRole, findByTestId, queryByTestId, baseElement } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} />
      </TestWrapper>
    )

    // open tooltip
    fireEvent.mouseEnter(getByText('failed'))

    // open modal
    const btn = await findByRole('button')
    expect(btn).toBeDefined()
    fireEvent.click(btn)

    const title = await findByText('errorDetails')
    expect(title).toBeDefined()

    const preEl = await findByTestId('trigger-status-errors')
    expect(preEl).toBeDefined()
    const expectedText = JSON.stringify(detailMessages, null, 1)
    expect(preEl.innerHTML).toMatch(expectedText)

    // close modal
    const closeBtn = baseElement.querySelector('button[aria-label="Close"]')
    fireEvent.click(closeBtn!)

    await waitFor(() => expect(queryByTestId('modaldialog-body')).toBeNull())
  })
})
