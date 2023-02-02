import { Container, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React, { useMemo } from 'react'
import type { GetDataError } from 'restful-react'
import type { TimeSeries } from 'services/cv'
import { useStrings } from 'framework/strings'
import CommonMetricLineChart from '@cv/pages/health-source/common/CommonMetricLineChart/CommonMetricLineChart'
import { getOptionsForChart } from './CommonChart.utils'
import { healthSourceChartConfig } from './CommonChart.constants'

export interface CommonChartProps {
  timeSeriesDataLoading: boolean
  timeseriesDataError: GetDataError<unknown> | null
  healthSourceTimeSeriesData?: TimeSeries[]
  isQueryExecuted?: boolean
}

export default function CommonChart(props: CommonChartProps): JSX.Element {
  const { timeSeriesDataLoading, timeseriesDataError, healthSourceTimeSeriesData, isQueryExecuted } = props
  const { getString } = useStrings()

  const options = useMemo(() => {
    return healthSourceTimeSeriesData ? getOptionsForChart(healthSourceTimeSeriesData) : []
  }, [healthSourceTimeSeriesData])

  return (
    <Container padding={{ top: 'large' }}>
      <Text
        font={{ variation: FontVariation.H6 }}
        margin={{ bottom: 'small' }}
        padding={{ top: 'large' }}
        tooltipProps={{ dataTooltipId: 'healthSource_Chart' }}
      >
        {getString('cv.monitoringSources.commonHealthSource.chart')}
      </Text>

      <CommonMetricLineChart
        loading={timeSeriesDataLoading}
        error={timeseriesDataError as GetDataError<Error>}
        series={options}
        chartConfig={healthSourceChartConfig}
        isQueryExecuted={isQueryExecuted}
      />
    </Container>
  )
}
