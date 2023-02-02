/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { GetDataError } from 'restful-react'
import { Container, NoDataCard, Icon, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import Highcharts, { SeriesLineOptions } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { Failure } from 'services/cd-ng'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import noDataImage from '@cv/assets/noData.svg'
import { getChartSeriesValues } from './CommonMetricLineChart.utils'
import css from './CommonMetricLineChart.module.scss'

export default function CommonMetricLineChart({
  options,
  loading,
  error,
  series,
  chartConfig,
  isQueryExecuted
}: {
  options?: any[]
  loading: boolean
  error: GetDataError<Failure | Error> | null
  series?: SeriesLineOptions[]
  chartConfig?: Highcharts.Options
  isQueryExecuted?: boolean
}): JSX.Element {
  const { getString } = useStrings()

  const chartSeriesValues = useMemo(() => {
    return getChartSeriesValues(series, options, chartConfig)
  }, [chartConfig, options, series])

  if (loading) {
    return (
      <Container data-testid="loading" className={cx(css.main, css.loadingContainer)}>
        <Icon name="spinner" size={32} color={Color.GREY_600} />
        <Text padding={{ top: 'small', left: 'medium' }}>
          {getString('cv.monitoringSources.commonHealthSource.metricsChart.fetchingCharts')}
        </Text>
      </Container>
    )
  }

  if (error) {
    return (
      <Container data-testid="loading" className={css.main}>
        <Text
          data-testid="error"
          padding={{ bottom: 'medium' }}
          font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}
        >
          {getErrorMessage(error)}
        </Text>
      </Container>
    )
  }
  if (!isQueryExecuted) {
    return (
      <Container className={css.noDataContainer}>
        <Text padding={{ top: 'small', left: 'medium' }} color={Color.BLACK}>
          {getString('cv.monitoringSources.commonHealthSource.metricsChart.runQueryToFetchResults')}
        </Text>
      </Container>
    )
  }

  if (!options?.length && !series?.length) {
    return (
      <Container className={cx(css.main, css.noDataContainer)}>
        <NoDataCard message={getString('cv.changeSource.noDataAvaiableForCard')} image={noDataImage} />
      </Container>
    )
  }

  return (
    <Container data-testid="chart" className={css.main}>
      {(options?.length || series) && <HighchartsReact highcharts={Highcharts} options={chartSeriesValues} />}
    </Container>
  )
}
