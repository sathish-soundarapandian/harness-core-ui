import type { ClusterAnalysisOverview, MetricsAnalysisOverview } from 'services/cv'

export function getTotalClustersData(clustersData: ClusterAnalysisOverview): number {
  const { unknownClustersCount = 0, knownClustersCount = 0, unexpectedFrequencyClustersCount = 0 } = clustersData
  return unknownClustersCount + knownClustersCount + unexpectedFrequencyClustersCount
}

export function getTotalMetrics(metricsAnalysis: MetricsAnalysisOverview): number {
  const { unhealthy = 0, healthy = 0, noAnalysis = 0 } = metricsAnalysis
  return unhealthy + healthy + noAnalysis
}
