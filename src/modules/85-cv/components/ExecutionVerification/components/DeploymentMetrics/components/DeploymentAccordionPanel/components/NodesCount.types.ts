import type { RiskValues } from '@cv/utils/CommonUtils'

export interface NodeCountProps {
  nodeRiskCount?: {
    anomalousNodeCount?: number
    nodeRiskCounts?: NodeDetail[]
    totalNodeCount?: number
  }
}

export interface NodeCountDisplayProps {
  nodeDetails?: NodeDetail[]
}

export interface NodeDetail {
  count?: number
  displayName?: string
  risk?: RiskValues
}
