import type { LogData } from 'services/cv'

export enum RadarChartAngleLimits {
  MIN = 0,
  MAX = 360
}

export const HealthRiskLegendOrder: LogData['riskStatus'][] = ['HEALTHY', 'OBSERVE', 'UNHEALTHY']
