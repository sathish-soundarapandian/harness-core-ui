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
  act,
  getByText,
  getByPlaceholderText,
  queryByPlaceholderText,
  waitFor,
  getAllByPlaceholderText
} from '@testing-library/react'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'

import AnomaliesFilter from '../AnomaliesFilter'
import SavedFilterData from './SavedFilterData.json'

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

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test case for anomalies detection overview page', () => {
  test('Should be able to render component when no saved filters', () => {
    const setFilters = jest.fn()
    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesFilter
          filters={{}}
          setFilters={setFilters}
          timeRange={{
            to: '2022-10-02',
            from: '2022-10-02'
          }}
          setTimeRange={jest.fn}
          fetchedFilterValues={[]}
          fetching={false}
        />
      </TestWrapper>
    )

    expect(queryByText(container, 'common.filters.noFilterSaved')).toBeDefined()
  })

  test('should be able to render the anomaly filters when loading', async () => {
    const setFilters = jest.fn()
    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesFilter
          filters={{}}
          setFilters={setFilters}
          timeRange={{
            to: '2022-10-02',
            from: '2022-10-02'
          }}
          setTimeRange={jest.fn}
          fetchedFilterValues={[{ key: 'key1', values: ['val1'] }]}
          fetching={true}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="spinner"]')).toBeDefined()
  })

  const props = {
    fetching: false,
    filters: { k8sClusterNames: ['sample-ce-dev'], awsAccounts: ['ac1'], tags: { tag1: '', TAG2: '' } },
    setFilters: jest.fn(),
    setTimeRange: jest.fn(),
    fetchedFilterValues: [
      { key: 'key1', values: ['val1'] },
      { key: 'clustername', values: ['sample-ce-dev', 'name_2'] },
      { key: 'awsaccount', values: ['ac1', 'acc2'] },
      { key: 'gcpproduct', values: ['pd1', 'pd2'] },
      { key: 'namespace', values: ['name1', 'name2'] }
    ],
    timeRange: { to: '2022-10-02', from: '2022-10-02' }
  }

  test('should be able to edit and delete saved filter', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesFilter {...props} />
      </TestWrapper>
    )

    expect(queryByText(container, 'filters.selectFilter')).toBeDefined()

    const filterPanelButton = container.querySelector('[data-icon="ng-filter"]')

    act(() => {
      fireEvent.click(filterPanelButton!)
    })

    const drawer = findDrawerContainer()

    expect(getByText(drawer!, 'ce.anomalyDetection.filters.anomalousSpend')).toBeDefined()
    fireEvent.click(drawer?.querySelector('[icon="plus"]')!)
    expect(getByPlaceholderText(drawer!, 'filters.typeFilterName')).toBeDefined()
    fireEvent.click(queryByText(drawer!, 'Test1')!)
    fireEvent.click(drawer?.querySelectorAll('[data-icon="chevron-down"]')[0]!)
    fireEvent.click(drawer?.querySelectorAll('[data-icon="Options"]')[0]!)

    const menu1 = findPopoverContainer()
    fireEvent.click(menu1?.querySelector('[data-icon="edit"]')!)
    fireEvent.click(getByText(drawer!, 'update'))

    fireEvent.click(queryByText(drawer!, 'Test_3')!)
    fireEvent.click(drawer?.querySelectorAll('[data-icon="Options"]')[1]!)
    const menu2 = findPopoverContainer()
    fireEvent.click(menu2?.querySelector('[data-icon="trash"]')!)
  })

  test('Should be able to create new filter', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesFilter {...props} />
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
    fireEvent.click(drawer?.querySelector('input[value="OnlyCreator"]')!)
    fireEvent.click(drawer?.querySelector('input[value="EveryOne"]')!)
    fireEvent.click(getByText(drawer!, 'save'))

    await waitFor(() => expect(queryByPlaceholderText(drawer!, 'filters.typeFilterName')).toBeNull())
  })

  test('Should be able to select saved filter', () => {
    const setFilters = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesFilter {...props} setFilters={setFilters} />
      </TestWrapper>
    )

    const selectedFilter = queryByText(container, 'filters.selectFilter')

    fireEvent.click(selectedFilter!)

    fireEvent.click(queryByText(container, 'Test_3')!)

    expect(setFilters).toBeCalledWith(SavedFilterData.data.content[1].filterProperties)
  })

  test('Should be able to set and apply filters and clear them', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesFilter {...props} />
      </TestWrapper>
    )

    const filterPanelButton = container.querySelector('[data-icon="ng-filter"]')

    act(() => {
      fireEvent.click(filterPanelButton!)
    })

    const drawer = findDrawerContainer()

    fireEvent.change(getAllByPlaceholderText(drawer!, 'ce.anomalyDetection.filters.spendPlaceholder')[0]!, {
      target: { value: 200 }
    })
    fireEvent.click(getByText(drawer!, 'filters.clearAll'))

    fireEvent.click(drawer?.querySelectorAll('[data-icon="chevron-down"]')[0]!)
    fireEvent.click(drawer?.querySelectorAll('[data-icon="chevron-down"]')[0]!)
    fireEvent.click(drawer?.querySelectorAll('[data-icon="chevron-down"]')[0]!)

    fireEvent.change(getAllByPlaceholderText(drawer!, 'ce.anomalyDetection.filters.spendPlaceholder')[1]!, {
      target: { value: 150 }
    })
    fireEvent.click(getByText(drawer!, 'common.apply'))

    expect(drawer?.querySelector('input[value="150"]')).toBeDefined()
  })
})
