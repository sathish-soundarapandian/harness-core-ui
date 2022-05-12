/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import DetailsPanel from '../DetailsPanel/DetailsPanel'
import {
  testWrapperProps,
  responseSLODashboardDetail2,
  changeEventSummaryRestParams,
  ChangeEventListResetParams,
  SLODetailsResetParams
} from './CVSLODetailsPage.mock'

jest.mock('@cv/pages/slos/CVSLODetailsPage/DetailsPanel/views/ServiceDetails', () => ({
  __esModule: true,
  default: function ServiceDetails() {
    return <span data-testid="service-details" />
  }
}))

jest.mock('services/cv', () => {
  return {
    useGetSLODetails: jest.fn().mockImplementation(() => ({
      data: responseSLODashboardDetail2,
      loading: false,
      error: null,
      refetch: jest.fn()
    })),
    useChangeEventTimeline: jest
      .fn()
      .mockImplementation(() => ({ data: null, loading: false, error: null, refetch: jest.fn(), cancel: jest.fn() })),
    useGetMonitoredServiceChangeTimeline: jest.fn().mockImplementation(() => {
      return {
        data: { resource: { categoryTimeline: { Deployment: [], Infrastructure: [], Alert: [] } } },
        loading: false,
        error: null,
        refetch: jest.fn(),
        cancel: jest.fn()
      }
    }),
    useGetAnomaliesSummary: jest
      .fn()
      .mockImplementation(() => ({ data: null, loading: false, error: null, refetch: jest.fn() })),
    useChangeEventList: jest
      .fn()
      .mockImplementation(() => ({ data: null, loading: false, error: null, refetch: jest.fn() })),
    useGetMonitoredServiceChangeEventSummary: jest
      .fn()
      .mockImplementation(() => ({ data: null, loading: false, error: null, refetch: jest.fn() }))
  }
})

const renderComponent = (): RenderResult => {
  const { sloDashboardWidget, timeRangeFilters } = responseSLODashboardDetail2.data ?? {}

  return render(
    <TestWrapper {...testWrapperProps}>
      <DetailsPanel
        loading={false}
        retryOnError={jest.fn()}
        sloDashboardWidget={sloDashboardWidget}
        timeRangeFilters={timeRangeFilters}
      />
    </TestWrapper>
  )
}

describe('Test cases for TimeRangeFilter', () => {
  beforeEach(() => {
    jest
      .spyOn(cvServices, 'useChangeEventList')
      .mockImplementation(() => ({ data: null, loading: false, error: null, refetch: jest.fn() } as any))
    jest
      .spyOn(cvServices, 'useGetMonitoredServiceChangeEventSummary')
      .mockImplementation(() => ({ data: null, loading: false, error: null, refetch: jest.fn() } as any))
  })
  test('it should render all the time range filters without reset button', async () => {
    renderComponent()

    await waitFor(() => {
      expect(cvServices.useGetSLODetails).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: SLODetailsResetParams
        })
      )
      expect(cvServices.useGetMonitoredServiceChangeEventSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...changeEventSummaryRestParams,
            startTime: 1648857600000,
            endTime: 1649462400000
          }
        })
      )
      expect(cvServices.useChangeEventList).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...ChangeEventListResetParams,
            startTime: 1648857600000,
            endTime: 1649462400000
          }
        })
      )
    })

    expect(screen.queryByText('reset')).not.toBeInTheDocument()

    userEvent.click(screen.getByText('1 Hour'))
    expect(screen.getByText('reset')).toBeInTheDocument()

    await waitFor(() => {
      expect(cvServices.useGetSLODetails).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...SLODetailsResetParams,
            startTime: 1639989840000,
            endTime: 1639993440000
          }
        })
      )
      expect(cvServices.useGetMonitoredServiceChangeEventSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...changeEventSummaryRestParams,
            startTime: 1639989840000,
            endTime: 1639993440000
          }
        })
      )
      expect(cvServices.useChangeEventList).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...ChangeEventListResetParams,
            startTime: 1639989840000,
            endTime: 1639993440000
          }
        })
      )
    })

    userEvent.click(screen.getByText('1 Day'))
    expect(screen.getByText('reset')).toBeInTheDocument()

    await waitFor(() => {
      expect(cvServices.useGetSLODetails).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...SLODetailsResetParams,
            startTime: 1639907040000,
            endTime: 1639993440000
          }
        })
      )
      expect(cvServices.useGetMonitoredServiceChangeEventSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...changeEventSummaryRestParams,
            startTime: 1639907040000,
            endTime: 1639993440000
          }
        })
      )
      expect(cvServices.useChangeEventList).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...ChangeEventListResetParams,
            startTime: 1639907040000,
            endTime: 1639993440000
          }
        })
      )
    })

    userEvent.click(screen.getByText('1 Week'))

    await waitFor(() => {
      expect(cvServices.useGetSLODetails).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...SLODetailsResetParams,
            startTime: 1639388640000,
            endTime: 1639993440000
          }
        })
      )
      expect(cvServices.useGetMonitoredServiceChangeEventSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...changeEventSummaryRestParams,
            startTime: 1639388640000,
            endTime: 1639993440000
          }
        })
      )
      expect(cvServices.useChangeEventList).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...ChangeEventListResetParams,
            startTime: 1639388640000,
            endTime: 1639993440000
          }
        })
      )
    })

    userEvent.click(screen.getByText('reset'))
    expect(screen.queryByText('reset')).not.toBeInTheDocument()

    await waitFor(() => {
      expect(cvServices.useGetSLODetails).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: SLODetailsResetParams
        })
      )
      expect(cvServices.useGetMonitoredServiceChangeEventSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...changeEventSummaryRestParams,
            startTime: 1648857600000,
            endTime: 1649462400000
          }
        })
      )
      expect(cvServices.useChangeEventList).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            ...ChangeEventListResetParams,
            startTime: 1648857600000,
            endTime: 1649462400000
          }
        })
      )
    })
  })

  test('it should handle time slider zoom', async () => {
    renderComponent()

    expect(screen.queryByText('reset')).not.toBeInTheDocument()

    expect(screen.getByTestId('timeline-slider-container')).toBeInTheDocument()
    userEvent.click(screen.getByTestId('timeline-slider-container'))

    expect(screen.getByText('cv.zoom')).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.zoom'))

    expect(screen.queryByText('cv.zoom')).not.toBeInTheDocument()
    expect(screen.getByText('reset')).toBeInTheDocument()
  })
})
