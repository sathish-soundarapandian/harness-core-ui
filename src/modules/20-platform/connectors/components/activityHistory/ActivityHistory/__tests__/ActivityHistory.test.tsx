/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ActivityHistory from '../ActivityHistory'
import connectivitySummary from './mockData/connectivitySummary.json'
import activityData from './mockData/activityData.json'
import summaryData from '../../ActivityGraph/__tests__/mockData.json'

jest.mock('services/cd-ng', () => ({
  useGetActivitiesSummary: jest.fn().mockImplementation(() => {
    return { ...summaryData, refetch: jest.fn(), error: null }
  }),
  useListActivities: jest.fn().mockImplementation(() => {
    return { ...activityData, refetch: jest.fn(), error: null }
  }),
  useGetConnectivitySummary: jest.fn().mockImplementation(() => {
    return { ...connectivitySummary, refetch: jest.fn(), error: null }
  })
}))

describe('Activity History', () => {
  test('render data for days with no activity', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <ActivityHistory
            referredEntityType="Connectors"
            entityIdentifier="entityId"
            mockActivitykData={activityData as any}
            mockConnectivitySummary={connectivitySummary as any}
          />
        </TestWrapper>
      </MemoryRouter>
    )
    await waitFor(() => getByText('activityHistory.noData'))
    expect(container.querySelector('[icon="calendar"]')).toBeDefined()
  })
})
