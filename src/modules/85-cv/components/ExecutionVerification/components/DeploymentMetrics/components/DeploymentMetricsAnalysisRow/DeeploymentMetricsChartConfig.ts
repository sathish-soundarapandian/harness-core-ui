/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { getRiskColorValue, getSecondaryRiskColorValue } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { HostControlTestData, HostTestData } from './DeploymentMetricsAnalysisRow.constants'
import type { DeploymentMetricsAnalysisRowChartSeries } from './DeploymentMetricsAnalysisRow.types'

export function chartsConfig(
  series: DeploymentMetricsAnalysisRowChartSeries[],
  width: number,
  testData: HostTestData | undefined,
  controlData: HostControlTestData | undefined,
  getString: UseStringsReturn['getString']
): Highcharts.Options {
  return {
    chart: {
      height: 120,
      width,
      type: 'spline',
      backgroundColor: '#f8f8fe'
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      tickLength: 0,
      labels: {
        enabled: false
      },
      crosshair: {
        width: 1,
        color: 'var(--primary-9-dark)'
      }
    },
    yAxis: {
      gridLineWidth: 0,
      labels: {
        enabled: false
      },
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        lineWidth: 3,
        turboThreshold: 50000,
        states: {
          inactive: {
            opacity: 1
          }
        }
      }
    },
    tooltip: {
      formatter: function tooltipFormatter(): string {
        // eslint-disable-next-line
        // @ts-ignore
        const baseDataValue = controlData?.points[this.points[0]?.point.index]?.y
        // eslint-disable-next-line
        // @ts-ignore
        const testDataValue = testData?.points[this.points[0]?.point.index]?.y

        // to show "No data" text when the y axis value is null
        const baseDataDisplayValue = baseDataValue?.toFixed(3) ?? getString('noData')
        const testDataDisplayValue = testDataValue?.toFixed(3) ?? getString('noData')

        // eslint-disable-next-line
        // @ts-ignore
        const baseDataTime = controlData?.points[this?.points?.[0]?.point.index]?.x + controlData?.initialXvalue
        const baseDataTimestamp = baseDataTime ? moment(baseDataTime).format('lll') : getString('noData')

        // eslint-disable-next-line
        // @ts-ignore
        const testeDataTime = testData?.points[this?.points?.[0]?.point.index]?.x + testData?.initialXvalue
        const testDataTimestamp = testeDataTime ? moment(testeDataTime).format('lll') : getString('noData')

        return `
        <div style="margin-bottom: var(--spacing-xsmall); color: var(--grey-350)">${testDataTimestamp}</div>
        <div class="sectionParent" style="margin-top: 4px">
        <div class="riskIndicator" style="border: 1px solid ${getRiskColorValue(
          testData?.risk
        )};background: ${getSecondaryRiskColorValue(testData?.risk)}; margin:0 10px 0 4px"></div>
        <div>
        <p><span style="color: var(--grey-350)">${getString(
          'pipeline.verification.testData'
        )}:</span><span style="color: var(--white); margin-left: var(--spacing-small)">${testDataDisplayValue}</span></p>
        </div>
        </div>      
        <div style="margin-bottom: var(--spacing-xsmall); color: var(--grey-350)">${baseDataTimestamp}</div>
        <div class="sectionParent"> 
        <div class="riskIndicator" style="border: 1px solid var(--primary-7);background: var(--primary-2); margin:0 10px 0 4px"></div> 
        <p><span style="color: var(--grey-350)">${getString(
          'pipeline.verification.controlData'
        )}:</span><span style="color: var(--white); margin-left: var(--spacing-small)" >${baseDataDisplayValue}</span></p>
        </div>`
      },
      positioner: (_, __, point) => {
        const { plotX } = point || {}
        const xPosition = plotX > 900 ? plotX - 200 : plotX - 100
        return {
          x: xPosition,
          y: -70
        }
      },
      useHTML: true,
      outside: false,
      className: 'metricsGraph_tooltip',
      shared: true
    },
    subtitle: undefined,
    series
  }
}
