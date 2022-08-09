/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
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
      type: 'spline'
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

      title: {
        text: testData?.name,
        align: 'low'
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

        return `
        <div class="sectionParent" style="margin-top: 4px">
        <div class="riskIndicator" style="border: 1px solid ${getRiskColorValue(
          testData?.risk
        )};background: ${getSecondaryRiskColorValue(testData?.risk)}; margin:0 10px 0 4px"></div>
        <div>
        <p><span style="color: var(--grey-350)">${getString('pipeline.verification.testHost')}:</span> ${
          testData?.name || getString('noData')
        }</p> 
        <p><span style="color: var(--grey-350)">${getString('valueLabel')}:</span> ${testDataDisplayValue}</p>
        </div>
        </div>      
        <div class="sectionParent"> 
        <div class="riskIndicator" style="border: 1px solid var(--primary-7);background: var(--primary-2); margin:0 10px 0 4px"></div>
        <div><p><span style="color: var(--grey-350)">${getString('pipeline.verification.controlHost')}:</span> ${
          controlData?.name || getString('noData')
        }</p>
        <p><span style="color: var(--grey-350)">${getString('valueLabel')}:</span> ${baseDataDisplayValue}</p>
        </div>
        </div>`
      },
      positioner: () => {
        return {
          x: 0,
          y: -115
        }
      },
      useHTML: true,
      outside: false,
      className: 'metricsGraph_tooltip',
      backgroundColor: Color.WHITE,
      borderColor: Color.GREY_200,
      borderRadius: 10,
      shadow: {
        color: 'rgba(96, 97, 112, 0.56)'
      },
      shared: true,
      shape: 'square',
      // eslint-disable-next-line
      // @ts-ignore
      crosshairs: true
    },
    subtitle: undefined,
    series
  }
}
