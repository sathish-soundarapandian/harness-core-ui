/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import Highcharts from 'highcharts/highcharts'
import moment from 'moment'
import { Layout } from '@harness/uicore'
import { QlceViewTimeGroupType } from 'services/ce/services'
import type { ChartConfigType } from './chartUtils'
import CEChart from '../CEChart/CEChart'
import css from './CloudCostInsightChart.module.scss'

export const DAYS_FOR_TICK_INTERVAL = 10
export const ONE_MONTH = 24 * 3600 * 1000 * 30

const chartOptions = {
  chart: {
    style: {
      fontFamily: 'var(--font-family)'
    }
  }
}

Highcharts.setOptions(chartOptions)

const HighchartPoint = Highcharts.Point as any

HighchartPoint.prototype.highlight = function (event: any) {
  // this.series.chart.tooltip.refresh(this) // Show the tooltip
  this.series.chart.xAxis[0].drawCrosshair(event, this) // Show the crosshair
}

const chartHover = (event: any, point: any, series: any) => {
  point.highlight && point.highlight(event)

  const yVal = point.y

  series.legendItem.element.innerHTML = `<tspan>${series.name}: ${isNaN(yVal) ? ' ' : yVal}<tspan>`

  const chartObj = series.chart

  const displayDate = moment.utc(point.x).format('MMM D, YYYY H:mm A')

  chartObj.lbl && chartObj.lbl.destroy()

  const label = chartObj.renderer
    .label(displayDate, null, 0)
    .css({
      color: '#212121',
      fontSize: '13px',
      fill: 'none'
    })
    .add()
  label.attr({
    x: +chartObj.plotWidth + +chartObj.plotLeft - label.width
  })

  chartObj.lbl = label
}

interface GetChartProps {
  chart: ChartConfigType[]
  idx: number
  onLoad: (chart: Highcharts.Chart) => void
  chartType: string
  aggregation: QlceViewTimeGroupType
  xAxisPointCount: number
  showLegends: boolean
  title: string
}

const GetChart: React.FC<GetChartProps> = ({ chart, idx, onLoad, chartType, aggregation, xAxisPointCount, title }) => {
  const CHART_LEGEND_PREFIX_V2: Record<string, string> = {
    CPU: 'vCPU',
    Memory: 'GB'
  }
  const xAxisOptions: Highcharts.XAxisOptions = {
    type: 'datetime',
    ordinal: true,
    tickInterval:
      aggregation === QlceViewTimeGroupType.Day && xAxisPointCount < DAYS_FOR_TICK_INTERVAL
        ? 24 * 3600 * 1000
        : undefined,
    labels: {
      formatter: function () {
        switch (aggregation) {
          case QlceViewTimeGroupType.Month:
            return moment(this.value).utc().format('MMM')

          default:
            return moment(this.value).utc().format('MMM DD')
        }
      }
    },
    crosshair: {
      width: 2,
      color: '#d5dae0',
      dashStyle: 'ShortDot'
    }
  }

  const plotOptions = {
    series: {
      connectNulls: true,
      animation: {
        duration: 500
      },
      point: {
        events: {
          mouseOver: function (e: any) {
            const eventDate = e.target.x

            Highcharts.charts.forEach(chartObj1 => {
              chartObj1 &&
                chartObj1.series.forEach(series => {
                  if (series.visible) {
                    series.points.forEach(point => {
                      if (point.x === eventDate) {
                        chartHover(e, point, series)
                      }
                    })
                  }
                })
            })
          }
        }
      }
    },
    line: {
      connectNulls: true,
      events: {
        mouseOut: function () {
          Highcharts.charts.forEach(chartObject => {
            chartObject?.xAxis[0]?.hideCrosshair()
            chartObject?.tooltip?.hide()
          })
        }
      },
      marker: {
        enabled: false
      }
    }
  }

  if (aggregation === QlceViewTimeGroupType.Month) {
    xAxisOptions.tickInterval = ONE_MONTH
  }

  return (
    <article key={idx}>
      <CEChart
        options={{
          series: chart as any,
          title: {
            text: title,
            align: 'left',
            margin: 24,
            style: {
              fontSize: '14px',
              fontWeight: 'normal'
            }
          },
          chart: {
            height: 260,
            type: chartType,
            events: {
              load() {
                onLoad(this)
              }
            }
          },
          legend: {
            align: 'left',
            enabled: true,
            margin: 20,
            itemDistance: 72,
            itemStyle: {
              color: '#627386',
              fontSize: '12px',
              fontWeight: 'normal'
            }
          },
          tooltip: {
            shared: true,
            enabled: true
          },
          plotOptions,
          yAxis: {
            allowDecimals: true,
            endOnTick: true,
            tickAmount: 5,
            title: {
              text: ''
            },
            labels: {
              formatter: function () {
                return `${this['value']} ${CHART_LEGEND_PREFIX_V2[title] || ''}`
              }
            }
          },
          xAxis: xAxisOptions
        }}
      />
    </article>
  )
}

interface CCMChartProps {
  data: ChartConfigType[][]
  onLoad: (chart: Highcharts.Chart) => void
  chartType: string
  aggregation: QlceViewTimeGroupType
  xAxisPointCount: number
  showLegends: boolean
}

const Chart: React.FC<CCMChartProps> = ({ data, onLoad, chartType, aggregation, xAxisPointCount, showLegends }) => {
  const chartTiles = ['CPU', 'Memory']
  return (
    <Layout.Horizontal className={css.horizontalCharts}>
      {data.map((chart, idx: number) => {
        return chart ? (
          <div className={css.horizontalChart} key={idx}>
            <GetChart
              title={chartTiles[idx]}
              key={idx}
              chartType={chartType}
              aggregation={aggregation}
              xAxisPointCount={xAxisPointCount}
              chart={chart}
              idx={idx}
              onLoad={onLoad}
              showLegends={showLegends}
            />
          </div>
        ) : null
      })}
    </Layout.Horizontal>
  )
}

export default Chart
