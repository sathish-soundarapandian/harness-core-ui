/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import type { RecommendationOverviewStats } from 'services/ce/services'
import { QualityOfService, RecommendationItem, ResourceObject, TimeRange, TimeRangeType } from '@ce/types'
import RecommendationDetails from '../RecommendationDetails'

import MockHistogramData from './MockHistogramData.json'

describe('test cases for recommendation details', () => {
  test('should be able to render recommendation details', async () => {
    const { getByText, getAllByText } = render(
      <TestWrapper>
        <RecommendationDetails
          cpuAndMemoryValueBuffer={0}
          qualityOfService={QualityOfService.BURSTABLE}
          recommendationStats={{ totalMonthlyCost: 49.82, totalMonthlySaving: 19.08 } as RecommendationOverviewStats}
          currentResources={
            {
              requests: { memory: '4Gi', cpu: '1' },
              limits: { memory: '4Gi', cpu: '1' },
              empty: false
            } as ResourceObject
          }
          histogramData={MockHistogramData as RecommendationItem}
          timeRange={{ value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 }}
          currentContainer={1}
          totalContainers={1}
        />
      </TestWrapper>
    )

    expect(getByText('ce.recommendation.detailsPage.resourceChanges')).toBeDefined()
    expect(getAllByText('ce.recommendation.detailsPage.recommendedResources')).toBeDefined()
  })

  test('should be able to render multiple containers and toggle them', async () => {
    const { container } = render(
      <TestWrapper>
        <RecommendationDetails
          cpuAndMemoryValueBuffer={0}
          qualityOfService={QualityOfService.BURSTABLE}
          recommendationStats={{ totalMonthlyCost: 49.82, totalMonthlySaving: 19.08 } as RecommendationOverviewStats}
          currentResources={
            {
              requests: { memory: '4Gi', cpu: '1' },
              limits: { memory: '4Gi', cpu: '1' },
              empty: false
            } as ResourceObject
          }
          histogramData={MockHistogramData as RecommendationItem}
          timeRange={{ value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 }}
          currentContainer={1}
          totalContainers={2}
        />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(container.querySelector('[class*="toggleContainerIcon"]')!)
    })

    waitFor(() => {
      expect(container.querySelector('span[icon="caret-up"]')).toBeNull()
    })
  })
})
