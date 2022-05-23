/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByText, render, fireEvent, getByText, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import RecommendationFilters from '../RecommendationFilters'

const params = { accountId: 'TEST_ACC', orgIdentifier: 'TEST_ORG', projectIdentifier: 'TEST_PROJECT' }

jest.mock('services/ce', () => ({
  useGetFilterList: jest.fn().mockImplementation(() => {
    return {
      data: [],
      refetch: jest.fn(),
      loading: false
    }
  }),
  usePostFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useUpdateFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useDeleteFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  })
}))

describe('Tests For Recommendation Filters', () => {
  test('Should be able to render RecommendationFilters Component', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters
          costFilters={{ minCost: 0, minSaving: 0 }}
          setCostFilters={jest.fn()}
          fetching={false}
          fetchedFilterValues={[]}
          filters={{}}
          setFilters={jest.fn()}
        />
      </TestWrapper>
    )

    expect(queryByText(container, 'filters.selectFilter')).toBeDefined()

    const filterPanelButton = container.querySelector('[data-icon="ng-filter"]')
    act(() => {
      fireEvent.click(filterPanelButton!)
    })

    waitFor(() => {
      expect(getByText(container, 'ce.recommendation.listPage.filters.minSaving')).toBeDefined()
      fireEvent.click(container.querySelector('[icon="plus"]')!)
      expect(getByText(container, 'filters.typeFilterName')).toBeDefined()
      fireEvent.click(getByText(container, 'save')!)
    })
  })

  test('Should be able to render RecommendationFilters Component When Fetching Filters', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters
          costFilters={{ minCost: 0, minSaving: 0 }}
          setCostFilters={jest.fn()}
          fetching={true}
          fetchedFilterValues={[]}
          filters={{}}
          setFilters={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="spinner"]')).toBeDefined()
  })
})
