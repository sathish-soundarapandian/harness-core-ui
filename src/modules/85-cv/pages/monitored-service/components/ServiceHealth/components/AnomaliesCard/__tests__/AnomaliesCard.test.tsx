/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetAnomaliesSummary } from 'services/cv'
import { RiskValues } from '@cv/utils/CommonUtils'
import { ChangeSourceTypes } from '@cv/components/ChangeTimeline/ChangeTimeline.constants'
import AnomaliesCard from '../AnomaliesCard'
import type { AnomaliesCardProps } from '../Anomalies.types'
import { areAnomaliesAvailable } from '../AnomaliesCard.utils'
import { mockedAnomaliesData } from './AnomaliesCard.mock'

const WrapperComponent = (props: AnomaliesCardProps): JSX.Element => {
  return (
    <TestWrapper>
      <AnomaliesCard {...props} />
    </TestWrapper>
  )
}

const fetchAnomaliesData = jest.fn()

jest.mock('services/cv', () => ({
  useGetAnomaliesSummary: jest.fn().mockImplementation(() => {
    return { data: mockedAnomaliesData, refetch: fetchAnomaliesData, error: null, loading: false }
  })
}))

describe('Unit tests for AnomaliesCard', () => {
  const initialProps = {
    lowestHealthScoreBarForTimeRange: {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    timeFormat: 'hours',
    timeRange: {
      startTime: 1631506424308,
      endTime: 1631506435205
    }
  }
  test('Verify if all the fields are rendered correctly inside AnomaliesCard', async () => {
    const { container, getByText } = render(<WrapperComponent {...initialProps} />)
    expect(container).toMatchSnapshot()

    expect(getByText('cv.monitoredServices.serviceHealth.anamolies: 0')).toBeDefined()
    expect(getByText('cv.monitoredServices.serviceHealth.lowestHealthScore')).toBeDefined()
    expect(getByText('pipeline.verification.analysisTab.metrics 0')).toBeDefined()
    expect(getByText('pipeline.verification.analysisTab.logs 0')).toBeDefined()
  })

  test('Verify if Correct jsx is rendered when loading is true', async () => {
    ;(useGetAnomaliesSummary as jest.Mock).mockImplementation(() => ({
      loading: true,
      data: null,
      error: null,
      refetch: fetchAnomaliesData
    }))

    const { container } = render(<WrapperComponent {...initialProps} />)
    const spinner = container.querySelector('.bp3-spinner')
    expect(spinner).toBeTruthy()
  })

  test('Verify if Correct data is returned when areAnomaliesAvailable method is called', async () => {
    const isLowestHealthScoreAvailable = 100
    expect(areAnomaliesAvailable(mockedAnomaliesData, isLowestHealthScoreAvailable)).toEqual({
      isTimeSeriesAnomaliesAvailable: true,
      isLogsAnomaliesAvailable: true,
      isTotalAnomaliesAvailable: true,
      isLowestHealthScoreAvailable: true
    })
  })

  test('it should render no data message for Changes when showOnlyChanges enabled', () => {
    render(
      WrapperComponent({
        ...initialProps,
        showOnlyChanges: true,
        changeTimelineSummary: [
          {
            key: ChangeSourceTypes.Deployments,
            count: 0,
            message: ''
          }
        ]
      })
    )

    expect(screen.getByText('cv.changeSource.noData')).toBeInTheDocument()
  })

  test('it should render no data message for Changes when showOnlyChanges disabled', () => {
    render(
      WrapperComponent({
        ...initialProps
      })
    )

    expect(screen.queryByText('cv.changeSource.noData')).not.toBeInTheDocument()
  })

  test('it should render actual data', () => {
    render(
      WrapperComponent({
        ...initialProps,
        showOnlyChanges: true,
        changeTimelineSummary: [
          {
            key: ChangeSourceTypes.Deployments,
            count: 10,
            message: 'MESSAGE'
          }
        ]
      })
    )

    expect(screen.getByText('MESSAGE')).toBeInTheDocument()
  })

  test('it should handle timeRange of undefined', () => {
    const refetch = jest.fn()
    ;(useGetAnomaliesSummary as jest.Mock).mockImplementation(() => ({
      loading: true,
      data: null,
      error: null,
      refetch
    }))

    render(
      WrapperComponent({
        ...initialProps,
        timeRange: undefined
      })
    )

    expect(refetch).not.toBeCalled()
  })
})
