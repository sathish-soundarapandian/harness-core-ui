/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { merge } from 'lodash-es'
import { Container, Icon, Text, PageError, NoDataCard, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { TimeSeriesAreaChart } from '@common/components'
import NoChartDataImage from '@cv/assets/noChartData.svg'
import { SLIMetricTypes } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { getDefaultChartOptions } from './SLOTargetChart.utils'
import type { SLOTargetChartProps, SLOTargetChartWithAPIGetSliGraphProps } from './SLOTargetChart.types'
import { convertServiceLevelIndicatorToSLIFormData } from '../CVCreateSLOV2/CVCreateSLOV2.utils'
import { SliMetricGraph } from './components/SLIMetricChart/SLIMetricChart'
import css from './SLOTargetChart.module.scss'

export const SLOTargetChart: React.FC<SLOTargetChartProps> = ({
  topLabel,
  bottomLabel,
  dataPoints,
  customChartOptions,
  secondaryDataPoints
}) => {
  const finalChartOptions = useMemo(() => merge(getDefaultChartOptions(), customChartOptions), [customChartOptions])

  const seriesData: Omit<Highcharts.SeriesColumnOptions, 'type'>[] = [
    {
      data: dataPoints,
      showInLegend: false
    }
  ]

  if (secondaryDataPoints) {
    seriesData.push({
      type: 'scatter',
      name: 'Scatter Data',
      data: secondaryDataPoints,
      marker: {
        symbol: `url(data:image/svg+xml;utf8,${encodeURIComponent(
          renderToStaticMarkup(
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" width="16" height="16" rx="8" fill="#7D4DD3" />
              <path
                d="M8.80147 6.64017C9.12659 5.68594 8.90309 4.58964 8.13098 3.8181C7.46049 3.14811 6.54619 2.8841 5.69287 3.04656C5.46937 3.0872 5.38816 3.37143 5.55058 3.53386L6.50552 4.48809C6.93227 4.91452 6.93227 5.58436 6.50552 6.01079C6.07877 6.43722 5.40843 6.43722 4.98168 6.01079L4.02674 5.05656C3.86418 4.89412 3.57974 4.97541 3.53907 5.19875C3.39678 6.05146 3.64069 6.98542 4.31119 7.63504C5.0833 8.40658 6.18043 8.60953 7.13537 8.30503L11.4834 12.6498C11.9507 13.1167 12.7025 13.1167 13.1495 12.6498C13.6168 12.1829 13.6168 11.4316 13.1495 10.9849L8.80147 6.64017Z"
                fill="white"
              />
            </svg>
          )
        )})`,
        radius: 2
      },
      showInLegend: false
    } as Omit<Highcharts.SeriesColumnOptions, 'type'>)
  }

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
  sliGraphData,
  loading,
  error,
  retryOnError,
  showMetricChart
}) => {
  const dataPoints = useMemo(
    () => sliGraphData?.dataPoints?.map(point => [Number(point.timeStamp) || 0, Number(point.value) || 0]),
    [sliGraphData?.dataPoints]
  )

  const containerHeight = showMetricChart ? '250px' : '100%'

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <PageError
          width={400}
          message={error}
          onClick={() => retryOnError(serviceLevelIndicator, monitoredServiceIdentifier)}
        />
      </Container>
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
  const { serviceLevelIndicator, monitoredServiceIdentifier, showMetricChart = false } = props

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
    <Container flex={{ justifyContent: 'center' }} width={'100%'}>
      <NoDataCard
        image={NoChartDataImage}
        containerClassName={css.noData}
        message={getString('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')}
      />
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

    return showMetricChart ? (
      <Layout.Vertical spacing="small">
        <Layout.Vertical spacing="xsmall" margin={{ bottom: 'xlarge' }}>
          <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }}>
            {getString(
              SLIMetricType === SLIMetricTypes.RATIO
                ? 'cv.slos.sliMetricChartRatioBasedHeader'
                : 'cv.slos.slis.ratioMetricType.validRequestsMetrics'
            )}
          </Text>
          <Text margin={{ bottom: 'large' }} font={{ size: 'normal', weight: 'light' }}>
            {getString('cv.slos.sliMetricChartSubHeader')}
          </Text>
          <SliMetricGraph {...props} />
        </Layout.Vertical>
        <Layout.Vertical spacing="small">
          <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
            {getString('cv.slos.slis.SLIChartTitle')}
          </Text>
          <SLOTargetChartWithAPIGetSliGraph {...props} />
        </Layout.Vertical>
      </Layout.Vertical>
    ) : (
      <Layout.Vertical spacing="small">
        <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
          {getString('cv.slos.slis.SLIChartTitle')}
        </Text>
        <SLOTargetChartWithAPIGetSliGraph {...props} />
      </Layout.Vertical>
    )
  }

  return emptyState
}

export default SLOTargetChartWrapper
