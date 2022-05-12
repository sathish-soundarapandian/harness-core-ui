/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text, Layout } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'

import React from 'react'
import type { PlotOptions } from 'highcharts'

import type { CustomHighcharts, CustomPoint, HistogramData } from '@ce/types'

import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import { Utils } from '@ce/common/Utils'
import { useStrings } from 'framework/strings'

import CEChart from '../CEChart/CEChart'
import { ChartColors } from '../RecommendationDetails/constants'
import { HistogramDescription, HistogramHeader } from './RecommendationHistogram'
import requestMarker from './images/requestMarker.svg'

import css from './RecommendationHistogram.module.scss'

interface RecommendationChartProps {
  cpuHistogram: HistogramData
  memoryHistogram: HistogramData
  onCPUChartLoad: (chart: CustomHighcharts) => void
  onMemoryChartLoad: (chart: CustomHighcharts) => void
  memReqVal: number
  cpuReqVal: number
  selectedRecommendation: string
  updateMemoryChart: (val: number) => void
  updateCPUChart: (reqVal: number) => void
  reRenderChart: boolean
}

const ECSRecommendationHistogram: React.FC<RecommendationChartProps> = props => {
  const { cpuReqVal, memReqVal, onMemoryChartLoad, onCPUChartLoad, cpuHistogram, memoryHistogram } = props

  const cpuM1 = cpuHistogram.maxBucket
  const cpuM0 = cpuHistogram.minBucket

  const cpuN = cpuHistogram.numBuckets

  const cpuX1 = cpuHistogram.precomputed[100]
  const cpuX0 = Utils.getConditionalResult(cpuM1 === 0, cpuX1, (cpuX1 * cpuM0) / cpuM1)

  const cpuD = Utils.getConditionalResult(cpuN === 1, 0, (cpuX1 - cpuX0) / (cpuN - 1))

  const cpuData = cpuHistogram.bucketWeights.map((bucketWeight, index) => {
    const x = cpuX0 + cpuD * index

    return [convertNumberToFixedDecimalPlaces(x, 3), Number(bucketWeight.toFixed(2))]
  })

  const memM1 = memoryHistogram.maxBucket
  const memM0 = memoryHistogram.minBucket

  const memN = memoryHistogram.numBuckets

  const memX1 = memoryHistogram.precomputed[100]
  const memX0 = Utils.getConditionalResult(memM1 === 0, memX1, (memX1 * memM0) / memM1)

  const memD = Utils.getConditionalResult(memN === 1, 0, (memX1 - memX0) / (memN - 1))

  const memData = memoryHistogram.bucketWeights.map((bucketWeight, index) => {
    const x = memX0 + memD * index

    return [convertNumberToFixedDecimalPlaces(x, 3), Number(bucketWeight.toFixed(2))]
  })

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

  /* istanbul ignore next */
  const getPercentileVal: (val: number, histogram: HistogramData) => number = (val, histogram) => {
    const { precomputed } = histogram
    const preComputedFilter = precomputed.filter(preComp => preComp <= val)
    return preComputedFilter.length - 1
  }

  /* istanbul ignore next */
  const findNearestMemData: (requestVal: number) => number = requestVal => {
    const requestPercentileValue = getPercentileVal(requestVal, memoryHistogram)

    props.updateMemoryChart(requestPercentileValue)

    return requestPercentileValue
  }

  /* istanbul ignore next */
  const findNearestCPUData: (val: number) => number = val => {
    const requestPercentileValue = getPercentileVal(val, cpuHistogram)

    props.updateCPUChart(requestPercentileValue)
    return requestPercentileValue
  }

  /* istanbul ignore next */
  const getInitialXPosition: (chart: Highcharts.Chart, memReqVal: number) => number = (chart, memReqValue) => {
    const columnData = chart.series[0].points as CustomPoint[]
    const filteredColData = columnData.filter(point => point.x <= memReqValue)
    const pointArgs = filteredColData[filteredColData.length - 1]
    return (pointArgs?.plotX || 0) + chart.plotLeft + (pointArgs?.pointWidth || 0) / 2 - 9
  }

  return (
    <Container className={css.chartContainer}>
      <CPUHistogram
        cpuHistogram={cpuHistogram}
        cpuReqVal={cpuReqVal}
        findNearestCPUData={findNearestCPUData}
        cpuData={cpuData}
        getInitialXPosition={getInitialXPosition}
        onCPUChartLoad={onCPUChartLoad}
        plotOptions={plotOptions}
      />
      <MemoryHistogram
        findNearestMemData={findNearestMemData}
        memData={memData}
        getInitialXPosition={getInitialXPosition}
        memReqVal={memReqVal}
        memoryHistogram={memoryHistogram}
        onMemoryChartLoad={onMemoryChartLoad}
        plotOptions={plotOptions}
      />
    </Container>
  )
}

export default React.memo(ECSRecommendationHistogram, (prevProps, nextProps) => {
  return (
    prevProps.selectedRecommendation === nextProps.selectedRecommendation &&
    prevProps.reRenderChart === nextProps.reRenderChart
  )
})

interface CPUHistogramProps {
  cpuData: number[][]
  cpuHistogram: HistogramData
  onCPUChartLoad: (chart: CustomHighcharts) => void
  cpuReqVal: number
  findNearestCPUData: (val: number) => number
  getInitialXPosition: (chart: Highcharts.Chart, memReqVal: number) => number
  plotOptions: PlotOptions
}

