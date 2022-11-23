/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect } from 'react'
import { merge } from 'lodash-es'
import type Highcharts from 'highcharts'
import { Container, Icon, PageError, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { TimeSeriesAreaChart } from '@common/components'
import { SLIMetricTypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { getDefaultChartOptions } from './SLOTargetChart.utils'
import { convertServiceLevelIndicatorToSLIFormData } from '../CVCreateSLO/CVCreateSLO.utils'
import type { SLOTargetChartProps, SLOTargetChartWithAPIGetSliGraphProps } from './SLOTargetChart.types'

export const SLOTargetChart: React.FC<SLOTargetChartProps> = ({
  topLabel,
  bottomLabel,
  dataPoints,
  customChartOptions
}) => {
  const finalChartOptions = useMemo(() => merge(getDefaultChartOptions(), customChartOptions), [customChartOptions])

  const seriesData: Omit<Highcharts.SeriesColumnOptions, 'type'>[] = [
    {
      data: dataPoints,
      showInLegend: false
    }
  ]

  return (
    <div>
      {topLabel}
      <TimeSeriesAreaChart customChartOptions={finalChartOptions} seriesData={seriesData} />
      {bottomLabel}
    </div>
  )
}

const SLOTargetChartWithAPIGetSliGraph: React.FC<SLOTargetChartWithAPIGetSliGraphProps> = ({
  topLabel,
  bottomLabel,
  customChartOptions,
  serviceLevelIndicator,
  monitoredServiceIdentifier,
  debounceFetchSliGraphData,
  sliGraphData,
  loading,
  error,
  retryOnError
}) => {
  const sliFormData = convertServiceLevelIndicatorToSLIFormData(serviceLevelIndicator)

  const dataPoints = useMemo(
    () => sliGraphData?.dataPoints?.map(point => [Number(point.timeStamp) || 0, Number(point.value) || 0]),
    [sliGraphData?.dataPoints]
  )

  useEffect(() => {
    debounceFetchSliGraphData?.(serviceLevelIndicator, monitoredServiceIdentifier)
  }, [...Object.values(sliFormData)])

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return (
      <PageError
        width={400}
        message={error}
        onClick={() => retryOnError(serviceLevelIndicator, monitoredServiceIdentifier)}
      />
    )
  }

  return (
    <SLOTargetChart
      topLabel={topLabel}
      bottomLabel={bottomLabel}
      customChartOptions={customChartOptions}
      dataPoints={dataPoints}
    />
  )
}

const SLOTargetChartWrapper: React.FC<SLOTargetChartWithAPIGetSliGraphProps> = props => {
  const { getString } = useStrings()
  const { serviceLevelIndicator, monitoredServiceIdentifier } = props

  const {
    healthSourceRef,
    SLIType,
    SLIMetricType,
    validRequestMetric,
    objectiveValue = -1,
    objectiveComparator,
    SLIMissingDataType,
    eventType,
    goodRequestMetric
  } = convertServiceLevelIndicatorToSLIFormData(serviceLevelIndicator)

  const emptyState = (
    <Container flex={{ justifyContent: 'center' }} height="100%">
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {getString('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')}
      </Text>
    </Container>
  )

  if (
    monitoredServiceIdentifier &&
    healthSourceRef &&
    SLIType &&
    SLIMetricType &&
    validRequestMetric &&
    objectiveValue >= 0 &&
    objectiveComparator &&
    SLIMissingDataType
  ) {
    if (SLIMetricType === SLIMetricTypes.RATIO) {
      if (!eventType || !goodRequestMetric || validRequestMetric === goodRequestMetric || objectiveValue > 100) {
        return emptyState
      }
    }

    return <SLOTargetChartWithAPIGetSliGraph {...props} />
  }

  return emptyState
}

export default SLOTargetChartWrapper
