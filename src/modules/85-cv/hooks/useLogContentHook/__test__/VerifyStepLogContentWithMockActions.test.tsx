/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { LogTypes } from '@cv/hooks/useLogContentHook/useLogContentHook.types'
import VerifyStepLogContent from '../views/VerifyStepLogContent'
import {
  testWrapperProps,
  pathParams,
  healthSourceResponse,
  executionLogsResponse,
  deploymentActivitySummaryResponse
} from './ExecutionLog.mock'
import { PAGE_SIZE } from '../useLogContentHook.constants'

const actions = {
  setExecutionLogs: jest.fn(),
  resetExecutionLogs: jest.fn(),
  search: jest.fn(),
  resetSearch: jest.fn(),
  goToNextSearchResult: jest.fn(),
  goToPrevSearchResult: jest.fn()
}

jest.mock('services/cv', () => ({
  useGetVerifyStepHealthSources: jest
    .fn()
    .mockImplementation(() => ({ data: healthSourceResponse, loading: false, error: null, refetch: jest.fn() })),
  useGetVerifyStepLogs: jest
    .fn()
    .mockImplementation(() => ({ data: executionLogsResponse, loading: false, error: null, refetch: jest.fn() })),
  useGetAllHealthSourcesForServiceAndEnvironment: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useGetVerifyStepDeploymentActivitySummary: jest.fn().mockImplementation(() => ({
    data: deploymentActivitySummaryResponse,
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

jest.mock('../views/ExecutionLog/ExecutionLogState.ts', () => ({
  useActionCreator: jest.fn(() => actions),
  reducer: jest.fn()
}))

describe('ExecutionLog - with mock actions', () => {
  beforeEach(() => {
    Object.entries(actions).map(([_, fn]: [string, jest.Mock]) => fn.mockReset())
  })

  test('should show No logs found message', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ExecutionLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('common.logs.noLogsText')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'pipeline.verification.loadMore' })).not.toBeInTheDocument()
    expect(container.querySelector('[data-icon="arrow-down"]')).not.toBeInTheDocument()
  })

  test('should clear the store data and fetch new data by changing a healthSource - Execution Logs', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ExecutionLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('- Select -')).toHaveValue('pipeline.verification.healthSourceLabel: all')

    await userEvent.click(screen.getByPlaceholderText('- Select -'))

    await waitFor(async () => {
      expect(screen.getByText('dyna')).toBeInTheDocument()
      await userEvent.click(screen.getByText('dyna'))
    })

    await waitFor(() => {
      expect(actions.resetExecutionLogs).toHaveBeenCalledTimes(1)
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ExecutionLog,
          pageNumber: 0,
          errorLogsOnly: false,
          healthSources: ['dynatrace_prod/dyna']
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })

  test('should fetch new data by changing a healthSource - External API Call Logs', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ApiCallLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('- Select -')).toHaveValue('pipeline.verification.healthSourceLabel: all')

    await userEvent.click(screen.getByPlaceholderText('- Select -'))

    await waitFor(async () => {
      expect(screen.getByText('dyna')).toBeInTheDocument()
      await userEvent.click(screen.getByText('dyna'))
    })

    await waitFor(() => {
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ApiCallLog,
          pageNumber: 0,
          errorLogsOnly: false,
          healthSources: ['dynatrace_prod/dyna']
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })

  test('should clear the store data and fetch new data by enabling the display errors only - Execution Logs', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ExecutionLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    await userEvent.click(screen.getByText('cv.displayOnlyErrors'))

    await waitFor(() => {
      expect(actions.resetExecutionLogs).toHaveBeenCalledTimes(1)
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ExecutionLog,
          pageNumber: 0,
          errorLogsOnly: true
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })

  test('should clear the store data and fetch new data by enabling the display errors only - External API Call Logs', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ApiCallLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    await userEvent.click(screen.getByText('cv.displayOnlyErrors'))

    await waitFor(() => {
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ApiCallLog,
          pageNumber: 0,
          errorLogsOnly: true
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })

  test('should ensure search is calling proper actions', async () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ExecutionLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText('Search')

    await userEvent.click(searchInput)
    await userEvent.type(searchInput, 'INFO')

    await waitFor(() => expect(actions.search).toHaveBeenCalledTimes(1))

    await userEvent.click(container.querySelector('[data-icon="main-close"]')!)

    await waitFor(() => expect(actions.resetSearch).toHaveBeenCalledTimes(1))
  })

  test('should handle the full screen', async () => {
    const setIsFullScreen = jest.fn()

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ExecutionLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={false}
          setIsFullScreen={setIsFullScreen}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="full-screen"]')!).toBeInTheDocument()

    await userEvent.click(container.querySelector('[data-icon="full-screen"]')!)

    await waitFor(() => expect(setIsFullScreen).toHaveBeenCalled())
  })

  test('should handle the full screen exit', async () => {
    const setIsFullScreen = jest.fn()

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ExecutionLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={true}
          setIsFullScreen={setIsFullScreen}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="full-screen-exit"]')!).toBeInTheDocument()

    await userEvent.click(container.querySelector('[data-icon="full-screen-exit"]')!)

    await waitFor(() => expect(setIsFullScreen).toHaveBeenCalled())
  })
})
