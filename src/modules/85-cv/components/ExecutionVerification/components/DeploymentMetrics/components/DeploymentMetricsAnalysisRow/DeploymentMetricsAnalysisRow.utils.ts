/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { TransactionMetricInfo } from 'services/cv'
import type { HostControlTestData, HostTestData } from './DeploymentMetricsAnalysisRow.constants'
import type { DeploymentMetricsAnalysisRowChartSeries } from './DeploymentMetricsAnalysisRow.types'

export function healthSourceTypeToLogo(healthSourceType: TransactionMetricInfo['dataSourceType']): IconName {
  switch (healthSourceType) {
    case 'APP_DYNAMICS':
      return 'service-appdynamics'
    case 'NEW_RELIC':
      return 'service-newrelic'
    case 'PROMETHEUS':
    case 'AWS_PROMETHEUS':
      return 'service-prometheus'
    case 'SPLUNK':
      return 'service-splunk'
    case 'STACKDRIVER':
    case 'STACKDRIVER_LOG':
      return 'service-stackdriver'
    case 'DATADOG_METRICS':
    case 'DATADOG_LOG':
      return 'service-datadog'
    case 'CUSTOM_HEALTH_METRIC':
    case 'CUSTOM_HEALTH_LOG':
      return 'service-custom-connector'
    case 'DYNATRACE':
      return 'service-dynatrace'
    case 'CLOUDWATCH_METRICS':
      return 'service-aws'
    default:
      return 'circle'
  }
}

export function transformControlAndTestDataToHighChartsSeries(
  controlData: HostControlTestData[],
  testData: HostTestData[]
): DeploymentMetricsAnalysisRowChartSeries[][] {
  const highchartsOptions: DeploymentMetricsAnalysisRowChartSeries[][] = []

  for (let index = 0; index < controlData.length; index++) {
    const testDataLineColor = getRiskColorValue(testData[index].risk)

    highchartsOptions.push([
      {
        type: 'spline',
        data: controlData[index].points || [],
        color: 'var(--primary-7)',
        name: testData[index].name,
        connectNulls: true,
        marker: {
          enabled: true,
          lineWidth: 1,
          symbol: 'circle',
          fillColor: 'var(--white)',
          lineColor: 'var(--primary-7)'
        },
        lineWidth: 1,
        dashStyle: 'Dash',
        baseData: controlData[index].points || [],
        actualTestData: testData[index] || []
      },
      {
        type: 'spline',
        data: testData[index].points || [],
        color: testDataLineColor,
        name: testData[index].name,
        connectNulls: true,
        marker: {
          enabled: true,
          lineWidth: 1,
          symbol: 'circle',
          fillColor: 'var(--white)',
          lineColor: testDataLineColor
        },
        lineWidth: 1,
        baseData: controlData[index].points || [],
        actualTestData: testData[index] || []
      }
    ])
  }

  return highchartsOptions
}

export function filterRenderCharts(
  charts: DeploymentMetricsAnalysisRowChartSeries[][],
  offset: number
): DeploymentMetricsAnalysisRowChartSeries[][] {
  if (charts.length <= 6) {
    return charts
  }

  return charts.slice(0, 6 * offset)
}
