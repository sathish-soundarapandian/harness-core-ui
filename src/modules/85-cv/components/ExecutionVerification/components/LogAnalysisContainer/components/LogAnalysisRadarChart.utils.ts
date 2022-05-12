/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SeriesScatterOptions } from 'highcharts'
import { Color } from '@harness/design-system'
import { getEventTypeChartColor } from '@cv/utils/CommonUtils'
import type { LogAnalysisRadarChartClusterDTO } from 'services/cv'
import type { MinMaxAngleState } from '../LogAnalysisView.container.types'
import type { MarkerOption } from './LogAnalysisRadarChart.types'

function getRadarMarkerDetails(marker: LogAnalysisRadarChartClusterDTO): MarkerOption {
  const markerDetails = [
    {
      x: marker.angle,
      y: typeof marker?.radius !== 'undefined' ? marker.radius * 30 : 10,
      color: getEventTypeChartColor(marker.clusterType)
    }
  ]

  if (marker.hasControlData && marker.baseline) {
    markerDetails.push({
      x: marker.baseline.angle,
      y: typeof marker.baseline?.radius !== 'undefined' ? marker.baseline?.radius * 30 : 10,
      color: getEventTypeChartColor(marker.baseline.clusterType)
    })
  }

  return {
    name: marker?.message && marker.message?.length > 200 ? `${marker.message?.substring(0, 200)}...` : marker?.message,
    data: markerDetails,
    pointPlacement: 'on',
    clusterId: marker?.clusterId
  }
}

export function getRadarChartSeries(data?: LogAnalysisRadarChartClusterDTO[]): SeriesScatterOptions['data'] | null {
  if (!data) {
    return null
  }

  const graphData: SeriesScatterOptions['data'] = []

  data.forEach(marker => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    graphData.push(getRadarMarkerDetails(marker))
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return graphData
}

export default function getLogAnalysisSpiderChartOptions(
  series: SeriesScatterOptions['data'] | null,
  minMaxAngle: MinMaxAngleState,
  handleRadarPointClick: (pointClusterId: string) => void
): Highcharts.Options {
  return {
    chart: {
      polar: true,
      type: 'scatter',
      height: 400,
      marginTop: 20,
      marginBottom: 20
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    pane: {
      size: '100%'
    },

    xAxis: {
      labels: { enabled: true, format: '{text}°' },
      floor: 0,
      tickmarkPlacement: 'on',
      lineWidth: 0,
      tickAmount: 13,
      max: minMaxAngle.max,
      min: minMaxAngle.min
    },
    boost: {
      enabled: true,
      seriesThreshold: 2000
    },

    yAxis: {
      labels: { enabled: false },
      plotBands: [
        {
          from: 0,
          to: 30,
          color: '#ffffff'
        },
        {
          from: 30,
          to: 60,
          color: '#FAFCFF'
        },
        {
          from: 60,
          to: 90,
          color: '#EFFBFF'
        }
      ],
      max: 90,
      allowDecimals: false,
      tickPositions: [0, 30, 60, 90],
      gridLineColor: '#ECE6E6',
      tickPixelInterval: 30
    },

    tooltip: {
      formatter: function tooltipFormatter(): string {
        return this.series.name
      },
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderColor: Color.GREY_300,
      borderRadius: 10,
      shadow: {
        color: 'rgba(96, 97, 112, 0.56)'
      },
      shape: 'square',
      outside: true
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    series,
    plotOptions: {
      series: {
        events: {
          mouseOver: function () {
            this.data.forEach(p => p.setState('hover'))
          },
          mouseOut: function () {
            this.data.forEach(p => p.setState())
          }
        },
        marker: {
          symbol: 'circle',
          states: {
            hover: {
              enabled: true,
              radius: 10
            }
          }
        },
        cursor: 'pointer',
        point: {
          events: {
            click: e => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              handleRadarPointClick(e.point.series.userOptions.clusterId)
            }
          }
        }
      }
    }
  }
}
