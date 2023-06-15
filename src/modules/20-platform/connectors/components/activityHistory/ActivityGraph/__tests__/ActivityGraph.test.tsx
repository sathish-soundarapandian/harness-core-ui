/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'

import ActivityGraph from '../ActivityGraph'
import summaryData from './mockData.json'

const refetchActivity = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetActivitiesSummary: jest.fn().mockImplementation(() => {
    return { ...summaryData, refetch: refetchActivity, error: null }
  })
}))

describe('Activity Graph', () => {
  test('render data for days', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <ActivityGraph
            referredEntityType="Connectors"
            entityIdentifier="entityId"
            dataFormat="DAY"
            dateRange={['From' as unknown as Date, 'To' as unknown as Date]}
            refetchActivities={jest.fn()}
            refetchConnectivitySummary={jest.fn()}
            setShowConnectivityChecks={jest.fn()}
            setShowOtherActivity={jest.fn()}
          />
        </TestWrapper>
      </MemoryRouter>
    )
    expect(getByText('activityHistory.successfulActivity')).toBeDefined()
    expect(getByText('activityHistory.failedActivity')).toBeDefined()

    await act(async () => {
      const point = container.getElementsByClassName(
        'highcharts-series highcharts-series-0 highcharts-column-series highcharts-tracker'
      )[0]

      await fireEvent.click(point)

      expect(refetchActivity).toBeCalled()
    })
  }),
    test('render data for one day', () => {
      const { getByText } = render(
        <MemoryRouter>
          <TestWrapper>
            <ActivityGraph
              referredEntityType="Connectors"
              entityIdentifier="entityId"
              dataFormat="HOUR"
              dateRange={['From' as unknown as Date, 'To' as unknown as Date]}
              refetchActivities={refetchActivity}
              refetchConnectivitySummary={jest.fn()}
              setShowConnectivityChecks={jest.fn()}
              setShowOtherActivity={jest.fn()}
            />
          </TestWrapper>
        </MemoryRouter>
      )
      expect(getByText('activityHistory.successfulActivity')).toBeDefined()
      expect(getByText('activityHistory.failedActivity')).toBeDefined()
    })
})
