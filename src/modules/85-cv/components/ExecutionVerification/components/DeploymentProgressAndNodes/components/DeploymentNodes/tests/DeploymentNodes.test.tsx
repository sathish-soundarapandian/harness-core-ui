/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { getRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import { DeploymentNodes } from '../DeploymentNodes'
import type { DeploymentNodeAnalysisResult } from '../DeploymentNodes.constants'

describe('Unit tests for Deployment Nodes', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure nodes are rendered based on input', async () => {
    const healthNodes: DeploymentNodeAnalysisResult[] = [
      { risk: RiskValues.HEALTHY, hostName: 'node1', anomalousMetricsCount: 2, anomalousLogClustersCount: 4 },
      { risk: RiskValues.UNHEALTHY, hostName: 'node5', anomalousMetricsCount: 5, anomalousLogClustersCount: 6 },
      { risk: RiskValues.NEED_ATTENTION, hostName: 'node16', anomalousMetricsCount: 2, anomalousLogClustersCount: 7 },
      { risk: RiskValues.OBSERVE, hostName: 'node18', anomalousMetricsCount: 3, anomalousLogClustersCount: 5 },
      { risk: RiskValues.NO_ANALYSIS, hostName: 'node23', anomalousMetricsCount: 1, anomalousLogClustersCount: 9 },
      { risk: RiskValues.NO_DATA, hostName: 'node23', anomalousMetricsCount: 1, anomalousLogClustersCount: 9 },
      { hostName: 'node23', anomalousMetricsCount: 1, anomalousLogClustersCount: 9 } as DeploymentNodeAnalysisResult
    ]
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentNodes nodes={healthNodes} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelectorAll('[class~="nodeHealth"]').length).toBe(healthNodes.length))
    expect(container.querySelectorAll('[class~="hexagon"]').length).toBe(7)
    expect(
      container.querySelectorAll(`[data-node-health-color="${getRiskColorValue(RiskValues.HEALTHY)}"]`).length
    ).toBe(0)
    expect(
      container.querySelectorAll(`[data-node-health-color="${getRiskColorValue(RiskValues.UNHEALTHY)}"]`).length
    ).toBe(0)
    expect(
      container.querySelectorAll(`[data-node-health-color="${getRiskColorValue(RiskValues.NEED_ATTENTION)}"]`).length
    ).toBe(0)
    expect(
      container.querySelectorAll(`[data-node-health-color="${getRiskColorValue(RiskValues.OBSERVE)}"]`).length
    ).toBe(0)
    expect(
      container.querySelectorAll(`[data-node-health-color="${getRiskColorValue(RiskValues.NO_ANALYSIS)}"]`).length
    ).toBe(7)
    expect(
      container.querySelectorAll(`[data-node-health-color="${getRiskColorValue(RiskValues.NO_DATA)}"]`).length
    ).toBe(7)

    // make sure popover has right contents
    fireEvent.mouseOver(container.querySelector('[class*="hexagonContainer"]')!)
    await waitFor(() => expect(document.body.querySelector('[class*="nodeHealthPopoverContent"]')).not.toBeNull())
    expect(getByText('0 pipeline.verification.metricsInViolation')).not.toBeNull()
    expect(getByText('0 pipeline.verification.logClustersInViolation')).not.toBeNull()
    expect(document.body.querySelector('[class*="nodeHealthPopoverContent"] [class*="nodeHealth"]')).not.toBeNull()
  })
})
