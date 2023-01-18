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
import {
  deploymentStatsSummaryResponse,
  noDeploymentData,
  noDeploymentOverview,
  deploymentStatsWithMoreThenOneData
} from './mocks'
import NotificationsCard from '../NotificationsCard'

jest.mock('services/dashboard-service', () => ({
  useGetDeploymentStatsOverview: jest.fn().mockImplementation(() => {
    return { data: deploymentStatsSummaryResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Notifications card tests', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper>
        <NotificationsCard timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )
    const runningExecutions = container.querySelector('[class*="runningExecutions"]')
    const badge = runningExecutions?.querySelector('[class*="badgeText"]')
    expect(badge?.textContent).toEqual('1 pipeline.dashboardDeploymentsWidget.runningPipeline.singular')
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
        <NotificationsCard timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="spinner"]')).toBeTruthy()
  })

  test('no deployment data', () => {
    jest.spyOn(dashboardService, 'useGetDeploymentStatsOverview').mockImplementation((): any => {
      return {
        data: noDeploymentData,
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })

    const { container } = render(
      <TestWrapper>
        <NotificationsCard timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )
    const badge = container?.querySelector('[class*="badgeText"]')
    expect(badge).toBeNull()
  })

  test('no deployment overview data', () => {
    jest.spyOn(dashboardService, 'useGetDeploymentStatsOverview').mockImplementation((): any => {
      return {
        data: noDeploymentOverview,
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })

    const { container } = render(
      <TestWrapper>
        <NotificationsCard timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )
    const badge = container?.querySelector('[class*="badgeText"]')
    expect(badge).toBeNull()
  })

  test('no deployment overview data', () => {
    jest.spyOn(dashboardService, 'useGetDeploymentStatsOverview').mockImplementation((): any => {
      return {
        data: deploymentStatsWithMoreThenOneData,
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })

    const { container } = render(
      <TestWrapper>
        <NotificationsCard timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )

    const runningExecutions = container.querySelector('[class*="runningExecutions"]')
    const badge = runningExecutions?.querySelector('[class*="badgeText"]')
    expect(badge?.textContent).toEqual('2 pipeline.dashboardDeploymentsWidget.runningPipeline.plural')
  })

  test('when api throws error', () => {
    jest.spyOn(dashboardService, 'useGetDeploymentStatsOverview').mockImplementation((): any => {
      return {
        data: deploymentStatsWithMoreThenOneData,
        refetch: jest.fn(),
        error: {},
        loading: false
      }
    })

    const { container } = render(
      <TestWrapper>
        <NotificationsCard timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )

    const badge = container?.querySelector('[class*="badgeText"]')
    expect(badge).toBeNull()
  })
})
