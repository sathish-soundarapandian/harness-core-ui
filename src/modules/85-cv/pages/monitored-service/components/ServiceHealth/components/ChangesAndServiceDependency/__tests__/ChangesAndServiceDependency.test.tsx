/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ChangesAndServiceDependency from '../ChangesAndServiceDependency'

jest.mock('services/cv', () => ({
  useChangeEventList: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetServiceDependencyGraph: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useChangeEventListForAccount: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  })
}))
describe('ChangesAndServiceDependency', () => {
  test('should render', async () => {
    const { container, getAllByText } = render(
      <TestWrapper>
        <ChangesAndServiceDependency
          startTime={0}
          endTime={1}
          hasChangeSource
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getAllByText('cv.monitoredServices.noAvailableData')).toHaveLength(2))
    expect(container).toMatchSnapshot()
  })
})
