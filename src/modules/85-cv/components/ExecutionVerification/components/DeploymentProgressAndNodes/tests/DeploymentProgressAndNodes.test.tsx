/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import { Classes } from '@blueprintjs/core'
import type { AdditionalInfo, DeploymentVerificationJobInstanceSummary } from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { RiskValues } from '@cv/utils/CommonUtils'
import { DeploymentProgressAndNodes, DeploymentProgressAndNodesProps } from '../DeploymentProgressAndNodes'

const BaselineDeploymentMockData: DeploymentProgressAndNodesProps = {
  deploymentSummary: {
    additionalInfo: {
      baselineDeploymentTag: null,
      baselineStartTime: 0,
      currentDeploymentTag: 'build#3',
      currentStartTime: 1602600600000,
      type: 'TEST'
    } as any,
    durationMs: 600000,
    environmentName: 'QA',
    jobName: 'loadtest',
    progressPercentage: 100,
    startTime: 1602600600000,
    status: 'SUCCESS' as DeploymentVerificationJobInstanceSummary['status'],
    verificationJobInstanceId: 'VS4Ck5okSMeGKiHDKls25w'
  }
}

const CanaryDeploymentMockData: DeploymentProgressAndNodesProps = {
  deploymentSummary: {
    additionalInfo: {
      canary: [
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
          risk: RiskValues.HEALTHY,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-27znb',
          risk: RiskValues.HEALTHY,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        }
      ],
      canaryInstancesLabel: 'canary',
      primaryInstancesLabel: 'primary',
      primary: [
        {
          hostName: 'manager-b6b7c4d9b-s228g',
          risk: RiskValues.NO_DATA,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-p2qlw',
          risk: RiskValues.UNHEALTHY,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-ghqpv',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-9sv75',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-czh8b',
          risk: RiskValues.NO_DATA,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-pg5wb',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-6bkpw',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-7cp2g',
          risk: RiskValues.UNHEALTHY,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-s6zzs',
          risk: RiskValues.UNHEALTHY,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-c8gzk',
          risk: RiskValues.UNHEALTHY,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-27znb',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        }
      ],
      trafficSplitPercentage: null,
      type: 'CANARY'
    } as any,
    durationMs: 600000,
    environmentName: 'prod',
    jobName: 'canary',
    progressPercentage: 58,
    startTime: 1602599760000,
    status: 'ERROR',
    verificationJobInstanceId: 'kuFEp5yRRDaGgK0i5fiGdg'
  }
}

describe('Deployment progress and nodes unit tests', () => {
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
  test('Ensure baseline info is rendered with green bar', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...BaselineDeploymentMockData} />
      </TestWrapper>
    )
    await waitFor(() => getByText('pipeline.verification.baselineTest'))

    expect(container.querySelector('[class*="bp3-intent-success"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 100%;')
  })
  test('Ensure production info for a canary deeployment is rendered with red bar', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('CANARY')).not.toBeNull())
    expect(getByText('PRIMARY')).not.toBeNull()
    expect(container.querySelector('[class*="bp3-intent-danger"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 58%;')

    const deploymentNodes = container.querySelectorAll('[class~="hexagon"]')
    expect(deploymentNodes.length).toBe(14)
  })

  test('Ensure node selection works', async () => {
    const onSelectMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} onSelectNode={onSelectMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('CANARY')).not.toBeNull())
    fireEvent.click(container.querySelector('[class*="canaryNodes"] [class~="hexagonContainer"]')!)
    await waitFor(() =>
      expect(onSelectMock).toHaveBeenLastCalledWith({
        anomalousLogClustersCount: 0,
        anomalousMetricsCount: 0,
        hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
        risk: RiskValues.HEALTHY
      })
    )
    expect(container.querySelector('[class*="hexagonContainer"] [class*="selected"]')).not.toBeNull()

    // when on select callback is not passed make sure hexagon is not selected
    const { container: container2 } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )

    fireEvent.click(container2.querySelector('[class~="hexagonContainer"]')!)
    await waitFor(() => expect(container2.querySelector('[class*="hexagonContainer"][class*="selected"]')).toBeNull())
  })

  test('Ensure that correct messaging is displayed when progress is 0', async () => {
    const onSelectMock = jest.fn()
    const clonedMock = cloneDeep(CanaryDeploymentMockData)
    clonedMock.deploymentSummary!.progressPercentage = 0
    clonedMock.deploymentSummary!.status = 'IN_PROGRESS'

    const { getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...clonedMock} onSelectNode={onSelectMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.waitForAnalysis')).not.toBeNull())
  })

  test('should show nodes for rolling deployment type', () => {
    const propsWithRollingType = {
      ...CanaryDeploymentMockData,
      deploymentSummary: {
        ...CanaryDeploymentMockData.deploymentSummary,
        additionalInfo: {
          ...CanaryDeploymentMockData.deploymentSummary!.additionalInfo,
          type: 'ROLLING' as AdditionalInfo['type'],
          canaryInstancesLabel: 'Canary instance label',
          primaryInstancesLabel: 'Primary instance label'
        }
      }
    }
    render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...propsWithRollingType} />
      </TestWrapper>
    )

    expect(screen.getByText(/CANARY INSTANCE LABEL/)).toBeInTheDocument()
    expect(screen.getByText(/PRIMARY INSTANCE LABEL/)).toBeInTheDocument()
  })
})
