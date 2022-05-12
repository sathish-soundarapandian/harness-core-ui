/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text, Layout } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'

import React from 'react'

import type { RecommendationItem, HistogramData, CustomPoint, CustomHighcharts } from '@ce/types'

import {
  getCPUValueInReadableForm,
  getMemValueInReadableFormForChart,
  getCPUValueInmCPUs,
  getMemValueInGB
} from '@ce/utils/formatResourceValue'
import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import { useStrings } from 'framework/strings'

import { ChartColors } from '../RecommendationDetails/constants'
import CEChart from '../CEChart/CEChart'
import limitMarker from './images/limitMarker.svg'
import requestMarker from './images/requestMarker.svg'
import css from './RecommendationHistogram.module.scss'

interface HistogramHeaderProps {
  header: string
}

export const HistogramHeader: React.FC<HistogramHeaderProps> = props => (
  <Text
    padding="xsmall"
    font={{ variation: FontVariation.TABLE_HEADERS, align: 'center' }}
    background={Color.PRIMARY_1}
    color={Color.PRIMARY_5}
  >
    {props.header}
  </Text>
)

interface HistogramDescriptionProps {
  description: React.ReactNode
}

export const HistogramDescription: React.FC<HistogramDescriptionProps> = props => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="xsmall" padding={{ bottom: 'small' }}>
      {props.description}
      <Text font={{ variation: FontVariation.SMALL_SEMI }}>
        {getString('ce.recommendation.recommendationChart.willBeMet')}
      </Text>
    </Layout.Horizontal>
  )
}

interface RecommendationChartProps {
  histogramData: RecommendationItem
  onCPUChartLoad: (chart: CustomHighcharts) => void
  onMemoryChartLoad: (chart: CustomHighcharts) => void
  memReqVal: number
  cpuReqVal: number
  memLimitVal: number
  selectedRecommendation: string
  updateMemoryChart: (val: [number, number]) => void
  updateCPUChart: (reqVal: number) => void
  reRenderChart: boolean
}

