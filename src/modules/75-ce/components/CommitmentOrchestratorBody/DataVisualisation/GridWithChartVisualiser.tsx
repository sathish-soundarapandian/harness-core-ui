/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import { Container, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import type { Column } from 'react-table'
import type { OptionsStackingValue } from 'highcharts'
import Grid from '@ce/components/PerspectiveGrid/Grid'
import CEChart from '@ce/components/CEChart/CEChart'
import { CCM_CHART_TYPES } from '@ce/constants'
import ChartLegend from '@ce/components/CloudCostInsightChart/ChartLegend'
import { highlightNode, resetNodeState } from '@ce/utils/perspectiveUtils'
import { useStrings } from 'framework/strings'
import css from '../CommitmentOrchestrationBody.module.scss'

interface GridWithChartVisualiserProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  chartData: any
  chartLoading?: boolean
  dataLoading?: boolean
  chartOptions?: any
  groupByProps?: GroupByProps
  granularFilterComponent?: React.ReactNode
  chartType?: CCM_CHART_TYPES
  onChartLoad?: (chartInstance: Highcharts.Chart) => void
}

interface GroupByProps {
  options?: string[]
  onOptionClick?: (option: string) => void
  selectedOption: string
}

const GridWithChartVisualiser = <T extends Record<string, any>>({
  columns,
  data,
  chartData,
  chartLoading,
  dataLoading,
  chartOptions,
  groupByProps,
  granularFilterComponent,
  chartType,
  onChartLoad
}: GridWithChartVisualiserProps<T>) => {
  const { getString } = useStrings()
  const { options, onOptionClick, selectedOption } = groupByProps || {}
  const [chartRef, setChartRef] = useState<Highcharts.Chart | null>()
  const plotOptions = {
    series: {
      connectNulls: true,
      animation: {
        duration: 500
      },
      stacking: 'normal' as OptionsStackingValue
    },
    area: {
      lineWidth: 1,
      marker: {
        enabled: false
      }
    },
    column: {
      borderColor: undefined
    }
  }
  const xAxisOptions: Highcharts.XAxisOptions = {
    type: 'datetime',
    ordinal: true,
    min: null,
    tickInterval: 24 * 3600 * 1000,
    minPadding: 0.05,
    maxPadding: 0.05,
    tickWidth: 0,
    labels: {
      formatter: function () {
        const date = new Date(this.value)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    }
  }

  useEffect(() => {
    /*  istanbul ignore next  */
    if ((chartLoading || dataLoading) && chartRef) {
      setChartRef(null)
    }
  }, [dataLoading, chartLoading])

  const gridData = useMemo(() => {
    if (chartRef && data) {
      const colors = chartRef.series.map((row: any) => row.color)
      return data.map((dataRow, index) => ({
        ...dataRow,
        legendColor: colors[index],
        id: dataRow.name
      }))
    }
    return []
  }, [data, chartRef])

  return (
    <Container>
      <Layout.Horizontal flex>
        {options && (
          <Layout.Horizontal spacing={'medium'}>
            <Text font={{ variation: FontVariation.SMALL }}>
              {getString('ce.perspectives.createPerspective.preview.groupBy')}
            </Text>
            {options.map(option => {
              return (
                <Text
                  key={option}
                  font={{ variation: selectedOption === option ? FontVariation.SMALL_BOLD : FontVariation.SMALL_SEMI }}
                  className={cx(css.groupByOption, {
                    [css.activeOption]: selectedOption === option
                  })}
                  onClick={/*  istanbul ignore next  */ () => onOptionClick?.(option)}
                >
                  {option}
                </Text>
              )
            })}
          </Layout.Horizontal>
        )}
        {granularFilterComponent}
      </Layout.Horizontal>
      {chartLoading || dataLoading ? (
        /* istanbul ignore next */ <Layout.Horizontal flex={{ justifyContent: 'center' }} style={{ minHeight: 300 }}>
          <Icon name="spinner" size={26} />
        </Layout.Horizontal>
      ) : (
        <>
          <CEChart
            options={{
              series: chartData as any,
              chart:
                chartType === CCM_CHART_TYPES.SPLINE
                  ? {
                      height: 300,
                      type: CCM_CHART_TYPES.SPLINE,
                      spacingTop: 40,
                      events: {
                        load() {
                          setChartRef(this)
                          onChartLoad?.(this)
                        }
                      }
                    }
                  : {
                      zoomType: 'x',
                      height: 300,
                      type: CCM_CHART_TYPES.COLUMN,
                      spacingTop: 40,
                      events: {
                        load() {
                          setChartRef(this)
                          onChartLoad?.(this)
                        }
                      }
                    },
              plotOptions,
              yAxis: {
                endOnTick: true,
                min: 0,
                max: null,
                tickAmount: 3,
                title: {
                  text: ''
                },
                labels: {
                  formatter: function () {
                    return `$${this.value}`
                  }
                },
                gridLineColor: 'transparent'
              },
              xAxis: xAxisOptions,
              annotations: [
                {
                  // labels: anomaliesLabels(),
                  draggable: '',
                  visible: true,
                  labelOptions: {
                    crop: false,
                    useHTML: true,
                    backgroundColor: 'transparent',
                    borderWidth: 0
                  }
                }
              ],
              legend: {
                enabled: false
              },
              ...chartOptions
            }}
          />
          {chartRef && <ChartLegend chartRefObj={chartRef as unknown as Highcharts.Chart} />}
          <Grid
            columns={columns}
            data={gridData}
            onMouseEnter={
              /* istanbul ignore next */ row => {
                row.original.id && highlightNode({ current: chartRef }, row.original.id)
              }
            }
            onMouseLeave={
              /* istanbul ignore next */ () => {
                resetNodeState({ current: chartRef })
              }
            }
          />
        </>
      )}
    </Container>
  )
}

export default GridWithChartVisualiser
