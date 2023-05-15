/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import HealthScoreCard from '../HealthScoreCard'
import {
  noHealthSourceData,
  noServiceHealthScoreData,
  noDependencyHealthScoreData,
  healthSourceDataWithoutDependency
} from './HealthScoreCard.mock'

jest.mock('services/cv', () => ({
  useGetMonitoredServiceScores: jest.fn().mockImplementation(() => ({
    data: noHealthSourceData,
    refetch: jest.fn()
  }))
}))

describe('HealthScoreCard Tests', () => {
  const initialProps = {
    monitoredServiceIdentifier: 'monitored_service_identifier'
  }

  test('Both Service and Dependency Health score data not available', () => {
    const { container } = render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )

    expect(screen.getByText('cv.monitoredServices.healthScoreDataNotAvailable')).toBeInTheDocument()
    expect(screen.getByText('cv.monitoredServices.monitoredServiceTabs.serviceHealth')).toBeInTheDocument()
    expect(screen.getByText('cv.monitoredServices.dependencyHealth')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  test('No Service Health score data', () => {
    ;(cvService.useGetMonitoredServiceScores as jest.Mock).mockReturnValue({
      data: noServiceHealthScoreData,
      refetch: jest.fn()
    })

    render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.monitoredServices.healthScoreDataNotAvailable')).not.toBeInTheDocument()
    expect(screen.getByText('cv.monitoredServices.serviceHealthScoreDataNotAvailable')).toBeInTheDocument()
    expect(screen.queryByText('cv.monitoredServices.dependencyHealthScoreDataNotAvailable')).not.toBeInTheDocument()
  })

  test('No Dependency Health score score', () => {
    ;(cvService.useGetMonitoredServiceScores as jest.Mock).mockReturnValue({
      data: noDependencyHealthScoreData,
      refetch: jest.fn()
    })

    render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.monitoredServices.healthScoreDataNotAvailable')).not.toBeInTheDocument()
    expect(screen.queryByText('cv.monitoredServices.serviceHealthScoreDataNotAvailable')).not.toBeInTheDocument()
    expect(screen.getByText('cv.monitoredServices.dependencyHealthScoreDataNotAvailable')).toBeInTheDocument()
  })

  test('No Dependency available', () => {
    ;(cvService.useGetMonitoredServiceScores as jest.Mock).mockReturnValue({
      data: healthSourceDataWithoutDependency,
      refetch: jest.fn()
    })

    render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.monitoredServices.dependencyHealthScoreDataNotAvailable')).not.toBeInTheDocument()
    expect(screen.queryByText('cv.monitoredServices.serviceHealthScoreDataNotAvailable')).not.toBeInTheDocument()
    expect(screen.queryByText('cv.monitoredServices.healthScoreDataNotAvailable')).toBeInTheDocument()
  })

  test('Loading state', () => {
    ;(cvService.useGetMonitoredServiceScores as jest.Mock).mockReturnValue({
      loading: true,
      refetch: jest.fn()
    })

    const { container } = render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )

    expect(screen.getByTestId('loading-healthScore')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Error state', async () => {
    const errorMessage = 'TEST ERROR MESSAGE'

    ;(cvService.useGetMonitoredServiceScores as jest.Mock).mockReturnValue({
      error: errorMessage,
      refetch: jest.fn()
    })

    render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )

    expect(screen.getByText('cv.monitoredServices.failedToFetchHealthScore')).toBeInTheDocument()

    await userEvent.click(screen.getByText('common.seeDetails'))

    waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument())
  })
})
