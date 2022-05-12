import type { GetDeploymentLogAnalysisResultQueryParams } from 'services/cv'

export type ClusterTypes = GetDeploymentLogAnalysisResultQueryParams['clusterTypes']

export interface MinMaxAngleState {
  min: number
  max: number
}

export interface LogAnalysisQueryParams {
  filterAnomalous?: string
}
