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
import * as cfServices from 'services/cf'
import type { InclusionSubSectionProps } from '../InclusionSubSection'
import type { ExclusionSubSectionProps } from '../ExclusionSubSection'
import TargetGroups, { TargetGroupsProps } from '../TargetGroups'

jest.mock('@common/components/ContainerSpinner/ContainerSpinner', () => ({
  ContainerSpinner: () => <span data-testid="container-spinner">Container Spinner</span>
}))

const mockIncludeTargetGroups: InclusionSubSectionProps['targetGroups'] = [
  { identifier: 'tg1', name: 'Target Group 1' },
  { identifier: 'tg2', name: 'Target Group 2' },
  { identifier: 'tg3', name: 'Target Group 3' }
]
const mockExcludeTargetGroups: ExclusionSubSectionProps['targetGroups'] = [
  { identifier: 'tg4', name: 'Target Group 4' },
  { identifier: 'tg5', name: 'Target Group 5' },
  { identifier: 'tg6', name: 'Target Group 6' }
]

const renderComponent = (props: Partial<TargetGroupsProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TargetGroups target={mockTarget} {...props} />
    </TestWrapper>
  )

describe('TargetGroups', () => {
  const getTargetSegmentsMock = jest.spyOn(cfServices, 'useGetTargetSegments')

  beforeEach(() => {
    jest.resetAllMocks()

    getTargetSegmentsMock.mockReturnValue({
      data: {
        identifier: mockTarget.identifier,
        excludedSegments: mockExcludeTargetGroups,
        includedSegments: mockIncludeTargetGroups,
        ruleSegments: []
      },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
  })

  test('it should display all returned target groups', async () => {
    renderComponent()

    mockIncludeTargetGroups.forEach(({ name }) => expect(screen.getByText(name as string)).toBeInTheDocument())
    mockExcludeTargetGroups.forEach(({ name }) => expect(screen.getByText(name as string)).toBeInTheDocument())
  })

  test('it should display the loading spinner when loading', async () => {
    getTargetSegmentsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    expect(screen.getByTestId('container-spinner')).toBeInTheDocument()
  })

  test('it should display the error message and a button to retry', async () => {
    const message = 'ERROR MESSAGE'
    const refetchMock = jest.fn()

    getTargetSegmentsMock.mockReturnValue({
      data: null,
      loading: false,
      error: { message },
      refetch: refetchMock
    } as any)

    renderComponent()

    expect(refetchMock).not.toHaveBeenCalled()
    expect(screen.getByText(message)).toBeInTheDocument()

    const retryBtn = screen.getByRole('button', { name: 'Retry' })
    expect(retryBtn).toBeInTheDocument()

    userEvent.click(retryBtn)

    await waitFor(() => expect(refetchMock).toHaveBeenCalled())
  })
})
