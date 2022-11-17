/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import { transformAnalysisDataToChartSeries } from '@cv/components/TimeseriesRow/TimeSeriesRowUtils'
import type { MetricData } from 'services/cv'
import TimeseriesRow from '@cv/components/TimeseriesRow/TimeseriesRow'
import css from './MetricAnalysisRow.module.scss'

interface MetricAnalysisRowProps {
  metricName: string
  categoryName?: string
  transactionName: string
  analysisData: MetricData[]
  startTime: number
  endTime: number
  displaySelectedTimeRange?: boolean
  setTimeSeriesRowRef?: (el: HTMLDivElement | null) => void
  dataSourceType?: string
}

const ROW_HEIGHT = 60

function getTimeMaskWidthBasedOnTimeRange(startTime: number, endTime: number): number {
  switch (Math.round(moment.duration(moment(endTime).diff(startTime)).asMinutes())) {
    case 125:
      return 48
    case 135:
      return 73
    case 150:
      return 130
    case 330:
      return 405
    case 360:
      return 420
    case 1020:
      return 556
    default:
      return 545
  }
}

export default function MetricAnalysisRow(props: MetricAnalysisRowProps): JSX.Element {
  const {
    metricName,
    analysisData = [],
    transactionName,
    startTime,
    endTime,
    displaySelectedTimeRange,
    setTimeSeriesRowRef,
    dataSourceType
  } = props || {}
  const timeseriesOptions = useMemo(() => transformAnalysisDataToChartSeries(analysisData), [analysisData])
  return (
    <Container className={css.main} height={ROW_HEIGHT} data-testid={'metrics-analysis-row'}>
      {displaySelectedTimeRange && (
        <Container
          className={css.selectedTimeRange}
          height={ROW_HEIGHT}
          background={Color.BLUE_300}
          width={getTimeMaskWidthBasedOnTimeRange(startTime, endTime)}
        />
      )}
      <TimeseriesRow
        transactionName={transactionName}
        metricName={metricName}
        dataSourceType={dataSourceType}
        seriesData={timeseriesOptions}
        chartOptions={{
          chart: {
            height: ROW_HEIGHT
          }
        }}
        setChartDivRef={setTimeSeriesRowRef}
      />
    </Container>
  )
}
