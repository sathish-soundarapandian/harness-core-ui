import type { StringKeys } from 'framework/strings'
import { CHART_VISIBILITY_ENUM } from '../../../CommonHealthSource.constants'

export const healthSourceConfig = {
  addQuery: {
    label: 'Metric',
    enableDefaultGroupName: false
  },
  customMetrics: {
    enabled: true,
    queryAndRecords: {
      enabled: true,
      titleStringKey: 'cv.monitoringSources.commonHealthSource.defineQuerySubDescription' as StringKeys
    },
    metricsChart: {
      enabled: true,
      chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO
    }
  },
  metricPacks: {
    enabled: false
  },
  sideNav: {
    shouldBeAbleToDeleteLastMetric: true
  },
  metricThresholds: {
    enabled: true
  }
}

export const healthSourceConfigWithNoMetricThresholdsAndMetricPacks = {
  addQuery: {
    label: 'Metric',
    enableDefaultGroupName: false
  },
  customMetrics: {
    enabled: true,
    queryAndRecords: {
      enabled: true,
      titleStringKey: 'cv.monitoringSources.commonHealthSource.defineQuerySubDescription' as StringKeys
    },
    metricsChart: {
      enabled: true,
      chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO
    }
  },
  sideNav: {
    shouldBeAbleToDeleteLastMetric: true
  }
}

export const healthSourceConfigWithMetricPacksEnabled = {
  ...healthSourceConfig,
  metricPacks: {
    enabled: true
  }
}

export const healthSourceConfigWithMetricThresholdsDisabled = {
  ...healthSourceConfig,
  metricThresholds: {
    enabled: false
  }
}

export const healthSourceConfigWithMetricThresholdsEnabled = {
  ...healthSourceConfig,
  metricThresholds: {
    enabled: true
  }
}

export const configurationsPageInitialValues = {
  queryMetricsMap: new Map([
    [
      'M1',
      {
        identifier: 'M1',
        metricName: 'M1',
        query: 'a',
        riskCategory: 'Performance',
        lowerBaselineDeviation: true,
        higherBaselineDeviation: false,
        groupName: {
          label: 'g1',
          value: 'g1'
        },
        continuousVerification: false,
        healthScore: false,
        sli: false
      }
    ]
  ]),
  selectedMetric: 'M1',
  ignoreThresholds: [],
  failFastThresholds: []
}
