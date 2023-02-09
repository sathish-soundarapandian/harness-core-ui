/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NodeRiskCount } from 'services/cv'
import type { DeploymentMetricsAnalysisRowProps } from '../DeploymentMetricsAnalysisRow'

export const InputData: DeploymentMetricsAnalysisRowProps[] = [
  {
    controlData: [
      {
        points: [
          {
            x: 0,
            y: 81.25
          },
          {
            x: 60000,
            y: 76.5
          },
          {
            x: 120000,
            y: 67.5
          },
          {
            x: 180000,
            y: 75.75
          },
          {
            x: 240000,
            y: 76.66666666666667
          }
        ],
        name: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
        initialXvalue: 1674145020000
      }
    ],
    testData: [
      {
        points: [
          {
            x: 0,
            y: 70.75
          },
          {
            x: 60000,
            y: 89.5
          },
          {
            x: 120000,
            y: 59.5
          },
          {
            x: 180000,
            y: 78.75
          },
          {
            x: 240000,
            y: 75.5
          }
        ],
        risk: 'HEALTHY',
        analysisReason: 'ML_ANALYSIS',
        name: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
        initialXvalue: 1674145380000
      }
    ],
    transactionName: 'Performance group',
    metricName: 'Performance metric',
    risk: 'HEALTHY',
    nodeRiskCount: {
      totalNodeCount: 1,
      anomalousNodeCount: 0,
      nodeRiskCounts: [
        {
          risk: 'UNHEALTHY',
          count: 0,
          displayName: 'Unhealthy'
        },
        {
          risk: 'WARNING' as NodeRiskCount['risk'],
          count: 0,
          displayName: 'Warning'
        },
        {
          risk: 'HEALTHY',
          count: 1,
          displayName: 'Healthy'
        }
      ]
    },
    thresholds: [
      {
        id: '6L6gbC9oRlCS8ypbtCi0rA',
        thresholdType: 'IGNORE',
        isUserDefined: false,
        action: 'Ignore',
        criteria: {
          measurementType: 'ratio',
          lessThanThreshold: 0
        }
      },
      {
        id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
        thresholdType: 'IGNORE',
        isUserDefined: false,
        action: 'Ignore',
        criteria: {
          measurementType: 'delta',
          lessThanThreshold: 0
        }
      }
    ],
    healthSource: {
      identifier: 'KQE5GbbKTD6w39T6_jwUog/Templatised_sumologic_metrics_health_source',
      name: 'Templatised sumologic metrics health source',
      type: 'SumologicMetrics',
      providerType: 'METRICS'
    },
    selectedDataFormat: {
      label: 'Raw',
      value: 'raw'
    },
    className: 'DeploymentMetrics-module_analysisRow_L4fk2S'
  }
]

const data1 = [
  { x: 1642941960000, y: 1000.9333333333334 },
  { x: 1642942020000, y: 805.1999999999999 },
  { x: 1642942080000, y: 879.7999999999998 },
  { x: 1642942140000, y: 864.098 }
]

const testData = [
  { x: 1642941960000, y: 456.6666666666667 },
  { x: 1642942020000, y: 386.6666666666667 },
  { x: 1642942080000, y: 466.6666666666667 },
  { x: 1642942140000, y: 702 }
]

export const seriesMock = [
  {
    type: 'spline',
    data: data1,
    color: 'var(--primary-7)',
    name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
    connectNulls: true,
    marker: { enabled: true, lineWidth: 1, symbol: 'circle', fillColor: 'var(--white)', lineColor: 'var(--primary-7)' },
    lineWidth: 1,
    dashStyle: 'Dash',
    baseData: data1,
    actualTestData: {
      points: testData,
      risk: 'HEALTHY',
      name: 'harness-deployment-canary-56b5cc7c5b-9rpq7'
    }
  },
  {
    type: 'spline',
    data: testData,
    color: 'var(--green-500)',
    name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
    connectNulls: true,
    marker: { enabled: true, lineWidth: 1, symbol: 'circle', fillColor: 'var(--white)', lineColor: 'var(--green-500)' },
    lineWidth: 1,
    baseData: data1,
    actualTestData: {
      points: testData,
      risk: 'HEALTHY',
      name: 'harness-deployment-canary-56b5cc7c5b-9rpq7'
    }
  }
]

export const testDataMock = {
  points: [
    { x: 1642941960000, y: 456.6666666666667 },
    { x: 1642942020000, y: 386.6666666666667 },
    { x: 1642942080000, y: 466.6666666666667 },
    { x: 1642942140000, y: 702 }
  ],
  risk: 'HEALTHY',
  name: 'harness-deployment-canary-56b5cc7c5b-9rpq7'
}

export const controlDataMock = {
  points: [
    { x: 1642941960000, y: 456.6666666666667 },
    { x: 1642942020000, y: 10 },
    { x: 1642942080000, y: 466.6666666666667 },
    { x: 1642942140000, y: 702 }
  ],
  risk: 'HEALTHY',
  name: 'control host name'
}

export const expectedChartConfigData = {
  chart: {
    backgroundColor: '#f8f8fe',
    height: 120,
    type: 'spline',
    width: 312.5806451612903
  },
  credits: undefined,
  legend: {
    enabled: false
  },
  plotOptions: {
    series: {
      lineWidth: 3,
      states: {
        inactive: {
          opacity: 1
        }
      },
      stickyTracking: false,
      turboThreshold: 50000
    }
  },
  series: [
    {
      actualTestData: {
        name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
        points: testData,
        risk: 'HEALTHY'
      },
      baseData: data1,
      color: 'var(--primary-7)',
      connectNulls: true,
      dashStyle: 'Dash',
      data: data1,
      lineWidth: 1,
      marker: {
        enabled: true,
        fillColor: 'var(--white)',
        lineColor: 'var(--primary-7)',
        lineWidth: 1,
        symbol: 'circle'
      },
      name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
      type: 'spline'
    },
    {
      actualTestData: {
        name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
        points: testData,
        risk: 'HEALTHY'
      },
      baseData: data1,
      color: 'var(--green-500)',
      connectNulls: true,
      data: testData,
      lineWidth: 1,
      marker: {
        enabled: true,
        fillColor: 'var(--white)',
        lineColor: 'var(--green-500)',
        lineWidth: 1,
        symbol: 'circle'
      },
      name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
      type: 'spline'
    }
  ],
  subtitle: undefined,
  title: {
    text: ''
  },
  tooltip: {
    className: 'metricsGraph_tooltip',
    formatter: expect.any(Function),
    positioner: expect.any(Function),
    outside: false,
    shared: true,
    useHTML: true
  },
  xAxis: {
    labels: {
      enabled: false
    },
    crosshair: {
      color: 'var(--primary-9-dark)',
      width: 1
    },
    tickLength: 0
  },
  yAxis: {
    gridLineWidth: 0,
    labels: {
      enabled: false
    },
    title: {
      text: ''
    }
  }
}
