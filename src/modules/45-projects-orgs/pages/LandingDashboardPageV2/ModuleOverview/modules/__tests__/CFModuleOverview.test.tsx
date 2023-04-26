/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DEFAULT_TIME_RANGE } from '@common/utils/momentUtils'
import CFModuleOverview from '../CFModuleOverview'

jest.mock('services/cf', () => ({
  useGetUserFlagOverview: jest.fn().mockImplementation(() => {
    return { data: { total: 10, enabled: 5 }, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('cf module tests', () => {
  test('cf expanded', () => {
    const { queryByText, container, getAllByTestId } = render(
      <TestWrapper>
        <CFModuleOverview isExpanded={true} timeRange={DEFAULT_TIME_RANGE} isEmptyState={false} />
      </TestWrapper>
    )

    expect(getAllByTestId('countRowText')[0].textContent).toEqual('5')
    expect(container.querySelector('[class*="ffColorBox"]')).not.toBeNull()
    expect(queryByText('common.moduleDetails.ff.expanded.title')).toBeNull()
  })

  test('cf expanded', () => {
    const { queryByText, getAllByTestId } = render(
      <TestWrapper>
        <CFModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState={false} />
      </TestWrapper>
    )

    expect(getAllByTestId('collapsedEnabledCount')[0].textContent).toEqual('5')
    expect(queryByText('common.moduleDetails.ff.expanded.title')).toBeNull()
  })

  test('cf empty state collapsed', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CFModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.ff.collapsed.title')).not.toBeNull()
  })

  test('cf empty state expanded', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CFModuleOverview isExpanded={true} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.ff.expanded.title')).not.toBeNull()
  })
})
