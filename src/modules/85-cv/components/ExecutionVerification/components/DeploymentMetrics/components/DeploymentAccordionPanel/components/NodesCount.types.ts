import type { RiskValues } from '@cv/utils/CommonUtils'
import type { NodeRiskCount } from 'services/cv'

export interface NodeCountProps {
  nodeRiskCount?: {
    anomalousNodeCount?: number
    nodeRiskCounts?: NodeDetail[] | NodeRiskCount[]
    totalNodeCount?: number
  }
}

export interface NodeCountDisplayProps {
  nodeDetails?: NodeDetail[] | NodeRiskCount[]
}

export interface NodeDetail {
  count?: number
  displayName?: string
  risk?: RiskValues
}
