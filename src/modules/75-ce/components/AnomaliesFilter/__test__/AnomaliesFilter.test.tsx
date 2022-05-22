/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByText, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AnomaliesFilter from '../AnomaliesFilter'

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

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test case for anomalies detection overview page', () => {
  test('should be able to render the overview dashboard', async () => {
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
          fetching={false}
        />
      </TestWrapper>
    )

    expect(queryByText(container, 'filters.selectFilter')).toBeDefined()
  })
})
