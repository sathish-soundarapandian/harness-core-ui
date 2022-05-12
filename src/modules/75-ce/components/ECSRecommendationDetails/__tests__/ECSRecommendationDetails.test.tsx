/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import type { RecommendationOverviewStats } from 'services/ce/services'
import { TimeRange, TimeRangeType } from '@ce/types'
import MockResponse from '@ce/pages/ecs-recommendation-details/__tests__/MockResponse.json'

import ECSRecommendationDetails, { EcsRecommendationDtoWithCurrentResources } from '../ECSRecommendationDetails'

const props = {
  recommendationStats: MockResponse.data.recommendationStatsV2 as RecommendationOverviewStats,
  timeRange: { value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 },
  timeRangeFilter: ['2022-02-02T00:00:00Z', '2022-02-08T03:18:24Z'],
  buffer: 0,
  recommendationDetails: MockResponse.data.recommendationDetails as EcsRecommendationDtoWithCurrentResources
}

describe('Test Cases For ECSRecommendationDetails Component', () => {
  test('Should be able to render ECSRecommendationDetails Component', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ECSRecommendationDetails {...props} />
      </TestWrapper>
    )

    expect(getByText('ce.recommendation.listPage.monthlySavingsText')).toBeDefined()
    expect(getByText('ce.recommendation.listPage.monthlyPotentialCostText')).toBeDefined()
    expect(getByText('$55.60')).toBeDefined()
  })

  test('Should be able to switch between Cost and Performance Optimized', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ECSRecommendationDetails {...props} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('ce.recommendation.detailsPage.performanceOptimized'))
    })

    expect(getByText('ce.recommendation.detailsPage.performanceOptimizedCaps')).toBeDefined()
  })
})
