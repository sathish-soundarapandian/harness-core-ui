import type { CloudWatchMetricDefinition } from 'services/cv'
import { customMetricsFormikPropertyName } from '../../common/CustomMetricV2/CustomMetricV2.constants'
import type { CloudWatchFormCustomMetricType, CloudWatchFormType } from './CloudWatch.types'

export const CloudWatchProductNames = {
  METRICS: 'CloudWatch Metrics'
}

export const CloudWatchTypeForMetricsPacks = 'CLOUDWATCH_METRICS'
export const CustomMetricsValidationName = 'CustomMetricsNotPresent'

export const cloudWatchInitialValues: CloudWatchFormType = {
  region: '',
  customMetrics: [],
  selectedCustomMetricIndex: 0
}

export const CloudWatchProperties: Record<string, keyof CloudWatchFormType> = {
  region: 'region',
  customMetrics: customMetricsFormikPropertyName
}

export const CloudWatchCustomMetricsProperties: Record<string, keyof CloudWatchFormCustomMetricType> = {
  metricName: 'metricName',
  identifier: 'identifier',
  groupName: 'groupName',
  expression: 'expression'
}

export const newCloudWatchCustomMetricValues: CloudWatchMetricDefinition = {
  expression: '',
  groupName: '',
  identifier: '',
  metricName: '',
  analysis: {
    riskProfile: {},
    liveMonitoring: {
      enabled: false
    },
    deploymentVerification: {
      enabled: false
    }
  }
}
