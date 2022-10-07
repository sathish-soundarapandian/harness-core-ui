/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'urql'
import type { DocumentNode } from 'graphql'
import { fromValue } from 'wonka'
import { TestWrapper } from '@common/utils/testUtils'
import { FetchPerspectiveBudgetDocument } from 'services/ce/services'
import PerspectiveSummary from '../PerspectiveSummary'
import PerspectiveSummaryData from './PerspectiveSummaryData.json'
import PerspectiveBudgetData from './PerspectiveBudgetData.json'

jest.mock('services/ce', () => ({
  useGetLastMonthCost: jest.fn().mockImplementation(() => {
    return {
      data: 291482,
      refetch: jest.fn(),
      loading: false
    }
  }),
  useGetForecastCost: jest.fn().mockImplementation(() => {
    return {
      data: 286561,
      refetch: jest.fn(),
      loading: false
    }
  })
}))

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

const summaryData = PerspectiveSummaryData.data

describe('Test cases for Perspective Summary section', () => {
  test('should render the cost card, budget card and forcasted cost card', () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveBudgetDocument) {
          return fromValue(PerspectiveBudgetData)
        }
        return fromValue({})
      }
    }
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <PerspectiveSummary
            data={summaryData.perspectiveTrendStats as any}
            fetching={false}
            forecastedCostData={summaryData?.perspectiveForecastCost as any}
            isDefaultPerspective={false}
            hasClusterAsSource={true}
            filters={[]}
          />
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should render the Budget card empty in case of no budgets', () => {
    const budgetData = {
      data: {
        budgetSummaryList: []
      }
    }
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveBudgetDocument) {
          return fromValue(budgetData)
        }
        return fromValue({})
      }
    }
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <PerspectiveSummary
            data={summaryData.perspectiveTrendStats as any}
            fetching={false}
            forecastedCostData={summaryData?.perspectiveForecastCost as any}
            isDefaultPerspective={false}
            hasClusterAsSource={true}
            filters={[]}
          />
        </Provider>
      </TestWrapper>
    )

    expect(screen.getByText('$---')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
