import { Container, Text } from '@harness/uicore'
import React, { useMemo } from 'react'
import type { GetDataError } from 'restful-react'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'
import type { TimeSeries } from 'services/cv'
import { useStrings } from 'framework/strings'
import { getOptionsForChart } from './CommonChart.utils'
import { healthSourceChartConfig } from './CommonChart.constants'
import css from './CommonChart.module.scss'

export interface CommonChartProps {
  timeSeriesDataLoading: boolean
  timeseriesDataError: GetDataError<unknown> | null
  healthSourceTimeSeriesData?: TimeSeries[]
}

export default function CommonChart(props: CommonChartProps): JSX.Element {
  const { timeSeriesDataLoading, timeseriesDataError, healthSourceTimeSeriesData } = props
  const { getString } = useStrings()

  const options = useMemo(() => {
    return healthSourceTimeSeriesData ? getOptionsForChart(healthSourceTimeSeriesData) : []
  }, [healthSourceTimeSeriesData])

  return (
    <>
      <Text
        className={css.labelText}
        font={{ weight: 'semi-bold', size: 'medium' }}
        padding={{ top: 'large' }}
        tooltipProps={{ dataTooltipId: 'healthSource_Chart' }}
      >
        {getString('cv.monitoringSources.commonHealthSource.chart')}
      </Text>
      <Container className={css.main}>
        <Container padding={{ top: 'large' }}>
          <MetricLineChart
            loading={timeSeriesDataLoading}
            error={timeseriesDataError as GetDataError<Error>}
            series={options}
            chartConfig={healthSourceChartConfig}
          />
        </Container>
      </Container>
    </>
  )
}