const RecommendationHistogram: React.FC<RecommendationChartProps> = props => {
  const { cpuReqVal, memReqVal, memLimitVal, onMemoryChartLoad, onCPUChartLoad, histogramData } = props

  const { getString } = useStrings()

  const cpuData = histogramData.cpuHistogram.bucketWeights.map((bucketWeight, index) => {
    const { firstBucketSize, growthRatio, minBucket } = histogramData.cpuHistogram
    const currentIdx = index + minBucket
    return [
      convertNumberToFixedDecimalPlaces(
        (firstBucketSize * (Math.pow(1 + Number(growthRatio), currentIdx + 1) - 1)) / Number(growthRatio),
        2
      ),
      Number(bucketWeight.toFixed(2))
    ]
  })

  const {
    firstBucketSize: cpufirstBucketSize,
    growthRatio: cpuGrowthRatio,
    minBucket: cpuMinBucket
  } = histogramData.cpuHistogram

  const formattedCPUData = [
    [
      convertNumberToFixedDecimalPlaces(
        (cpufirstBucketSize * (Math.pow(1 + Number(cpuGrowthRatio), cpuMinBucket - 1) - 1)) / Number(cpuGrowthRatio),
        2
      ),
      0
    ],
    ...cpuData
  ]

  const memData = histogramData.memoryHistogram.bucketWeights.map((bucketWeight, index) => {
    const { firstBucketSize, growthRatio, minBucket } = histogramData.memoryHistogram
    const currentIdx = index + minBucket

    return [
      convertNumberToFixedDecimalPlaces(
        (firstBucketSize * (Math.pow(1 + Number(growthRatio), currentIdx + 1) - 1)) / Number(growthRatio),
        2
      ),
      Number(bucketWeight.toFixed(2))
    ]
  })

  const { firstBucketSize, growthRatio, minBucket } = histogramData.memoryHistogram

  const formattedmemData = [
    [
      convertNumberToFixedDecimalPlaces(
        (firstBucketSize * (Math.pow(1 + Number(growthRatio), minBucket - 1) - 1)) / Number(growthRatio),
        2
      ),
      0
    ],
    ...memData
  ]

  const plotOptions = {
    series: {
      connectNulls: true,
      animation: {
        duration: 500
      }
    },
    column: {
      borderColor: undefined,
      pointPadding: 0,
      borderWidth: 0,
      groupPadding: 0,
      shadow: false
    },
    legend: {
      enabled: false
    }
  }

  const getPercentileVal: (val: number, histogram: HistogramData) => number = (val, histogram) => {
    const { precomputed } = histogram
    const preComputedFilter = precomputed.filter(preComp => preComp <= val)
    const percentileVal = preComputedFilter.length - 1
    return percentileVal
  }

  const findNearestMemData: (
    requestVal: number,
    limitVal: number
  ) => { requestPercentileValue: number; limitPercentileValue: number } = (requestVal, limitVal) => {
    const requestPercentileValue = getPercentileVal(requestVal, histogramData.memoryHistogram),
      limitPercentileValue = getPercentileVal(limitVal, histogramData.memoryHistogram)
    props.updateMemoryChart([requestPercentileValue, limitPercentileValue])

    return { requestPercentileValue, limitPercentileValue }
  }

  const findNearestCPUData: (val: number) => number = val => {
    const requestPercentileValue = getPercentileVal(val, histogramData.cpuHistogram)
    props.updateCPUChart(requestPercentileValue)
    return requestPercentileValue
  }

  const getInitialXPosition: (chart: Highcharts.Chart, memReqVal: number) => number = (chart, memReqValue) => {
    const columnData = chart.series[0].points as CustomPoint[]
    const filteredColData = columnData.filter(point => point.x <= memReqValue)
    const pointArgs = filteredColData[filteredColData.length - 1]
    const memReqValX = (pointArgs?.plotX || 0) + chart.plotLeft + (pointArgs?.pointWidth || 0) / 2 - 9
    return memReqValX
  }

  return (
    <Container className={css.chartContainer}>
      <Layout.Vertical>
        <HistogramDescription
          description={
            <>
              <Text font={{ variation: FontVariation.SMALL_SEMI }}>
                {getString('ce.recommendation.recommendationChart.cpuHistogramHeader')}
              </Text>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.PRIMARY_7}>
                {getString('ce.recommendation.recommendationChart.request')}
              </Text>
            </>
          }
        />
        <Container>
          <HistogramHeader header={getString('delegate.delegateCPU')} />
          <CEChart
            options={{
              tooltip: {
                formatter: function () {
                  return `CPU: ${getCPUValueInReadableForm(this.x)}`
                }
              },
              series: [
                {
                  showInLegend: false,
                  pointPlacement: -0.5,
                  type: 'column',
                  data: formattedCPUData,
                  zoneAxis: 'x',
                  name: getString('delegate.delegateCPU'),
                  zones: [
                    {
                      value:
                        convertNumberToFixedDecimalPlaces(histogramData?.cpuHistogram.precomputed[cpuReqVal], 2) +
                        0.001,
                      color: ChartColors.BLUE
                    },
                    {
                      color: ChartColors.GREY
                    }
                  ]
                }
              ],
              chart: {
                height: 380,
                spacingBottom: 100,
                spacingRight: 30,
                type: 'column',
                events: {
                  load() {
                    const chart = this as CustomHighcharts

                    onCPUChartLoad(chart)

                    const cpuReqValue =
                      convertNumberToFixedDecimalPlaces(histogramData?.cpuHistogram.precomputed[cpuReqVal], 2) + 0.001

                    const cpuReqValueXPost = getInitialXPosition(chart, cpuReqValue)

                    const requestPlotLine = chart.renderer
                      .image(requestMarker, cpuReqValueXPost, 0, 20, 310)
                      .attr({
                        zIndex: 3
                      })
                      .add() as any

                    requestPlotLine.chartX = cpuReqValueXPost

                    chart.renderer
                      .rect(chart.plotLeft, 282, 0.5, 16)
                      .attr({
                        'stroke-width': 1,
                        stroke: ChartColors.BLUE,
                        zIndex: 3
                      })
                      .add()

                    const requestPlotLineMarker = chart.renderer
                      .rect(chart.plotLeft, 290, cpuReqValueXPost - chart.plotLeft + 10, 0.5)
                      .attr({
                        'stroke-width': 1,
                        stroke: ChartColors.BLUE,
                        zIndex: 3
                      })
                      .add()

                    const CPUReqPercentileText = chart.renderer
                      .text(`${cpuReqVal}th`, cpuReqValueXPost + 15, 295)
                      .attr({
                        color: ChartColors.BLUE,
                        zIndex: 3
                      })
                      .add()

                    chart.container.onmousemove = function (e) {
                      const chartEvent = e as any
                      if (requestPlotLine.drag) {
                        chart.pointer.normalize(chartEvent)

                        const extremes = {
                          left: chart.plotLeft,
                          right: chart.plotLeft + chart.plotWidth
                        }

                        if (chartEvent.chartX >= extremes.left - 10 && chartEvent.chartX <= extremes.right - 10) {
                          requestPlotLine.attr({ x: chartEvent.chartX })
                          requestPlotLine.chartX = chartEvent.chartX
                          requestPlotLineMarker.attr({
                            width: chartEvent.chartX - chart.plotLeft + 10
                          })

                          CPUReqPercentileText.attr({
                            x: chartEvent.chartX + 15
                          })

                          const reqPercentileVal = findNearestCPUData(
                            chart.xAxis[0].toValue(requestPlotLine.chartX + 10)
                          )

                          CPUReqPercentileText.attr({
                            text: `${reqPercentileVal}th`
                          })
                        }
                      }
                    }

                    requestPlotLine.element.onmousedown = function () {
                      requestPlotLine.drag = true
                    }

                    requestPlotLine.element.onmouseup = function () {
                      requestPlotLine.drag = false
                    }

                    chart.rePlaceMarker = currentReqVal => {
                      const currentCPUReqValue =
                        convertNumberToFixedDecimalPlaces(histogramData?.cpuHistogram.precomputed[currentReqVal], 2) +
                        0.001

                      const cuurentCPUReqValueXPost = getInitialXPosition(chart, currentCPUReqValue)

                      requestPlotLine.attr({ x: cuurentCPUReqValueXPost })
                      requestPlotLine.chartX = cuurentCPUReqValueXPost
                      requestPlotLineMarker.attr({
                        width: cuurentCPUReqValueXPost - chart.plotLeft + 10
                      })

                      CPUReqPercentileText.attr({
                        x: cuurentCPUReqValueXPost + 15,
                        text: `${currentReqVal}th`
                      })
                    }
                  }
                }
              },
              plotOptions,
              xAxis: {
                crosshair: true,
                title: {
                  text: getString('ce.recommendation.recommendationChart.cpuPlaceholder')
                }
              },
              yAxis: {
                endOnTick: true,
                title: {
                  text: getString('ce.recommendation.recommendationChart.noOfSamples')
                },
                labels: {
                  formatter: function () {
                    return getCPUValueInmCPUs(Number(this.value))
                  }
                }
              }
            }}
          />
        </Container>
      </Layout.Vertical>
      <Layout.Vertical>
        <HistogramDescription
          description={
            <>
              <Text font={{ variation: FontVariation.SMALL_SEMI }}>
                {getString('ce.recommendation.recommendationChart.memoryHistogramHeader')}
              </Text>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.PRIMARY_7}>
                {getString('ce.recommendation.recommendationChart.request')}
              </Text>
              <Text font={{ variation: FontVariation.SMALL_SEMI }}>
                {getString('ce.recommendation.recommendationChart.and')}
              </Text>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREEN_500}>
                {getString('ce.recommendation.recommendationChart.limitLabelRegular')}
              </Text>
            </>
          }
        />
        <Container>
          <HistogramHeader header={getString('ce.recommendation.recommendationChart.memoryLabel')} />
          <CEChart
            options={{
              tooltip: {
                formatter: function () {
                  return `Memory: ${getMemValueInReadableFormForChart(this.x)}`
                }
              },
              series: [
                {
                  showInLegend: false,
                  pointPlacement: -0.5,
                  type: 'column',
                  name: getString('ce.recommendation.recommendationChart.memoryLabelRegular'),
                  data: formattedmemData,
                  zoneAxis: 'x',
                  zones: [
                    {
                      value:
                        convertNumberToFixedDecimalPlaces(histogramData?.memoryHistogram.precomputed[memReqVal], 2) + 1,
                      color: ChartColors.BLUE
                    },
                    {
                      value:
                        convertNumberToFixedDecimalPlaces(histogramData?.memoryHistogram.precomputed[memLimitVal], 2) +
                        1,
                      color: ChartColors.GREEN
                    },
                    {
                      color: ChartColors.GREY
                    }
                  ]
                }
              ],
              chart: {
                height: 380,
                type: 'column',
                spacingRight: 30,
                spacingBottom: 100,
                events: {
                  load() {
                    const chart = this as CustomHighcharts

                    onMemoryChartLoad(chart)

                    const memReqValue =
                      convertNumberToFixedDecimalPlaces(histogramData?.memoryHistogram.precomputed[memReqVal], 2) + 1

                    const memLimitValue =
                      convertNumberToFixedDecimalPlaces(histogramData?.memoryHistogram.precomputed[memLimitVal], 2) + 1

                    const memRequestMarkerXPos = getInitialXPosition(chart, memReqValue)
                    const memLimitMarkerXPos = getInitialXPosition(chart, memLimitValue)

                    const requestPlotLine = chart.renderer
                      .image(requestMarker, memRequestMarkerXPos, 0, 20, 310)
                      .attr({
                        zIndex: 3
                      })
                      .add() as any

                    const requestPlotLineMarker = chart.renderer
                      .rect(chart.plotLeft, 290, memRequestMarkerXPos - chart.plotLeft + 10, 0.5)
                      .attr({
                        'stroke-width': 1,
                        stroke: ChartColors.BLUE,
                        zIndex: 3
                      })
                      .add()

                    chart.renderer
                      .rect(chart.plotLeft, 282, 0.5, 16)
                      .attr({
                        'stroke-width': 1,
                        stroke: ChartColors.BLUE,
                        zIndex: 3
                      })
                      .add()

                    const LimitPlotLineMarker = chart.renderer
                      .rect(chart.plotLeft, 310, memLimitMarkerXPos - chart.plotLeft + 10, 0.5)
                      .attr({
                        'stroke-width': 1,
                        stroke: ChartColors.GREEN,
                        zIndex: 3
                      })
                      .add()

                    chart.renderer
                      .rect(chart.plotLeft, 302, 0.5, 16)
                      .attr({
                        'stroke-width': 1,
                        stroke: ChartColors.GREEN,
                        zIndex: 3
                      })
                      .add()

                    const memLimitPercentileText = chart.renderer
                      .text(`${memLimitVal}th`, memLimitMarkerXPos + 15, 315)
                      .attr({
                        color: ChartColors.GREEN,
                        zIndex: 3
                      })
                      .add()

                    const memReqPercentileText = chart.renderer
                      .text(`${memReqVal}th`, memRequestMarkerXPos + 15, 295)
                      .attr({
                        color: ChartColors.BLUE,
                        zIndex: 3
                      })
                      .add()

                    requestPlotLine.chartX = memRequestMarkerXPos

                    const limitPlotLine = chart.renderer
                      .image(limitMarker, memLimitMarkerXPos, 0, 20, 330)
                      .attr({
                        zIndex: 3
                      })
                      .add() as any

                    limitPlotLine.chartX = memLimitMarkerXPos

                    chart.container.onmousemove = function (e) {
                      const chartEvent = e as any
                      chart.pointer.normalize(chartEvent)

                      const extremes = {
                        left: chart.plotLeft,
                        right: chart.plotLeft + chart.plotWidth
                      }

                      if (requestPlotLine.drag) {
                        if (chartEvent.chartX >= extremes.left - 10 && chartEvent.chartX <= extremes.right - 10) {
                          requestPlotLine.attr({ x: chartEvent.chartX })
                          requestPlotLine.chartX = chartEvent.chartX
                          requestPlotLineMarker.attr({
                            width: chartEvent.chartX - chart.plotLeft + 10
                          })

                          memReqPercentileText.attr({
                            x: chartEvent.chartX + 15
                          })
                          const percentileValues = findNearestMemData(
                            chart.xAxis[0].toValue(requestPlotLine.chartX + 10),
                            chart.xAxis[0].toValue(limitPlotLine.chartX + 10)
                          )
                          memReqPercentileText.attr({
                            text: `${percentileValues.requestPercentileValue}th`
                          })
                        }
                      }

                      if (limitPlotLine.drag) {
                        if (chartEvent.chartX >= extremes.left - 10 && chartEvent.chartX <= extremes.right - 10) {
                          limitPlotLine.attr({ x: chartEvent.chartX })
                          limitPlotLine.chartX = chartEvent.chartX

                          LimitPlotLineMarker.attr({
                            width: chartEvent.chartX - chart.plotLeft + 10
                          })
                          memLimitPercentileText.attr({
                            x: chartEvent.chartX + 15
                          })

                          const percentileValues = findNearestMemData(
                            chart.xAxis[0].toValue(requestPlotLine.chartX + 10),
                            chart.xAxis[0].toValue(limitPlotLine.chartX + 10)
                          )

                          memLimitPercentileText.attr({
                            text: `${percentileValues.limitPercentileValue}th`
                          })
                        }
                      }
                    }

                    requestPlotLine.element.onmousedown = function () {
                      requestPlotLine.drag = true
                    }

                    requestPlotLine.element.onmouseup = function () {
                      requestPlotLine.drag = false
                    }

                    limitPlotLine.element.onmousedown = function () {
                      limitPlotLine.drag = true
                    }

                    limitPlotLine.element.onmouseup = function () {
                      limitPlotLine.drag = false
                    }

                    chart.rePlaceMarker = (currentReqVal, currentLimitVal) => {
                      const currentMemReqValue =
                        convertNumberToFixedDecimalPlaces(
                          histogramData?.memoryHistogram.precomputed[currentReqVal],
                          2
                        ) + 1

                      const currentMemLimitValue =
                        convertNumberToFixedDecimalPlaces(
                          histogramData?.memoryHistogram.precomputed[currentLimitVal as number],
                          2
                        ) + 1

                      const currentMemRequestMarkerXPos = getInitialXPosition(chart, currentMemReqValue)
                      const currentMemLimitMarkerXPos = getInitialXPosition(chart, currentMemLimitValue)

                      requestPlotLine.attr({ x: currentMemRequestMarkerXPos })
                      requestPlotLine.chartX = currentMemRequestMarkerXPos
                      requestPlotLineMarker.attr({
                        width: currentMemRequestMarkerXPos - chart.plotLeft + 10
                      })

                      memReqPercentileText.attr({
                        x: currentMemRequestMarkerXPos + 15,
                        text: `${currentReqVal}th`
                      })

                      limitPlotLine.attr({ x: currentMemLimitMarkerXPos })
                      limitPlotLine.chartX = currentMemLimitMarkerXPos

                      LimitPlotLineMarker.attr({
                        width: currentMemLimitMarkerXPos - chart.plotLeft + 10
                      })
                      memLimitPercentileText.attr({
                        x: currentMemLimitMarkerXPos + 15
                      })

                      memLimitPercentileText.attr({
                        text: `${currentLimitVal}th`
                      })
                    }
                  }
                }
              },
              plotOptions,
              xAxis: {
                title: {
                  text: getString('ce.recommendation.recommendationChart.memoryUsagePlaceholder')
                },
                labels: {
                  formatter: function () {
                    return `${getMemValueInGB(Number(this.value))}`
                  }
                },
                crosshair: true
              },
              yAxis: {
                endOnTick: true,
                title: {
                  text: getString('ce.recommendation.recommendationChart.noOfSamples')
                },
                labels: {
                  formatter: function () {
                    return `${this['value']}`
                  }
                }
              }
            }}
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default React.memo(RecommendationHistogram, (prevProps, nextProps) => {
  return (
    prevProps.selectedRecommendation === nextProps.selectedRecommendation &&
    prevProps.reRenderChart === nextProps.reRenderChart
  )
})
