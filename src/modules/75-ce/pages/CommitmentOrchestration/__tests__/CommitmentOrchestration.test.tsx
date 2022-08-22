/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CommitmentOrchestration from '../CommitmentOrchestration'
import {
  mockedComputeCoverageResponse,
  mockedConfigResponse,
  mockedFiltersResponse,
  mockedSavingsResponse,
  mockedSummaryResponse,
  mockedUtilisationResponse
} from './mockData'

jest.mock('services/lw-co', () => ({
  useGetSetupCO: jest.fn().mockImplementation(() => ({
    data: mockedConfigResponse,
    loading: false
  })),
  useFetchCOSummary: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedSummaryResponse))
  })),
  useFetchFilters: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedFiltersResponse))
  })),
  useFetchComputeCoverage: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedComputeCoverageResponse)),
    loading: false
  })),
  useFetchSavings: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedSavingsResponse)),
    loading: false
  })),
  useGetCommitmentUtilisation: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedUtilisationResponse)),
    loading: false
  }))
}))

describe('Commitment Orchestrator', () => {
  test('display dashboard page with data', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CommitmentOrchestration />
      </TestWrapper>
    )

    expect(getByText('ce.commitmentOrchestration.sideNavLabel')).toBeInTheDocument()
    expect(container.querySelector('[class*="bodyWidgetsContainer"]')?.firstChild?.childNodes.length).toBe(4)
  })

  test('clicking on setup button should navigate to setup page', async () => {
    const { getByTestId, getAllByText } = render(
      <TestWrapper pathParams={{ accountId: 'accountId' }}>
        <CommitmentOrchestration />
      </TestWrapper>
    )

    fireEvent.click(getAllByText('common.setup')[0])
    expect(getByTestId('location').innerHTML.indexOf('commitment-orchestration/setup')).toBeGreaterThan(-1)
  })

  test('render Savings tab with data', () => {
    const { container } = render(
      <TestWrapper>
        <CommitmentOrchestration />
      </TestWrapper>
    )

    const allTabs = container.querySelector('[class*="tabsContainer"]')
    if (allTabs) {
      fireEvent.click(allTabs.children[1] as HTMLDivElement)
      expect(allTabs.children[1].classList.contains('activeTab')).toBeTruthy()
    }
  })

  test('render Utilisation tab with data', () => {
    const { container } = render(
      <TestWrapper>
        <CommitmentOrchestration />
      </TestWrapper>
    )

    const allTabs = container.querySelector('[class*="tabsContainer"]')
    if (allTabs) {
      fireEvent.click(allTabs.children[2] as HTMLDivElement)
      expect(allTabs.children[2].classList.contains('activeTab')).toBeTruthy()
    }
  })
})
