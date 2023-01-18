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
import * as dashboardService from 'services/dashboard-service'
import CDModuleOverview from '../CDModuleOverview'
import { deploymentStatsSummaryResponse } from './mocks'

jest.mock('services/dashboard-service', () => ({
  useGetDeploymentStatsOverview: jest.fn().mockImplementation(() => {
    return { data: deploymentStatsSummaryResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('@projects-orgs/pages/LandingDashboardPageV2/ModuleColumnChart/ModuleColumnChart', () => {
  return () => <div>Module column chart</div>
})

describe('module overview grid test', () => {
  test('cd module overview collapsed with data', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CDModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState={false} />
      </TestWrapper>
    )

    expect(queryByText('Module column chart')).not.toBeNull()
  })

  test('cd module overview collapsed empty state', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CDModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState={true} />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.cd.collapsed.title')).not.toBeNull()
  })

  test('cd module overview expanded empty state', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CDModuleOverview isExpanded={true} timeRange={DEFAULT_TIME_RANGE} isEmptyState={true} />
      </TestWrapper>
    )
    expect(queryByText('common.moduleDetails.cd.expanded.title')).not.toBeNull()
  })

  test('loading true', () => {
    jest.spyOn(dashboardService, 'useGetDeploymentStatsOverview').mockImplementation((): any => {
      return {
        data: [],
        refetch: jest.fn(),
        error: null,
        loading: true
      }
    })

    const { container } = render(
      <TestWrapper>
        <CDModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState={false} />
      </TestWrapper>
    )

    //spinner should be visible
    expect(container.querySelector('[data-icon="spinner"]')).toBeTruthy()
  })
})
