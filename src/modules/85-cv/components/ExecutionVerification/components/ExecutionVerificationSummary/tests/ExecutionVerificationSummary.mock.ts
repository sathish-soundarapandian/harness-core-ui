/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const SampleResponse = {
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
}
