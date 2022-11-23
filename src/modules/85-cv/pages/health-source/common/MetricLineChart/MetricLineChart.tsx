/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { GetDataError } from 'restful-react'
import { Container, NoDataCard, Icon, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import Highcharts, { SeriesLineOptions } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useStrings } from 'framework/strings'
import type { Failure } from 'services/cd-ng'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import noDataImage from '@cv/assets/noData.svg'
import { getChartSeriesValues } from './MetricLineChart.utils'
import css from './MetricLineChart.module.scss'

export default function MetricLineChart({
  options,
  loading,
  error,
  series
}: {
  options?: any[]
  loading: boolean
  error: GetDataError<Failure | Error> | null
  series?: SeriesLineOptions[]
}): JSX.Element {
  const { getString } = useStrings()

  const chartSeriesValues = useMemo(() => {
    return getChartSeriesValues(series, options)
  }, [options, series])

  if (loading) {
    return (
      <Container>
        <Icon name="spinner" margin={{ bottom: 'medium' }} size={24} />
      </Container>
    )
  }

  if (error) {
    return (
      <Text padding={{ bottom: 'medium' }} font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>
        {getErrorMessage(error)}
      </Text>
    )
  }

  if (!options?.length && !series?.length) {
    return (
      <Container className={css.noDataContainer}>
        <NoDataCard message={getString('cv.changeSource.noDataAvaiableForCard')} image={noDataImage} />
      </Container>
    )
  }

  return (
    <Container>
      {(options?.length || series) && <HighchartsReact highcharts={Highcharts} options={chartSeriesValues} />}
    </Container>
  )
}
