/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DetailsPanel from '../DetailsPanel'
import { slowidgetAPI } from './DetailsPanel.mock'

const mockAPI = {
  data: {},
  refetch: jest.fn(),
  error: null,
  loading: false,
  cancel: jest.fn()
}

jest.mock('highcharts-react-official', () => () => <div />)
jest.mock('@cv/components/ChangeTimeline/components/TimelineSlider/TimelineSlider', () => () => <div />)
jest.mock('services/cv', () => ({
  useGetSLODetails: jest
    .fn()
    .mockImplementation(() => ({ data: slowidgetAPI, loading: false, error: null, refetch: jest.fn() })),
  useGetMonitoredServiceChangeEventSummary: jest.fn().mockImplementation(() => mockAPI),
  useChangeEventTimelineForAccount: jest.fn().mockImplementation(() => mockAPI),
  useChangeEventTimeline: jest.fn().mockImplementation(() => mockAPI),
  useGetAnomaliesSummary: jest.fn().mockImplementation(() => mockAPI),
  useChangeEventListForAccount: jest.fn().mockImplementation(() => mockAPI),
  useChangeEventList: jest.fn().mockImplementation(() => mockAPI),
  useGetUnavailabilityInstances: jest.fn().mockImplementation(() => mockAPI),
  useGetMonitoredServiceChangeTimeline: jest.fn().mockImplementation(() => {
    return {
      data: {
        resource: {
          categoryTimeline: {
            Deployment: [],
            Infrastructure: [],
            Alert: []
          }
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  })
}))
describe('Test DetailsPanel', () => {
  test('should render DetailsPanel', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <DetailsPanel
          sloDashboardWidget={slowidgetAPI.data.sloDashboardWidget}
          timeRangeFilters={slowidgetAPI.data.timeRangeFilters}
          loading={false}
          retryOnError={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByTestId('sloDashboardWidgetServiceName')).toBeInTheDocument()
    expect(getByTestId('sloDashboardWidgetEnvironmentName')).toBeInTheDocument()
    expect(getByTestId('cv.slos.sliType')).toBeInTheDocument()
    expect(getByTestId('cv.slos.sliType_value')).toBeInTheDocument()
    expect(getByTestId('pipeline.verification.healthSourceLabel')).toBeInTheDocument()
    expect(getByTestId('pipeline.verification.healthSourceLabel_value')).toBeInTheDocument()
    expect(getByTestId('cv.slos.sloTargetAndBudget.periodType')).toBeInTheDocument()
    expect(getByTestId('cv.slos.sloTargetAndBudget.periodType_value')).toBeInTheDocument()
    expect(getByTestId('periodLength')).toBeInTheDocument()
    expect(getByTestId('errorBudgetRemainingPercentage')).toBeInTheDocument()
    expect(getByTestId('timeRemainingDaysValue')).toBeInTheDocument()
    expect(getByTestId('timeRemainingDaysLabel')).toBeInTheDocument()
    expect(getByTestId('sloTargetPercentage')).toBeInTheDocument()
    expect(getByTestId('sloPerformanceTrendSLI')).toBeInTheDocument()
    expect(getByTestId('SLOCard_UserHint_SLO')).toBeInTheDocument()
    expect(getByTestId('timeline-slider-container')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
