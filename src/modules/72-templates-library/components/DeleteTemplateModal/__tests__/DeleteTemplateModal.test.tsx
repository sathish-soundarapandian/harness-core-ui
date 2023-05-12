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
import {
  mockTemplates,
  mockTemplatesSuccessResponse,
  mockTemplatesMultipleVersions
} from '@templates-library/TemplatesTestHelper'
import * as commonHooks from '@common/hooks'
import * as templateServices from 'services/template-ng'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'
import * as cdNgServices from 'services/cd-ng'
import { DeleteTemplateModal, DeleteTemplateProps } from '../DeleteTemplateModal'

const mockTemplatesSuccessResponseUpdated = {
  ...mockTemplatesSuccessResponse,
  data: {
    ...mockTemplatesMultipleVersions
  }
}

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => mockTemplatesSuccessResponse)
}))

jest.spyOn(cdNgServices, 'useGetSettingValue').mockImplementation(() => {
  return { data: { data: { value: 'false' } } } as any
})
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
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
  })
  const baseProps = {
    template: defaultTo(mockTemplates.data?.content?.[0], ''),
    onSuccess: jest.fn(),
    onClose: jest.fn()
  }
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call onClose when cancel button is clicked', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
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
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
      </TestWrapper>
    )

    const deleteBtn = getByRole('button', { name: 'Delete Selected' })
    expect(deleteBtn).toBeDisabled()
  })

  test('should call onSuccess when select all is checked and deleted successfully', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
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
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
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
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
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
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot when loading is true', async () => {
    jest.spyOn(commonHooks, 'useMutateAsGet').mockImplementation(() => {
      return { loading: true, data: undefined, refetch: jest.fn() } as any
    })

    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true, supportingTemplatesGitx: true }}>
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot when multiple versions are present', async () => {
    jest.spyOn(commonHooks, 'useMutateAsGet').mockImplementation(() => {
      return mockTemplatesSuccessResponseUpdated as any
    })

    const { container } = render(
      <TestWrapper>
        <DeleteTemplateModal {...(baseProps as DeleteTemplateProps)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
