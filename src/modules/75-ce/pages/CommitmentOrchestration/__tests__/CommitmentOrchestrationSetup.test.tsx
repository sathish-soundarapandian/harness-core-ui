/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import CommitmentOrchestrationSetup from '../CommitmentOrchestrationSetup'
import { mockedFiltersResponse, mockedInstanceTypes, mockedSummaryResponse } from './mockData'

jest.mock('services/lw-co', () => ({
  useFetchFilters: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedFiltersResponse))
  })),
  useFetchSetupInstanceTypes: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedInstanceTypes)),
    loading: false
  })),
  useSaveSetupCO: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve({}))
  })),
  useFetchCOSummary: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedSummaryResponse))
  }))
}))

describe('Commitment Orchestration Setup', async () => {
  test('complete setup process', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <CommitmentOrchestrationSetup />
      </TestWrapper>
    )

    const stepsNodes = container.querySelector('[class*="setupSteps"]')
    expect(stepsNodes?.children.length).toBe(4)
    expect(stepsNodes?.children[0].classList.contains('active')).toBeTruthy()

    fireEvent.click(getByText('continue'))
    expect(stepsNodes?.children[1].classList.contains('active')).toBeTruthy()

    await waitFor(() => fireEvent.click(getByText('continue')))
    // await waitFor(() => fireEvent.click(getByText('continue')))
    fireEvent.click(container.querySelector('input[type="checkbox"]') as HTMLInputElement)
    await waitFor(() => fireEvent.click(getByText('confirm')))
    expect(
      getByTestId('location').innerHTML.endsWith(
        routes.toCommitmentOrchestration({ accountId: undefined as unknown as string })
      )
    ).toBeTruthy()
  })

  test('exit setup process - navigate back to CO home page', () => {
    const { getAllByText, getByTestId } = render(
      <TestWrapper>
        <CommitmentOrchestrationSetup />
      </TestWrapper>
    )

    fireEvent.click(getAllByText('ce.commitmentOrchestration.exitSetupBtn')[0])
    expect(
      getByTestId('location').innerHTML.endsWith(
        routes.toCommitmentOrchestration({ accountId: undefined as unknown as string })
      )
    ).toBeTruthy()
  })
})
