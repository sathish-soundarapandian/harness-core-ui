/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const formikInitialValues = {
  identifier: 'prometheus_metric',
  metricName: 'Prometheus Metric',
  prometheusMetric: 'process_cpu_seconds_total',
  query: 'process_cpu_seconds_total\t{\n\n\t\tjob="payment-service-nikpapag",\n\t\tgroup="goto"\n\n}',
  isManualQuery: false,
  serviceFilter: [
    {
      label: 'group:goto',
      value: 'group'
    }
  ],
  envFilter: [
    {
      label: 'job:payment-service-nikpapag',
      value: 'job'
    }
  ],
  additionalFilter: [],
  aggregator: '',
  riskCategory: 'Performance/ERROR',
  serviceInstance: 'pod',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  groupName: {
    label: 'g1',
    value: 'g1'
  },
  continuousVerification: true,
  healthScore: true,
  sli: true,
  ignoreThresholds: [
    {
      metricType: 'Custom',
      metricName: null,
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Absolute',
        spec: {}
      }
    }
  ],
  failFastThresholds: [
    {
      metricType: 'Custom',
      groupName: null,
      metricName: null,
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: 'Absolute',
        spec: {}
      }
    }
  ],
  recordCount: 1
}

export const formikInitialValuesCriteriaMock = {
  ...formikInitialValues,
  ignoreThresholds: [
    {
      metricType: 'Custom',
      metricName: null,
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Percentage',
        spec: {
          lessThan: 21
        }
      }
    }
  ]
}

export const formikInitialValuesCriteriaGreaterThanMock = {
  ...formikInitialValues,
  ignoreThresholds: [
    {
      metricType: 'Custom',
      metricName: null,
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Percentage',
        spec: {
          greaterThan: 21
        }
      }
    }
  ]
}

export const PrometheusThresholdProps = {
  formikValues: formikInitialValues,
  groupedCreatedMetrics: {
    g1: [
      {
        index: 0,
        groupName: {
          label: 'g1',
          value: 'g1'
        },
        metricName: 'Prometheus Metric'
      }
    ]
  },
  setMetricThresholds: jest.fn()
}
