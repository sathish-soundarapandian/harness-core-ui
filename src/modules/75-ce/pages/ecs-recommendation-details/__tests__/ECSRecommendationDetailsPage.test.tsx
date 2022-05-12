/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, findByText } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'

import ECSRecommendationDetailsPage from '../ECSRecommendationDetailsPage'
import ResponseData from './MockResponse.json'

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')
jest.mock('@ce/components/RecommendationDetailsSummaryCards/RecommendationDetailsSummaryCards', () => ({
  RecommendationDetailsSpendCard: () => 'recommendation-details-spend-card-mock',
  RecommendationDetailsSavingsCard: () => 'recommendation-details-savings-card-mock'
}))

const params = {
  accountId: 'TEST_ACC',
  recommendation: 'RECOMMENDATION_ID'
}

describe('Test Cases For ECS Recommendation Details Page', () => {
  test('Should be able to render the page', async () => {
    const responseState = {
      executeQuery: () => fromValue(ResponseData)
    }

    const { getByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <ECSRecommendationDetailsPage />
        </Provider>
      </TestWrapper>
    )

    expect(getByText('mock_cluster_name')).toBeDefined()
    expect(getByText('mock_serviceName')).toBeDefined()
  })

  test('Should be able to change date range', async () => {
    const responseState = {
      executeQuery: () => fromValue(ResponseData)
    }

    const { getAllByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <ECSRecommendationDetailsPage />
        </Provider>
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getAllByText('LAST 7 DAYS')[0])
    })

    const popover = findPopoverContainer()
    const lastMonth = await findByText(popover as HTMLElement, 'LAST 30 DAYS')

    act(() => {
      fireEvent.click(lastMonth)
    })

    expect(getAllByText('LAST 30 DAYS')[1]).toBeDefined()
  })

  test('Should be able to render empty page', async () => {
    const responseState = {
      executeQuery: () => fromValue({})
    }

    const { queryByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <ECSRecommendationDetailsPage />
        </Provider>
      </TestWrapper>
    )

    expect(queryByText('ce.recommendation.detailsPage.performanceOptimized')).toBeNull()
    expect(queryByText('mock_cluster_name')).toBeNull()
    expect(queryByText('mock_serviceName')).toBeNull()
    expect(queryByText('ce.recommendation.detailsPage.ecsRecommendationHelpText')).toBeNull()
  })
})
