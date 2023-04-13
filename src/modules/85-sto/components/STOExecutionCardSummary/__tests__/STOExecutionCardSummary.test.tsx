/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseQueryResult } from '@tanstack/react-query'
import React from 'react'
import { render } from '@testing-library/react'
import { screen, waitFor } from '@testing-library/dom'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { CardVariant } from '@pipeline/utils/constants'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import type { FrontendExecutionIssueCountsError } from 'services/sto/stoComponents'
import * as stoService from 'services/sto/stoComponents'
import type { SeverityPillProps } from '@sto/components/SeverityPill/SeverityPill'
import STOExecutionCardSummary from '@sto/components/STOExecutionCardSummary/STOExecutionCardSummary'

jest.mock('@sto/components/SeverityPill/SeverityPill', () => ({ severity, value }: SeverityPillProps) => (
  <div data-testid={severity} data-value={value} />
))

jest.mock('@blueprintjs/core', () => {
  const original = jest.requireActual('@blueprintjs/core')

  return {
    ...original,
    Spinner: () => <div data-testid="spinner" />
  }
})

const testPath = routes.toDeployments({
  accountId: ':accountId',
  orgIdentifier: ':orgIdentifier',
  projectIdentifier: ':projectIdentifier',
  module: 'sto'
})
const testParams = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module: 'sto'
}

const successPipelineExecutionSummary = {
  pipelineIdentifier: 'pipeline-id',
  planExecutionId: 'execution-id',
  status: 'Success'
} as PipelineExecutionSummary

const runningPipelineExecutionSummary = {
  pipelineIdentifier: 'pipeline-id',
  planExecutionId: 'execution-id',
  status: 'Running'
} as PipelineExecutionSummary

const failedPipelineExecutionSummary = {
  pipelineIdentifier: 'pipeline-id',
  planExecutionId: 'execution-id',
  status: 'Failed'
} as PipelineExecutionSummary

describe('STOExecutionCardSummary', () => {
  test('renders correctly', () => {
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: { 'execution-id': { critical: 1, high: 2, medium: 3, low: 4, info: 5, unassigned: 0 } },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testParams}>
        <STOExecutionCardSummary
          data={successPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('only renders non-zero counts', () => {
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: { 'execution-id': { critical: 1, high: 0, medium: 0, low: 0, info: 0, unassigned: 0 } },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    const { queryByTestId } = render(
      <TestWrapper path={testPath} pathParams={testParams}>
        <STOExecutionCardSummary
          data={successPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )
    expect(queryByTestId('Critical')).toBeTruthy()
    expect(queryByTestId('High')).toBeNull()
    expect(queryByTestId('Medium')).toBeNull()
    expect(queryByTestId('Low')).toBeNull()

    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: { 'execution-id': { critical: 0, high: 11, medium: 0, low: 0, info: 0, unassigned: 0 } },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)
  })

  test("only renders non-zero counts (cont'd)", () => {
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: { 'execution-id': { critical: 0, high: 11, medium: 0, low: 0, info: 0, unassigned: 0 } },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    const { queryByTestId } = render(
      <TestWrapper path={testPath} pathParams={testParams}>
        <STOExecutionCardSummary
          data={successPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )
    expect(queryByTestId('Critical')).toBeNull()
    expect(queryByTestId('High')).toBeTruthy()
    expect(queryByTestId('Medium')).toBeNull()
    expect(queryByTestId('Low')).toBeNull()
  })

  test('shows loading spinner', () => {
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testParams} getString={id => id}>
        <STOExecutionCardSummary
          data={successPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('shows an error message', () => {
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: null,
      isLoading: false,
      error: { payload: { message: 'Error!', status: 500 } },
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    render(
      <TestWrapper path={testPath} pathParams={testParams} getString={id => id}>
        <STOExecutionCardSummary
          data={successPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )
    expect(screen.getByText('sto.failedToGetIssueCounts')).toBeTruthy()
  })

  test('shows no security tests message', () => {
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: {},
      isLoading: false,
      error: null,
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    render(
      <TestWrapper path={testPath} pathParams={testParams} getString={id => id}>
        <STOExecutionCardSummary
          data={successPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )
    expect(screen.getByText('sto.noSecurityResults')).toBeTruthy()
  })

  test('shows issues on pipeline failure', () => {
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: { 'execution-id': { critical: 1, high: 2, medium: 3, low: 4, info: 5, unassigned: 0 } },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testParams}>
        <STOExecutionCardSummary
          data={failedPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('shows no issues message', () => {
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: { 'execution-id': { critical: 0, high: 0, medium: 0, low: 0, info: 0, unassigned: 0 } },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    render(
      <TestWrapper path={testPath} pathParams={testParams} getString={id => id}>
        <STOExecutionCardSummary
          data={successPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )
    expect(screen.getByText('sto.noSecurityIssues')).toBeTruthy()
  })

  test('shows issue counts when pipeline completes', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(stoService, 'useFrontendExecutionIssueCounts').mockReturnValue({
      data: { 'execution-id': { critical: 10, high: 8, medium: 6, low: 4, info: 2, unassigned: 0 } },
      isLoading: false,
      error: null,
      refetch: refetchFn
    } as unknown as UseQueryResult<unknown, FrontendExecutionIssueCountsError>)

    const { container, rerender, getByTestId, queryByText } = render(
      <TestWrapper path={testPath} pathParams={testParams} getString={id => id}>
        <STOExecutionCardSummary
          data={runningPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )

    expect(queryByText('sto.processingSecurityResults')).toBeTruthy()

    rerender(
      <TestWrapper path={testPath} pathParams={testParams} getString={id => id}>
        <STOExecutionCardSummary
          data={successPipelineExecutionSummary}
          nodeMap={{}}
          startingNodeId={'foo'}
          variant={CardVariant.Default}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(refetchFn).toHaveBeenCalledTimes(1)
      expect(getByTestId('Critical')).toBeTruthy()
      expect(getByTestId('High')).toBeTruthy()
      expect(getByTestId('Medium')).toBeTruthy()
      expect(getByTestId('Low')).toBeTruthy()
      expect(getByTestId('Info')).toBeTruthy()
      const allDataValueAttrs = container.querySelectorAll('[data-value]')
      expect(allDataValueAttrs).toHaveLength(5)
      expect(container.querySelector('div[data-value="10"]')).toBeTruthy()
      expect(container.querySelector('div[data-value="8"]')).toBeTruthy()
      expect(container.querySelector('div[data-value="6"]')).toBeTruthy()
      expect(container.querySelector('div[data-value="4"]')).toBeTruthy()
      expect(container.querySelector('div[data-value="2"]')).toBeTruthy()
    })
  })
})
