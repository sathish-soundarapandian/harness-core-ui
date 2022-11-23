/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Container, Text, Icon, Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color, FontProps } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import classnames from 'classnames'
import moment from 'moment'
import { merge } from 'lodash-es'
import { Popover, Menu, MenuItem, Dialog } from '@blueprintjs/core'
import { TimelineBar } from '@cv/components/TimelineView/TimelineBar'
import { useStrings } from 'framework/strings'
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import styles from './TimeseriesRow.module.scss'

export interface SeriesConfig {
  name?: string
  series: Highcharts.SeriesLineOptions[]
  chartOptions?: Highcharts.Options
}

export interface TimeseriesRowProps {
  transactionName: React.ReactNode
  metricName?: React.ReactNode
  seriesData?: Array<SeriesConfig>
  chartOptions?: Highcharts.Options
  withContextMenu?: boolean
  className?: string
  setChartDivRef?: (element: HTMLDivElement | null) => void
  dataSourceType?: string
}

const FONT_SIZE_SMALL: FontProps = {
  size: 'small'
}

export default function TimeseriesRow({
  transactionName,
  metricName,
  seriesData,
  className,
  chartOptions,
  withContextMenu = true,
  setChartDivRef,
  dataSourceType
}: TimeseriesRowProps): JSX.Element {
  const { getString } = useStrings()
  const showDetails = useTimeseriesDetailsModal(transactionName, metricName, dataSourceType as string)
  const chartingRowRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    return seriesData?.map(data => ({
      name: data.name,
      series: data.series,
      options: merge(chartsConfig(data.series), chartOptions, data.chartOptions)
    }))
  }, [seriesData, chartOptions])
  useEffect(() => {
    setChartDivRef?.(chartingRowRef?.current)
  }, [chartingRowRef])

  return (
    <Container className={classnames(styles.timeseriesRow, className)}>
      <Container className={styles.labels}>
        <div className={styles.metricLablesContainer}>
          <Text color={Color.BLACK} font={FONT_SIZE_SMALL} lineClamp={1}>
            {transactionName}
          </Text>
          <Text font={FONT_SIZE_SMALL} lineClamp={1}>
            {metricName}
          </Text>
        </div>
        <Container className={styles.icons}>
          {dataSourceType ? <Icon name={getIconBySourceType(dataSourceType)} size={14} /> : null}
        </Container>
      </Container>
      <Container className={styles.charts}>
        {rows?.map((data, index) => (
          <React.Fragment key={index}>
            {data.name && <Text>{data.name}</Text>}
            <Container className={styles.chartRow}>
              <div className={styles.chartContainer} ref={chartingRowRef}>
                <HighchartsReact highcharts={Highcharts} options={data.options} />
              </div>
              {withContextMenu && (
                <Container padding={{ right: 'xsmall' }}>
                  <Popover
                    content={
                      <Menu>
                        <MenuItem
                          icon="fullscreen"
                          text={getString('viewDetails')}
                          onClick={() =>
                            showDetails({
                              name: data.name,
                              series: data.series
                            })
                          }
                        />
                      </Menu>
                    }
                  >
                    <Icon name="main-more" className={styles.verticalMoreIcon} color={Color.GREY_350} />
                  </Popover>
                </Container>
              )}
            </Container>
          </React.Fragment>
        ))}
      </Container>
    </Container>
  )
}

export function useTimeseriesDetailsModal(
  transactionName: React.ReactNode,
  metricName: React.ReactNode,
  dataSourceType: string
) {
  const [range, setRange] = useState<{ startDate: number; endDate: number } | undefined>()
  const [seriesData, setSeriesData] = useState<SeriesConfig>()
  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        usePortal
        autoFocus
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        onClose={hideModal}
        style={{ width: '80vw', borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }}
      >
        <Container className={styles.detailsModal} padding="small" margin="xxxlarge">
          <TimeseriesRow
            transactionName={transactionName}
            metricName={metricName}
            seriesData={seriesData && [seriesData]}
            dataSourceType={dataSourceType}
            chartOptions={{
              chart: {
                height: 200,
                marginLeft: 50
              },
              xAxis: {
                gridLineWidth: 0
              },
              yAxis: {
                gridLineWidth: 1,
                labels: {
                  enabled: true,
                  style: {
                    fontSize: 'var(--font-size-xsmall)',
                    color: 'var(--grey-300)'
                  }
                }
              },
              plotOptions: {
                series: {
                  marker: {
                    symbol: 'circle'
                  }
                }
              }
            }}
            withContextMenu={false}
          />
          {range && <TimelineBar className={styles.timelineBar} {...range} />}
          <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={styles.crossButton} />
        </Container>
      </Dialog>
    ),
    [seriesData]
  )
  return (data: SeriesConfig, options?: Highcharts.Options) => {
    setRange(extractTimeRange(data, options))
    setSeriesData(data)
    return openModal()
  }
}

export function extractTimeRange(data: SeriesConfig, options?: Highcharts.Options) {
  let start: number = (options?.xAxis as Highcharts.XAxisOptions)?.min ?? 0
  let end: number = (options?.xAxis as Highcharts.XAxisOptions)?.max ?? 0
  if (!start && !end) {
    const seriesWithData = data.series.filter(serie => serie.data?.length)
    if (seriesWithData.length) {
      start = Infinity
      end = -Infinity
      seriesWithData.forEach(serie => {
        serie?.data?.forEach((item: any) => {
          const timestamp = Array.isArray(item) ? item[0] : item.x
          start = Math.min(start, timestamp)
          end = Math.max(end, timestamp)
        })
      })
    }
  }
  if (start && end) {
    if (start === end) {
      start -= 3600000
      end += 3600000
    }
    return {
      startDate: start,
      endDate: end
    }
  }
}

export function chartsConfig(series: Highcharts.SeriesLineOptions[]): Highcharts.Options {
  return {
    chart: {
      backgroundColor: 'transparent',
      height: 40,
      type: 'line',
      spacing: [5, 0, 5, 0]
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    yAxis: {
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        lineWidth: 1,
        turboThreshold: 50000
      },
      line: {
        marker: {
          enabled: false
        }
      }
    },
    tooltip: {
      formatter: function tooltipFormatter(this: any): string {
        return `<section class="serviceeGuardTimeSeriesTooltip"><p>${moment(this.x).format(
          'M/D/YYYY h:mm:ss a'
        )}</p><br/><p>Value: ${Math.round(this.y * 100) / 100}</p></section>`
      },
      outside: true
    },
    subtitle: undefined,
    series
  }
}
