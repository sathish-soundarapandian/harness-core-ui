/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, getByText, render, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'
import { defaultTo } from 'lodash-es'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { mockTemplates, mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import * as commonHooks from '@common/hooks'
import * as templateServices from 'services/template-ng'
import { DeleteTemplateModal } from '../DeleteTemplateModal'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => mockTemplatesSuccessResponse)
}))

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useDeleteTemplateVersionsOfIdentifier: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  }))
}))

describe('<DeleteTemplateModal /> tests', () => {
  const baseProps = {
    template: defaultTo(mockTemplates.data?.content?.[0], ''),
    onSuccess: jest.fn(),
    onClose: jest.fn()
  }
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <DeleteTemplateModal {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call onClose when cancel button is clicked', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <DeleteTemplateModal {...baseProps} />
      </TestWrapper>
    )
    const cancelBtn = getByRole('button', { name: 'cancel' })
    act(() => {
      fireEvent.click(cancelBtn)
    })
    await waitFor(() => expect(baseProps.onClose).toBeCalled())
  })

  test('should have delete button disabled by default', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <DeleteTemplateModal {...baseProps} />
      </TestWrapper>
    )

    const deleteBtn = getByRole('button', { name: 'Delete Selected' })
    expect(deleteBtn).toBeDisabled()
  })

  test('should call onSuccess when select all is checked and deleted successfully', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <DeleteTemplateModal {...baseProps} />
      </TestWrapper>
    )

    const selectAllCheckBox = getByRole('checkbox', { name: 'Select All' })
    act(() => {
      fireEvent.click(selectAllCheckBox)
    })

    const deleteBtn = getByRole('button', { name: 'Delete Selected' })
    expect(deleteBtn).not.toBeDisabled()
    act(() => {
      fireEvent.click(deleteBtn)
    })

    await waitFor(() => expect(findDialogContainer).toBeDefined())
    const dialogContainer = findDialogContainer() as HTMLElement
    fireEvent.click(getByText(dialogContainer, 'delete'))
    await waitFor(() => expect(baseProps.onSuccess).toBeCalled())
  })

  test('should match snapshot when status is failure for deleteTemplates operation', async () => {
    jest.spyOn(templateServices, 'useDeleteTemplateVersionsOfIdentifier').mockImplementation(() => ({
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return Promise.resolve({
          status: 'FAILURE',
          data: {}
        })
      }),
      refetch: jest.fn(),
      cancel: jest.fn(),
      error: null
    }))

    const { container, getByRole } = render(
      <TestWrapper>
        <DeleteTemplateModal {...baseProps} />
      </TestWrapper>
    )

    const selectAllCheckBox = getByRole('checkbox', { name: 'Select All' })
    act(() => {
      fireEvent.click(selectAllCheckBox)
    })

    const deleteBtn = getByRole('button', { name: 'Delete Selected' })
    expect(deleteBtn).not.toBeDisabled()
    act(() => {
      fireEvent.click(deleteBtn)
    })

    await waitFor(() => expect(findDialogContainer).toBeDefined())
    const dialogContainer = findDialogContainer() as HTMLElement
    fireEvent.click(getByText(dialogContainer, 'delete'))

    expect(container).toMatchSnapshot()
  })

  test('should match snapshot when error occurs in deleteTemplates operation', async () => {
    jest.spyOn(templateServices, 'useDeleteTemplateVersionsOfIdentifier').mockImplementation(() => ({
      loading: false,
      mutate: jest.fn(() => {
        throw new Error('Something went wrong!')
      }),
      refetch: jest.fn(),
      cancel: jest.fn(),
      error: null
    }))

    const { container, getByRole } = render(
      <TestWrapper>
        <DeleteTemplateModal {...baseProps} />
      </TestWrapper>
    )

    const selectAllCheckBox = getByRole('checkbox', { name: 'Select All' })
    act(() => {
      fireEvent.click(selectAllCheckBox)
    })

    const deleteBtn = getByRole('button', { name: 'Delete Selected' })
    expect(deleteBtn).not.toBeDisabled()
    act(() => {
      fireEvent.click(deleteBtn)
    })

    await waitFor(() => expect(findDialogContainer).toBeDefined())
    const dialogContainer = findDialogContainer() as HTMLElement
    fireEvent.click(getByText(dialogContainer, 'delete'))

    expect(container).toMatchSnapshot()
  })

  test('should match snapshot when error occurs in useMutateAsGet', async () => {
    jest.spyOn(commonHooks, 'useMutateAsGet').mockImplementation(() => {
      return { loading: false, error: 'Some error occurred', data: undefined, refetch: jest.fn() } as any
    })

    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <DeleteTemplateModal {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
