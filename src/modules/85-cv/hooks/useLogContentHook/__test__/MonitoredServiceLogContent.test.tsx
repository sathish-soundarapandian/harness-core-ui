import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import {
  errorMessage,
  executionLogsResponse,
  externalAPICallLogsResponse,
  healthSourceResponse,
  pathParams,
  testWrapperProps
} from './ExecutionLog.mock'
import { LogTypes } from '../useLogContentHook.types'
import MonitoredServiceLogContent from '../views/MonitoredServiceLogContent'

const STRING_ID_LOAD_MORE = 'pipeline.verification.loadMore'

jest.mock('services/cv', () => ({
  useGetVerifyStepHealthSources: jest
    .fn()
    .mockImplementation(() => ({ data: healthSourceResponse, loading: false, error: null, refetch: jest.fn() })),
  useGetMonitoredServiceLogs: jest
    .fn()
    .mockImplementation(() => ({ data: executionLogsResponse, loading: false, error: null, refetch: jest.fn() })),
  useGetAllHealthSourcesForServiceAndEnvironment: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  getMonitoredServiceLogsPromise: jest.fn().mockImplementation(() => executionLogsResponse)
}))

describe('MonitoredServiceLogContent', () => {
  test('should download the logs of type ApiCallLog', async () => {
    jest.spyOn(cvService, 'getMonitoredServiceLogsPromise').mockReturnValue(externalAPICallLogsResponse as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ApiCallLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.download')).toBeInTheDocument()

    await userEvent.click(screen.getByText('cv.download'))

    await waitFor(() => {
      expect(cvService.getMonitoredServiceLogsPromise).toHaveBeenCalledWith({
        monitoredServiceIdentifier: 'monitoredServiceIdentifier',
        queryParams: {
          accountId: 'TEST_ACCOUNT_ID',
          endTime: 0,
          errorLogsOnly: false,
          logType: 'ApiCallLog',
          orgIdentifier: 'TEST_ORG',
          pageSize: 1,
          projectIdentifier: 'TEST_PROJECT',
          startTime: 0
        }
      })
    })
  })

  test('should download the logs of type Execution log', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ExecutionLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier1"
          serviceName="SERVICE_NAME1"
          envName="ENV_NAME1"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.download')).toBeInTheDocument()

    await userEvent.click(screen.getByText('cv.download'))

    await waitFor(() => {
      expect(cvService.getMonitoredServiceLogsPromise).toHaveBeenCalled()
    })
  })

  test('should render MonitoredServiceLogContent component of type Execution Log', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ExecutionLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.executionLogs')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render MonitoredServiceLogContent component of type External API Call Log', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ApiCallLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.externalAPICalls')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should call healthSource API for MonitoredService step', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ExecutionLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(cvService.useGetVerifyStepHealthSources).toHaveBeenLastCalledWith({
      verifyStepExecutionId: '',
      queryParams: {
        accountId: pathParams.accountId
      },
      lazy: true
    })
  })

  test('should call the logs API by clicking the load more button', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ExecutionLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(screen.getByRole('button', { name: STRING_ID_LOAD_MORE })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: STRING_ID_LOAD_MORE }))

    await waitFor(() => {
      expect(cvService.useGetMonitoredServiceLogs).toHaveBeenLastCalledWith({
        monitoredServiceIdentifier: 'monitoredServiceIdentifier',
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: 'TEST_ACCOUNT_ID',
          endTime: 0,
          errorLogsOnly: false,
          logType: 'ExecutionLog',
          orgIdentifier: 'TEST_ORG',
          pageNumber: 1,
          pageSize: 20,
          projectIdentifier: 'TEST_PROJECT',
          startTime: 0
        }
      })
      expect(screen.queryByRole('button', { name: STRING_ID_LOAD_MORE })).not.toBeInTheDocument()
    })
  })

  test('should handle the Top and Bottom navigation', async () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ExecutionLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="arrow-down"]')).toBeInTheDocument()

    await userEvent.click(container.querySelector('[data-icon="arrow-down"]')!)
  })

  test('should show the text Loading...', () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServiceLogs')
      .mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ExecutionLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  test('should show the error message and fetch the logs by clicking on Retry', async () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServiceLogs')
      .mockReturnValue({ data: {}, loading: false, error: { message: errorMessage }, refetch: jest.fn() } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ExecutionLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByText('retry'))

    await waitFor(() => {
      expect(cvService.useGetMonitoredServiceLogs).toHaveBeenLastCalledWith({
        monitoredServiceIdentifier: 'monitoredServiceIdentifier',
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: 'TEST_ACCOUNT_ID',
          endTime: 0,
          errorLogsOnly: false,
          logType: 'ExecutionLog',
          orgIdentifier: 'TEST_ORG',
          pageNumber: 0,
          pageSize: 20,
          projectIdentifier: 'TEST_PROJECT',
          startTime: 0
        }
      })
    })
  })

  test('should show loader for External API Call Logs', () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServiceLogs')
      .mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ApiCallLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('should handle error for External API Call Logs', async () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServiceLogs')
      .mockReturnValue({ data: {}, loading: false, error: { message: errorMessage }, refetch: jest.fn() } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ApiCallLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByText('Retry'))

    await waitFor(() => {
      expect(cvService.useGetMonitoredServiceLogs).toHaveBeenLastCalledWith({
        monitoredServiceIdentifier: 'monitoredServiceIdentifier',
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: 'TEST_ACCOUNT_ID',
          endTime: 0,
          errorLogsOnly: false,
          logType: 'ApiCallLog',
          orgIdentifier: 'TEST_ORG',
          pageNumber: 0,
          pageSize: 20,
          projectIdentifier: 'TEST_PROJECT',
          startTime: 0
        }
      })
    })
  })

  test('should handle no data for External API Call Logs', () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServiceLogs')
      .mockReturnValue({ data: {}, loading: false, error: null, refetch: jest.fn() } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServiceLogContent
          logType={LogTypes.ApiCallLog}
          monitoredServiceIdentifier="monitoredServiceIdentifier"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          serviceName="service 1"
          envName="env 1"
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.monitoredServices.noAvailableLogData')).toBeInTheDocument()
  })
})
