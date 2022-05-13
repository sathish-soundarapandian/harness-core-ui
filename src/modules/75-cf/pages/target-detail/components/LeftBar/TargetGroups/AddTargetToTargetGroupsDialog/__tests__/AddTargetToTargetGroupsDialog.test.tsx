/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockTarget from '@cf/utils/testData/data/mockTarget'
import type { Segment, Segments } from 'services/cf'
import * as cfServices from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import AddTargetToTargetGroupsDialog, { AddTargetToTargetGroupsDialogProps } from '../AddTargetToTargetGroupsDialog'

jest.mock('@common/components/ContainerSpinner/ContainerSpinner', () => ({
  ContainerSpinner: () => <span data-testid="container-spinner">Container Spinner</span>
}))

const mockTargetGroups = [
  { identifier: 'tg1', name: 'Target Group 1' },
  { identifier: 'tg2', name: 'Target Group 2' },
  { identifier: 'tg3', name: 'Target Group 3' }
] as Segment[]

const buildTargetGroupsWithPagination = (targetGroups: Segment[]): Segments => ({
  segments: targetGroups,
  pageCount: Math.ceil(targetGroups.length / CF_DEFAULT_PAGE_SIZE),
  itemCount: targetGroups.length,
  pageSize: CF_DEFAULT_PAGE_SIZE,
  pageIndex: 0
})

const renderComponent = (props: Partial<AddTargetToTargetGroupsDialogProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <AddTargetToTargetGroupsDialog
        target={mockTarget}
        modalTitle="MODAL TITLE"
        addButtonText="cf.targetDetail.addToSegment"
        instructionKind="addToIncludeList"
        hideModal={jest.fn()}
        onChange={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('AddTargetToTargetGroupsDialog', () => {
  const useGetTargetAvailableSegmentsMock = jest.spyOn(cfServices, 'useGetTargetAvailableSegments')
  const patchTargetMock = jest.fn()
  jest.spyOn(cfServices, 'usePatchTarget').mockReturnValue({ mutate: patchTargetMock } as any)

  beforeEach(() => {
    jest.clearAllMocks()

    useGetTargetAvailableSegmentsMock.mockReturnValue({
      data: buildTargetGroupsWithPagination(mockTargetGroups),
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
  })

  describe('Error state', () => {
    test('it should display the error message and retry button when getTargetAvailableSegments fails', async () => {
      const message = 'ERROR MESSAGE'
      const retryMock = jest.fn()

      useGetTargetAvailableSegmentsMock.mockReturnValue({
        data: null,
        loading: false,
        error: { message },
        refetch: retryMock
      } as any)

      renderComponent()

      const btn = screen.getByRole('button', { name: 'Retry' })
      expect(btn).toBeInTheDocument()
      expect(retryMock).not.toHaveBeenCalled()
      expect(screen.getByText(message)).toBeInTheDocument()

      userEvent.click(btn)

      await waitFor(() => expect(retryMock).toHaveBeenCalled())
    })

    test('it should display the error message when patchSegment fails', async () => {
      const message = 'ERROR MESSAGE'
      const onChangeMock = jest.fn()
      const hideModalMock = jest.fn()
      patchTargetMock.mockRejectedValue({ message })

      renderComponent()

      expect(onChangeMock).not.toHaveBeenCalled()
      expect(hideModalMock).not.toHaveBeenCalled()
      expect(screen.queryByText(message)).not.toBeInTheDocument()

      userEvent.click(screen.getByText(mockTargetGroups[0].name))
      userEvent.click(screen.getByRole('button', { name: 'cf.targetDetail.addToSegment' }))

      await waitFor(() => {
        expect(onChangeMock).not.toHaveBeenCalled()
        expect(hideModalMock).not.toHaveBeenCalled()
        expect(screen.getByText(message)).toBeInTheDocument()
      })
    })
  })

  describe('Loading state', () => {
    test('it should display the loading indicator when loading target groups', async () => {
      useGetTargetAvailableSegmentsMock.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      } as any)

      renderComponent()

      expect(screen.getByTestId('container-spinner')).toBeInTheDocument()
    })

    test('it should display the loading indicator when loading target groups during a search', async () => {
      renderComponent()

      useGetTargetAvailableSegmentsMock.mockReturnValue({
        data: buildTargetGroupsWithPagination(mockTargetGroups),
        loading: true,
        error: null,
        refetch: jest.fn()
      } as any)

      expect(screen.queryByTestId('container-spinner')).not.toBeInTheDocument()

      await userEvent.type(screen.getByRole('searchbox'), 'testing')

      await waitFor(() => expect(screen.getByTestId('container-spinner')).toBeInTheDocument())
    })
  })

  describe('Empty state', () => {
    test('it should show no Target Groups available when none returned on initial load', async () => {
      useGetTargetAvailableSegmentsMock.mockReturnValue({
        data: buildTargetGroupsWithPagination([]),
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)

      renderComponent()

      expect(screen.getByText('cf.targetDetail.noTargetGroupsAvailable'))
    })

    test('it should show no result match when no results returned from a search', async () => {
      renderComponent()

      useGetTargetAvailableSegmentsMock.mockReturnValue({
        data: buildTargetGroupsWithPagination([]),
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)

      expect(screen.queryByText('cf.noResultMatch')).not.toBeInTheDocument()

      await userEvent.type(screen.getByRole('searchbox'), 'testing')

      await waitFor(() => expect(screen.getByText('cf.noResultMatch')).toBeInTheDocument())
    })
  })

  describe('Submission', () => {
    test('it should call patchTarget with the appropriate instruction and call the onChange and hideModal callbacks', async () => {
      const onChangeMock = jest.fn()
      const hideModalMock = jest.fn()
      const instructionKind = 'addToExcludeList'
      patchTargetMock.mockResolvedValue(undefined)

      renderComponent({ onChange: onChangeMock, hideModal: hideModalMock, instructionKind })

      expect(patchTargetMock).not.toHaveBeenCalled()
      expect(onChangeMock).not.toHaveBeenCalled()
      expect(hideModalMock).not.toHaveBeenCalled()

      mockTargetGroups.forEach(({ name }) => userEvent.click(screen.getByText(name)))
      userEvent.click(screen.getByRole('button', { name: 'cf.targetDetail.addToSegment' }))

      await waitFor(() => {
        expect(patchTargetMock).toHaveBeenCalledWith({
          instructions: [
            {
              kind: instructionKind,
              parameters: {
                segments: mockTargetGroups.map(({ identifier }) => identifier)
              }
            }
          ]
        })
        expect(onChangeMock).toHaveBeenCalled()
        expect(hideModalMock).toHaveBeenCalled()
      })
    })
  })
})
