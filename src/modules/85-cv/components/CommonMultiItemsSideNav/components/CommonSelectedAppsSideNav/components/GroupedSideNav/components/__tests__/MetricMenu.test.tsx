/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { MetricMenuProps } from '../MetricMenu.types'
import MetricMenu from '../MetricMenu'

function WrapperComponent(props: MetricMenuProps): JSX.Element {
  return (
    <TestWrapper>
      <MetricMenu {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for MetricMenu', () => {
  const onEditMock = jest.fn()
  const onDeleteMock = jest.fn()
  const props = {
    onEdit: onEditMock,
    onDelete: onDeleteMock,
    titleText: 'Title',
    contentText: 'content',
    deleteLabel: 'delete',
    editLabel: 'edit',
    itemName: 'item-name',
    index: 0,
    metricThresholdTitleText: 'delete metric ?',
    metricThresholdCancelButtonText: 'cancel',
    metricThresholdWarningContentText: 'warning',
    showPromptOnDelete: false
  }
  test('Ensure MetricMenu component loads with the Kebab menu options', async () => {
    const { getByTestId } = render(<WrapperComponent {...props} />)

    const metricMenu = getByTestId('sideNav-options')
    await waitFor(() => expect(metricMenu).toBeInTheDocument())
  })

  test('should be able to see edit and delete button when options is clicked', async () => {
    const { getByTestId, getByText } = render(<WrapperComponent {...props} />)
    const metricMenu = getByTestId('sideNav-options')
    await waitFor(() => expect(metricMenu).toBeInTheDocument())

    // clicking on the menu should display possible menu options.
    metricMenu.click()
    const editButton = getByTestId('sideNav-edit')
    const deleteButton = getByTestId('sideNav-delete')
    await waitFor(() => expect(editButton).toBeInTheDocument())
    await waitFor(() => expect(deleteButton).toBeInTheDocument())

    // validating edit functionality.
    editButton.click()
    expect(onEditMock).toHaveBeenCalledTimes(1)

    // validating delete functionality.
    deleteButton.click()
    expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()
    const modalDeleteBtn = getByText('delete')
    act(() => {
      userEvent.click(modalDeleteBtn!)
    })
    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
    })
  })

  test('should be able to validate delete functionality when showPromptOnDelete is true', async () => {
    const newProps = { ...props, showPromptOnDelete: true }
    const { getByTestId, getAllByText, getByText } = render(<WrapperComponent {...newProps} />)

    const metricMenu = getByTestId('sideNav-options')
    await waitFor(() => expect(metricMenu).toBeInTheDocument())

    // clicking on the menu should display possible menu options.
    metricMenu.click()
    const deleteButton = getByTestId('sideNav-delete')
    await waitFor(() => expect(deleteButton).toBeInTheDocument())

    // validating delete functionality.
    deleteButton.click()
    expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()
    const deleteConfirmationBtn = getAllByText('delete')[0]
    act(() => {
      userEvent.click(deleteConfirmationBtn!)
    })
    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
    })

    // validating cancel on delete modal
    deleteButton.click()
    expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()
    const cancelBtn = getByText('cancel')
    act(() => {
      userEvent.click(cancelBtn!)
    })
    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
    })
  })
})
