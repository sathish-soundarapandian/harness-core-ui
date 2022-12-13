/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import LandingDashboardPageV2 from '../LandingDashboardPageV2'

jest.mock('../OverviewGlanceCardsContainer/OverviewGlanceCardsContainer', () => {
  return (props: any) => {
    return <div data-testid="timeRangeFrom">{props.timeRange.from}</div>
  }
})

jest.mock('@common/components/TimeRangePicker/TimeRangePicker', () => {
  return (props: any) => (
    <button
      data-testid="updateTimeRange"
      onClick={() => {
        props.setTimeRange({ from: 'dummyRangeOne', to: 'dummyRangeTwo' })
      }}
    />
  )
})

describe('landing dashboard page tests', () => {
  test('time range update', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <LandingDashboardPageV2 />
      </TestWrapper>
    )
    expect(queryByText('projectsOrgs.landingDashboard.dashboardTitle')).toBeDefined()
    const updateButton = container.querySelector('[data-testid="updateTimeRange"]')
    fireEvent.click(updateButton!)
    expect(container).toMatchSnapshot()
    expect(container.querySelector('[data-testid="timeRangeFrom"]')?.innerHTML).toContain('dummyRangeOne')
  })
})
