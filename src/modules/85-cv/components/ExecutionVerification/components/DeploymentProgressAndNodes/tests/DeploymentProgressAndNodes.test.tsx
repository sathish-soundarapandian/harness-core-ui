/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import { Classes } from '@blueprintjs/core'
import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentProgressAndNodes, DeploymentProgressAndNodesProps } from '../DeploymentProgressAndNodes'

const BaselineDeploymentMockData: DeploymentProgressAndNodesProps = {
  data: {
    spec: {
      analysedServiceIdentifier: 'sumo_service_v2',
      analysedEnvIdentifier: 'sumo_env_v2',
      monitoredServiceType: 'DEFAULT',
      monitoredServiceIdentifier: 'KQE5GbbKTD6w39T6_jwUog',
      analysisType: 'BLUE_GREEN',
      sensitivity: 'HIGH',
      durationInMinutes: 5,
      isFailOnNoAnalysis: false
    },
    appliedDeploymentAnalysisType: 'ROLLING',
    verificationStatus: 'VERIFICATION_PASSED',
    verificationProgressPercentage: 100,
    verificationStartTimestamp: 1674145324888,
    testNodes: {
      nodeType: 'POST_DEPLOYMENT',
      nodes: [
        {
          type: 'DEPLOYMENT_NODE',
          nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
          verificationResult: 'PASSED',
          failedMetrics: 0,
          failedLogClusters: 0
        }
      ]
    },
    controlNodes: {
      nodeType: 'PRE_DEPLOYMENT',
      nodes: [
        {
          type: 'DEPLOYMENT_NODE',
          nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02'
        }
      ]
    },
    metricsAnalysis: {
      healthy: 1,
      warning: 0,
      unhealthy: 0,
      noAnalysis: 0
    },
    logClusters: {
      knownClustersCount: 0,
      unknownClustersCount: 0,
      unexpectedFrequencyClustersCount: 0
    },
    errorClusters: {
      knownClustersCount: 0,
      unknownClustersCount: 0,
      unexpectedFrequencyClustersCount: 0
    }
  },
  className: 'ExecutionVerificationSummary-module_details_xcmdgQ',
  isConsoleView: true
}

const CanaryDeploymentMockData: DeploymentProgressAndNodesProps = {
  data: {
    spec: {
      analysedServiceIdentifier: 'sumo_service_v2',
      analysedEnvIdentifier: 'sumo_env_v2',
      monitoredServiceType: 'DEFAULT',
      monitoredServiceIdentifier: 'KQE5GbbKTD6w39T6_jwUog',
      analysisType: 'BLUE_GREEN',
      sensitivity: 'HIGH',
      durationInMinutes: 5,
      isFailOnNoAnalysis: false
    },
    appliedDeploymentAnalysisType: 'CANARY',
    verificationStatus: 'VERIFICATION_PASSED',
    verificationProgressPercentage: 100,
    verificationStartTimestamp: 1674145324888,
    testNodes: {
      nodeType: 'POST_DEPLOYMENT',
      nodes: [
        {
          type: 'DEPLOYMENT_NODE',
          nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
          verificationResult: 'PASSED',
          failedMetrics: 0,
          failedLogClusters: 0
        }
      ]
    },
    controlNodes: {
      nodeType: 'PRE_DEPLOYMENT',
      nodes: [
        {
          type: 'DEPLOYMENT_NODE',
          nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02'
        }
      ]
    },
    metricsAnalysis: {
      healthy: 1,
      warning: 0,
      unhealthy: 0,
      noAnalysis: 0
    },
    logClusters: {
      knownClustersCount: 0,
      unknownClustersCount: 0,
      unexpectedFrequencyClustersCount: 0
    },
    errorClusters: {
      knownClustersCount: 0,
      unknownClustersCount: 0,
      unexpectedFrequencyClustersCount: 0
    }
  },
  className: 'ExecutionVerificationSummary-module_details_xcmdgQ',
  isConsoleView: true
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
    const { container } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...BaselineDeploymentMockData} />
      </TestWrapper>
    )

    expect(container.querySelector('[class*="bp3-intent-success"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 100%;')
  })
  test('Ensure production info for a canary deeployment is rendered with green bar', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )
    expect(container.querySelector('[class*="bp3-intent-danger"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 100%;')

    const deploymentNodes = container.querySelectorAll('[class~="hexagon"]')
    expect(deploymentNodes.length).toBe(2)
  })

  test('Ensure node selection works', async () => {
    const onSelectMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} onSelectNode={onSelectMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('AFTER')).not.toBeNull())
    fireEvent.click(container.querySelector('[class*="canaryNodes"] [class~="hexagonContainer"]')!)
    await waitFor(() =>
      expect(onSelectMock).toHaveBeenLastCalledWith({
        failedLogClusters: 0,
        failedMetrics: 0,
        nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
        type: 'DEPLOYMENT_NODE',
        verificationResult: 'PASSED'
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
    clonedMock.data!.verificationProgressPercentage = 0
    clonedMock.data!.verificationStatus = 'IN_PROGRESS'

    const { getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...clonedMock} onSelectNode={onSelectMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.waitForAnalysis')).not.toBeNull())
  })

  test('should show nodes for rolling deployment type', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )

    expect(getByText(/BEFORE/)).toBeInTheDocument()
    expect(getByText(/AFTER/)).toBeInTheDocument()
    const deploymentNodes = container.querySelectorAll('[class~="hexagon"]')
    expect(deploymentNodes.length).toBe(2)
  })
})