const CPUHistogram: React.FC<CPUHistogramProps> = ({
  cpuData,
  cpuHistogram,
  cpuReqVal,
  onCPUChartLoad,
  findNearestCPUData,
  getInitialXPosition,
  plotOptions
}) => {
  const { getString } = useStrings()

  return (
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
                return `CPU: ${this.x}`
              }
            },
            series: [
              {
                showInLegend: false,
                pointPlacement: -0.5,
                type: 'column',
                data: cpuData,
                zoneAxis: 'x',
                name: getString('delegate.delegateCPU'),
                zones: [
                  {
                    value: convertNumberToFixedDecimalPlaces(cpuHistogram.precomputed[cpuReqVal], 3) + 0.001,
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

                  const cpuReqValue = convertNumberToFixedDecimalPlaces(cpuHistogram.precomputed[cpuReqVal], 3) + 0.001

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

                  chart.container.onmousemove = /* istanbul ignore next */ function (e) {
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

                        const reqPercentileVal = findNearestCPUData(chart.xAxis[0].toValue(requestPlotLine.chartX + 10))

                        CPUReqPercentileText.attr({
                          text: `${reqPercentileVal < 0 ? 0 : reqPercentileVal}th`
                        })
                      }
                    }
                  }

                  requestPlotLine.element.onmousedown = /* istanbul ignore next */ function () {
                    requestPlotLine.drag = true
                  }

                  requestPlotLine.element.onmouseup = /* istanbul ignore next */ function () {
                    requestPlotLine.drag = false
                  }

                  chart.rePlaceMarker = currentReqVal => {
                    const currentCPUReqValue =
                      convertNumberToFixedDecimalPlaces(cpuHistogram.precomputed[currentReqVal], 3) + 0.001

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
                text: getString('ce.recommendation.recommendationChart.cpuValuePlaceholder')
              }
            },
            yAxis: {
              endOnTick: true,
              title: {
                text: getString('ce.recommendation.recommendationChart.noOfSamples')
              },
              labels: {
                formatter: function () {
                  return String(this.value)
                }
              }
            }
          }}
        />
      </Container>
    </Layout.Vertical>
  )
}

interface MemoryHistogramProps {
  memData: number[][]
  memoryHistogram: HistogramData
  onMemoryChartLoad: (chart: CustomHighcharts) => void
  memReqVal: number
  findNearestMemData: (val: number) => number
  getInitialXPosition: (chart: Highcharts.Chart, memReqVal: number) => number
  plotOptions: PlotOptions
}

const MemoryHistogram: React.FC<MemoryHistogramProps> = ({
  findNearestMemData,
  memData,
  getInitialXPosition,
  memReqVal,
  memoryHistogram,
  onMemoryChartLoad,
  plotOptions
}) => {
  const { getString } = useStrings()

  return (
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
          </>
        }
      />
      <Container>
        <HistogramHeader header={getString('ce.recommendation.recommendationChart.memoryLabel')} />
        <CEChart
          options={{
            tooltip: {
              formatter: function () {
                return `Memory: ${this.x}`
              }
            },
            series: [
              {
                showInLegend: false,
                pointPlacement: -0.5,
                type: 'column',
                name: getString('ce.recommendation.recommendationChart.memoryLabelRegular'),
                data: memData,
                zoneAxis: 'x',
                zones: [
                  {
                    value: convertNumberToFixedDecimalPlaces(memoryHistogram.precomputed[memReqVal], 3) + 1,
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
              type: 'column',
              spacingRight: 30,
              spacingBottom: 100,
              events: {
                load() {
                  const chart = this as CustomHighcharts

                  onMemoryChartLoad(chart)

                  const memReqValue = convertNumberToFixedDecimalPlaces(memoryHistogram.precomputed[memReqVal], 3) + 1

                  const memRequestMarkerXPos = getInitialXPosition(chart, memReqValue)

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

                  const memReqPercentileText = chart.renderer
                    .text(`${memReqVal}th`, memRequestMarkerXPos + 15, 295)
                    .attr({
                      color: ChartColors.BLUE,
                      zIndex: 3
                    })
                    .add()

                  requestPlotLine.chartX = memRequestMarkerXPos

                  chart.container.onmousemove = /* istanbul ignore next */ function (e) {
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
                        const percentileValues = findNearestMemData(chart.xAxis[0].toValue(requestPlotLine.chartX + 10))

                        memReqPercentileText.attr({
                          text: `${percentileValues < 0 ? 0 : percentileValues}th`
                        })
                      }
                    }
                  }

                  requestPlotLine.element.onmousedown = /* istanbul ignore next */ function () {
                    requestPlotLine.drag = true
                  }

                  requestPlotLine.element.onmouseup = /* istanbul ignore next */ function () {
                    requestPlotLine.drag = false
                  }

                  chart.rePlaceMarker = currentReqVal => {
                    const currentMemReqValue =
                      convertNumberToFixedDecimalPlaces(memoryHistogram.precomputed[currentReqVal], 3) + 1

                    const currentMemRequestMarkerXPos = getInitialXPosition(chart, currentMemReqValue)

                    requestPlotLine.attr({ x: currentMemRequestMarkerXPos })
                    requestPlotLine.chartX = currentMemRequestMarkerXPos
                    requestPlotLineMarker.attr({
                      width: currentMemRequestMarkerXPos - chart.plotLeft + 10
                    })

                    memReqPercentileText.attr({
                      x: currentMemRequestMarkerXPos + 15,
                      text: `${currentReqVal}th`
                    })
                  }
                }
              }
            },
            plotOptions,
            xAxis: {
              title: {
                text: getString('ce.recommendation.recommendationChart.memoryUsageInMBsPlaceholder')
              },
              labels: {
                formatter: function () {
                  return `${Number(this.value)}`
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
  )
}
