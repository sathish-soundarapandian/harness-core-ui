/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SLITypeEnum } from '@cv/pages/slos/common/SLI/SLI.constants'
import { EvaluationType } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { mockedSecondaryEventsResponse } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import DetailsPanel from '../DetailsPanel'
import { slowidgetAPI } from './DetailsPanel.mock'
import { getEvaluationTitleAndValue } from '../DetailsPanel.utils'

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
  useGetSecondaryEvents: jest.fn().mockImplementation(() => {
    return {
      data: mockedSecondaryEventsResponse,
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
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
    const { getByText, getByTestId } = render(
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
    expect(getByText('common.purpose.cf.continuous')).toBeInTheDocument()
  })

  test('validate getEvaluationTitleAndValue', () => {
    const defaultValue = {
      title: 'cv.slos.sliType',
      value: 'cv.slos.slis.type.latency'
    }
    expect(getEvaluationTitleAndValue(str => str)).toEqual(defaultValue)
    expect(getEvaluationTitleAndValue(str => str, {} as any, false)).toEqual(defaultValue)
    expect(getEvaluationTitleAndValue(str => str, { type: SLITypeEnum.AVAILABILITY } as any, false)).toEqual({
      ...defaultValue,
      value: 'cv.slos.slis.type.availability'
    })
    expect(getEvaluationTitleAndValue(str => str, { evaluationType: EvaluationType.REQUEST } as any, true)).toEqual({
      title: 'cv.slos.evaluationType',
      value: 'common.request'
    })
    expect(getEvaluationTitleAndValue(str => str, { evaluationType: EvaluationType.WINDOW } as any, true)).toEqual({
      title: 'cv.slos.evaluationType',
      value: 'cv.slos.slis.evaluationType.window'
    })
  })
})
