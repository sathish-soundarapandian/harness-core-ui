/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  queryByText,
  render,
  fireEvent,
  getByText,
  act,
  getByPlaceholderText,
  waitFor,
  queryByPlaceholderText
} from '@testing-library/react'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import RecommendationFilters from '../RecommendationFilters'
import SavedFilterData from './SavedFilterData.json'

const params = { accountId: 'TEST_ACC', orgIdentifier: 'TEST_ORG', projectIdentifier: 'TEST_PROJECT' }

const findDrawerContainer = (): HTMLElement | null => document.querySelector('.bp3-drawer')

jest.mock('services/ce', () => ({
  useGetFilterList: jest
    .fn()
    .mockImplementationOnce(() => {
      return {
        data: {},
        refetch: jest.fn(),
        loading: false
      }
    })
    .mockImplementation(() => {
      return {
        data: SavedFilterData,
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
  test('Should be able to render component when no saved filters', () => {
    const setFilters = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters
          costFilters={{ minCost: 0, minSaving: 0 }}
          setCostFilters={jest.fn()}
          fetching={false}
          fetchedFilterValues={[]}
          filters={{}}
          setFilters={setFilters}
        />
      </TestWrapper>
    )

    expect(queryByText(container, 'common.filters.noFilterSaved')).toBeDefined()
  })

  test('Should be able to select saved filter', () => {
    const setFilters = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters
          costFilters={{ minCost: 0, minSaving: 0 }}
          setCostFilters={jest.fn()}
          fetching={false}
          fetchedFilterValues={[]}
          filters={{}}
          setFilters={setFilters}
        />
      </TestWrapper>
    )

    const selectedFilter = queryByText(container, 'filters.selectFilter')

    fireEvent.click(selectedFilter!)

    fireEvent.click(queryByText(container, 'Test 2')!)

    expect(setFilters).toBeCalledWith(
      SavedFilterData.data.content[1].filterProperties.k8sRecommendationFilterPropertiesDTO
    )
  })

  test('Should be able to render RecommendationFilters Component when fetching filters', () => {
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

  const props = {
    fetching: false,
    fetchedFilterValues: [
      {
        key: 'name',
        values: ['default-pool', 'general-preemptible', 'pool-1', 'pool-2']
      },
      {
        key: 'resourceType',
        values: ['NODE_POOL']
      },
      {
        key: 'clusterName',
        values: ['609cfe4282d2f0abd7fc4549', '611a2e7f82d2f0abd7f4e9f8']
      }
    ],
    costFilters: { minCost: 0, minSaving: 0 },
    setCostFilters: jest.fn(),
    filters: { names: ['general-preemptible'] },
    setFilters: jest.fn()
  }

  test('Should be able to edit and delete saved filter', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters {...props} />
      </TestWrapper>
    )

    expect(queryByText(container, 'filters.selectFilter')).toBeDefined()

    const filterPanelButton = container.querySelector('[data-icon="ng-filter"]')

    act(() => {
      fireEvent.click(filterPanelButton!)
    })

    const drawer = findDrawerContainer()

    expect(getByText(drawer!, 'ce.recommendation.listPage.filters.savings')).toBeDefined()
    fireEvent.click(drawer?.querySelector('[icon="plus"]')!)
    expect(getByPlaceholderText(drawer!, 'filters.typeFilterName')).toBeDefined()
    fireEvent.click(queryByText(drawer!, 'Test 2')!)

    fireEvent.click(drawer?.querySelectorAll('[data-icon="Options"]')[2]!)

    const menu1 = findPopoverContainer()
    fireEvent.click(menu1?.querySelector('[data-icon="edit"]')!)
    fireEvent.click(drawer?.querySelector('input[value="OnlyCreator"]')!)
    fireEvent.click(drawer?.querySelector('input[value="EveryOne"]')!)
    fireEvent.click(getByText(drawer!, 'update'))

    fireEvent.click(queryByText(drawer!, 'Test3')!)
    fireEvent.click(drawer?.querySelectorAll('[data-icon="Options"]')[3]!)
    const menu2 = findPopoverContainer()
    fireEvent.click(menu2?.querySelector('[data-icon="trash"]')!)
  })

  test('Should be able to create new filter', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters {...props} />
      </TestWrapper>
    )

    expect(queryByText(container, 'filters.selectFilter')).toBeDefined()

    const filterPanelButton = container.querySelector('[data-icon="ng-filter"]')

    act(() => {
      fireEvent.click(filterPanelButton!)
    })

    const drawer = findDrawerContainer()

    fireEvent.click(drawer?.querySelector('[icon="plus"]')!)
    expect(getByPlaceholderText(drawer!, 'filters.typeFilterName')).toBeDefined()

    fireEvent.change(getByPlaceholderText(drawer!, 'filters.typeFilterName'), { target: { value: 'mock_name' } })
    fireEvent.click(getByText(drawer!, 'save'))

    await waitFor(() => expect(queryByPlaceholderText(drawer!, 'filters.typeFilterName')).toBeNull())
  })

  test('Should be able to set and apply filters and clear them', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters {...props} />
      </TestWrapper>
    )

    const filterPanelButton = container.querySelector('[data-icon="ng-filter"]')

    act(() => {
      fireEvent.click(filterPanelButton!)
    })

    const drawer = findDrawerContainer()

    fireEvent.change(getByPlaceholderText(drawer!, 'ce.recommendation.listPage.filters.savingsPlaceholder')!, {
      target: { value: 200 }
    })
    fireEvent.click(getByText(drawer!, 'filters.clearAll'))

    fireEvent.change(getByPlaceholderText(drawer!, 'ce.recommendation.listPage.filters.spendPlaceholder')!, {
      target: { value: 150 }
    })
    fireEvent.click(getByText(drawer!, 'common.apply'))

    expect(drawer?.querySelector('input[value="150"]')).toBeDefined()
  })
})
