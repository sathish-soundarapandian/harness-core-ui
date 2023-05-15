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
import VerifyStepLogContent from '../views/VerifyStepLogContent'
import {
  deploymentActivitySummaryResponse,
  errorMessage,
  executionLogsResponse,
  externalAPICallLogsResponse,
  healthSourceResponse,
  pathParams,
  testWrapperProps
} from './ExecutionLog.mock'
import { LogTypes } from '../useLogContentHook.types'
import { PAGE_SIZE } from '../useLogContentHook.constants'

const STRING_ID_LOAD_MORE = 'pipeline.verification.loadMore'

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
  getVerifyStepLogsPromise: jest.fn().mockImplementation(() => executionLogsResponse),
  useGetVerifyStepDeploymentActivitySummary: jest.fn().mockImplementation(() => ({
    data: deploymentActivitySummaryResponse,
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('VerifyStepLogContent', () => {
  test('should render VerifyStepLogContent component of type Execution Log', () => {
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

    expect(screen.getByText('cv.executionLogs')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render VerifyStepLogContent component of type External API Call Log', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <VerifyStepLogContent
          logType={LogTypes.ApiCallLog}
          verifyStepExecutionId="verifyStepExecutionId"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.externalAPICalls')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should call healthSource API only for verify step', () => {
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

    expect(cvService.useGetVerifyStepHealthSources).toHaveBeenLastCalledWith({
      verifyStepExecutionId: 'verifyStepExecutionId',
      queryParams: {
        accountId: pathParams.accountId
      },
      lazy: true
    })
  })

  test('should call the logs API by clicking the load more button', async () => {
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

    expect(screen.getByRole('button', { name: STRING_ID_LOAD_MORE })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: STRING_ID_LOAD_MORE }))

    await waitFor(() => {
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ExecutionLog,
          pageNumber: 1,
          errorLogsOnly: false
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
      expect(screen.queryByRole('button', { name: STRING_ID_LOAD_MORE })).not.toBeInTheDocument()
    })
  })

  test('should handle the Top and Bottom navigation', async () => {
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

    expect(container.querySelector('[data-icon="arrow-down"]')).toBeInTheDocument()

    await userEvent.click(container.querySelector('[data-icon="arrow-down"]')!)
  })

  test('should show the text Loading...', () => {
    jest
      .spyOn(cvService, 'useGetVerifyStepLogs')
      .mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() } as any)

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

    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  test('should show the error message and fetch the logs by clicking on Retry', async () => {
    jest
      .spyOn(cvService, 'useGetVerifyStepLogs')
      .mockReturnValue({ data: {}, loading: false, error: { message: errorMessage }, refetch: jest.fn() } as any)

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

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByText('retry'))

    await waitFor(() => {
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ExecutionLog,
          pageNumber: 0,
          errorLogsOnly: false
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })

  test('should show loader for External API Call Logs', () => {
    jest
      .spyOn(cvService, 'useGetVerifyStepLogs')
      .mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() } as any)

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

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('should handle error for External API Call Logs', async () => {
    jest
      .spyOn(cvService, 'useGetVerifyStepLogs')
      .mockReturnValue({ data: {}, loading: false, error: { message: errorMessage }, refetch: jest.fn() } as any)

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

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByText('Retry'))

    await waitFor(() => {
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ApiCallLog,
          pageNumber: 0,
          errorLogsOnly: false
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })

  test('should handle no data for External API Call Logs', () => {
    jest
      .spyOn(cvService, 'useGetVerifyStepLogs')
      .mockReturnValue({ data: {}, loading: false, error: null, refetch: jest.fn() } as any)

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

    expect(screen.getByText('cv.changeSource.noDataAvaiableForCard')).toBeInTheDocument()
  })

  test('should download the logs of type ApiCallLog', async () => {
    jest
      .spyOn(cvService, 'useGetVerifyStepLogs')
      .mockReturnValue({ data: executionLogsResponse, loading: false, error: null, refetch: jest.fn() } as any)
    jest.spyOn(cvService, 'getVerifyStepLogsPromise').mockReturnValue(externalAPICallLogsResponse as any)

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

    expect(screen.getByText('cv.download')).toBeInTheDocument()

    await userEvent.click(screen.getByText('cv.download'))

    await waitFor(() => {
      expect(cvService.getVerifyStepLogsPromise).toHaveBeenCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: 1,
          logType: LogTypes.ApiCallLog,
          errorLogsOnly: false
        }
      })
    })
  })

  test('should download the logs of type ExecutionLog', async () => {
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

    expect(screen.getByText('cv.download')).toBeInTheDocument()

    await userEvent.click(screen.getByText('cv.download'))

    await waitFor(() => {
      expect(cvService.getVerifyStepLogsPromise).toHaveBeenCalledWith({
        verifyStepExecutionId: 'verifyStepExecutionId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: 1,
          logType: LogTypes.ExecutionLog,
          errorLogsOnly: false
        }
      })
    })
  })
})
