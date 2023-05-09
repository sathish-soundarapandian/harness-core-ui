import { CHART_VISIBILITY_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { HealthSourceConfig } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'

export const healthSourceConfigMock: HealthSourceConfig = {
  addQuery: {
    label: 'Metric',
    enableDefaultGroupName: false
  },
  customMetrics: {
    enabled: true,
    queryAndRecords: {
      enabled: true,
      titleStringKey: 'cv.monitoringSources.commonHealthSource.defineQueryDescriptionMetrics'
    },
    metricsChart: {
      enabled: true,
      chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO
    },
    assign: {
      enabled: true,
      hideCV: false,
      hideServiceIdentifier: false,
      hideSLIAndHealthScore: false,
      defaultServiceInstance: '_sourceHost'
    }
  },
  metricPacks: {
    enabled: false
  },
  sideNav: {
    shouldBeAbleToDeleteLastMetric: false
  },
  metricThresholds: {
    enabled: true
  }
}
