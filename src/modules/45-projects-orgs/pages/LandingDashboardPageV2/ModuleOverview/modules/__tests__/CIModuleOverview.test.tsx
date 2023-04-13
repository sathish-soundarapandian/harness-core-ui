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
import CIModuleOverview from '../CIModuleOverview'
import { buildsExecutionData } from './mocks'

jest.mock('services/ci', () => ({
  ...jest.requireActual('services/ci'),
  useGetBuildExecution: jest.fn().mockImplementation(() => {
    return { data: buildsExecutionData, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('ci module tests', () => {
  test('ci empty state collapsed', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CIModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.ci.collapsed.title')).not.toBeNull()
  })

  test('ci empty state expanded', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CIModuleOverview isExpanded={true} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.ci.expanded.title')).not.toBeNull()
  })

  test('ci collapsed with empty state', () => {
    const { container } = render(
      <TestWrapper>
        <CIModuleOverview isExpanded={true} timeRange={DEFAULT_TIME_RANGE} isEmptyState={false} />
      </TestWrapper>
    )

    expect(container.querySelector('div[class*="countRow"]')?.textContent).toEqual('41')
    expect(container.querySelector('div[class*="highcharts-container"]')).not.toBeNull()
  })
})
