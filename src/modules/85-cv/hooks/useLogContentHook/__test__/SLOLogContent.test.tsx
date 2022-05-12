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
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import SLOLogContent from '../views/SLOLogContent'
import { LogTypes } from '../useLogContentHook.types'
import { executionLogsResponse, externalAPICallLogsResponse, pathParams } from './ExecutionLog.mock'
import { PAGE_SIZE } from '../useLogContentHook.constants'

const { accountId, orgIdentifier, projectIdentifier } = pathParams

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVSLOs({ ...projectPathProps }),
  pathParams: {
    accountId,
    orgIdentifier,
    projectIdentifier
  }
}

const fetchHealthSources = jest.fn()

jest.mock('services/cv', () => ({
  useGetServiceLevelObjectiveLogs: jest
    .fn()
    .mockImplementation(() => ({ data: executionLogsResponse, loading: false, error: null, refetch: jest.fn() })),
  getServiceLevelObjectiveLogsPromise: jest.fn().mockImplementation(() => executionLogsResponse),
  useGetVerifyStepHealthSources: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: fetchHealthSources })),
  useGetAllHealthSourcesForServiceAndEnvironment: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() }))
}))

jest.mock('moment', () => () => ({
  format: () => 'DUMMY_DATE',
  utc: () => ({ startOf: () => ({ toDate: () => new Date('2022') }) }),
  subtract: () => ({ add: () => ({ utc: () => ({ startOf: () => ({ toDate: () => new Date('2022') }) }) }) })
}))

describe('SLOLogContent', () => {
  test('should render SLOLogContent component of type Execution Log', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ExecutionLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.executionLogs')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render SLOLogContent component of type External API Call Log', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ApiCallLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.externalAPICalls')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should not call healthSource API for SLO', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ExecutionLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(fetchHealthSources).not.toHaveBeenCalled()
  })

  test('should handle the time range filter - Execution Logs', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ExecutionLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.showingLogsFor cv.lastonehour from DUMMY_DATE to DUMMY_DATE.')).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.lastOneHour'))
    userEvent.click(screen.getByText('cv.monitoredServices.serviceHealth.last4Hrs'))

    expect(screen.getByText('cv.monitoredServices.serviceHealth.last4Hrs')).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.monitoredServices.serviceHealth.last4Hrs'))
    userEvent.click(screen.getByText('cv.last12Hours'))

    expect(screen.getByText('cv.last12Hours')).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.last12Hours'))
    userEvent.click(screen.getByText('cv.monitoredServices.serviceHealth.last24Hrs'))

    expect(screen.getByText('cv.monitoredServices.serviceHealth.last24Hrs')).toBeInTheDocument()

    await waitFor(() => {
      expect(cvService.useGetServiceLevelObjectiveLogs).toHaveBeenLastCalledWith({
        identifier: 'SLO_IDENTIFIER',
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          pageNumber: 0,
          logType: LogTypes.ExecutionLog,
          pageSize: PAGE_SIZE,
          errorLogsOnly: false,
          startTime: 1640995200000,
          endTime: 1640995200000
        }
      })
    })
  })

  test('should handle the time range filter - External API Call Logs', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ApiCallLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.showingLogsFor cv.lastonehour from DUMMY_DATE to DUMMY_DATE.')).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.lastOneHour'))
    userEvent.click(screen.getByText('cv.monitoredServices.serviceHealth.last4Hrs'))

    expect(screen.getByText('cv.monitoredServices.serviceHealth.last4Hrs')).toBeInTheDocument()

    await waitFor(() => {
      expect(cvService.useGetServiceLevelObjectiveLogs).toHaveBeenLastCalledWith({
        identifier: 'SLO_IDENTIFIER',
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          pageNumber: 0,
          logType: LogTypes.ApiCallLog,
          pageSize: PAGE_SIZE,
          errorLogsOnly: false,
          startTime: 1640995200000,
          endTime: 1640995200000
        }
      })
    })
  })

  test('should download the logs of type ApiCallLog', async () => {
    jest.spyOn(cvService, 'getServiceLevelObjectiveLogsPromise').mockReturnValue(externalAPICallLogsResponse as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ApiCallLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.download')).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.download'))

    await waitFor(() => {
      expect(cvService.getServiceLevelObjectiveLogsPromise).toHaveBeenCalledWith({
        identifier: 'SLO_IDENTIFIER',
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          logType: LogTypes.ApiCallLog,
          errorLogsOnly: false,
          startTime: 1640995200000,
          endTime: 1640995200000,
          pageSize: 1
        }
      })
    })
  })

  test('should download the logs of type ExecutionLog', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ExecutionLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.download')).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.download'))

    await waitFor(() => {
      expect(cvService.getServiceLevelObjectiveLogsPromise).toHaveBeenCalledWith({
        identifier: 'SLO_IDENTIFIER',
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          logType: LogTypes.ExecutionLog,
          errorLogsOnly: false,
          startTime: 1640995200000,
          endTime: 1640995200000,
          pageSize: 1
        }
      })
    })
  })

  test('it should handle the custom time range filter for ExecutionLog', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ExecutionLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    userEvent.click(screen.getByRole('button', { name: /cv.lastOneHour/i }))

    expect(screen.getByText('cv.selectTimeRange')).toBeInTheDocument()

    userEvent.click(screen.getByText('cancel'))

    expect(screen.queryByText('cv.selectTimeRange')).not.toBeVisible()

    userEvent.click(screen.getByRole('button', { name: /cv.lastOneHour/i }))

    expect(screen.getByText('cv.selectTimeRange')).toBeInTheDocument()

    userEvent.click(screen.getByText('common.apply'))

    expect(screen.queryByText('cv.selectTimeRange')).not.toBeVisible()
  })

  test('it should handle the custom time range filter for ApiCallLog', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLogContent
          logType={LogTypes.ApiCallLog}
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    userEvent.click(screen.getByRole('button', { name: /cv.lastOneHour/i }))

    expect(screen.getByText('cv.selectTimeRange')).toBeInTheDocument()

    userEvent.click(screen.getByText('common.apply'))

    expect(screen.queryByText('cv.selectTimeRange')).not.toBeVisible()
  })
})
