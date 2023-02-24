import { HealthSourceTypes } from '@cv/pages/health-source/types'

export const HEALTHSOURCE_TYPE_TO_PROVIDER_MAPPING: { [key: string]: string } = {
  [HealthSourceTypes.SumologicLogs]: 'SUMOLOGIC_LOG',
  [HealthSourceTypes.SumologicMetrics]: 'SUMOLOGIC_METRICS',
  [HealthSourceTypes.ElasticSearch_Logs]: 'ElasticSearch'
}
