import type { DeploymentProgressAndNodesProps } from '../DeploymentProgressAndNodes'

export const BaselineDeploymentMockData: DeploymentProgressAndNodesProps = {
  data: {
    spec: {
      analysedServiceIdentifier: 'sumo_service_v2',
      analysedEnvIdentifier: 'sumo_env_v2',
      monitoredServiceType: 'DEFAULT',
      monitoredServiceIdentifier: 'KQE5GbbKTD6w39T6_jwUog',
      analysisType: 'TEST',
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
          failedLogClusters: 0,
          deploymentTag: 'null'
        }
      ]
    },
    controlNodes: {
      nodeType: 'PRE_DEPLOYMENT',
      nodes: [
        {
          type: 'DEPLOYMENT_NODE',
          nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
          deploymentTag: 'tag1'
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
