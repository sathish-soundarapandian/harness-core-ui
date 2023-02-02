/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { AnalysedDeploymentTestDataNode } from 'services/cv'
import { HostControlTestData, HostTestData, MINIMUM_DEVIATION } from './DeploymentMetricsAnalysisRow.constants'
import type { DeploymentMetricsAnalysisRowChartSeries } from './DeploymentMetricsAnalysisRow.types'

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

export function getControlDataType(
  controlDataType: AnalysedDeploymentTestDataNode['controlDataType'],
  getString: UseStringsReturn['getString']
): string {
  if (controlDataType === MINIMUM_DEVIATION) {
    return getString('cv.metricsAnalysis.controlDataType.minDeviation')
  } else {
    return ''
  }
}

export const getVerificationType = (risk: RiskValues, getString: UseStringsReturn['getString']): string => {
  switch (risk) {
    case RiskValues.HEALTHY:
      return getString('passed').toLocaleUpperCase()
    case RiskValues.WARNING:
    case RiskValues.FAILED:
      return getString('failed').toLocaleUpperCase()
    default:
      return getString('passed').toLocaleUpperCase()
  }
}
